import { NextResponse } from "next/server";
import { normalizeCertificateTemplateKey } from "@/lib/certificateTemplates";
import { generateCertificatePdf } from "@/services/certificate";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const searchParams = new URL(request.url).searchParams;
  const templateKey = normalizeCertificateTemplateKey(
    searchParams.get("template"),
  );
  const firstName = searchParams.get("firstName") ?? "Magdalena";
  const lastName = searchParams.get("lastName") ?? "Małecka";
  const issuedAt = searchParams.get("issuedAt") ?? "16 maja 2026";

  const pdfBytes = await generateCertificatePdf({
    firstName,
    lastName,
    issuedAt,
    courseTitle: "Certyfikat testowy",
    templateKey,
  });

  const pdfBuffer = Buffer.from(pdfBytes);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certyfikat-test-${templateKey}.pdf"`,
      "Content-Length": String(pdfBuffer.length),
    },
  });
}
