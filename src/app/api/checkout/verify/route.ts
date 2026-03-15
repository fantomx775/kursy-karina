import { revalidatePath } from "next/cache";
import { authenticateUser } from "@/services/auth/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { stripe } from "@/services/stripe";

export async function POST(request: Request) {
  const auth = await authenticateUser();
  if (!auth.success) {
    return Response.json({ error: auth.error, verified: false }, { status: auth.statusCode });
  }

  const { sessionId } = await request.json();
  const userId = auth.user.id;

  if (!sessionId) {
    return Response.json(
      { error: "Missing session ID" },
      { status: 400 },
    );
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session || session.payment_status !== "paid") {
    return Response.json(
      { error: "Payment not completed", verified: false },
      { status: 400 },
    );
  }

  const sessionUserId = session.metadata?.user_id;
  if (!sessionUserId || sessionUserId !== userId) {
    return Response.json(
      { error: "Unauthorized checkout verification", verified: false },
      { status: 403 },
    );
  }

  const paymentId = session.payment_intent?.toString() ?? sessionId;
  const admin = createAdminSupabaseClient();

  const { data: existingOrder } = await admin
    .from("orders")
    .select("id")
    .eq("payment_intent_id", paymentId)
    .eq("user_id", userId)
    .eq("status", "paid")
    .maybeSingle();

  if (existingOrder) {
    revalidatePath("/dashboard");
    return Response.json({ verified: true, order: existingOrder });
  }

  const courseIds = session.metadata?.course_ids
    ? JSON.parse(session.metadata.course_ids)
    : [];
  const couponId = session.metadata?.coupon_id || null;
  const subtotalAmount = Number(session.metadata?.subtotal_amount ?? 0);
  const discountAmount = Number(session.metadata?.discount_amount ?? 0);
  const totalAmount = Number(session.metadata?.total_amount ?? 0);

  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    return Response.json(
      { error: "No course IDs in session", verified: false },
      { status: 400 },
    );
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      status: "paid",
      subtotal_amount: subtotalAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      coupon_id: couponId || null,
      payment_intent_id: paymentId,
    })
    .select()
    .single();

  if (orderError || !order) {
    return Response.json(
      { error: "Failed to create order", verified: false },
      { status: 500 },
    );
  }

  const { data: courses } = await admin
    .from("courses")
    .select("id, title, price")
    .in("id", courseIds);

  const courseMap = new Map(
    (courses ?? []).map((course) => [course.id, course]),
  );

  const orderItems = courseIds.map((courseId: string) => {
    const course = courseMap.get(courseId);
    return {
      order_id: order.id,
      course_id: courseId,
      title: course?.title ?? "Kurs",
      price: course?.price ?? 0,
      quantity: 1,
    };
  });

  const { error: itemsError } = await admin
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    return Response.json(
      { error: "Failed to create order items", verified: false },
      { status: 500 },
    );
  }

  if (couponId) {
    await admin.from("coupon_usage").insert({
      coupon_id: couponId,
      user_id: userId,
      order_id: order.id,
      discount_amount: discountAmount,
    });
  }

  revalidatePath("/dashboard");
  return Response.json({ verified: true, order });
}
