import { authenticateAdmin } from "@/services/auth/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const admin = createAdminSupabaseClient();
  const { data: students, error } = await admin
    .from("users")
    .select("id, first_name, last_name, email, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Failed to fetch students" }, { status: 500 });
  }

  const studentIds = students?.map((student) => student.id) ?? [];

  const lastSignInMap: Record<string, string | null> = {};
  if (studentIds.length > 0) {
    const { data: authData } = await admin.auth.admin.listUsers({ per_page: 1000 });
    authData?.users?.forEach((u) => {
      lastSignInMap[u.id] = u.last_sign_in_at ?? null;
    });
  }

  let courseCounts: Record<string, number> = {};
  if (studentIds.length > 0) {
    const { data: orders } = await admin
      .from("orders")
      .select("id, user_id")
      .in("user_id", studentIds)
      .eq("status", "paid");

    const orderIds = orders?.map((order) => order.id) ?? [];
    if (orderIds.length > 0) {
      const { data: orderItems } = await admin
        .from("order_items")
        .select("order_id, course_id")
        .in("order_id", orderIds);

      orderItems?.forEach((item) => {
        const order = orders?.find((o) => o.id === item.order_id);
        if (!order) return;
        const key = order.user_id;
        courseCounts[key] = (courseCounts[key] ?? 0) + 1;
      });
    }
  }

  const result =
    students?.map((student) => ({
      id: student.id,
      fullName: `${student.first_name} ${student.last_name}`,
      email: student.email,
      registrationDate: student.created_at,
      lastLogin: lastSignInMap[student.id] ?? null,
      coursesEnrolled: courseCounts[student.id] ?? 0,
    })) ?? [];

  return Response.json({ students: result });
}
