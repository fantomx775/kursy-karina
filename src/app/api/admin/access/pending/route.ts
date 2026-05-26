import {
  addCalendarMonths,
  normalizeAccessDurationMonths,
} from "@/lib/accessDuration";
import { authenticateAdmin } from "@/services/auth/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import type {
  PendingAccessActivationResult,
  PendingAccessRecord,
} from "@/types/pending-access";

export const dynamic = "force-dynamic";

type PendingOrderItem = {
  id: string;
  order_id: string;
  course_id: string;
  title: string | null;
  access_duration_months: number | null;
  created_at: string | null;
};

type PaidOrder = {
  id: string;
  user_id: string;
  created_at: string;
};

type StudentRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  instagram_username: string | null;
};

type CourseRow = {
  id: string;
  title: string;
  slug: string | null;
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function getStudentName(student: StudentRow | undefined): string {
  if (!student) return "—";
  const fullName = `${student.first_name ?? ""} ${
    student.last_name ?? ""
  }`.trim();
  return fullName || student.email;
}

function getDaysWaiting(pendingSince: string, now = Date.now()): number {
  const pendingTime = new Date(pendingSince).getTime();
  if (Number.isNaN(pendingTime)) return 0;
  return Math.max(0, Math.floor((now - pendingTime) / 86_400_000));
}

async function loadPendingItems(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  itemIds?: string[],
): Promise<{ data: PendingOrderItem[]; error: unknown }> {
  let query = admin
    .from("order_items")
    .select("id, order_id, course_id, title, access_duration_months, created_at")
    .eq("access_status", "pending")
    .order("created_at", { ascending: true });

  if (itemIds) {
    query = query.in("id", itemIds);
  }

  const { data, error } = await query;
  return { data: (data ?? []) as PendingOrderItem[], error };
}

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const admin = createAdminSupabaseClient();
  const { data: pendingItems, error: pendingError } =
    await loadPendingItems(admin);

  if (pendingError) {
    console.error("Failed to load pending access items", pendingError);
    return Response.json(
      { error: "Failed to load pending access items" },
      { status: 500 },
    );
  }

  if (pendingItems.length === 0) {
    return Response.json({ pendingAccess: [] });
  }

  const orderIds = unique(pendingItems.map((item) => item.order_id));
  const { data: ordersData, error: ordersError } = await admin
    .from("orders")
    .select("id, user_id, created_at")
    .eq("status", "paid")
    .in("id", orderIds);

  if (ordersError) {
    console.error("Failed to load pending access orders", ordersError);
    return Response.json(
      { error: "Failed to load pending access orders" },
      { status: 500 },
    );
  }

  const orders = (ordersData ?? []) as PaidOrder[];
  const orderById = new Map(orders.map((order) => [order.id, order]));
  const paidPendingItems = pendingItems.filter((item) =>
    orderById.has(item.order_id),
  );

  if (paidPendingItems.length === 0) {
    return Response.json({ pendingAccess: [] });
  }

  const userIds = unique(orders.map((order) => order.user_id));
  const courseIds = unique(paidPendingItems.map((item) => item.course_id));

  const [{ data: usersData }, { data: coursesData }] = await Promise.all([
    admin
      .from("users")
      .select("id, first_name, last_name, email, instagram_username")
      .in("id", userIds),
    admin.from("courses").select("id, title, slug").in("id", courseIds),
  ]);

  const userById = new Map(
    ((usersData ?? []) as StudentRow[]).map((user) => [user.id, user]),
  );
  const courseById = new Map(
    ((coursesData ?? []) as CourseRow[]).map((course) => [course.id, course]),
  );

  const pendingAccess: PendingAccessRecord[] = paidPendingItems
    .map((item) => {
      const order = orderById.get(item.order_id);
      if (!order) return null;

      const student = userById.get(order.user_id);
      const course = courseById.get(item.course_id);
      const pendingSince = item.created_at ?? order.created_at;

      return {
        id: item.id,
        orderId: item.order_id,
        studentId: order.user_id,
        studentName: getStudentName(student),
        studentEmail: student?.email ?? "—",
        instagramUsername: student?.instagram_username ?? null,
        courseId: item.course_id,
        courseTitle: course?.title ?? item.title ?? "Kurs",
        courseSlug: course?.slug ?? null,
        purchaseDate: order.created_at,
        pendingSince,
        daysWaiting: getDaysWaiting(pendingSince),
        accessDurationMonths: item.access_duration_months,
      } satisfies PendingAccessRecord;
    })
    .filter((record): record is PendingAccessRecord => Boolean(record))
    .sort(
      (a, b) =>
        new Date(a.pendingSince).getTime() - new Date(b.pendingSince).getTime(),
    );

  return Response.json({ pendingAccess });
}

export async function POST(request: Request) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const body = await request.json().catch(() => null);
  const itemIds = unique(
    Array.isArray(body?.itemIds)
      ? body.itemIds.filter((itemId: unknown): itemId is string => {
          return typeof itemId === "string" && itemId.length > 0;
        })
      : [],
  );

  if (itemIds.length === 0) {
    return Response.json({ error: "Missing itemIds" }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { data: pendingItems, error: pendingError } = await loadPendingItems(
    admin,
    itemIds,
  );

  if (pendingError) {
    console.error("Failed to load pending access items", pendingError);
    return Response.json(
      { error: "Failed to load pending access items" },
      { status: 500 },
    );
  }

  const foundItemIds = new Set(pendingItems.map((item) => item.id));
  const results: PendingAccessActivationResult[] = itemIds
    .filter((itemId) => !foundItemIds.has(itemId))
    .map((itemId) => ({
      itemId,
      status: "not_found",
      accessExpiresAt: null,
      error: "Pending access item was not found.",
    }));

  if (pendingItems.length === 0) {
    return Response.json({ activatedCount: 0, results });
  }

  const orderIds = unique(pendingItems.map((item) => item.order_id));
  const { data: ordersData, error: ordersError } = await admin
    .from("orders")
    .select("id, user_id, created_at")
    .eq("status", "paid")
    .in("id", orderIds);

  if (ordersError) {
    console.error("Failed to load pending access orders", ordersError);
    return Response.json(
      { error: "Failed to load pending access orders" },
      { status: 500 },
    );
  }

  const orderById = new Map(
    ((ordersData ?? []) as PaidOrder[]).map((order) => [order.id, order]),
  );
  const userIds = unique(
    pendingItems
      .map((item) => orderById.get(item.order_id)?.user_id)
      .filter((userId): userId is string => Boolean(userId)),
  );

  const { data: userOrdersData, error: userOrdersError } =
    userIds.length > 0
      ? await admin
          .from("orders")
          .select("id, user_id")
          .eq("status", "paid")
          .in("user_id", userIds)
      : { data: [], error: null };

  if (userOrdersError) {
    console.error("Failed to load user paid orders", userOrdersError);
    return Response.json(
      { error: "Failed to load user paid orders" },
      { status: 500 },
    );
  }

  const paidOrderIdsByUserId = new Map<string, string[]>();
  (userOrdersData ?? []).forEach((order: { id: string; user_id: string }) => {
    paidOrderIdsByUserId.set(order.user_id, [
      ...(paidOrderIdsByUserId.get(order.user_id) ?? []),
      order.id,
    ]);
  });

  const now = new Date();
  const nowIso = now.toISOString();

  for (const item of pendingItems) {
    const order = orderById.get(item.order_id);
    if (!order) {
      results.push({
        itemId: item.id,
        status: "failed",
        accessExpiresAt: null,
        error: "Paid order was not found.",
      });
      continue;
    }

    const paidOrderIds = paidOrderIdsByUserId.get(order.user_id) ?? [];
    const { data: activeItems, error: activeError } = await admin
      .from("order_items")
      .select("id, access_expires_at")
      .eq("course_id", item.course_id)
      .eq("access_status", "active")
      .gt("access_expires_at", nowIso)
      .in("order_id", paidOrderIds)
      .order("access_expires_at", { ascending: false })
      .limit(1);

    if (activeError) {
      console.error("Failed to check active access", activeError);
      results.push({
        itemId: item.id,
        status: "failed",
        accessExpiresAt: null,
        error: "Failed to check active access.",
      });
      continue;
    }

    const activeItem = activeItems?.[0];
    if (activeItem) {
      results.push({
        itemId: item.id,
        status: "already_active",
        accessExpiresAt: activeItem.access_expires_at,
      });
      continue;
    }

    const accessDurationMonths = normalizeAccessDurationMonths(
      item.access_duration_months,
    );
    const accessExpiresAt = addCalendarMonths(now, accessDurationMonths);

    const { data: updatedItem, error: updateError } = await admin
      .from("order_items")
      .update({
        access_status: "active",
        access_activated_at: nowIso,
        access_expires_at: accessExpiresAt.toISOString(),
      })
      .eq("id", item.id)
      .eq("access_status", "pending")
      .select("id, access_expires_at")
      .single();

    if (updateError || !updatedItem) {
      console.error("Failed to activate pending access", updateError);
      results.push({
        itemId: item.id,
        status: "failed",
        accessExpiresAt: null,
        error: "Failed to activate access.",
      });
      continue;
    }

    results.push({
      itemId: item.id,
      status: "activated",
      accessExpiresAt: updatedItem.access_expires_at,
    });
  }

  return Response.json({
    activatedCount: results.filter((result) => result.status === "activated")
      .length,
    results,
  });
}
