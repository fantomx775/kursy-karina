import { authenticateUser } from "@/services/auth/server";
import { getUserCourseAccess } from "@/services/courseAccess";
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
    const access = await getUserCourseAccess(admin, auth.user.id, course.id);
    if (!access.hasActiveAccess) {
      return Response.json(
        {
          error:
            access.status === "expired"
              ? "Course access expired"
              : access.status === "pending"
                ? "Course access pending activation"
                : "Course not purchased",
        },
        { status: 403 },
      );
    }
  }

  const assets = await listCourseSvgs(slug, section);
  return Response.json(
    { courseSlug: slug, section, assets },
    { headers: { "Cache-Control": "no-store" } },
  );
}
