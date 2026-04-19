import { useRef, useState } from "react";
import type { CourseStatsDetail } from "@/types/admin-stats";
import type { Coupon } from "@/types/coupon";
import type { StudentDetail } from "@/types/student";

export function useAdminModals() {
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [statsDetailModalOpen, setStatsDetailModalOpen] = useState(false);

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [courseStatsDetail, setCourseStatsDetail] =
    useState<CourseStatsDetail | null>(null);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);
  const [studentDetailError, setStudentDetailError] = useState<string | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const studentRequestIdRef = useRef(0);

  const openCouponModal = (coupon?: Coupon) => {
    setEditingCoupon(coupon ?? null);
    setCouponModalOpen(true);
  };

  const closeCouponModal = () => {
    setCouponModalOpen(false);
    setEditingCoupon(null);
  };

  const loadStudentDetail = async (
    studentId: string,
    preserveExistingData = false,
  ) => {
    const requestId = ++studentRequestIdRef.current;
    setActiveStudentId(studentId);
    setStudentModalOpen(true);
    setStudentDetailLoading(true);
    setStudentDetailError(null);
    if (!preserveExistingData) {
      setStudentDetail(null);
    }

    try {
      const response = await fetch(`/api/admin/students/${studentId}`);
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? "Nie udalo sie pobrac danych kursanta.");
      }

      if (studentRequestIdRef.current !== requestId) {
        return;
      }

      setStudentDetail(data?.student ?? null);
      setStudentDetailError(null);
    } catch (error) {
      if (studentRequestIdRef.current !== requestId) {
        return;
      }

      console.error("Failed to load student details:", error);
      setStudentDetailError(
        error instanceof Error
          ? error.message
          : "Nie udalo sie pobrac danych kursanta.",
      );
    } finally {
      if (studentRequestIdRef.current === requestId) {
        setStudentDetailLoading(false);
      }
    }
  };

  const openStudentModal = async (studentId: string) => {
    await loadStudentDetail(studentId);
  };

  const closeStudentModal = () => {
    studentRequestIdRef.current += 1;
    setStudentModalOpen(false);
    setStudentDetail(null);
    setStudentDetailLoading(false);
    setStudentDetailError(null);
    setActiveStudentId(null);
  };

  const markCertificateGranted = (courseId: string, grantedAt: string | null) => {
    setStudentDetail((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        courses: previous.courses.map((course) =>
          course.courseId === courseId
            ? {
                ...course,
                certificateGranted: true,
                certificateGrantedAt: grantedAt,
              }
            : course,
        ),
      };
    });
  };

  const refreshStudentDetail = async () => {
    if (!activeStudentId) {
      return;
    }

    await loadStudentDetail(activeStudentId, true);
  };

  const openCourseStatsDetail = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/stats/courses/${courseId}`);
      if (!response.ok) return;
      const data = await response.json();
      setCourseStatsDetail(data.courseStats ?? null);
      setStatsDetailModalOpen(true);
    } catch (error) {
      console.error("Failed to load course stats details:", error);
    }
  };

  const closeCourseStatsDetail = () => {
    setStatsDetailModalOpen(false);
    setCourseStatsDetail(null);
  };

  return {
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
    refreshStudentDetail,
  };
}
