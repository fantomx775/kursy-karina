import { courseInputSchema } from "@/lib/validators/course";
import { authenticateAdmin } from "@/services/auth/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Failed to fetch courses" }, { status: 500 });
  }

  return Response.json({ courses: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const payload = await request.json();
  const parsed = courseInputSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    title,
    slug,
    description,
    price,
    status,
    mainImageUrl,
    sections,
    promotionDiscountType,
    promotionDiscountValue,
    promotionStartDate,
    promotionEndDate,
  } = parsed.data;
  const admin = createAdminSupabaseClient();

  const hasPromo =
    promotionDiscountType != null &&
    promotionDiscountValue != null &&
    promotionStartDate != null &&
    promotionStartDate !== "";

  const rpcPayload = {
    p_title: title,
    p_slug: slug,
    p_description: description,
    p_price: Math.round(price * 100),
    p_status: status,
    p_sections: sections,
    p_promotion_discount_type: hasPromo ? promotionDiscountType : null,
    p_promotion_discount_value: hasPromo ? promotionDiscountValue : null,
    p_promotion_start_date:
      hasPromo && promotionStartDate ? promotionStartDate : null,
    p_promotion_end_date:
      hasPromo && promotionEndDate && promotionEndDate !== ""
        ? promotionEndDate
        : null,
  };
  // Use atomic RPC function for course creation
  const { data, error } = await admin.rpc("create_course_with_content", rpcPayload);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return Response.json({ error: "Failed to create course" }, { status: 500 });
  }

  const result = data[0];
  if (!result.success) {
    const status = result.error_message?.includes("already exists") ? 409 : 400;
    return Response.json(
      { 
        error: result.error_message || "Failed to create course",
        field: result.error_message?.includes("slug") ? "slug" : undefined
      }, 
      { status }
    );
  }

  const normalizedMainImageUrl = mainImageUrl ?? null;
  const { error: imageError } = await admin
    .from("courses")
    .update({ main_image_url: normalizedMainImageUrl })
    .eq("id", result.course_id);
  if (imageError) {
    return Response.json(
      { error: "Course saved, but failed to persist main image" },
      { status: 500 },
    );
  }

  // Fetch the created course with full details
  const { data: course, error: fetchError } = await admin
    .from("courses")
    .select("*")
    .eq("id", result.course_id)
    .single();

  if (fetchError || !course) {
    return Response.json({ error: "Course created but failed to fetch details" }, { status: 500 });
  }

  return Response.json({ course }, { status: 201 });
}
