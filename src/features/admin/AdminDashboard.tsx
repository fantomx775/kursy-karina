"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Spinner } from "@/components/ui";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { StudentCourseProgress } from "@/types/student";
import { CouponForm } from "./CouponForm";
import { StudentDetailPanel } from "./StudentDetailPanel";
import { getCertificateGrantConfirmationMessage } from "./certificateGrant";
import { CouponsTab } from "./components/CouponsTab";
import { CoursesTab } from "./components/CoursesTab";
import { CourseStatsDetailPanel } from "./components/CourseStatsDetailPanel";
import { CourseStatsTab } from "./components/CourseStatsTab";
import { StudentsTab } from "./components/StudentsTab";
import { TabNavigation } from "./components/TabNavigation";
import { useAdminActions } from "./hooks/useAdminActions";
import { useAdminData } from "./hooks/useAdminData";
import { useAdminModals } from "./hooks/useAdminModals";

export type AdminTabId = "courses" | "students" | "coupons" | "stats";

type AdminDashboardProps = {
  embedded?: boolean;
  activeAdminTab?: AdminTabId;
};

export function AdminDashboard({
  embedded = false,
  activeAdminTab = "courses",
}: AdminDashboardProps = {}) {
  const [activeTab, setActiveTab] = useState<AdminTabId>("courses");
  const [pendingCertificateCourse, setPendingCertificateCourse] =
    useState<StudentCourseProgress | null>(null);
  const [grantingCertificateCourseId, setGrantingCertificateCourseId] =
    useState<string | null>(null);
  const effectiveTab = embedded ? activeAdminTab : activeTab;
  const { addToast } = useToast();

  const {
    courses,
    students,
    coupons,
    courseStats,
    loading,
    error,
    loadCourses,
    loadStudents,
    loadCoupons,
    loadCourseStats,
    clearError,
  } = useAdminData();

  const {
    couponModalOpen,
    studentModalOpen,
    statsDetailModalOpen,
    editingCoupon,
    studentDetail,
    courseStatsDetail,
    studentDetailLoading,
    studentDetailError,
    openCouponModal,
    closeCouponModal,
    openStudentModal,
    closeStudentModal,
    openCourseStatsDetail,
    closeCourseStatsDetail,
    markCertificateGranted,
  } = useAdminModals();

  const { handleSaveCoupon, handleDeleteCoupon } = useAdminActions();

  useEffect(() => {
    if (effectiveTab === "courses" && courses.length === 0) {
      loadCourses();
    } else if (effectiveTab === "students" && students.length === 0) {
      loadStudents();
    } else if (effectiveTab === "coupons" && coupons.length === 0) {
      loadCoupons();
    } else if (effectiveTab === "stats") {
      loadCourseStats();
    }
  }, [effectiveTab, loadCourses, loadStudents, loadCoupons, loadCourseStats]);

  const handleSaveCouponWithRefresh = async (data: any) => {
    const result = await handleSaveCoupon(data, editingCoupon);
    if (result.success) {
      addToast({
        type: "success",
        title: editingCoupon ? "Kupon zaktualizowany" : "Kupon dodany",
        message: editingCoupon
          ? "Kupon zostal pomyslnie zaktualizowany."
          : "Nowy kupon zostal pomyslnie dodany.",
      });
      closeCouponModal();
      await loadCoupons();
    } else {
      addToast({
        type: "error",
        title: "Blad zapisu kuponu",
        message: result.error,
      });
    }
  };

  const handleDeleteCouponWithRefresh = async (couponId: string) => {
    const result = await handleDeleteCoupon(couponId);
    if (result.success) {
      addToast({
        type: "success",
        title: "Kupon usuniety",
        message: "Kupon zostal pomyslnie usuniety.",
      });
      await loadCoupons();
    } else {
      addToast({
        type: "error",
        title: "Blad usuwania kuponu",
        message: result.error,
      });
    }
  };

  const handleCloseStudentModal = () => {
    setPendingCertificateCourse(null);
    closeStudentModal();
  };

  const handleRequestCertificateGrant = (course: StudentCourseProgress) => {
    setPendingCertificateCourse(course);
  };

  const handleConfirmCertificateGrant = async () => {
    if (!studentDetail || !pendingCertificateCourse) {
      return;
    }

    setGrantingCertificateCourseId(pendingCertificateCourse.courseId);

    try {
      const response = await fetch(
        `/api/admin/students/${studentDetail.id}/certificates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId: pendingCertificateCourse.courseId }),
        },
      );

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? "Nie udalo sie przyznac certyfikatu.");
      }

      markCertificateGranted(
        pendingCertificateCourse.courseId,
        data?.certificateGrantedAt ?? null,
      );
      setPendingCertificateCourse(null);

      addToast({
        type: "success",
        title: data?.alreadyGranted
          ? "Certyfikat juz przyznany"
          : "Certyfikat przyznany",
        message: data?.alreadyGranted
          ? "Ten kursant ma juz aktywny certyfikat dla tego kursu."
          : "Kursant moze juz odebrac certyfikat.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Blad przyznawania certyfikatu",
        message:
          error instanceof Error
            ? error.message
            : "Nie udalo sie przyznac certyfikatu.",
      });
    } finally {
      setGrantingCertificateCourseId(null);
    }
  };

  const getAddButton = () => {
    if (effectiveTab === "courses") {
      return (
        <Link
          href="/dashboard/courses/create"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="primary">Dodaj kurs</Button>
        </Link>
      );
    }

    if (effectiveTab === "coupons") {
      return (
        <Button variant="primary" onClick={() => openCouponModal()}>
          Dodaj kupon
        </Button>
      );
    }

    return null;
  };

  const content = (
    <>
      {!embedded && (
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--coffee-charcoal)]">
              Panel administracyjny
            </h1>
            <p className="text-[var(--coffee-espresso)]">
              Zarzadzaj kursami, kursantami i kuponami rabatowymi.
            </p>
          </div>
          {getAddButton()}
        </div>
      )}

      {embedded && getAddButton() ? (
        <div className="mb-4 flex justify-end">{getAddButton()}</div>
      ) : null}

      {!embedded && (
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {error ? (
        <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
          <button
            onClick={clearError}
            className="ml-4 text-red-600 underline hover:text-red-800"
          >
            Zamknij
          </button>
        </div>
      ) : null}

      {effectiveTab === "courses" && (
        <CoursesTab courses={courses} loading={loading} />
      )}

      {effectiveTab === "students" && (
        <StudentsTab
          students={students}
          loading={loading}
          onViewStudent={openStudentModal}
        />
      )}

      {effectiveTab === "coupons" && (
        <CouponsTab
          coupons={coupons}
          loading={loading}
          onEditCoupon={openCouponModal}
          onDeleteCoupon={handleDeleteCouponWithRefresh}
        />
      )}

      {effectiveTab === "stats" && (
        <CourseStatsTab
          courseStats={courseStats}
          loading={loading}
          onViewDetails={openCourseStatsDetail}
        />
      )}
    </>
  );

  const modals = (
    <>
      <Modal
        isOpen={couponModalOpen}
        onClose={closeCouponModal}
        title={editingCoupon ? "Edytuj kupon" : "Dodaj kupon"}
        size="sm"
      >
        <CouponForm
          initial={editingCoupon ?? undefined}
          onCancel={closeCouponModal}
          onSave={handleSaveCouponWithRefresh}
        />
      </Modal>

      <Modal
        isOpen={studentModalOpen}
        onClose={handleCloseStudentModal}
        title="Szczegoly kursanta"
        size="lg"
      >
        {studentDetailLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-10">
            <Spinner size="lg" />
            <p className="text-sm text-[var(--coffee-espresso)]">
              Trwa ladowanie danych kursanta...
            </p>
          </div>
        ) : studentDetailError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {studentDetailError}
          </div>
        ) : studentDetail ? (
          <StudentDetailPanel
            student={studentDetail}
            onGrantCertificate={handleRequestCertificateGrant}
            grantingCourseId={grantingCertificateCourseId}
          />
        ) : (
          <div className="p-6 text-sm text-[var(--coffee-espresso)]">
            Nie znaleziono danych kursanta.
          </div>
        )}
      </Modal>

      <Modal
        isOpen={statsDetailModalOpen}
        onClose={closeCourseStatsDetail}
        title="Statystyki kursu"
        size="lg"
      >
        {courseStatsDetail ? (
          <CourseStatsDetailPanel detail={courseStatsDetail} />
        ) : (
          <div className="p-6 text-sm text-[var(--coffee-espresso)]">
            Ladowanie szczegolow...
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={pendingCertificateCourse !== null}
        onClose={() => {
          if (!grantingCertificateCourseId) {
            setPendingCertificateCourse(null);
          }
        }}
        onConfirm={handleConfirmCertificateGrant}
        title="Potwierdz przyznanie certyfikatu"
        message={
          pendingCertificateCourse
            ? getCertificateGrantConfirmationMessage(pendingCertificateCourse)
            : ""
        }
        confirmText="Przyznaj certyfikat"
        cancelText="Anuluj"
        variant="warning"
        loading={grantingCertificateCourseId !== null}
        closeOnConfirm={false}
      />
    </>
  );

  if (embedded) {
    return (
      <div className="mt-4">
        {content}
        {modals}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--coffee-cream)] to-[var(--coffee-latte)]">
      <div className="page-width py-10">{content}</div>
      {modals}
    </div>
  );
}
