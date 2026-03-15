import { authenticateAdmin } from "@/services/auth/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import type { CourseStatsSummary } from "@/types/admin-stats";

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const admin = createAdminSupabaseClient();

  const { data: courses, error: coursesError } = await admin
    .from("courses")
    .select("id, title, slug, created_at")
    .order("created_at", { ascending: false });

  if (coursesError) {
    return Response.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }

  const { data: paidOrders } = await admin
    .from("orders")
    .select("id, user_id, created_at")
    .eq("status", "paid");

  const orderIds = paidOrders?.map((o) => o.id) ?? [];
  if (orderIds.length === 0) {
    const summaries: CourseStatsSummary[] = (courses ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      createdAt: c.created_at,
      buyersCount: 0,
      lastPurchaseAt: null,
      totalRevenue: null,
    }));
    return Response.json({ courseStats: summaries });
  }

  const { data: orderItems } = await admin
    .from("order_items")
    .select("order_id, course_id, price")
    .in("order_id", orderIds);

  const orderById = new Map(paidOrders?.map((o) => [o.id, o]) ?? []);
  const byCourseId = new Map<
    string,
    { userIds: Set<string>; lastAt: string | null; revenue: number }
  >();

  orderItems?.forEach((item) => {
    const order = orderById.get(item.order_id);
    if (!order) return;
    let entry = byCourseId.get(item.course_id);
    if (!entry) {
      entry = { userIds: new Set(), lastAt: null, revenue: 0 };
      byCourseId.set(item.course_id, entry);
    }
    entry.userIds.add(order.user_id);
    if (
      !entry.lastAt ||
      new Date(order.created_at) > new Date(entry.lastAt)
    ) {
      entry.lastAt = order.created_at;
    }
    entry.revenue += item.price ?? 0;
  });

  const summaries: CourseStatsSummary[] = (courses ?? []).map((c) => {
    const entry = byCourseId.get(c.id);
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      createdAt: c.created_at,
      buyersCount: entry?.userIds.size ?? 0,
      lastPurchaseAt: entry?.lastAt ?? null,
      totalRevenue: entry ? entry.revenue : null,
    };
  });

  return Response.json({ courseStats: summaries });
}
