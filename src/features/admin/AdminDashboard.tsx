"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { CouponForm } from "./CouponForm";
import { StudentDetailPanel } from "./StudentDetailPanel";
import { CoursesTab } from "./components/CoursesTab";
import { StudentsTab } from "./components/StudentsTab";
import { CouponsTab } from "./components/CouponsTab";
import { CourseStatsTab } from "./components/CourseStatsTab";
import { CourseStatsDetailPanel } from "./components/CourseStatsDetailPanel";
import { TabNavigation } from "./components/TabNavigation";
import { useAdminData } from "./hooks/useAdminData";
import { useAdminModals } from "./hooks/useAdminModals";
import { useAdminActions } from "./hooks/useAdminActions";

export type AdminTabId = "courses" | "students" | "coupons" | "stats";

type AdminDashboardProps = {
  /** When true, render without outer page wrapper and title (e.g. inside dashboard tabs). */
  embedded?: boolean;
  /** When embedded, the active tab is controlled by the parent. */
  activeAdminTab?: AdminTabId;
};

export function AdminDashboard({
  embedded = false,
  activeAdminTab = "courses",
}: AdminDashboardProps = {}) {
  const [activeTab, setActiveTab] = useState<AdminTabId>("courses");
  const effectiveTab = embedded ? activeAdminTab : activeTab;
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [deletingCoupon, setDeletingCoupon] = useState<string | null>(null);
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
    openCouponModal,
    closeCouponModal,
    openStudentModal,
    closeStudentModal,
    openCourseStatsDetail,
    closeCourseStatsDetail,
  } = useAdminModals();

  const { handleSaveCoupon, handleDeleteCoupon } = useAdminActions();

  // Load data when switching to a tab. Stats refetch every time; others only when list is empty to avoid repeated requests / loops.
  // Dependency array must stay fixed size (React requirement); lengths are read inside the effect, not used as deps.
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
    setSavingCoupon(true);
    const result = await handleSaveCoupon(data, editingCoupon);
    if (result.success) {
      addToast({
        type: "success",
        title: editingCoupon ? "Kupon zaktualizowany" : "Kupon dodany",
        message: editingCoupon 
          ? "Kupon został pomyślnie zaktualizowany." 
          : "Nowy kupon został pomyślnie dodany.",
      });
      closeCouponModal();
      await loadCoupons();
    } else {
      addToast({
        type: "error",
        title: "Błąd zapisu kuponu",
        message: result.error,
      });
    }
    setSavingCoupon(false);
  };

  const handleDeleteCouponWithRefresh = async (couponId: string) => {
    setDeletingCoupon(couponId);
    const result = await handleDeleteCoupon(couponId);
    if (result.success) {
      addToast({
        type: "success",
        title: "Kupon usunięty",
        message: "Kupon został pomyślnie usunięty.",
      });
      await loadCoupons();
    } else {
      addToast({
        type: "error",
        title: "Błąd usuwania kuponu",
        message: result.error,
      });
    }
    setDeletingCoupon(null);
  };

  const getAddButton = () => {
    if (effectiveTab === "courses") {
      return (
        <Link href="/dashboard/courses/create" target="_blank" rel="noopener noreferrer">
          <Button variant="primary">
            Dodaj kurs
          </Button>
        </Link>
      );
    }
    if (effectiveTab === "coupons") {
      return (
        <Button
          variant="primary"
          onClick={() => openCouponModal()}
        >
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
              Zarządzaj kursami, kursantami i kuponami rabatowymi.
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4">
            {error}
            <button
              onClick={clearError}
              className="ml-4 text-red-600 hover:text-red-800 underline"
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
        onClose={closeStudentModal}
        title="Szczegóły kursanta"
        size="lg"
      >
        {studentDetail ? (
          <StudentDetailPanel student={studentDetail} />
        ) : (
          <div className="p-6 text-sm text-[var(--coffee-espresso)]">
            Ładowanie danych kursanta...
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
            Ładowanie szczegółów...
          </div>
        )}
      </Modal>
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
      <div className="page-width py-10">
        {content}
      </div>

      {modals}
    </div>
  );
}
