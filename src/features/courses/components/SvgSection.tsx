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
    <div className="overflow-hidden border-radius border border-[var(--coffee-cappuccino)] bg-white">
      <img
        src={src}
        alt={alt ?? "Materiał tekstowy"}
        loading="lazy"
        className="pointer-events-none h-auto w-full select-none"
        draggable={false}
      />
    </div>
  );
}
