"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";
import type { CourseWithContent } from "@/types/course";
import { useAuth } from "@/features/auth/AuthContext";
import { createBrowserSupabaseClient } from "@/services/supabase/browser";
import { CourseStepCard } from "./components/CourseStepCard";
import { StepList } from "./components/StepList";

type Props = {
  course: CourseWithContent;
  completedItemIds: string[];
  certificateGranted: boolean;
  certificateGrantedAt: string | null;
};

function formatCertificateDate(iso: string | null): string {
  if (!iso) {
    return "Certyfikat jest juz dostepny.";
  }

  return `Certyfikat przyznano ${new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}.`;
}

export function CourseViewer({
  course,
  completedItemIds,
  certificateGranted,
  certificateGrantedAt,
}: Props) {
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
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              (right.intersectionRatio ?? 0) - (left.intersectionRatio ?? 0),
          );
        const topElement = visibleEntries[0]?.target as HTMLElement | undefined;
        if (topElement?.dataset.stepId) {
          setActiveItemId(topElement.dataset.stepId);
        }
      },
      {
        root: null,
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0.05, 0.25, 0.5, 0.75],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [steps]);

  const persistCompletion = async (itemId: string, completed: boolean) => {
    if (!user) {
      return;
    }

    await supabase.from("course_progress").upsert(
      {
        user_id: user.id,
        course_id: course.id,
        item_id: itemId,
        completed,
        last_watched: new Date().toISOString(),
      },
      { onConflict: "user_id,item_id" },
    );
  };

  const onSelectItem = (itemId: string) => {
    const element = document.getElementById(itemId);
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveItemId(itemId);
  };

  const onToggleCompleted = async (itemId: string) => {
    if (!user) {
      return;
    }

    const shouldComplete = !completedIds[itemId];

    setCompletedIds((previous) => {
      const next = { ...previous };
      if (shouldComplete) {
        next[itemId] = true;
      } else {
        delete next[itemId];
      }
      return next;
    });

    await persistCompletion(itemId, shouldComplete);
  };

  const onQuizPassed = async (itemId: string) => {
    if (!user || completedIds[itemId]) {
      return;
    }

    setCompletedIds((previous) => ({
      ...previous,
      [itemId]: true,
    }));

    await persistCompletion(itemId, true);
  };

  const completedCount = steps.reduce(
    (accumulator, step) => accumulator + (completedIds[step.id] ? 1 : 0),
    0,
  );
  const completionPercentage =
    steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="min-h-dvh bg-[var(--coffee-cream)] text-[var(--coffee-charcoal)]">
      <div className="page-width learn-page-content pb-5 sm:pb-6">
        <header className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-[var(--coffee-mocha)] transition-colors hover:text-[var(--coffee-espresso)]"
            >
              <FiChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
              Powrot do moich kursow
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
            <p className="text-sm text-[var(--coffee-espresso)]">
              Kontynuuj nauke krok po kroku. Postep zapisuje sie automatycznie.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="border-radius border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 text-sm text-[var(--coffee-espresso)] shadow-sm">
              Postep:{" "}
              <span className="font-semibold text-[var(--coffee-charcoal)]">
                {completedCount}/{steps.length} ({completionPercentage}%)
              </span>
            </div>
            {certificateGranted ? (
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
                  Podglad certyfikatu
                </a>
              </div>
            ) : null}
          </div>
        </header>

        <div className="mb-4 rounded-md border border-[var(--coffee-cappuccino)] bg-white px-4 py-3 text-sm text-[var(--coffee-espresso)] shadow-sm">
          {certificateGranted
            ? formatCertificateDate(certificateGrantedAt)
            : "Certyfikat bedzie dostepny po decyzji administratora."}
        </div>

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
            <div className="mb-4 md:hidden">
              <StepList
                items={steps}
                activeItemId={activeItemId}
                completedIds={completedIds}
                onSelectItem={onSelectItem}
              />
            </div>
            <div className="mt-4 space-y-6 md:mt-0">
              {steps.length === 0 ? (
                <div className="border-radius border border-[var(--coffee-cappuccino)] bg-white p-6 text-[var(--coffee-espresso)]">
                  Materialy kursu sa w przygotowaniu.
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
                        onQuizPassed={onQuizPassed}
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
