import { getEffectivePriceCents } from "@/lib/coursePromo";
import { authenticateUser } from "@/services/auth/server";
import { validateCoupon } from "@/services/coupons";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { stripe } from "@/services/stripe";
import type { Course } from "@/types/course";

type CartItem = {
  id: string;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await authenticateUser();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const { cart, couponCode } = await request.json();
  if (!Array.isArray(cart) || cart.length === 0) {
    return Response.json({ error: "Koszyk jest pusty." }, { status: 400 });
  }

  const uniqueCourseIds = Array.from(new Set(cart.map((item: CartItem) => item.id)));
  const admin = createAdminSupabaseClient();

  const { data: courses } = await admin
    .from("courses")
    .select(
      "id, title, description, price, promotion_discount_type, promotion_discount_value, promotion_start_date, promotion_end_date",
    )
    .in("id", uniqueCourseIds)
    .eq("status", "active");

  const courseMap = new Map<string, Course>();
  courses?.forEach((row) => {
    const course: Course = {
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price,
      status: "active",
      promotion_discount_type: row.promotion_discount_type ?? null,
      promotion_discount_value: row.promotion_discount_value ?? null,
      promotion_start_date: row.promotion_start_date != null ? String(row.promotion_start_date) : null,
      promotion_end_date: row.promotion_end_date != null ? String(row.promotion_end_date) : null,
    };
    courseMap.set(course.id, course);
  });

  const validCourses = uniqueCourseIds
    .map((id) => courseMap.get(id))
    .filter((course): course is Course => Boolean(course));

  if (validCourses.length === 0) {
    return Response.json({ error: "Brak aktywnych kursów w koszyku." }, { status: 400 });
  }

  const { data: orders } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("status", "paid");

  const orderIds = orders?.map((order) => order.id) ?? [];
  let purchasedCourseIds: string[] = [];
  if (orderIds.length > 0) {
    const { data: items } = await admin
      .from("order_items")
      .select("course_id")
      .in("order_id", orderIds);
    purchasedCourseIds = items?.map((item) => item.course_id) ?? [];
  }

  const coursesToCharge = validCourses.filter(
    (course) => !purchasedCourseIds.includes(course.id),
  );

  if (coursesToCharge.length === 0) {
    return Response.json({
      alreadyPurchased: true,
      message: "Wszystkie kursy są już zakupione.",
    });
  }

  const coursesWithEffectivePrice = coursesToCharge.map((course) => ({
    ...course,
    effectivePrice: getEffectivePriceCents(course),
  }));
  const subtotalAmount = coursesWithEffectivePrice.reduce(
    (sum, c) => sum + c.effectivePrice,
    0,
  );
  let discountAmount = 0;
  let couponId: string | undefined;

  if (couponCode) {
    const couponResult = await validateCoupon({
      code: couponCode,
      userId: auth.user.id,
      subtotalAmount,
    });
    if (!couponResult.valid) {
      return Response.json({ error: couponResult.error }, { status: 400 });
    }
    discountAmount = couponResult.discountAmount ?? 0;
    couponId = couponResult.couponId;
  }

  let remainingDiscount = discountAmount;
  const discountedCourses = coursesWithEffectivePrice.map((course, index) => {
    const rawDiscount =
      index === coursesWithEffectivePrice.length - 1
        ? remainingDiscount
        : Math.round(
            (course.effectivePrice / subtotalAmount) * discountAmount,
          );
    const appliedDiscount = Math.min(rawDiscount, course.effectivePrice);
    remainingDiscount -= appliedDiscount;
    return {
      ...course,
      finalPrice: course.effectivePrice - appliedDiscount,
    };
  });

  const origin = request.headers.get("origin");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin || "";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "blik"],
    line_items: discountedCourses.map((course) => ({
      price_data: {
        currency: "pln",
        product_data: {
          name: course.title,
          description: course.description,
        },
        unit_amount: Math.round(course.finalPrice),
      },
      quantity: 1,
    })),
    mode: "payment",
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cancel`,
    locale: "pl",
    metadata: {
      course_ids: JSON.stringify(discountedCourses.map((course) => course.id)),
      user_id: auth.user.id,
      coupon_id: couponId ?? "",
      discount_amount: String(discountAmount),
      subtotal_amount: String(subtotalAmount),
      total_amount: String(subtotalAmount - discountAmount),
    },
    customer_email: auth.user.email || undefined,
  });

  return Response.json({ url: session.url });
}
