"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import {
  AdminDashboard,
  type AdminTabId,
} from "@/features/admin/AdminDashboard";
import { CertificateActions } from "@/features/certificates/CertificateActions";
import { formatAccessDuration } from "@/lib/accessDuration";
import { getCourseDescriptionExcerpt } from "@/lib/courseDescription";
import type { CourseStatus } from "@/types/course";
import type { UserProfile } from "@/types/user";
import { AccountForm } from "./AccountForm";

export type CourseCard = {
  id: string;
  title: string;
  description: string;
  slug: string;
  status: CourseStatus;
  adminAccess: boolean;
  accessStatus: "active" | "pending" | "expired";
  accessExpiresAt: string | null;
  accessDurationMonths: number | null;
  canRenewAccess: boolean;
  saleStatus: "open" | "coming_soon" | "inactive";
  completionPercentage: number;
  certificateGranted: boolean;
  certificateGrantedAt: string | null;
  certificateGenerated: boolean;
  certificateGeneratedAt: string | null;
  certificateIssuedAt: string | null;
  certificateRegenerationAllowed: boolean;
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
  | "admin-access"
  | "admin-certificates"
  | "admin-coupons"
  | "admin-stats";

const STUDENT_TABS: { key: TabId; label: string }[] = [
  { key: "courses", label: "Moje kursy" },
  { key: "account", label: "Moje konto" },
];

const ADMIN_TABS: { key: TabId; label: string }[] = [
  { key: "admin-courses", label: "Zarządzanie kursami" },
  { key: "admin-students", label: "Kursanci" },
  { key: "admin-access", label: "Dostępy" },
  { key: "admin-certificates", label: "Certyfikaty" },
  { key: "admin-coupons", label: "Kupony" },
  { key: "admin-stats", label: "Statystyki" },
];

function getAdminTabId(tab: TabId): AdminTabId | null {
  switch (tab) {
    case "admin-courses":
      return "courses";
    case "admin-students":
      return "students";
    case "admin-access":
      return "access";
    case "admin-certificates":
      return "certificates";
    case "admin-coupons":
      return "coupons";
    case "admin-stats":
      return "stats";
    default:
      return null;
  }
}

function formatCertificateDate(iso: string | null): string {
  if (!iso) {
    return "Certyfikat odebrany.";
  }

  return `Certyfikat odebrany: ${new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;
}

function formatAccessDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getAccessNotice(course: CourseCard): string {
  if (course.adminAccess) {
    return "Masz techniczny podgląd admina. Uczestnik widzi materiały dopiero po aktywacji dostępu.";
  }

  if (course.accessStatus === "pending") {
    const duration = course.accessDurationMonths
      ? ` Po aktywacji dostęp będzie trwał ${formatAccessDuration(
          course.accessDurationMonths,
        )}.`
      : "";

    return `Zakup jest potwierdzony. Dostęp do materiałów uruchomi administrator.${duration} Czas dostępu zacznie się liczyć dopiero od aktywacji.`;
  }

  if (course.accessStatus === "active") {
    return course.accessExpiresAt
      ? `Dostęp aktywny do: ${formatAccessDate(course.accessExpiresAt)}.`
      : "Dostęp aktywny.";
  }

  const expiredAt = course.accessExpiresAt
    ? ` Dostęp był aktywny do: ${formatAccessDate(course.accessExpiresAt)}.`
    : "";
  const renewal = course.canRenewAccess
    ? " Możesz przedłużyć dostęp teraz."
    : " Przedłużenie będzie możliwe, gdy sprzedaż zostanie otwarta.";

  return `Dostęp do materiałów wygasł.${expiredAt}${renewal} Postęp i certyfikat zostają zapisane.`;
}

export function DashboardTabs({
  profile,
  courseCards,
  isAdmin,
  emptyState,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("courses");
  const [localCourseCards, setLocalCourseCards] = useState(courseCards);
  const [certificateActionCount, setCertificateActionCount] = useState<
    number | null
  >(null);
  const [pendingAccessCount, setPendingAccessCount] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setLocalCourseCards(courseCards);
  }, [courseCards]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    let active = true;
    fetch("/api/admin/certificates/summary")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active) {
          setCertificateActionCount(data?.actionRequiredCount ?? 0);
        }
      })
      .catch(() => {
        if (active) {
          setCertificateActionCount(null);
        }
      });

    fetch("/api/admin/access/pending")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active) {
          setPendingAccessCount(data?.pendingAccess?.length ?? 0);
        }
      })
      .catch(() => {
        if (active) {
          setPendingAccessCount(null);
        }
      });

    return () => {
      active = false;
    };
  }, [isAdmin]);

  const tabs: { key: TabId; label: string }[] = [
    ...STUDENT_TABS,
    ...(isAdmin ? ADMIN_TABS : []),
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
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
            <span className="inline-flex items-center gap-2">
              {tab.label}
              {tab.key === "admin-access" &&
              pendingAccessCount != null &&
              pendingAccessCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--coffee-mocha)] px-1.5 py-0.5 text-xs font-semibold text-white">
                  {pendingAccessCount}
                </span>
              ) : null}
              {tab.key === "admin-certificates" &&
              certificateActionCount != null &&
              certificateActionCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--coffee-mocha)] px-1.5 py-0.5 text-xs font-semibold text-white">
                  {certificateActionCount}
                </span>
              ) : null}
            </span>
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
              {localCourseCards.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border border-[var(--table-border)] border-radius overflow-hidden p-5 sm:p-6 transition-shadow duration-300 hover:bg-[var(--coffee-cream)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-[var(--coffee-charcoal)]">
                      {course.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {course.adminAccess ? (
                        <Badge rounded={false} variant="secondary" size="sm">
                          Dostęp admina
                        </Badge>
                      ) : course.accessStatus === "expired" ? (
                        <Badge rounded={false} variant="warning" size="sm">
                          Dostęp wygasł
                        </Badge>
                      ) : course.accessStatus === "pending" ? (
                        <>
                          <Badge rounded={false} variant="success" size="sm">
                            Zakup potwierdzony
                          </Badge>
                          <Badge rounded={false} variant="warning" size="sm">
                            Dostęp oczekuje na aktywację
                          </Badge>
                        </>
                      ) : course.accessExpiresAt ? (
                        <>
                          <Badge rounded={false} variant="success" size="sm">
                            Dostęp aktywny
                          </Badge>
                          <Badge rounded={false} variant="secondary" size="sm">
                            Do {formatAccessDate(course.accessExpiresAt)}
                          </Badge>
                        </>
                      ) : (
                        <Badge rounded={false} variant="success" size="sm">
                          Dostęp aktywny
                        </Badge>
                      )}
                      {!course.adminAccess &&
                      course.accessStatus === "expired" &&
                      course.saleStatus !== "open" ? (
                        <Badge rounded={false} variant="outline" size="sm">
                          Sprzedaż wkrótce
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--coffee-espresso)] mt-2 leading-relaxed">
                    {getCourseDescriptionExcerpt(course.description)}
                  </p>
                  <div className="mt-4 h-2 bg-[var(--coffee-latte)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--coffee-mocha)] rounded-full transition-all duration-500"
                      style={{ width: `${course.completionPercentage}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-[var(--coffee-espresso)]">
                    Ukończono: {course.completionPercentage}%
                  </div>
                  <div className="mt-3 rounded-md border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 text-sm text-[var(--coffee-espresso)]">
                    {getAccessNotice(course)}
                  </div>
                  <div className="mt-3 rounded-md border border-[var(--coffee-cappuccino)] bg-[var(--coffee-cream)] px-3 py-2 text-sm text-[var(--coffee-espresso)]">
                    {course.certificateRegenerationAllowed
                      ? "Administrator pozwolił wygenerować certyfikat ponownie."
                      : course.certificateGenerated
                        ? formatCertificateDate(course.certificateGeneratedAt)
                        : course.certificateGranted
                          ? "Certyfikat przyznany. Odbierz go raz po sprawdzeniu danych."
                          : course.completionPercentage === 100
                            ? "Ukończyłeś 100% kursu. Certyfikat będzie dostępny po decyzji administratora."
                            : "Certyfikat będzie dostępny po decyzji administratora."}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {course.accessStatus === "expired" &&
                    !course.adminAccess &&
                    course.canRenewAccess ? (
                      <Link href={`/courses/${course.slug}`}>
                        <Button variant="primary">Przedłuż dostęp</Button>
                      </Link>
                    ) : null}
                    {course.certificateGranted ? (
                      <>
                        <CertificateActions
                          slug={course.slug}
                          firstName={profile.first_name}
                          lastName={profile.last_name}
                          generated={course.certificateGenerated}
                          regenerationAllowed={
                            course.certificateRegenerationAllowed
                          }
                          onGenerated={(generatedAt, issuedAt) => {
                            setLocalCourseCards((previous) =>
                              previous.map((item) =>
                                item.id === course.id
                                  ? {
                                      ...item,
                                      certificateGenerated: true,
                                      certificateGeneratedAt: generatedAt,
                                      certificateIssuedAt: issuedAt,
                                      certificateRegenerationAllowed: false,
                                    }
                                  : item,
                              ),
                            );
                          }}
                        />
                        {course.accessStatus === "active" ||
                        course.adminAccess ? (
                          <Link href={`/learn/${course.slug}`}>
                            <Button variant="outline">Otwórz kurs</Button>
                          </Link>
                        ) : null}
                        {isAdmin ? (
                          <Link href={`/dashboard/courses/${course.id}/edit`}>
                            <Button variant="secondary">Edytuj</Button>
                          </Link>
                        ) : null}
                      </>
                    ) : (
                      <>
                        {course.accessStatus === "active" ||
                        course.adminAccess ? (
                          <Link href={`/learn/${course.slug}`}>
                            <Button variant="primary">
                              {course.completionPercentage === 100
                                ? "Otwórz kurs"
                                : "Kontynuuj naukę"}
                            </Button>
                          </Link>
                        ) : null}
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
          onCertificateActionCountChange={setCertificateActionCount}
          onPendingAccessCountChange={setPendingAccessCount}
        />
      )}
    </>
  );
}
