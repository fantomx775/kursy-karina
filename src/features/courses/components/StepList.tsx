"use client";

import { useEffect, useMemo, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "@/lib/utils";
import type { CourseItem, CourseSection } from "@/types/course";

type Props = {
  sections: CourseSection[];
  activeItemId: string | null;
  completedIds: Record<string, true>;
  onSelectItem: (itemId: string) => void;
  onRequestClose?: () => void;
};

function getBadgeLabel(kind: CourseItem["kind"]): string {
  switch (kind) {
    case "youtube":
      return "Video";
    case "quiz":
      return "Quiz";
    case "svg":
      return "PDF";
    default:
      return "PDF";
  }
}

export function StepList({
  sections,
  activeItemId,
  completedIds,
  onSelectItem,
  onRequestClose,
}: Props) {
  const items = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections],
  );

  const itemGlobalIndex = useMemo(() => {
    const indexById = new Map<string, number>();
    items.forEach((item, index) => {
      indexById.set(item.id, index);
    });
    return indexById;
  }, [items]);

  const [collapsedSectionIds, setCollapsedSectionIds] = useState<
    Set<string>
  >(() => new Set());

  useEffect(() => {
    if (!activeItemId) {
      return;
    }

    const activeSection = sections.find((section) =>
      section.items.some((item) => item.id === activeItemId),
    );

    if (!activeSection) {
      return;
    }

    setCollapsedSectionIds((previous) => {
      if (!previous.has(activeSection.id)) {
        return previous;
      }

      const next = new Set(previous);
      next.delete(activeSection.id);
      return next;
    });
  }, [activeItemId, sections]);

  const completedCount = items.reduce(
    (accumulator, item) => accumulator + (completedIds[item.id] ? 1 : 0),
    0,
  );

  const toggleSection = (sectionId: string) => {
    setCollapsedSectionIds((previous) => {
      const next = new Set(previous);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  return (
    <nav
      aria-label="Course steps"
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
              x
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-2 p-2">
          {sections.map((section) => {
            const isCollapsed = collapsedSectionIds.has(section.id);
            const sectionCompletedCount = section.items.reduce(
              (accumulator, item) =>
                accumulator + (completedIds[item.id] ? 1 : 0),
              0,
            );
            const sectionLabel =
              section.title.trim() || "Sekcja bez tytułu";

            return (
              <section
                key={section.id}
                className="border-radius border border-[var(--coffee-cappuccino)] bg-white"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={!isCollapsed}
                  aria-controls={`section-panel-${section.id}`}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[var(--coffee-cream)]"
                >
                  <span className="shrink-0 text-[var(--coffee-espresso)]">
                    <FiChevronDown
                      aria-hidden
                      className={cn(
                        "h-4 w-4 transition-transform duration-300 ease-out motion-reduce:transition-none",
                        !isCollapsed && "rotate-180",
                      )}
                    />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--coffee-charcoal)]">
                    {sectionLabel}
                  </span>
                  <span className="shrink-0 text-xs text-[var(--coffee-espresso)]">
                    {sectionCompletedCount}/{section.items.length}
                  </span>
                </button>

                <div
                  id={`section-panel-${section.id}`}
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
                    isCollapsed
                      ? "grid-rows-[0fr] opacity-0"
                      : "grid-rows-[1fr] opacity-100",
                  )}
                >
                  <div className="overflow-hidden" inert={isCollapsed ? true : undefined}>
                    <ul
                      aria-hidden={isCollapsed}
                      className="grid grid-cols-1 gap-2 border-t border-[var(--coffee-cappuccino)] p-2 sm:grid-cols-2 md:flex md:flex-col"
                    >
                      {section.items.map((item) => {
                      const isActive = item.id === activeItemId;
                      const isDone = Boolean(completedIds[item.id]);
                      const badge = getBadgeLabel(item.kind);
                      const globalIndex = itemGlobalIndex.get(item.id) ?? 0;

                      return (
                        <li key={item.id} className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onSelectItem(item.id)}
                            className={[
                              "group flex w-full items-center gap-3 border-radius border px-3 py-2 text-left transition-colors",
                              isActive
                                ? "border-[var(--coffee-mocha)] bg-[var(--coffee-cream)]"
                                : "border-[var(--coffee-cappuccino)] bg-white hover:bg-[var(--coffee-cream)]",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "flex h-7 w-7 items-center justify-center border-radius text-xs font-semibold",
                                isDone
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-[var(--coffee-latte)] text-[var(--coffee-espresso)]",
                              ].join(" ")}
                            >
                              {isDone ? "OK" : globalIndex + 1}
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
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
