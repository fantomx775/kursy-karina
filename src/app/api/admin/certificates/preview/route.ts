import { authenticateAdmin } from "@/services/auth/server";
import {
  formatCertificateIssuedAtInput,
  generateCertificatePdf,
} from "@/services/certificate";
import {
  downloadCertificateTemplateBytes,
  getCertificateTemplateById,
} from "@/services/certificateTemplates";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export async function GET(request: Request) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const params = new URL(request.url).searchParams;
  const admin = createAdminSupabaseClient();
  const template = await getCertificateTemplateById(
    admin,
    params.get("templateId"),
  );

  if (!template) {
    return Response.json(
      { error: "Certificate template not found" },
      { status: 404 },
    );
  }

  const templateBytes = await downloadCertificateTemplateBytes(admin, template);
  const pdfBytes = await generateCertificatePdf({
    firstName: params.get("firstName") || "Magdalena",
    lastName: params.get("lastName") || "Malecka",
    courseTitle: "Test",
    issuedAt: formatCertificateIssuedAtInput(params.get("issuedAt") ?? ""),
    templateBytes,
  });
  const pdfBuffer = Buffer.from(pdfBytes);

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certyfikat-test.pdf"`,
      "Content-Length": String(pdfBuffer.length),
      "Cache-Control": "no-store",
    },
  });
}
