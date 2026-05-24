import {
  DEFAULT_COURSE_ACCESS_DURATION_MONTHS,
  normalizeAccessDurationMonths,
} from "@/lib/accessDuration";

export type CheckoutCourseSnapshot = {
  id: string;
  title?: string | null;
  price?: number | null;
  access_duration_months?: number | null;
};

export type PendingOrderItemInsert = {
  order_id: string;
  course_id: string;
  title: string;
  price: number;
  quantity: 1;
  access_duration_months: number;
  access_status: "pending";
  access_activated_at: null;
  access_expires_at: null;
};

export function buildPendingOrderItems({
  courseIds,
  courses,
  existingCourseIds = [],
  orderId,
}: {
  courseIds: string[];
  courses: CheckoutCourseSnapshot[];
  existingCourseIds?: Iterable<string>;
  orderId: string;
}): PendingOrderItemInsert[] {
  const courseMap = new Map(courses.map((course) => [course.id, course]));
  const skippedCourseIds = new Set(existingCourseIds);
  const queuedCourseIds = new Set<string>();

  return courseIds.flatMap((courseId) => {
    if (skippedCourseIds.has(courseId) || queuedCourseIds.has(courseId)) {
      return [];
    }

    queuedCourseIds.add(courseId);
    const course = courseMap.get(courseId);
    const accessDurationMonths = normalizeAccessDurationMonths(
      course?.access_duration_months ?? DEFAULT_COURSE_ACCESS_DURATION_MONTHS,
    );

    return [
      {
        order_id: orderId,
        course_id: courseId,
        title: course?.title?.trim() || "Kurs",
        price: course?.price ?? 0,
        quantity: 1,
        access_duration_months: accessDurationMonths,
        access_status: "pending",
        access_activated_at: null,
        access_expires_at: null,
      },
    ];
  });
}
