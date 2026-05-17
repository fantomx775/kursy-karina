"server-only";

import path from "node:path";
import { readFile } from "node:fs/promises";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_CERTIFICATE_TEMPLATE_KEY,
  normalizeCertificateTemplateKey,
  type CertificateTemplateId,
  type CertificateTemplateKey,
} from "@/lib/certificateTemplates";

const CERTIFICATE_TEMPLATE_PATHS: Record<CertificateTemplateKey, string> = {
  "certificate-1": "public/certificates/templates/certificate-1.pdf",
  "certificate-2": "public/certificates/templates/certificate-2.pdf",
};

const PRATA_FONT_PATH = "public/fonts/prata/Prata-Regular.ttf";

const NAME_CENTER_X = 405;
const NAME_FIRST_LINE_Y = 650;
const NAME_SECOND_LINE_Y = 598;
const NAME_SINGLE_LINE_Y = 624;
const NAME_BASE_SIZE = 48;
const NAME_MAX_WIDTH = 320;
const DATE_CENTER_X = 123.5;
const DATE_BASELINE_Y = 62;
const DATE_BASE_SIZE = 12;
const DATE_MAX_WIDTH = 126;
const INK = rgb(0.02, 0.02, 0.02);

type AccentKind = "acute" | "dot" | "ogonek" | "slash";

const DIACRITICS: Record<
  string,
  { base: string; accent: AccentKind; uppercase: boolean }
> = {
  Ą: { base: "A", accent: "ogonek", uppercase: true },
  Ć: { base: "C", accent: "acute", uppercase: true },
  Ę: { base: "E", accent: "ogonek", uppercase: true },
  Ł: { base: "L", accent: "slash", uppercase: true },
  Ń: { base: "N", accent: "acute", uppercase: true },
  Ó: { base: "O", accent: "acute", uppercase: true },
  Ś: { base: "S", accent: "acute", uppercase: true },
  Ź: { base: "Z", accent: "acute", uppercase: true },
  Ż: { base: "Z", accent: "dot", uppercase: true },
  ą: { base: "a", accent: "ogonek", uppercase: false },
  ć: { base: "c", accent: "acute", uppercase: false },
  ę: { base: "e", accent: "ogonek", uppercase: false },
  ł: { base: "l", accent: "slash", uppercase: false },
  ń: { base: "n", accent: "acute", uppercase: false },
  ó: { base: "o", accent: "acute", uppercase: false },
  ś: { base: "s", accent: "acute", uppercase: false },
  ź: { base: "z", accent: "acute", uppercase: false },
  ż: { base: "z", accent: "dot", uppercase: false },
};

const fileCache: {
  prata: Uint8Array | null;
  templates: Partial<Record<CertificateTemplateKey, Uint8Array>>;
} = {
  prata: null,
  templates: {},
};

async function loadPublicFile(relativePath: string): Promise<Uint8Array> {
  const bytes = await readFile(path.join(process.cwd(), relativePath));
  return bytes;
}

async function loadPrataFont(): Promise<Uint8Array> {
  if (!fileCache.prata) {
    fileCache.prata = await loadPublicFile(PRATA_FONT_PATH);
  }

  return fileCache.prata;
}

async function loadCertificateTemplate(
  templateKey: CertificateTemplateKey,
): Promise<Uint8Array> {
  if (!fileCache.templates[templateKey]) {
    fileCache.templates[templateKey] = await loadPublicFile(
      CERTIFICATE_TEMPLATE_PATHS[templateKey],
    );
  }

  return fileCache.templates[templateKey]!;
}

export type CourseCompletion = {
  totalItems: number;
  completedItems: number;
  percentage: number;
};

export type CertificateGrant = {
  granted: boolean;
  grantedAt: string | null;
  generated: boolean;
  generatedAt: string | null;
  issuedAt: string | null;
  recipientFirstName: string | null;
  recipientLastName: string | null;
  pdfStorageBucket: string | null;
  pdfStoragePath: string | null;
  certificateTemplateId: CertificateTemplateId | null;
  regenerationAllowed: boolean;
  regenerationAllowedAt: string | null;
  generationVersion: number;
};

/**
 * Computes course completion for a single course.
 * Uses the same logic as dashboard: totalItems = count of course_items (via sections),
 * completedItems = count of course_progress with completed=true.
 */
export async function getCourseCompletion(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<CourseCompletion> {
  const { data: sections } = await supabase
    .from("course_sections")
    .select("id")
    .eq("course_id", courseId);

  const sectionIds = sections?.map((section) => section.id) ?? [];
  if (sectionIds.length === 0) {
    return { totalItems: 0, completedItems: 0, percentage: 0 };
  }

  const { data: items } = await supabase
    .from("course_items")
    .select("id")
    .in("section_id", sectionIds);

  const totalItems = items?.length ?? 0;

  const { data: progress } = await supabase
    .from("course_progress")
    .select("item_id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("completed", true);

  const completedItems = progress?.length ?? 0;
  const percentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return { totalItems, completedItems, percentage };
}

/**
 * Batch version: completion for multiple courses (same query pattern as dashboard).
 */
export async function getCoursesCompletion(
  supabase: SupabaseClient,
  userId: string,
  courseIds: string[],
): Promise<Record<string, CourseCompletion>> {
  if (courseIds.length === 0) return {};

  const { data: sections } = await supabase
    .from("course_sections")
    .select("id, course_id")
    .in("course_id", courseIds);

  const sectionIds = sections?.map((section) => section.id) ?? [];
  const totalItemsByCourse = new Map<string, number>();

  let items: { id: string; section_id: string }[] = [];
  if (sectionIds.length > 0) {
    const { data: itemsData } = await supabase
      .from("course_items")
      .select("id, section_id")
      .in("section_id", sectionIds);
    items = itemsData ?? [];
  }

  sections?.forEach((section) => {
    const count = items.filter((item) => item.section_id === section.id).length;
    totalItemsByCourse.set(
      section.course_id,
      (totalItemsByCourse.get(section.course_id) ?? 0) + count,
    );
  });

  const { data: progress } = await supabase
    .from("course_progress")
    .select("course_id")
    .eq("user_id", userId)
    .eq("completed", true)
    .in("course_id", courseIds);

  const completedByCourse = new Map<string, number>();
  progress?.forEach((entry) => {
    completedByCourse.set(
      entry.course_id,
      (completedByCourse.get(entry.course_id) ?? 0) + 1,
    );
  });

  const result: Record<string, CourseCompletion> = {};
  courseIds.forEach((courseId) => {
    const totalItems = totalItemsByCourse.get(courseId) ?? 0;
    const completedItems = completedByCourse.get(courseId) ?? 0;
    const percentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    result[courseId] = { totalItems, completedItems, percentage };
  });

  return result;
}

export async function getCertificateGrant(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<CertificateGrant> {
  const { data } = await supabase
    .from("course_certificates")
    .select(
      "granted_at, generated_at, issued_at, recipient_first_name, recipient_last_name, pdf_storage_bucket, pdf_storage_path, certificate_template_id, regeneration_allowed, regeneration_allowed_at, generation_version",
    )
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  return {
    granted: Boolean(data?.granted_at),
    grantedAt: data?.granted_at ?? null,
    generated: Boolean(data?.generated_at && data?.pdf_storage_path),
    generatedAt: data?.generated_at ?? null,
    issuedAt: data?.issued_at ?? null,
    recipientFirstName: data?.recipient_first_name ?? null,
    recipientLastName: data?.recipient_last_name ?? null,
    pdfStorageBucket: data?.pdf_storage_bucket ?? null,
    pdfStoragePath: data?.pdf_storage_path ?? null,
    certificateTemplateId: data?.certificate_template_id ?? null,
    regenerationAllowed: Boolean(data?.regeneration_allowed),
    regenerationAllowedAt: data?.regeneration_allowed_at ?? null,
    generationVersion: data?.generation_version ?? 0,
  };
}

export async function getCertificateGrants(
  supabase: SupabaseClient,
  userId: string,
  courseIds: string[],
): Promise<Record<string, CertificateGrant>> {
  if (courseIds.length === 0) return {};

  const { data } = await supabase
    .from("course_certificates")
    .select(
      "course_id, granted_at, generated_at, issued_at, recipient_first_name, recipient_last_name, pdf_storage_bucket, pdf_storage_path, certificate_template_id, regeneration_allowed, regeneration_allowed_at, generation_version",
    )
    .eq("user_id", userId)
    .in("course_id", courseIds);

  const result: Record<string, CertificateGrant> = {};
  courseIds.forEach((courseId) => {
    result[courseId] = {
      granted: false,
      grantedAt: null,
      generated: false,
      generatedAt: null,
      issuedAt: null,
      recipientFirstName: null,
      recipientLastName: null,
      pdfStorageBucket: null,
      pdfStoragePath: null,
      certificateTemplateId: null,
      regenerationAllowed: false,
      regenerationAllowedAt: null,
      generationVersion: 0,
    };
  });

  data?.forEach((entry) => {
    result[entry.course_id] = {
      granted: true,
      grantedAt: entry.granted_at,
      generated: Boolean(entry.generated_at && entry.pdf_storage_path),
      generatedAt: entry.generated_at,
      issuedAt: entry.issued_at,
      recipientFirstName: entry.recipient_first_name,
      recipientLastName: entry.recipient_last_name,
      pdfStorageBucket: entry.pdf_storage_bucket,
      pdfStoragePath: entry.pdf_storage_path,
      certificateTemplateId: entry.certificate_template_id,
      regenerationAllowed: Boolean(entry.regeneration_allowed),
      regenerationAllowedAt: entry.regeneration_allowed_at,
      generationVersion: entry.generation_version ?? 0,
    };
  });

  return result;
}

export type CertificateData = {
  firstName: string;
  lastName: string;
  courseTitle: string;
  issuedAt: string;
  templateKey?: CertificateTemplateKey | null;
  templateBytes?: Uint8Array | ArrayBuffer | null;
};

export function formatCertificateIssuedAt(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Warsaw",
  }).format(date);
}

export function getWarsawDateOnly(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Warsaw",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function formatCertificateIssuedAtInput(value: string): string {
  if (!value) {
    return formatCertificateIssuedAt();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return formatCertificateIssuedAt(new Date(`${value}T12:00:00Z`));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : formatCertificateIssuedAt(parsed);
}

function fitFontSize(
  text: string,
  font: PDFFont,
  baseSize: number,
  maxWidth: number,
): number {
  const width = font.widthOfTextAtSize(toBaseText(text), baseSize);

  if (width <= maxWidth) {
    return baseSize;
  }

  return (maxWidth / width) * baseSize;
}

function toBaseText(text: string): string {
  return Array.from(text)
    .map((character) => DIACRITICS[character]?.base ?? character)
    .join("");
}

function drawAccent({
  page,
  kind,
  x,
  y,
  width,
  size,
  uppercase,
}: {
  page: PDFPage;
  kind: AccentKind;
  x: number;
  y: number;
  width: number;
  size: number;
  uppercase: boolean;
}) {
  const thickness = Math.max(0.35, size * 0.018);

  if (kind === "slash") {
    page.drawLine({
      start: {
        x: x + width * (uppercase ? 0.18 : 0.08),
        y: y + size * (uppercase ? 0.34 : 0.28),
      },
      end: {
        x: x + width * (uppercase ? 0.68 : 0.74),
        y: y + size * (uppercase ? 0.49 : 0.46),
      },
      thickness: Math.max(0.55, size * 0.026),
      color: INK,
    });
    return;
  }

  if (kind === "acute") {
    page.drawLine({
      start: {
        x: x + width * 0.48,
        y: y + size * (uppercase ? 0.96 : 0.68),
      },
      end: {
        x: x + width * 0.72,
        y: y + size * (uppercase ? 1.14 : 0.86),
      },
      thickness,
      color: INK,
    });
    return;
  }

  if (kind === "dot") {
    page.drawCircle({
      x: x + width * 0.58,
      y: y + size * (uppercase ? 1.05 : 0.78),
      size: Math.max(0.9, size * 0.035),
      color: INK,
    });
    return;
  }

  const startX = x + width * 0.72;
  const startY = y + size * (uppercase ? -0.02 : -0.08);
  page.drawLine({
    start: { x: startX, y: startY },
    end: { x: startX - size * 0.11, y: startY - size * 0.11 },
    thickness,
    color: INK,
  });
  page.drawLine({
    start: { x: startX - size * 0.11, y: startY - size * 0.11 },
    end: { x: startX - size * 0.02, y: startY - size * 0.18 },
    thickness,
    color: INK,
  });
}

function drawPrataText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
) {
  const characters = Array.from(text);
  const baseCharacters = characters.map(
    (character) => DIACRITICS[character]?.base ?? character,
  );
  const baseText = baseCharacters.join("");

  page.drawText(baseText, {
    x,
    y,
    size,
    font,
    color: INK,
  });

  characters.forEach((character, index) => {
    const diacritic = DIACRITICS[character];
    if (!diacritic) {
      return;
    }

    const prefix = baseCharacters.slice(0, index).join("");
    const characterX = x + font.widthOfTextAtSize(prefix, size);
    const characterWidth = font.widthOfTextAtSize(diacritic.base, size);

    drawAccent({
      page,
      kind: diacritic.accent,
      x: characterX,
      y,
      width: characterWidth,
      size,
      uppercase: diacritic.uppercase,
    });
  });
}

function drawCenteredText({
  page,
  font,
  text,
  centerX,
  y,
  baseSize,
  maxWidth,
}: {
  page: PDFPage;
  font: PDFFont;
  text: string;
  centerX: number;
  y: number;
  baseSize: number;
  maxWidth: number;
}) {
  const size = fitFontSize(text, font, baseSize, maxWidth);
  const width = font.widthOfTextAtSize(toBaseText(text), size);

  drawPrataText(page, text, centerX - width / 2, y, size, font);
}

function formatNameLine(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleUpperCase("pl-PL");
}

function drawRecipientName(
  page: PDFPage,
  font: PDFFont,
  firstName: string,
  lastName: string,
) {
  const lines = [formatNameLine(firstName), formatNameLine(lastName)].filter(
    Boolean,
  );

  if (lines.length === 0) {
    return;
  }

  const yPositions =
    lines.length === 1
      ? [NAME_SINGLE_LINE_Y]
      : [NAME_FIRST_LINE_Y, NAME_SECOND_LINE_Y];

  lines.slice(0, 2).forEach((line, index) => {
    drawCenteredText({
      page,
      font,
      text: line,
      centerX: NAME_CENTER_X,
      y: yPositions[index],
      baseSize: NAME_BASE_SIZE,
      maxWidth: NAME_MAX_WIDTH,
    });
  });
}

function drawIssuedAt(page: PDFPage, font: PDFFont, issuedAt: string) {
  drawCenteredText({
    page,
    font,
    text: issuedAt,
    centerX: DATE_CENTER_X,
    y: DATE_BASELINE_Y,
    baseSize: DATE_BASE_SIZE,
    maxWidth: DATE_MAX_WIDTH,
  });
}

export async function generateCertificatePdf(
  data: CertificateData,
): Promise<Uint8Array> {
  const templateKey = normalizeCertificateTemplateKey(
    data.templateKey ?? DEFAULT_CERTIFICATE_TEMPLATE_KEY,
  );
  const [templateBytes, fontBytes] = await Promise.all([
    data.templateBytes
      ? Promise.resolve(new Uint8Array(data.templateBytes))
      : loadCertificateTemplate(templateKey),
    loadPrataFont(),
  ]);

  const doc = await PDFDocument.load(templateBytes);
  doc.registerFontkit(fontkit);

  const prata = await doc.embedFont(fontBytes, { subset: false });
  const page = doc.getPage(0);

  drawRecipientName(page, prata, data.firstName, data.lastName);
  drawIssuedAt(page, prata, data.issuedAt);

  return doc.save();
}
