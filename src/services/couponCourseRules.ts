"server-only";

import { createAdminSupabaseClient } from "@/services/supabase/admin";

type AdminClient = ReturnType<typeof createAdminSupabaseClient>;

export function uniqueCouponCourseIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

export async function syncCouponCourseRules({
  admin,
  couponId,
  applicableCourseIds,
  requiredCourseIds,
}: {
  admin: AdminClient;
  couponId: string;
  applicableCourseIds: string[];
  requiredCourseIds: string[];
}) {
  const [applicableDelete, requiredDelete] = await Promise.all([
    admin.from("coupon_applicable_courses").delete().eq("coupon_id", couponId),
    admin.from("coupon_required_courses").delete().eq("coupon_id", couponId),
  ]);

  if (applicableDelete.error) return applicableDelete.error;
  if (requiredDelete.error) return requiredDelete.error;

  const applicableRows = uniqueCouponCourseIds(applicableCourseIds).map(
    (courseId) => ({
      coupon_id: couponId,
      course_id: courseId,
    }),
  );
  const requiredRows = uniqueCouponCourseIds(requiredCourseIds).map(
    (courseId) => ({
      coupon_id: couponId,
      course_id: courseId,
    }),
  );

  if (applicableRows.length > 0) {
    const { error } = await admin
      .from("coupon_applicable_courses")
      .insert(applicableRows);
    if (error) return error;
  }

  if (requiredRows.length > 0) {
    const { error } = await admin
      .from("coupon_required_courses")
      .insert(requiredRows);
    if (error) return error;
  }

  return null;
}
