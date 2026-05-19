export type CouponDiscountType = "percentage" | "fixed";

export type CouponRuleCartItem = {
  courseId: string;
  amount: number;
};

export type CouponRuleEvaluationInput = {
  discountType: CouponDiscountType;
  discountValue: number;
  cartItems: CouponRuleCartItem[];
  applicableCourseIds?: string[];
  requiredCourseIds?: string[];
};

export type CouponRuleEvaluationResult =
  | {
      valid: true;
      discountBaseAmount: number;
      discountAmount: number;
      discountedCourseIds: string[];
    }
  | {
      valid: false;
      reason:
        | "empty-cart"
        | "missing-required-courses"
        | "no-applicable-courses";
      missingCourseIds?: string[];
    };

function uniqueIds(ids: string[] | undefined): string[] {
  return Array.from(new Set((ids ?? []).filter(Boolean)));
}

export function evaluateCouponCourseRules({
  discountType,
  discountValue,
  cartItems,
  applicableCourseIds,
  requiredCourseIds,
}: CouponRuleEvaluationInput): CouponRuleEvaluationResult {
  const normalizedCartItems = cartItems.filter((item) => item.amount > 0);

  if (normalizedCartItems.length === 0) {
    return { valid: false, reason: "empty-cart" };
  }

  const cartCourseIds = new Set(
    normalizedCartItems.map((item) => item.courseId),
  );
  const requiredIds = uniqueIds(requiredCourseIds);
  const missingCourseIds = requiredIds.filter((id) => !cartCourseIds.has(id));

  if (missingCourseIds.length > 0) {
    return {
      valid: false,
      reason: "missing-required-courses",
      missingCourseIds,
    };
  }

  const applicableIds = uniqueIds(applicableCourseIds);
  const applicableIdSet =
    applicableIds.length > 0 ? new Set(applicableIds) : null;
  const applicableItems = applicableIdSet
    ? normalizedCartItems.filter((item) => applicableIdSet.has(item.courseId))
    : normalizedCartItems;

  const discountBaseAmount = applicableItems.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  if (discountBaseAmount <= 0) {
    return { valid: false, reason: "no-applicable-courses" };
  }

  const discountAmount =
    discountType === "percentage"
      ? Math.round(discountBaseAmount * (discountValue / 10000))
      : Math.min(discountBaseAmount, discountValue);

  return {
    valid: true,
    discountBaseAmount,
    discountAmount,
    discountedCourseIds: uniqueIds(
      applicableItems.map((item) => item.courseId),
    ),
  };
}
