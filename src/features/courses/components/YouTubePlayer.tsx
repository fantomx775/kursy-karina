"use client";

import { useState } from "react";
import { FiPlay } from "react-icons/fi";
import {
  getYouTubeVideoId,
  toYouTubeEmbedUrl,
  toYouTubeThumbnailUrl,
} from "@/lib/utils/youtube";

type Props = {
  url: string;
};

export function YouTubePlayer({ url }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = getYouTubeVideoId(url);

  if (!url || !videoId) {
    return (
      <div className="border-radius border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        Brak linku do YouTube.
      </div>
    );
  }

  const embedUrl = toYouTubeEmbedUrl(url);
  const thumbnailUrl = toYouTubeThumbnailUrl(videoId);

  return (
    <div className="overflow-hidden border-radius border border-[var(--coffee-cappuccino)] bg-black shadow-sm">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {isPlaying ? (
          <iframe
            className="absolute left-0 top-0 h-full w-full"
            src={embedUrl}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden"
            aria-label="Odtwórz wideo"
          >
            <img
              src={thumbnailUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white transition-transform group-hover:scale-105">
              <FiPlay className="h-6 w-6" aria-hidden />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
