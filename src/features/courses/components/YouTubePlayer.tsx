"use client";

import { toYouTubeEmbedUrl } from "@/lib/utils/youtube";

type Props = {
  url: string;
};

export function YouTubePlayer({ url }: Props) {
  if (!url) {
    return (
      <div className="border-radius border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        Brak linku do YouTube.
      </div>
    );
  }

  const embedUrl = toYouTubeEmbedUrl(url);

  return (
    <div className="overflow-hidden border-radius border border-[var(--coffee-cappuccino)] bg-black shadow-sm">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute left-0 top-0 h-full w-full"
          src={embedUrl}
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
