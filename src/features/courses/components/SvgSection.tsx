"use client";

type Props = {
  src: string;
  alt?: string;
};

export function SvgSection({ src, alt }: Props) {
  if (!src) {
    return (
      <div className="border-radius border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        Brak przypisanego pliku SVG.
      </div>
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      className="group block overflow-hidden border-radius border border-[var(--coffee-cappuccino)] bg-white"
      title={alt ?? "SVG"}
    >
      <img src={src} alt={alt ?? "SVG"} loading="lazy" className="h-auto w-full" />
      <div className="border-t border-[var(--coffee-cappuccino)] px-3 py-2 text-xs text-[var(--coffee-espresso)]">
        {alt ?? src}
      </div>
    </a>
  );
}
