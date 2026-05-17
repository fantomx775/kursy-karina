import { NextResponse } from "next/server";
import { CERTIFICATE_STORAGE_BUCKET } from "@/lib/certificateTemplates";
import { authenticateUser } from "@/services/auth/server";
import {
  formatCertificateIssuedAt,
  generateCertificatePdf,
  getCertificateGrant,
  getCourseCompletion,
  getWarsawDateOnly,
  type CertificateGrant,
} from "@/services/certificate";
import {
  downloadCertificateTemplateBytes,
  getCertificateTemplateById,
} from "@/services/certificateTemplates";
import { getCourseBySlug } from "@/services/courses";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { createServerSupabaseClient } from "@/services/supabase/server";

type CertificateContext = {
  course: NonNullable<Awaited<ReturnType<typeof getCourseBySlug>>>;
  grant: CertificateGrant;
  isPreview: boolean;
  userId: string;
  firstName: string;
  lastName: string;
};

async function assertCourseAccess(
  slug: string,
  requestUrl: string,
): Promise<
  | { ok: true; context: CertificateContext }
  | { ok: false; response: NextResponse }
> {
  const isPreview = new URL(requestUrl).searchParams.get("preview") === "1";
  const auth = await authenticateUser();
  if (!auth.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: auth.error },
        { status: auth.statusCode },
      ),
    };
  }

  const authenticatedUser = auth.user;
  const userId = authenticatedUser.id;
  const isAdmin = authenticatedUser.role === "admin";
  const supabase = await createServerSupabaseClient();

  const course = await getCourseBySlug(slug);
  if (!course) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Course not found" },
        { status: 404 },
      ),
    };
  }

  if (!isAdmin) {
    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "paid");

    const orderIds = orders?.map((order) => order.id) ?? [];
    if (orderIds.length === 0) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Course not purchased" },
          { status: 403 },
        ),
      };
    }

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("course_id")
      .in("order_id", orderIds);

    const ownsCourse = orderItems?.some((item) => item.course_id === course.id);
    if (!ownsCourse) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Course not purchased" },
          { status: 403 },
        ),
      };
    }
  }

  const completion = await getCourseCompletion(supabase, userId, course.id);
  if (completion.totalItems === 0) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Certificate not available for this course" },
        { status: 403 },
      ),
    };
  }

  const grant = await getCertificateGrant(supabase, userId, course.id);
  if (!grant.granted) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Certificate has not been granted by admin yet" },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true,
    context: {
      course,
      grant,
      isPreview,
      userId,
      firstName: authenticatedUser.profile.first_name,
      lastName: authenticatedUser.profile.last_name,
    },
  };
}

async function downloadGeneratedCertificate(
  grant: CertificateGrant,
): Promise<Buffer> {
  if (!grant.pdfStoragePath) {
    throw new Error("Certificate has not been generated yet.");
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.storage
    .from(grant.pdfStorageBucket ?? CERTIFICATE_STORAGE_BUCKET)
    .download(grant.pdfStoragePath);

  if (error || !data) {
    throw new Error(error?.message ?? "Certificate file not found.");
  }

  return Buffer.from(await data.arrayBuffer());
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const access = await assertCourseAccess(slug, request.url);
  if (!access.ok) {
    return access.response;
  }

  const { grant, isPreview } = access.context;
  if (!grant.generated || !grant.pdfStoragePath) {
    return NextResponse.json(
      {
        error: "Certificate must be generated first.",
        needsGeneration: true,
      },
      { status: 409 },
    );
  }

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await downloadGeneratedCertificate(grant);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to download certificate.",
      },
      { status: 500 },
    );
  }

  const filename = `certyfikat-${slug}.pdf`;
  const disposition = isPreview
    ? `inline; filename="${filename}"`
    : `attachment; filename="${filename}"`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": disposition,
      "Content-Length": String(pdfBuffer.length),
      "Cache-Control": "private, no-store",
    },
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const access = await assertCourseAccess(slug, request.url);
  if (!access.ok) {
    return access.response;
  }

  const { course, grant, userId, firstName, lastName } = access.context;
  if (grant.generated && !grant.regenerationAllowed) {
    return NextResponse.json({
      success: true,
      alreadyGenerated: true,
      generatedAt: grant.generatedAt,
      issuedAt: grant.issuedAt,
      downloadUrl: `/api/courses/${slug}/certificate`,
    });
  }

  const admin = createAdminSupabaseClient();
  const template = await getCertificateTemplateById(
    admin,
    course.certificate_template_id ?? grant.certificateTemplateId,
  );

  if (!template) {
    return NextResponse.json(
      { error: "Certificate template not found" },
      { status: 500 },
    );
  }

  const today = new Date();
  const issuedAtDate = getWarsawDateOnly(today);
  const issuedAtLabel = formatCertificateIssuedAt(today);
  const templateBytes = await downloadCertificateTemplateBytes(admin, template);
  const pdfBytes = await generateCertificatePdf({
    firstName,
    lastName,
    courseTitle: course.title,
    issuedAt: issuedAtLabel,
    templateBytes,
  });

  const pdfStoragePath =
    grant.pdfStoragePath ?? `issued/${course.id}/${userId}.pdf`;
  const pdfBuffer = Buffer.from(pdfBytes);

  const { error: uploadError } = await admin.storage
    .from(CERTIFICATE_STORAGE_BUCKET)
    .upload(pdfStoragePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Failed to store generated certificate" },
      { status: 500 },
    );
  }

  const { data: updatedGrant, error: updateError } = await admin
    .from("course_certificates")
    .update({
      recipient_first_name: firstName,
      recipient_last_name: lastName,
      issued_at: issuedAtDate,
      generated_at: new Date().toISOString(),
      pdf_storage_bucket: CERTIFICATE_STORAGE_BUCKET,
      pdf_storage_path: pdfStoragePath,
      certificate_template_id: template.id,
      regeneration_allowed: false,
      regeneration_allowed_at: null,
      generation_version: grant.generationVersion + 1,
    })
    .eq("user_id", userId)
    .eq("course_id", course.id)
    .select("generated_at, issued_at")
    .single();

  if (updateError || !updatedGrant) {
    return NextResponse.json(
      { error: "Failed to persist generated certificate" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    generatedAt: updatedGrant.generated_at,
    issuedAt: updatedGrant.issued_at,
    downloadUrl: `/api/courses/${slug}/certificate`,
  });
}
