const DEFAULT_REDIRECT = "/dashboard";

export function getSafeRedirectPath(
  next: string | null | undefined,
): string {
  if (!next || typeof next !== "string") {
    return DEFAULT_REDIRECT;
  }

  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return DEFAULT_REDIRECT;
  }

  if (trimmed.includes("://")) {
    return DEFAULT_REDIRECT;
  }

  return trimmed;
}

export function buildAuthPath(
  path: "/login" | "/register",
  options?: { next?: string; intent?: string },
): string {
  const params = new URLSearchParams();

  if (options?.next) {
    params.set("next", options.next);
  }

  if (options?.intent) {
    params.set("intent", options.intent);
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
