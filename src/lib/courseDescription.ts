export const COURSE_DESCRIPTION_EXCERPT_LENGTH = 100;

const allowedTags = new Set([
  "a",
  "b",
  "br",
  "em",
  "h2",
  "h3",
  "h4",
  "i",
  "li",
  "ol",
  "p",
  "strong",
  "u",
  "ul",
]);

const blockTags = new Set(["br", "h2", "h3", "h4", "li", "p"]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => {
      const parsed = Number(code);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : "";
    });
}

function hasHtmlTags(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function sanitizeHref(value: string): string | null {
  const trimmed = decodeHtmlEntities(value).trim();
  if (/^(https?:|mailto:|tel:|#)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }

  return null;
}

export function sanitizeCourseDescriptionHtml(value: string): string {
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|meta|link|svg|math)[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|meta|link|svg|math)\b[^>]*\/?>/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!allowedTags.has(tag)) {
        return "";
      }

      if (match.startsWith("</")) {
        return tag === "br" ? "" : `</${tag}>`;
      }

      if (tag === "br") {
        return "<br>";
      }

      if (tag === "a") {
        const hrefMatch = rawAttrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const href = hrefMatch ? sanitizeHref(hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] ?? "") : null;
        return href ? `<a href="${href}" rel="noopener noreferrer">` : "<a>";
      }

      return `<${tag}>`;
    })
    .trim();
}

export function getCourseDescriptionPlainText(description: string): string {
  const withSpacing = description.replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi, (match, tag: string) => {
    return blockTags.has(tag.toLowerCase()) ? " " : match;
  });

  return decodeHtmlEntities(withSpacing.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function plainTextToHtml(description: string): string {
  const normalized = description
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\s+(ETAP\s*\d+\s*:?\s*)/gi, "\n\n$1");

  return normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const stageMatch = block.match(/^(ETAP\s*\d+)\s*:?\s*([\s\S]*)$/i);
      if (stageMatch) {
        const heading = stageMatch[1].replace(/\s+/g, " ").toUpperCase();
        const body = stageMatch[2].trim();
        return [
          `<h2>${escapeHtml(heading)}</h2>`,
          body ? `<p>${escapeHtml(body).replace(/\n/g, "<br>")}</p>` : "",
        ].join("");
      }

      return `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

export function getCourseDescriptionHtml(description: string): string {
  if (hasHtmlTags(description)) {
    return sanitizeCourseDescriptionHtml(description);
  }

  return plainTextToHtml(description);
}

export function getCourseDescriptionExcerpt(
  description: string,
  maxLength = COURSE_DESCRIPTION_EXCERPT_LENGTH,
): string {
  const plainText = getCourseDescriptionPlainText(description);
  if (plainText.length <= maxLength) {
    return plainText;
  }

  const shortened = plainText.slice(0, maxLength).trimEnd();
  return `${shortened}...`;
}
