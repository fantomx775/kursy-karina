export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id || null;
    }

    if (parsed.pathname.startsWith("/embed/")) {
      const id = parsed.pathname.replace("/embed/", "");
      return id || null;
    }

    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

export function toYouTubeEmbedUrl(url: string) {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

export function toYouTubeThumbnailUrl(
  videoId: string,
  quality: "default" | "hqdefault" = "hqdefault",
) {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}
