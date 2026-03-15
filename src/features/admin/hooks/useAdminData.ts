import { useState, useCallback } from "react";
import type { Course } from "@/types/course";
import type { Coupon } from "@/types/coupon";
import type { StudentSummary } from "@/types/student";
import type { CourseStatsSummary } from "@/types/admin-stats";

export function useAdminData() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStatsSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/courses");
      if (!response.ok) {
        throw new Error("Nie udało się pobrać kursów.");
      }
      const data = await response.json();
      setCourses(data.courses ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się pobrać kursów.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/students");
      if (!response.ok) {
        throw new Error("Nie udało się pobrać kursantów.");
      }
      const data = await response.json();
      setStudents(data.students ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się pobrać kursantów.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/coupons");
      if (!response.ok) {
        throw new Error("Nie udało się pobrać kuponów.");
      }
      const data = await response.json();
      setCoupons(data.coupons ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się pobrać kuponów.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCourseStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/stats/courses");
      if (!response.ok) {
        throw new Error("Nie udało się pobrać statystyk kursów.");
      }
      const data = await response.json();
      setCourseStats(data.courseStats ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się pobrać statystyk kursów.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
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
    clearError: () => setError(null),
  };
}
