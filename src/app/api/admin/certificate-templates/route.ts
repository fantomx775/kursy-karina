import { randomUUID } from "node:crypto";
import { CERTIFICATE_STORAGE_BUCKET } from "@/lib/certificateTemplates";
import { authenticateAdmin } from "@/services/auth/server";
import {
  getCertificateTemplates,
  upsertCertificateTemplate,
} from "@/services/certificateTemplates";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const admin = createAdminSupabaseClient();
  const templates = await getCertificateTemplates(admin);
  return Response.json({ templates });
}

export async function POST(request: Request) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "PDF file is required" }, { status: 400 });
  }

  if (file.type && file.type !== "application/pdf") {
    return Response.json(
      { error: "Only PDF files are supported" },
      { status: 400 },
    );
  }

  const rawName = (formData.get("name")?.toString() ?? "").trim();
  const name = rawName || file.name.replace(/\.pdf$/i, "") || "Certyfikat";
  const id = randomUUID();
  const storagePath = `templates/${id}.pdf`;
  const admin = createAdminSupabaseClient();
  const pdfBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(CERTIFICATE_STORAGE_BUCKET)
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return Response.json(
      { error: "Failed to upload certificate template" },
      { status: 500 },
    );
  }

  const template = await upsertCertificateTemplate(admin, {
    id,
    name,
    storagePath,
  });

  return Response.json({ template }, { status: 201 });
}
