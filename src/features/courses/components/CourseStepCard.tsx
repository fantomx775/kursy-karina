"use client";

import type { CourseItem } from "@/types/course";
import { SvgSection } from "./SvgSection";
import { YouTubePlayer } from "./YouTubePlayer";

type Props = {
  item: CourseItem;
  isCompleted: boolean;
  onToggleCompleted: (itemId: string) => void;
};

export function CourseStepCard({ item, isCompleted, onToggleCompleted }: Props) {
  const badgeLabel = item.kind === "svg" ? "SVG" : "YouTube";

  return (
    <section
      id={item.id}
      data-step-id={item.id}
      className="scroll-mt-24 border-radius border border-[var(--coffee-cappuccino)] bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-base font-semibold text-[var(--coffee-charcoal)]">
              {item.title}
            </div>
            <span className="border-radius-sm bg-[var(--coffee-latte)] px-2 py-1 text-[11px] font-semibold text-[var(--coffee-espresso)]">
              {badgeLabel}
            </span>
          </div>
          <div className="text-sm text-[var(--coffee-espresso)]">
            {isCompleted ? "Ukończone ✓" : "Nieukończone"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onToggleCompleted(item.id)}
          className={`h-10 border-radius px-4 text-sm font-medium transition-colors ${
            isCompleted
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-[var(--coffee-mocha)] text-white hover:bg-[var(--coffee-espresso)]"
          }`}
        >
          {isCompleted ? "Oznacz jako nieukończone" : "Oznacz jako ukończone"}
        </button>
      </div>

      <div className="mt-4">
        {item.kind === "svg" ? (
          <SvgSection src={item.asset_path ?? ""} alt={item.title} />
        ) : (
          <YouTubePlayer url={item.youtube_url ?? ""} />
        )}
      </div>
    </section>
  );
}
