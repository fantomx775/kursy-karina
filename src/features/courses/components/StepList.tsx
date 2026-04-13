"use client";

import type { CourseItem } from "@/types/course";

type Props = {
  items: CourseItem[];
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
    default:
      return "Tekst";
  }
}

export function StepList({
  items,
  activeItemId,
  completedIds,
  onSelectItem,
  onRequestClose,
}: Props) {
  const completedCount = items.reduce(
    (accumulator, item) => accumulator + (completedIds[item.id] ? 1 : 0),
    0,
  );

  return (
    <nav
      aria-label="Course steps"
      className="flex min-h-0 flex-1 flex-col border-radius border border-[var(--coffee-cappuccino)] bg-white shadow-sm"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--coffee-cappuccino)] bg-white px-3 py-2">
        <div className="text-sm font-semibold text-[var(--coffee-charcoal)]">
          Zawartosc kursu
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
        <ul className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 md:flex md:flex-col">
          {items.map((item, index) => {
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
                    {isDone ? "OK" : index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[var(--coffee-charcoal)]">
                      {item.title}
                    </div>
                    <div className="text-xs text-[var(--coffee-espresso)]">
                      {badge}
                      {isDone ? " • Ukonczone" : ""}
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
    </nav>
  );
}
