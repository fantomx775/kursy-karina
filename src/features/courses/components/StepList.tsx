"use client";

import { FiCheck, FiX } from "react-icons/fi";
import type { CourseItem, CourseSection } from "@/types/course";

type Props = {
  sections: CourseSection[];
  activeItemId: string | null;
  completedIds: Record<string, true>;
  onSelectItem: (itemId: string) => void;
  onRequestClose?: () => void;
};

type SectionEntry = {
  section: CourseSection;
  items: Array<{
    item: CourseItem;
    lessonNumber: number;
  }>;
};

function getBadgeLabel(kind: CourseItem["kind"]): string {
  switch (kind) {
    case "youtube":
      return "Video";
    case "quiz":
      return "Quiz";
    default:
      return "PDF";
  }
}

function createSectionEntries(sections: CourseSection[]): SectionEntry[] {
  let lessonNumber = 0;

  return sections
    .map((section) => ({
      section,
      items: section.items.map((item) => ({
        item,
        lessonNumber: ++lessonNumber,
      })),
    }))
    .filter(({ items }) => items.length > 0);
}

export function StepList({
  sections,
  activeItemId,
  completedIds,
  onSelectItem,
  onRequestClose,
}: Props) {
  const sectionEntries = createSectionEntries(sections);
  const items = sectionEntries.flatMap((entry) =>
    entry.items.map(({ item }) => item),
  );
  const completedCount = items.reduce(
    (accumulator, item) => accumulator + (completedIds[item.id] ? 1 : 0),
    0,
  );

  return (
    <nav
      aria-label="Zawartość kursu"
      className="flex min-h-0 flex-1 flex-col border-radius border border-[var(--coffee-cappuccino)] bg-white shadow-sm"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--coffee-cappuccino)] bg-white px-3 py-2">
        <div className="text-sm font-semibold text-[var(--coffee-charcoal)]">
          Zawartość kursu
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-[var(--coffee-espresso)]">
            {completedCount}/{items.length}
          </div>
          {onRequestClose ? (
            <button
              type="button"
              onClick={onRequestClose}
              className="inline-flex h-8 w-8 items-center justify-center border-radius border border-[var(--coffee-cappuccino)] bg-white text-sm text-[var(--coffee-espresso)] hover:bg-[var(--coffee-cream)]"
              aria-label="Zamknij kroki"
            >
              <FiX className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-3 p-2">
          {sectionEntries.map(({ section, items: sectionItems }) => {
            const sectionCompletedCount = sectionItems.reduce(
              (accumulator, { item }) =>
                accumulator + (completedIds[item.id] ? 1 : 0),
              0,
            );

            return (
              <section key={section.id} className="space-y-2">
                <div className="flex items-baseline justify-between gap-2 px-2 pt-1">
                  <h3 className="truncate text-xs font-semibold uppercase text-[var(--coffee-espresso)]">
                    {section.title}
                  </h3>
                  <div className="shrink-0 text-[11px] text-[var(--coffee-espresso)]">
                    {sectionCompletedCount}/{sectionItems.length}
                  </div>
                </div>

                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:flex-col">
                  {sectionItems.map(({ item, lessonNumber }) => {
                    const isActive = item.id === activeItemId;
                    const isDone = Boolean(completedIds[item.id]);
                    const badge = getBadgeLabel(item.kind);

                    return (
                      <li key={item.id} className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onSelectItem(item.id)}
                          className={[
                            "group flex w-full items-center gap-3 border-radius border px-3 py-2 text-left transition-colors",
                            isDone
                              ? isActive
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100"
                              : isActive
                                ? "border-[var(--coffee-mocha)] bg-[var(--coffee-cream)]"
                                : "border-[var(--coffee-cappuccino)] bg-white hover:bg-[var(--coffee-cream)]",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "flex h-7 w-7 shrink-0 items-center justify-center border-radius text-xs font-semibold",
                              isDone
                                ? "border border-emerald-200 bg-emerald-100 text-emerald-700"
                                : "bg-[var(--coffee-latte)] text-[var(--coffee-espresso)]",
                            ].join(" ")}
                          >
                            {isDone ? (
                              <FiCheck className="h-4 w-4" aria-hidden />
                            ) : (
                              lessonNumber
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-[var(--coffee-charcoal)]">
                              {item.title}
                            </div>
                            <div className="text-xs text-[var(--coffee-espresso)]">
                              {badge}
                              {isDone ? " • Ukończone" : ""}
                            </div>
                          </div>
                          <div className="border-radius-sm bg-[var(--coffee-latte)] px-2 py-1 text-[11px] font-semibold text-[var(--coffee-espresso)]">
                            {badge}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
