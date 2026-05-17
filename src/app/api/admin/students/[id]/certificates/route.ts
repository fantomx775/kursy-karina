import { authenticateAdmin } from "@/services/auth/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

type RequestBody = {
  courseId?: string;
};

const CERTIFICATE_SELECT =
  "granted_at, generated_at, issued_at, regeneration_allowed, regeneration_allowed_at";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const body = (await request.json().catch(() => null)) as RequestBody | null;
  if (!body?.courseId) {
    return Response.json({ error: "Course ID is required" }, { status: 400 });
  }

  const { id: studentId } = await params;
  const admin = createAdminSupabaseClient();

  const { data: student } = await admin
    .from("users")
    .select("id")
    .eq("id", studentId)
    .eq("role", "student")
    .maybeSingle();

  if (!student) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  const { data: course } = await admin
    .from("courses")
    .select("id")
    .eq("id", body.courseId)
    .maybeSingle();

  if (!course) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  const { data: orders } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", studentId)
    .eq("status", "paid");

  const orderIds = orders?.map((order) => order.id) ?? [];
  if (orderIds.length === 0) {
    return Response.json(
      { error: "Student does not own this course" },
      { status: 400 },
    );
  }

  const { data: ownedCourse } = await admin
    .from("order_items")
    .select("course_id")
    .eq("course_id", body.courseId)
    .in("order_id", orderIds)
    .limit(1)
    .maybeSingle();

  if (!ownedCourse) {
    return Response.json(
      { error: "Student does not own this course" },
      { status: 400 },
    );
  }

  const { data: existingGrant } = await admin
    .from("course_certificates")
    .select(CERTIFICATE_SELECT)
    .eq("user_id", studentId)
    .eq("course_id", body.courseId)
    .maybeSingle();

  if (existingGrant?.granted_at) {
    return Response.json({
      success: true,
      alreadyGranted: true,
      certificateGrantedAt: existingGrant.granted_at,
      certificateGenerated: Boolean(existingGrant.generated_at),
      certificateGeneratedAt: existingGrant.generated_at,
      certificateIssuedAt: existingGrant.issued_at,
      certificateRegenerationAllowed: Boolean(
        existingGrant.regeneration_allowed,
      ),
    });
  }

  const { data: createdGrant, error: grantError } = await admin
    .from("course_certificates")
    .insert({
      user_id: studentId,
      course_id: body.courseId,
      granted_by: auth.user.id,
    })
    .select(CERTIFICATE_SELECT)
    .single();

  if (grantError || !createdGrant) {
    return Response.json(
      { error: "Failed to grant certificate" },
      { status: 500 },
    );
  }

  return Response.json({
    success: true,
    certificateGrantedAt: createdGrant.granted_at,
    certificateGenerated: false,
    certificateGeneratedAt: null,
    certificateIssuedAt: null,
    certificateRegenerationAllowed: false,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const body = (await request.json().catch(() => null)) as RequestBody | null;
  if (!body?.courseId) {
    return Response.json({ error: "Course ID is required" }, { status: 400 });
  }

  const { id: studentId } = await params;
  const admin = createAdminSupabaseClient();
  const { data: updatedGrant, error } = await admin
    .from("course_certificates")
    .update({
      regeneration_allowed: true,
      regeneration_allowed_at: new Date().toISOString(),
    })
    .eq("user_id", studentId)
    .eq("course_id", body.courseId)
    .not("generated_at", "is", null)
    .select(CERTIFICATE_SELECT)
    .maybeSingle();

  if (error) {
    return Response.json(
      { error: "Failed to allow certificate regeneration" },
      { status: 500 },
    );
  }

  if (!updatedGrant) {
    return Response.json(
      { error: "Generated certificate not found" },
      { status: 404 },
    );
  }

  return Response.json({
    success: true,
    certificateGrantedAt: updatedGrant.granted_at,
    certificateGenerated: Boolean(updatedGrant.generated_at),
    certificateGeneratedAt: updatedGrant.generated_at,
    certificateIssuedAt: updatedGrant.issued_at,
    certificateRegenerationAllowed: Boolean(updatedGrant.regeneration_allowed),
  });
}
