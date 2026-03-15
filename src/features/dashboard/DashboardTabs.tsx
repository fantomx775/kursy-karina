"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { AccountForm } from "./AccountForm";
import { AdminDashboard, type AdminTabId } from "@/features/admin/AdminDashboard";
import type { UserProfile } from "@/types/user";
import type { CourseStatus } from "@/types/course";

export type CourseCard = {
  id: string;
  title: string;
  description: string;
  slug: string;
  status: CourseStatus;
  adminAccess: boolean;
  completionPercentage: number;
};

type Props = {
  profile: UserProfile;
  courseCards: CourseCard[];
  isAdmin: boolean;
  emptyState: boolean;
};

type TabId =
  | "courses"
  | "account"
  | "admin-courses"
  | "admin-students"
  | "admin-coupons"
  | "admin-stats";

const STUDENT_TABS: { key: TabId; label: string }[] = [
  { key: "courses", label: "Moje kursy" },
  { key: "account", label: "Moje konto" },
];

const ADMIN_TABS: { key: TabId; label: string }[] = [
  { key: "admin-courses", label: "Kursy" },
  { key: "admin-students", label: "Uczniowie" },
  { key: "admin-coupons", label: "Kupony" },
  { key: "admin-stats", label: "Statystyki" },
];

function getAdminTabId(tab: TabId): AdminTabId | null {
  switch (tab) {
    case "admin-courses":
      return "courses";
    case "admin-students":
      return "students";
    case "admin-coupons":
      return "coupons";
    case "admin-stats":
      return "stats";
    default:
      return null;
  }
}

export function DashboardTabs({
  profile,
  courseCards,
  isAdmin,
  emptyState,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("courses");

  const tabs: { key: TabId; label: string }[] = [
    ...STUDENT_TABS,
    ...(isAdmin ? ADMIN_TABS : []),
  ];

  return (
    <>
      <div className="mb-6 flex gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`px-4 py-2 border border-radius ${
              activeTab === tab.key
                ? "border-[var(--coffee-mocha)] bg-[var(--coffee-cream)] text-[var(--coffee-mocha)]"
                : "border-[var(--coffee-cappuccino)] text-[var(--coffee-espresso)] hover:bg-[var(--coffee-cream)]"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "courses" && (
        <>
          {emptyState ? (
            <div className="bg-white border border-[var(--table-border)] border-radius overflow-hidden">
              <div className="p-6 sm:p-8 text-center">
                <h2 className="text-lg font-semibold text-[var(--coffee-charcoal)] mb-2">
                  Brak zakupionych kursów
                </h2>
                <p className="text-[var(--coffee-espresso)] mb-4 text-sm">
                  Dodaj kursy do koszyka i rozpocznij naukę.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/courses">
                    <Button variant="primary">Przeglądaj kursy</Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {courseCards.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border border-[var(--table-border)] border-radius overflow-hidden p-5 sm:p-6 transition-shadow duration-300 hover:bg-[var(--coffee-cream)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-[var(--coffee-charcoal)]">
                      {course.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        rounded={false}
                        variant={course.status === "active" ? "success" : "warning"}
                        size="sm"
                      >
                        {course.status === "active" ? "Aktywny" : "Nieaktywny"}
                      </Badge>
                      {course.adminAccess ? (
                        <Badge rounded={false} variant="secondary" size="sm">
                          Dostęp admina
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--coffee-espresso)] mt-2 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="mt-4 h-2 bg-[var(--coffee-latte)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--coffee-mocha)] rounded-full transition-all duration-500"
                      style={{ width: `${course.completionPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-[var(--coffee-espresso)] mt-2">
                    Ukończono: {course.completionPercentage}%
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {course.completionPercentage === 100 ? (
                      <>
                        <a
                          href={`/api/courses/${course.slug}/certificate`}
                          download
                        >
                          <Button variant="primary">Pobierz certyfikat</Button>
                        </a>
                        <a
                          href={`/api/courses/${course.slug}/certificate?preview=1`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline">Podgląd certyfikatu</Button>
                        </a>
                        <Link href={`/learn/${course.slug}`}>
                          <Button variant="outline">Otwórz kurs</Button>
                        </Link>
                        {isAdmin ? (
                          <Link href={`/dashboard/courses/${course.id}/edit`}>
                            <Button variant="secondary">Edytuj</Button>
                          </Link>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <Link href={`/learn/${course.slug}`}>
                          <Button variant="primary">Kontynuuj naukę</Button>
                        </Link>
                        {isAdmin ? (
                          <Link href={`/dashboard/courses/${course.id}/edit`}>
                            <Button variant="secondary">Edytuj</Button>
                          </Link>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "account" && (
        <div className="bg-white border border-[var(--table-border)] border-radius p-6 sm:p-8">
          <AccountForm profile={profile} />
        </div>
      )}

      {isAdmin && getAdminTabId(activeTab) !== null && (
        <AdminDashboard
          embedded
          activeAdminTab={getAdminTabId(activeTab)!}
        />
      )}
    </>
  );
}
