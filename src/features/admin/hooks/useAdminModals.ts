import { useState } from "react";
import type { Coupon } from "@/types/coupon";
import type { StudentDetail } from "@/types/student";
import type { CourseStatsDetail } from "@/types/admin-stats";

export function useAdminModals() {
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [statsDetailModalOpen, setStatsDetailModalOpen] = useState(false);

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [courseStatsDetail, setCourseStatsDetail] =
    useState<CourseStatsDetail | null>(null);

  const openCouponModal = (coupon?: Coupon) => {
    setEditingCoupon(coupon ?? null);
    setCouponModalOpen(true);
  };

  const closeCouponModal = () => {
    setCouponModalOpen(false);
    setEditingCoupon(null);
  };

  const openStudentModal = async (studentId: string) => {
    try {
      const response = await fetch(`/api/admin/students/${studentId}`);
      const data = await response.json();
      setStudentDetail(data.student ?? null);
      setStudentModalOpen(true);
    } catch (error) {
      console.error("Failed to load student details:", error);
    }
  };

  const closeStudentModal = () => {
    setStudentModalOpen(false);
    setStudentDetail(null);
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
    openCouponModal,
    closeCouponModal,
    openStudentModal,
    closeStudentModal,
    openCourseStatsDetail,
    closeCourseStatsDetail,
  };
}
