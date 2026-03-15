import { couponInputSchema } from "@/lib/validators/coupon";
import { authenticateAdmin } from "@/services/auth/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const admin = createAdminSupabaseClient();
  const { data: coupons, error } = await admin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }

  const couponIds = coupons?.map((coupon) => coupon.id) ?? [];
  const { data: usage } = await admin
    .from("coupon_usage")
    .select("coupon_id, discount_amount")
    .in("coupon_id", couponIds);

  const usageMap = new Map<string, { count: number; total: number }>();
  usage?.forEach((entry) => {
    const current = usageMap.get(entry.coupon_id) ?? { count: 0, total: 0 };
    current.count += 1;
    current.total += entry.discount_amount;
    usageMap.set(entry.coupon_id, current);
  });

  const result =
    coupons?.map((coupon) => {
      const usageStats = usageMap.get(coupon.id) ?? { count: 0, total: 0 };
      return {
        id: coupon.id,
        name: coupon.name,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue:
          coupon.discount_type === "percentage"
            ? coupon.discount_value / 100
            : coupon.discount_value / 100,
        startDate: coupon.start_date,
        endDate: coupon.end_date,
        usageLimit: coupon.usage_limit,
        usageLimitPerUser: coupon.usage_limit_per_user,
        isActive: coupon.is_active,
        createdAt: coupon.created_at,
        usageCount: usageStats.count,
        totalDiscountGiven: usageStats.total / 100,
      };
    }) ?? [];

  return Response.json({ coupons: result });
}

export async function POST(request: Request) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const payload = await request.json();
  const parsed = couponInputSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = createAdminSupabaseClient();
  const {
    name,
    code,
    discountType,
    discountValue,
    startDate,
    endDate,
    usageLimit,
    usageLimitPerUser,
    isActive,
  } = parsed.data;

  const normalizedCode = code.toUpperCase();

  const { data: existing } = await admin
    .from("coupons")
    .select("id")
    .eq("code", normalizedCode)
    .maybeSingle();

  if (existing) {
    return Response.json({ error: "Coupon code already exists" }, { status: 400 });
  }

  const { data: coupon, error } = await admin
    .from("coupons")
    .insert({
      name,
      code: normalizedCode,
      discount_type: discountType,
      discount_value: Math.round(discountValue * 100),
      start_date: startDate,
      end_date: endDate ?? null,
      usage_limit: usageLimit ?? null,
      usage_limit_per_user: usageLimitPerUser ?? null,
      is_active: isActive ?? true,
    })
    .select()
    .single();

  if (error || !coupon) {
    return Response.json({ error: "Failed to create coupon" }, { status: 500 });
  }

  return Response.json({ coupon }, { status: 201 });
}
