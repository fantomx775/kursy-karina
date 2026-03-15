import { authenticateAdmin } from "@/services/auth/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import type {
  CourseStatsDetail,
  PurchaserWithProgress,
} from "@/types/admin-stats";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const { id: courseId } = await params;
  const admin = createAdminSupabaseClient();

  const { data: course, error: courseError } = await admin
    .from("courses")
    .select("id, title, slug, created_at")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  const { data: paidOrders } = await admin
    .from("orders")
    .select("id, user_id, created_at")
    .eq("status", "paid");

  const orderIds = paidOrders?.map((o) => o.id) ?? [];
  if (orderIds.length === 0) {
    return Response.json({
      courseStats: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        createdAt: course.created_at,
        buyersCount: 0,
        purchasers: [],
      } satisfies CourseStatsDetail,
    });
  }

  const { data: orderItems } = await admin
    .from("order_items")
    .select("order_id, course_id")
    .eq("course_id", courseId)
    .in("order_id", orderIds);

  const orderById = new Map(paidOrders?.map((o) => [o.id, o]) ?? []);
  const userIdToPurchaseDate = new Map<string, string>();
  orderItems?.forEach((item) => {
    const order = orderById.get(item.order_id);
    if (!order) return;
    const existing = userIdToPurchaseDate.get(order.user_id);
    const orderDate = order.created_at;
    if (
      !existing ||
      new Date(orderDate) < new Date(existing)
    ) {
      userIdToPurchaseDate.set(order.user_id, orderDate);
    }
  });

  const userIds = Array.from(userIdToPurchaseDate.keys());
  if (userIds.length === 0) {
    return Response.json({
      courseStats: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        createdAt: course.created_at,
        buyersCount: 0,
        purchasers: [],
      } satisfies CourseStatsDetail,
    });
  }

  const { data: users } = await admin
    .from("users")
    .select("id, first_name, last_name, email")
    .in("id", userIds);

  const { data: sections } = await admin
    .from("course_sections")
    .select("id, course_id")
    .eq("course_id", courseId);

  const sectionIds = sections?.map((s) => s.id) ?? [];
  const { data: items } = await admin
    .from("course_items")
    .select("id, section_id")
    .in("section_id", sectionIds);

  const totalItems = items?.length ?? 0;

  const { data: progress } = await admin
    .from("course_progress")
    .select("user_id, completed")
    .eq("course_id", courseId);

  const completedByUser = new Map<string, number>();
  progress?.forEach((entry) => {
    if (!entry.completed) return;
    completedByUser.set(
      entry.user_id,
      (completedByUser.get(entry.user_id) ?? 0) + 1,
    );
  });

  const userById = new Map(users?.map((u) => [u.id, u]) ?? []);
  const purchasers: PurchaserWithProgress[] = userIds.map((userId) => {
    const u = userById.get(userId);
    const completedItems = completedByUser.get(userId) ?? 0;
    const completionPercentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return {
      userId,
      fullName: u
        ? `${u.first_name} ${u.last_name}`.trim() || u.email
        : "—",
      email: u?.email ?? "—",
      purchaseDate: userIdToPurchaseDate.get(userId) ?? "",
      completedItems,
      totalItems,
      completionPercentage,
    };
  });

  const detail: CourseStatsDetail = {
    id: course.id,
    title: course.title,
    slug: course.slug,
    createdAt: course.created_at,
    buyersCount: purchasers.length,
    purchasers,
  };

  return Response.json({ courseStats: detail });
}
