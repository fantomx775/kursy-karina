"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";
import type { CourseWithContent } from "@/types/course";
import { createBrowserSupabaseClient } from "@/services/supabase/browser";
import { useAuth } from "@/features/auth/AuthContext";
import { CourseStepCard } from "./components/CourseStepCard";
import { StepList } from "./components/StepList";

type Props = {
  course: CourseWithContent;
  completedItemIds: string[];
};

export function CourseViewer({ course, completedItemIds }: Props) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const { user } = useAuth();
  const steps = useMemo(
    () => course.sections.flatMap((section) => section.items),
    [course.sections],
  );
  const [completedIds, setCompletedIds] = useState<Record<string, true>>({});
  const [activeItemId, setActiveItemId] = useState<string | null>(
    steps[0]?.id ?? null,
  );

  useEffect(() => {
    const seed: Record<string, true> = {};
    completedItemIds.forEach((id) => {
      seed[id] = true;
    });
    setCompletedIds(seed);
  }, [completedItemIds]);

  useEffect(() => {
    const elements = steps
      .map((step) => document.getElementById(step.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const top = visible[0]?.target as HTMLElement | undefined;
        if (top?.dataset.stepId) {
          setActiveItemId(top.dataset.stepId);
        }
      },
      {
        root: null,
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0.05, 0.25, 0.5, 0.75],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [steps]);

  const onSelectItem = (itemId: string) => {
    const element = document.getElementById(itemId);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveItemId(itemId);
  };

  const onToggleCompleted = async (itemId: string) => {
    if (!user) return;
    const shouldComplete = !completedIds[itemId];

    setCompletedIds((prev) => {
      const next = { ...prev };
      if (shouldComplete) next[itemId] = true;
      else delete next[itemId];
      return next;
    });

    await supabase.from("course_progress").upsert(
      {
        user_id: user.id,
        course_id: course.id,
        item_id: itemId,
        completed: shouldComplete,
        last_watched: new Date().toISOString(),
      },
      { onConflict: "user_id,item_id" },
    );
  };

  const completedCount = steps.reduce(
    (acc, step) => acc + (completedIds[step.id] ? 1 : 0),
    0,
  );

  return (
    <div className="min-h-dvh bg-[var(--coffee-cream)] text-[var(--coffee-charcoal)]">
      <div className="page-width learn-page-content pb-5 sm:pb-6">
        <header className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-[var(--coffee-mocha)] hover:text-[var(--coffee-espresso)] transition-colors"
            >
              <FiChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
              Powrót do moich kursów
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
            <p className="text-sm text-[var(--coffee-espresso)]">
              Kontynuuj naukę krok po kroku. Postęp zapisuje się automatycznie.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="border-radius border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 text-sm text-[var(--coffee-espresso)] shadow-sm">
              Postęp:{" "}
              <span className="font-semibold text-[var(--coffee-charcoal)]">
                {completedCount}/{steps.length}
              </span>
            </div>
            {completedCount === steps.length && steps.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/api/courses/${course.slug}/certificate`}
                  download
                  className="inline-block border-radius border border-[var(--coffee-mocha)] bg-[var(--coffee-mocha)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--coffee-espresso)]"
                >
                  Pobierz certyfikat
                </a>
                <a
                  href={`/api/courses/${course.slug}/certificate?preview=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border-radius border border-[var(--coffee-mocha)] bg-white px-4 py-2 text-sm font-medium text-[var(--coffee-mocha)] shadow-sm hover:bg-[var(--coffee-cream)]"
                >
                  Podgląd certyfikatu
                </a>
              </div>
            )}
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-[320px_1fr]">
          <aside className="sticky top-[calc(var(--sticky-top-offset)+0.75rem)] hidden self-start md:block">
            <div className="flex max-h-[calc(100dvh-var(--sticky-top-offset)-1.5rem)] flex-col overflow-hidden">
              <StepList
                items={steps}
                activeItemId={activeItemId}
                completedIds={completedIds}
                onSelectItem={onSelectItem}
              />
            </div>
          </aside>

          <main>
            <div className="md:hidden mb-4">
              <StepList
                items={steps}
                activeItemId={activeItemId}
                completedIds={completedIds}
                onSelectItem={onSelectItem}
              />
            </div>
            <div className="mt-4 md:mt-0 space-y-6">
              {steps.length === 0 ? (
                <div className="border-radius border border-[var(--coffee-cappuccino)] bg-white p-6 text-[var(--coffee-espresso)]">
                  Materiały kursu są w przygotowaniu.
                </div>
              ) : (
                course.sections.map((section) => (
                  <div key={section.id} className="space-y-4">
                    <h2 className="text-xl font-semibold text-[var(--coffee-charcoal)]">
                      {section.title}
                    </h2>
                    {section.items.map((item) => (
                      <CourseStepCard
                        key={item.id}
                        item={item}
                        isCompleted={Boolean(completedIds[item.id])}
                        onToggleCompleted={onToggleCompleted}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
