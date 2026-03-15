import type { Course } from "@/types/course";

/**
 * Returns true if the course has promotion fields set and the current time
 * is within the promotion window (start_date <= now and (end_date is null or now <= end_date)).
 */
export function isPromoActive(course: Course, now: Date = new Date()): boolean {
  const type = course.promotion_discount_type;
  const value = course.promotion_discount_value;
  const start = course.promotion_start_date;
  const end = course.promotion_end_date;

  if (type == null || value == null || start == null) return false;

  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime()) || now < startDate) return false;

  if (end != null && end !== "") {
    const endDate = new Date(end);
    if (!Number.isNaN(endDate.getTime()) && now > endDate) return false;
  }

  return true;
}

/**
 * Returns the effective price in cents: promotional price when promotion is active,
 * otherwise the regular course price.
 * - percentage: price * (1 - value/100), rounded
 * - fixed: max(0, price - value) with value in grosze
 */
export function getEffectivePriceCents(
  course: Course,
  now: Date = new Date()
): number {
  if (!isPromoActive(course, now)) return course.price;

  const value = course.promotion_discount_value!;
  const type = course.promotion_discount_type!;

  if (type === "percentage") {
    return Math.round(course.price * (1 - value / 100));
  }
  return Math.max(0, course.price - value);
}

/**
 * Returns a short label for the active promotion, e.g. "-20%" or "-59,80 zł".
 * Returns null if promotion is not active or has no type/value.
 */
export function getPromoLabel(
  course: Course,
  now: Date = new Date()
): string | null {
  if (!isPromoActive(course, now)) return null;
  const value = course.promotion_discount_value;
  const type = course.promotion_discount_type;
  if (value == null || type == null) return null;
  if (type === "percentage") return `-${Math.round(value)}%`;
  const zł = (value / 100).toFixed(2).replace(".", ",");
  return `-${zł} zł`;
}
