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
  // #region agent log
  fetch('http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9b4d30'},body:JSON.stringify({sessionId:'9b4d30',runId:'baseline',hypothesisId:'H3',location:'courses/route.ts:POST:payload',message:'Admin course create received payload',data:{hasMainImageUrl:Object.prototype.hasOwnProperty.call(payload ?? {}, 'mainImageUrl'),mainImageUrl: (payload && typeof payload === 'object' && payload.mainImageUrl) ? String(payload.mainImageUrl).slice(0,120) : null,keys:Object.keys(payload ?? {}).sort()},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  const parsed = courseInputSchema.safeParse(payload);
  // #region agent log
  fetch('http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9b4d30'},body:JSON.stringify({sessionId:'9b4d30',runId:'baseline',hypothesisId:'H3',location:'courses/route.ts:POST:parse',message:'Admin course create parse result',data:{success:parsed.success,error:parsed.success ? null : parsed.error.issues.slice(0,2).map((issue) => ({ path: issue.path, code: issue.code, message: issue.message })),parsedKeys:parsed.success && parsed.data ? Object.keys(parsed.data).sort() : null,mainImageInParsed: parsed.success ? Object.prototype.hasOwnProperty.call(parsed.data as Record<string, unknown>, 'mainImageUrl') : false},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9b4d30'},body:JSON.stringify({sessionId:'9b4d30',runId:'baseline',hypothesisId:'H4',location:'courses/route.ts:POST:rpc',message:'Admin course create RPC payload',data:{paramKeys:Object.keys(rpcPayload).sort(),hasMainImageParam:false},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9b4d30'},body:JSON.stringify({sessionId:'9b4d30',runId:'post-fix',hypothesisId:'H4',location:'courses/route.ts:POST:image-save',message:'Persisting main image URL after create',data:{courseId:result.course_id,mainImageUrl:normalizedMainImageUrl,hasImage:normalizedMainImageUrl !== null}),timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9b4d30'},body:JSON.stringify({sessionId:'9b4d30',runId:'baseline',hypothesisId:'H5',location:'courses/route.ts:POST:db-read',message:'Admin course create persisted row',data:{id:course?.id ?? null,mainImageUrl:course?.main_image_url ?? null,hasMainImage:Boolean(course?.main_image_url)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (fetchError || !course) {
    return Response.json({ error: "Course created but failed to fetch details" }, { status: 500 });
  }

  return Response.json({ course }, { status: 201 });
}
