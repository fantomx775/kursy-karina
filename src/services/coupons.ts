"server-only";

import {
  evaluateCouponCourseRules,
  type CouponRuleCartItem,
} from "@/lib/couponRules";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export type CouponValidationResult = {
  valid: boolean;
  error?: string;
  discountAmount?: number;
  discountedCourseIds?: string[];
  couponId?: string;
};

export async function validateCoupon({
  code,
  userId,
  subtotalAmount,
  cartItems,
}: {
  code: string;
  userId?: string;
  subtotalAmount?: number;
  cartItems?: CouponRuleCartItem[];
}): Promise<CouponValidationResult> {
  const admin = createAdminSupabaseClient();
  const normalizedCode = code.toUpperCase();

  const { data: coupon, error } = await admin
    .from("coupons")
    .select("*")
    .eq("code", normalizedCode)
    .single();

  if (error || !coupon) {
    return { valid: false, error: "Nieprawidłowy kod kuponu." };
  }

  if (!coupon.is_active) {
    return { valid: false, error: "Kupon jest nieaktywny." };
  }

  const now = new Date();
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    return { valid: false, error: "Kupon jeszcze nie obowiązuje." };
  }
  if (coupon.end_date && new Date(coupon.end_date) < now) {
    return { valid: false, error: "Kupon wygasł." };
  }

  if (coupon.usage_limit) {
    const { count } = await admin
      .from("coupon_usage")
      .select("*", { count: "exact", head: true })
      .eq("coupon_id", coupon.id);

    if ((count ?? 0) >= coupon.usage_limit) {
      return { valid: false, error: "Kupon osiągnął limit użyć." };
    }
  }

  if (userId && coupon.usage_limit_per_user) {
    const { count } = await admin
      .from("coupon_usage")
      .select("*", { count: "exact", head: true })
      .eq("coupon_id", coupon.id)
      .eq("user_id", userId);

    if ((count ?? 0) >= coupon.usage_limit_per_user) {
      return { valid: false, error: "Limit użyć kuponu został osiągnięty." };
    }
  }

  const [{ data: applicableRows }, { data: requiredRows }] = await Promise.all([
    admin
      .from("coupon_applicable_courses")
      .select("course_id")
      .eq("coupon_id", coupon.id),
    admin
      .from("coupon_required_courses")
      .select("course_id")
      .eq("coupon_id", coupon.id),
  ]);

  const applicableCourseIds =
    applicableRows?.map((row) => row.course_id as string) ?? [];
  const requiredCourseIds =
    requiredRows?.map((row) => row.course_id as string) ?? [];
  const validationCartItems =
    cartItems ??
    (typeof subtotalAmount === "number"
      ? [{ courseId: "__cart__", amount: subtotalAmount }]
      : []);

  if (
    validationCartItems.length === 0 ||
    validationCartItems.some((item) => !item.courseId || item.amount <= 0)
  ) {
    return { valid: false, error: "Nieprawidłowa zawartość koszyka." };
  }

  const ruleResult = evaluateCouponCourseRules({
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
    cartItems: validationCartItems,
    applicableCourseIds,
    requiredCourseIds,
  });

  if (!ruleResult.valid) {
    if (ruleResult.reason === "missing-required-courses") {
      return {
        valid: false,
        error:
          "Ten kupon działa tylko wtedy, gdy w koszyku są wszystkie wymagane kursy.",
      };
    }

    if (ruleResult.reason === "no-applicable-courses") {
      return {
        valid: false,
        error: "Ten kupon nie obejmuje kursów znajdujących się w koszyku.",
      };
    }

    return { valid: false, error: "Nieprawidłowa zawartość koszyka." };
  }

  return {
    valid: true,
    discountAmount: ruleResult.discountAmount,
    discountedCourseIds: ruleResult.discountedCourseIds,
    couponId: coupon.id,
  };
}
