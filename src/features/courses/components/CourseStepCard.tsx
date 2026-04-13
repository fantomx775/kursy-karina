"use client";

import type { CourseItem } from "@/types/course";
import { QuizSection } from "./QuizSection";
import { SvgSection } from "./SvgSection";
import { YouTubePlayer } from "./YouTubePlayer";

type Props = {
  item: CourseItem;
  isCompleted: boolean;
  onToggleCompleted: (itemId: string) => void;
  onQuizPassed: (itemId: string) => Promise<void> | void;
};

function getBadgeLabel(item: CourseItem): string {
  switch (item.kind) {
    case "youtube":
      return "Video";
    case "quiz":
      return "Quiz";
    default:
      return "Tekst";
  }
}

function getStatusLabel(item: CourseItem, isCompleted: boolean): string {
  if (item.kind === "quiz") {
    return isCompleted ? "Zaliczone" : "Do zaliczenia";
  }

  return isCompleted ? "Ukonczone" : "Nieukonczone";
}

export function CourseStepCard({
  item,
  isCompleted,
  onToggleCompleted,
  onQuizPassed,
}: Props) {
  const badgeLabel = getBadgeLabel(item);

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
            {getStatusLabel(item, isCompleted)}
          </div>
        </div>

        {item.kind === "quiz" ? null : (
          <button
            type="button"
            onClick={() => onToggleCompleted(item.id)}
            className={`h-10 border-radius px-4 text-sm font-medium transition-colors ${
              isCompleted
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-[var(--coffee-mocha)] text-white hover:bg-[var(--coffee-espresso)]"
            }`}
          >
            {isCompleted ? "Oznacz jako nieukonczone" : "Oznacz jako ukonczone"}
          </button>
        )}
      </div>

      <div className="mt-4">
        {item.kind === "svg" ? (
          <SvgSection src={item.asset_path ?? ""} alt={item.title} />
        ) : null}

        {item.kind === "youtube" ? (
          <YouTubePlayer url={item.youtube_url ?? ""} />
        ) : null}

        {item.kind === "quiz" ? (
          <QuizSection item={item} isCompleted={isCompleted} onPass={onQuizPassed} />
        ) : null}
      </div>
    </section>
  );
}
