import {
  addCalendarMonths,
  normalizeAccessDurationMonths,
} from "@/lib/accessDuration";
import { authenticateAdmin } from "@/services/auth/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const { id: studentId } = await params;
  const { courseId } = await request.json();

  if (!courseId || typeof courseId !== "string") {
    return Response.json({ error: "Missing courseId" }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { data: orders } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", studentId)
    .eq("status", "paid");

  const orderIds = orders?.map((order) => order.id) ?? [];
  if (orderIds.length === 0) {
    return Response.json(
      { error: "Student has no paid order for this course" },
      { status: 404 },
    );
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const { data: activeItems } = await admin
    .from("order_items")
    .select("id, access_expires_at")
    .eq("course_id", courseId)
    .eq("access_status", "active")
    .gt("access_expires_at", nowIso)
    .in("order_id", orderIds)
    .order("access_expires_at", { ascending: false })
    .limit(1);

  const activeItem = activeItems?.[0];
  if (activeItem) {
    return Response.json({
      alreadyActive: true,
      accessExpiresAt: activeItem.access_expires_at,
    });
  }

  const { data: pendingItems, error: pendingError } = await admin
    .from("order_items")
    .select("id, access_duration_months, created_at")
    .eq("course_id", courseId)
    .eq("access_status", "pending")
    .in("order_id", orderIds)
    .order("created_at", { ascending: true })
    .limit(1);

  if (pendingError) {
    console.error("Failed to check pending access", pendingError);
    return Response.json(
      { error: "Failed to check pending access" },
      { status: 500 },
    );
  }

  const pendingItem = pendingItems?.[0];
  if (!pendingItem) {
    return Response.json(
      { error: "No pending access found for this course" },
      { status: 404 },
    );
  }

  const accessDurationMonths = normalizeAccessDurationMonths(
    pendingItem.access_duration_months,
  );
  const accessExpiresAt = addCalendarMonths(now, accessDurationMonths);

  const { data: updatedItem, error: updateError } = await admin
    .from("order_items")
    .update({
      access_status: "active",
      access_activated_at: nowIso,
      access_expires_at: accessExpiresAt.toISOString(),
    })
    .eq("id", pendingItem.id)
    .select("id, access_activated_at, access_expires_at")
    .single();

  if (updateError || !updatedItem) {
    console.error("Failed to activate access", updateError);
    return Response.json(
      { error: "Failed to activate access" },
      { status: 500 },
    );
  }

  return Response.json({
    activated: true,
    accessActivatedAt: updatedItem.access_activated_at,
    accessExpiresAt: updatedItem.access_expires_at,
  });
}
