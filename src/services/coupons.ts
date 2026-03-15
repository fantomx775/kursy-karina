"server-only";

import { createAdminSupabaseClient } from "@/services/supabase/admin";

export type CouponValidationResult = {
  valid: boolean;
  error?: string;
  discountAmount?: number;
  couponId?: string;
};

export async function validateCoupon({
  code,
  userId,
  subtotalAmount,
}: {
  code: string;
  userId?: string;
  subtotalAmount: number;
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

  let discountAmount = 0;
  if (coupon.discount_type === "percentage") {
    // Fixed: discount_value is stored as integer (e.g., 10 = 10%), so divide by 100
    discountAmount = Math.round(
      subtotalAmount * (coupon.discount_value / 100),
    );
  } else {
    discountAmount = Math.min(subtotalAmount, coupon.discount_value);
  }

  return {
    valid: true,
    discountAmount,
    couponId: coupon.id,
  };
}
