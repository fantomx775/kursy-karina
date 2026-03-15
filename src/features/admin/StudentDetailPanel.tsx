"use client";

import { FiMail, FiCalendar, FiLogIn, FiBook } from "react-icons/fi";
import type { StudentDetail } from "@/types/student";

type Props = {
  student: StudentDetail;
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StudentDetailPanel({ student }: Props) {
  return (
    <div className="space-y-6">
      {/* Dane kursanta */}
      <section>
        <div className="bg-white border border-[var(--coffee-cappuccino)] border-radius p-5">
          <h3 className="text-[var(--text-sm)] font-semibold text-[var(--coffee-espresso)] uppercase tracking-wide mb-4">
            Dane kursanta
          </h3>
          <p className="text-[var(--text-xl)] font-semibold text-[var(--coffee-charcoal)] mb-4">
            {student.fullName}
          </p>
          <ul className="grid gap-3 sm:grid-cols-1">
            <li className="flex items-center gap-3 text-[var(--text-sm)] text-[var(--coffee-charcoal)]">
              <span className="flex shrink-0 w-8 h-8 items-center justify-center border-radius bg-[var(--coffee-latte)] text-[var(--coffee-mocha)]">
                <FiMail className="w-4 h-4" aria-hidden />
              </span>
              <span>
                <span className="text-[var(--coffee-espresso)]">Email: </span>
                <a
                  href={`mailto:${student.email}`}
                  className="text-[var(--coffee-mocha)] hover:underline"
                >
                  {student.email}
                </a>
              </span>
            </li>
            <li className="flex items-center gap-3 text-[var(--text-sm)] text-[var(--coffee-charcoal)]">
              <span className="flex shrink-0 w-8 h-8 items-center justify-center border-radius bg-[var(--coffee-latte)] text-[var(--coffee-mocha)]">
                <FiCalendar className="w-4 h-4" aria-hidden />
              </span>
              <span>
                <span className="text-[var(--coffee-espresso)]">Rejestracja: </span>
                {formatDateTime(student.registrationDate)}
              </span>
            </li>
            <li className="flex items-center gap-3 text-[var(--text-sm)] text-[var(--coffee-charcoal)]">
              <span className="flex shrink-0 w-8 h-8 items-center justify-center border-radius bg-[var(--coffee-latte)] text-[var(--coffee-mocha)]">
                <FiLogIn className="w-4 h-4" aria-hidden />
              </span>
              <span>
                <span className="text-[var(--coffee-espresso)]">Ostatnie logowanie: </span>
                {formatDateTime(student.lastLogin ?? null)}
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Postęp w kursach */}
      <section>
        <h3 className="flex items-center gap-2 text-[var(--text-base)] font-semibold text-[var(--coffee-charcoal)] mb-3">
          <FiBook className="w-5 h-5 text-[var(--coffee-mocha)]" aria-hidden />
          Postęp w kursach
        </h3>
        {student.courses.length === 0 ? (
          <div className="bg-white border border-[var(--coffee-cappuccino)] border-radius p-6 text-center text-[var(--text-sm)] text-[var(--coffee-espresso)]">
            Brak zakupionych kursów.
          </div>
        ) : (
          <ul className="space-y-3">
            {student.courses.map((course) => (
              <li
                key={course.courseId}
                className="bg-white border border-[var(--coffee-cappuccino)] border-radius p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-[var(--text-sm)] font-medium text-[var(--coffee-charcoal)]">
                    {course.courseTitle}
                  </span>
                  <span className="text-[var(--text-sm)] font-semibold text-[var(--coffee-mocha)]">
                    {course.completionPercentage}%
                  </span>
                </div>
                <div
                  className="h-2.5 w-full overflow-hidden bg-[var(--coffee-latte)] border-radius-sm"
                  role="progressbar"
                  aria-valuenow={course.completionPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Postęp: ${course.completionPercentage}%`}
                >
                  <div
                    className="h-full bg-[var(--coffee-mocha)] border-radius-sm transition-[width] duration-300"
                    style={{ width: `${course.completionPercentage}%` }}
                  />
                </div>
                <p className="mt-2 text-[var(--text-xs)] text-[var(--coffee-espresso)]">
                  {course.completedItems} / {course.totalItems} materiałów
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
