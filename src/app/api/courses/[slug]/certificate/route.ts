import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { authenticateUser } from "@/services/auth/server";
import { getCourseBySlug } from "@/services/courses";
import {
  getCourseCompletion,
  generateCertificatePdf,
} from "@/services/certificate";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const isPreview =
    new URL(request.url).searchParams.get("preview") === "1";
  const auth = await authenticateUser();
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode });
  }

  const authenticatedUser = auth.user;
  const userId = authenticatedUser.id;
  const isAdmin = authenticatedUser.role === "admin";
  const supabase = await createServerSupabaseClient();

  const course = await getCourseBySlug(slug);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (!isAdmin) {
    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "paid");

    const orderIds = orders?.map((o) => o.id) ?? [];
    if (orderIds.length === 0) {
      return NextResponse.json(
        { error: "Course not purchased" },
        { status: 403 },
      );
    }

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("course_id")
      .in("order_id", orderIds);

    const ownsCourse = orderItems?.some(
      (item) => item.course_id === course.id,
    );
    if (!ownsCourse) {
      return NextResponse.json(
        { error: "Course not purchased" },
        { status: 403 },
      );
    }
  }

  const completion = await getCourseCompletion(supabase, userId, course.id);
  if (completion.totalItems === 0) {
    return NextResponse.json(
      { error: "Certificate not available for this course" },
      { status: 403 },
    );
  }
  if (completion.completedItems !== completion.totalItems) {
    return NextResponse.json(
      { error: "Course must be completed 100% to download certificate" },
      { status: 403 },
    );
  }

  const { data: lastProgress } = await supabase
    .from("course_progress")
    .select("last_watched")
    .eq("user_id", userId)
    .eq("course_id", course.id)
    .eq("completed", true)
    .order("last_watched", { ascending: false })
    .limit(1)
    .maybeSingle();

  const completedAt = lastProgress?.last_watched
    ? new Date(lastProgress.last_watched).toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  const pdfBytes = await generateCertificatePdf({
    firstName: authenticatedUser.profile.first_name,
    lastName: authenticatedUser.profile.last_name,
    courseTitle: course.title,
    completedAt,
  });

  const filename = `certyfikat-${slug}.pdf`;
  const disposition = isPreview
    ? `inline; filename="${filename}"`
    : `attachment; filename="${filename}"`;
  const pdfBuffer = Buffer.from(pdfBytes);
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": disposition,
      "Content-Length": String(pdfBuffer.length),
    },
  });
}
