"use client";

import { FiAward, FiBook, FiCalendar, FiLogIn, FiMail } from "react-icons/fi";
import { Button } from "@/components/ui";
import type { StudentCourseProgress, StudentDetail } from "@/types/student";

type Props = {
  student: StudentDetail;
  onGrantCertificate: (course: StudentCourseProgress) => void;
  grantingCourseId: string | null;
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCertificateDate(iso: string | null): string {
  if (!iso) return "Certyfikat przyznany.";
  return `Certyfikat przyznany ${new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}.`;
}

export function StudentDetailPanel({
  student,
  onGrantCertificate,
  grantingCourseId,
}: Props) {
  return (
    <div className="space-y-6">
      <section>
        <div className="bg-white border border-[var(--coffee-cappuccino)] border-radius p-5">
          <h3 className="mb-4 text-[var(--text-sm)] font-semibold uppercase tracking-wide text-[var(--coffee-espresso)]">
            Dane kursanta
          </h3>
          <p className="mb-4 text-[var(--text-xl)] font-semibold text-[var(--coffee-charcoal)]">
            {student.fullName}
          </p>
          <ul className="grid gap-3 sm:grid-cols-1">
            <li className="flex items-center gap-3 text-[var(--text-sm)] text-[var(--coffee-charcoal)]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center border-radius bg-[var(--coffee-latte)] text-[var(--coffee-mocha)]">
                <FiMail className="h-4 w-4" aria-hidden />
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
              <span className="flex h-8 w-8 shrink-0 items-center justify-center border-radius bg-[var(--coffee-latte)] text-[var(--coffee-mocha)]">
                <FiCalendar className="h-4 w-4" aria-hidden />
              </span>
              <span>
                <span className="text-[var(--coffee-espresso)]">Rejestracja: </span>
                {formatDateTime(student.registrationDate)}
              </span>
            </li>
            <li className="flex items-center gap-3 text-[var(--text-sm)] text-[var(--coffee-charcoal)]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center border-radius bg-[var(--coffee-latte)] text-[var(--coffee-mocha)]">
                <FiLogIn className="h-4 w-4" aria-hidden />
              </span>
              <span>
                <span className="text-[var(--coffee-espresso)]">Ostatnie logowanie: </span>
                {formatDateTime(student.lastLogin)}
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-[var(--text-base)] font-semibold text-[var(--coffee-charcoal)]">
          <FiBook className="h-5 w-5 text-[var(--coffee-mocha)]" aria-hidden />
          Postep w kursach
        </h3>
        {student.courses.length === 0 ? (
          <div className="bg-white border border-[var(--coffee-cappuccino)] border-radius p-6 text-center text-[var(--text-sm)] text-[var(--coffee-espresso)]">
            Brak zakupionych kursow.
          </div>
        ) : (
          <ul className="space-y-3">
            {student.courses.map((course) => (
              <li
                key={course.courseId}
                className="bg-white border border-[var(--coffee-cappuccino)] border-radius p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
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
                  aria-label={`Postep: ${course.completionPercentage}%`}
                >
                  <div
                    className="h-full bg-[var(--coffee-mocha)] border-radius-sm transition-[width] duration-300"
                    style={{ width: `${course.completionPercentage}%` }}
                  />
                </div>
                <p className="mt-2 text-[var(--text-xs)] text-[var(--coffee-espresso)]">
                  {course.completedItems} / {course.totalItems} materialow
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-[var(--text-xs)] text-[var(--coffee-espresso)]">
                    {course.certificateGranted
                      ? formatCertificateDate(course.certificateGrantedAt)
                      : "Certyfikat oczekuje na decyzje administratora."}
                  </div>
                  <Button
                    variant={course.certificateGranted ? "secondary" : "primary"}
                    size="sm"
                    loading={grantingCourseId === course.courseId}
                    disabled={course.certificateGranted}
                    onClick={() => onGrantCertificate(course)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <FiAward className="h-4 w-4" aria-hidden />
                      {course.certificateGranted
                        ? "Certyfikat przyznany"
                        : "Przyznaj certyfikat"}
                    </span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
