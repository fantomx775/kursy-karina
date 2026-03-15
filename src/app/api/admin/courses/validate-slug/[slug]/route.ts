import { authenticateAdmin } from "@/services/auth/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const excludeId = searchParams.get("excludeId");

  const admin = createAdminSupabaseClient();

  let query = admin
    .from("courses")
    .select("id")
    .eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data: existingCourse, error } = await query.maybeSingle();

  if (error) {
    return Response.json({ error: "Failed to validate slug" }, { status: 500 });
  }

  return Response.json({
    available: !existingCourse,
    message: existingCourse ? "Slug already exists" : null,
  });
}
