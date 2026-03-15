import { authenticateAdmin } from "@/services/auth/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const { id } = await params;
  const admin = createAdminSupabaseClient();

  const { data: student, error: studentError } = await admin
    .from("users")
    .select("id, first_name, last_name, email, created_at")
    .eq("id", id)
    .eq("role", "student")
    .single();

  if (studentError || !student) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  let lastLogin: string | null = null;
  const { data: authUser } = await admin.auth.admin.getUserById(id);
  if (authUser?.user?.last_sign_in_at) {
    lastLogin = authUser.user.last_sign_in_at;
  }

  const { data: orders } = await admin
    .from("orders")
    .select("id, total_amount, created_at")
    .eq("user_id", id)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  const orderIds = orders?.map((order) => order.id) ?? [];
  const { data: orderItems } = await admin
    .from("order_items")
    .select("order_id, course_id, title, price, quantity")
    .in("order_id", orderIds);

  const courseIds = Array.from(
    new Set(orderItems?.map((item) => item.course_id) ?? []),
  );

  const { data: sections } = await admin
    .from("course_sections")
    .select("id, course_id")
    .in("course_id", courseIds);

  const sectionIds = sections?.map((section) => section.id) ?? [];
  const { data: items } = await admin
    .from("course_items")
    .select("id, section_id")
    .in("section_id", sectionIds);

  const totalItemsByCourse = new Map<string, number>();
  sections?.forEach((section) => {
    const count =
      items?.filter((item) => item.section_id === section.id).length ?? 0;
    totalItemsByCourse.set(
      section.course_id,
      (totalItemsByCourse.get(section.course_id) ?? 0) + count,
    );
  });

  const { data: progress } = await admin
    .from("course_progress")
    .select("course_id, item_id, completed, last_watched")
    .eq("user_id", id);

  const completedByCourse = new Map<string, number>();
  progress?.forEach((entry) => {
    if (!entry.completed) return;
    completedByCourse.set(
      entry.course_id,
      (completedByCourse.get(entry.course_id) ?? 0) + 1,
    );
  });

  const courses = courseIds.map((courseId) => {
    const courseItems = orderItems?.filter(
      (item) => item.course_id === courseId,
    );
    const courseTitle = courseItems?.[0]?.title ?? "Kurs";
    const totalItems = totalItemsByCourse.get(courseId) ?? 0;
    const completedItems = completedByCourse.get(courseId) ?? 0;
    const completionPercentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      courseId,
      courseTitle,
      totalItems,
      completedItems,
      completionPercentage,
    };
  });

  return Response.json({
    student: {
      id: student.id,
      fullName: `${student.first_name} ${student.last_name}`,
      email: student.email,
      registrationDate: student.created_at,
      lastLogin,
      courses,
    },
  });
}
