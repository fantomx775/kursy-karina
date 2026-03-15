import { authenticateUser } from "@/services/auth/server";
import { getCourseBySlug } from "@/services/courses";
import { listCourseSvgs } from "@/services/courseAssets";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await authenticateUser();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  if (!section) {
    return Response.json(
      { error: "Missing `section` query param." },
      { status: 400 },
    );
  }

  const course = await getCourseBySlug(slug);
  if (!course) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.status !== "active" && auth.user.role !== "admin") {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  if (auth.user.role !== "admin") {
    const admin = createAdminSupabaseClient();
    const { data: orders, error: ordersError } = await admin
      .from("orders")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("status", "paid");

    if (ordersError) {
      return Response.json(
        { error: "Failed to validate course access" },
        { status: 500 },
      );
    }

    const orderIds = orders?.map((order) => order.id) ?? [];
    if (orderIds.length === 0) {
      return Response.json({ error: "Course not purchased" }, { status: 403 });
    }

    const { data: orderItem, error: orderItemError } = await admin
      .from("order_items")
      .select("course_id")
      .eq("course_id", course.id)
      .in("order_id", orderIds)
      .limit(1)
      .maybeSingle();

    if (orderItemError) {
      return Response.json(
        { error: "Failed to validate course access" },
        { status: 500 },
      );
    }

    if (!orderItem) {
      return Response.json({ error: "Course not purchased" }, { status: 403 });
    }
  }

  const assets = await listCourseSvgs(slug, section);
  return Response.json(
    { courseSlug: slug, section, assets },
    { headers: { "Cache-Control": "no-store" } },
  );
}
