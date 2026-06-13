export type CouponDisplayStatus =
  | "active"
  | "inactive"
  | "expired"
  | "scheduled"
  | "exhausted";

export type CouponStatusInput = {
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  usageLimit?: number | null;
  usageCount?: number;
};

export function getCouponDisplayStatus(
  coupon: CouponStatusInput,
  now: Date = new Date(),
): CouponDisplayStatus {
  if (!coupon.isActive) return "inactive";

  if (coupon.startDate) {
    const start = new Date(coupon.startDate);
    if (!Number.isNaN(start.getTime()) && start > now) {
      return "scheduled";
    }
  }

  if (coupon.endDate) {
    const end = new Date(coupon.endDate);
    if (!Number.isNaN(end.getTime()) && end < now) {
      return "expired";
    }
  }

  if (
    coupon.usageLimit != null &&
    coupon.usageLimit > 0 &&
    (coupon.usageCount ?? 0) >= coupon.usageLimit
  ) {
    return "exhausted";
  }

  return "active";
}

function formatCouponDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatCouponValidityPeriod(
  startDate: string,
  endDate: string | null,
): string {
  const start = startDate ? formatCouponDate(startDate) : null;
  const end = endDate ? formatCouponDate(endDate) : null;

  if (start && end) return `${start} – ${end}`;
  if (start) return `od ${start}`;
  if (end) return `do ${end}`;
  return "Bez ograniczeń";
}
