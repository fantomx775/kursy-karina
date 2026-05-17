import { authenticateAdmin } from "@/services/auth/server";
import { mapCertificateTemplateRow } from "@/services/certificateTemplates";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string;
  } | null;
  const name = body?.name?.trim();
  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const { id } = await params;
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("certificate_templates")
    .update({ name })
    .eq("id", id)
    .select(
      "id, name, storage_bucket, storage_path, is_active, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    return Response.json(
      { error: "Failed to rename certificate template" },
      { status: 500 },
    );
  }

  return Response.json({ template: mapCertificateTemplateRow(data) });
}
