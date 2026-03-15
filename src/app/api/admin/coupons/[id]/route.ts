import { couponInputSchema } from "@/lib/validators/coupon";
import { authenticateAdmin } from "@/services/auth/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
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

  const { data: coupon, error } = await admin
    .from("coupons")
    .update({
      name,
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_value: Math.round(discountValue * 100),
      start_date: startDate,
      end_date: endDate ?? null,
      usage_limit: usageLimit ?? null,
      usage_limit_per_user: usageLimitPerUser ?? null,
      is_active: isActive ?? true,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !coupon) {
    return Response.json({ error: "Failed to update coupon" }, { status: 500 });
  }

  return Response.json({ coupon });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const { id } = await params;
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("coupons").delete().eq("id", id);

  if (error) {
    return Response.json({ error: "Failed to delete coupon" }, { status: 500 });
  }

  return Response.json({ success: true });
}
