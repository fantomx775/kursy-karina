import { getEffectivePriceCents } from "@/lib/coursePromo";
import { authenticateUser } from "@/services/auth/server";
import { validateCoupon } from "@/services/coupons";
import { getUserCourseAccessMap } from "@/services/courseAccess";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { stripe } from "@/services/stripe";
import { formatAccessDuration } from "@/lib/accessDuration";
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

  const { cart, couponCode, wantsCompanyInvoice } = await request.json();
  const shouldCreateCompanyInvoice = wantsCompanyInvoice === true;
  if (!Array.isArray(cart) || cart.length === 0) {
    return Response.json({ error: "Koszyk jest pusty." }, { status: 400 });
  }

  const uniqueCourseIds = Array.from(
    new Set(cart.map((item: CartItem) => item.id)),
  );
  const admin = createAdminSupabaseClient();

  const { data: courses } = await admin
    .from("courses")
    .select(
      "id, slug, title, description, price, access_duration_months, promotion_discount_type, promotion_discount_value, promotion_start_date, promotion_end_date",
    )
    .in("id", uniqueCourseIds)
    .eq("status", "active");

  const courseMap = new Map<string, Course>();
  courses?.forEach((row) => {
    const course: Course = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      price: row.price,
      status: "active",
      access_duration_months: row.access_duration_months ?? 6,
      promotion_discount_type: row.promotion_discount_type ?? null,
      promotion_discount_value: row.promotion_discount_value ?? null,
      promotion_start_date:
        row.promotion_start_date != null
          ? String(row.promotion_start_date)
          : null,
      promotion_end_date:
        row.promotion_end_date != null ? String(row.promotion_end_date) : null,
    };
    courseMap.set(course.id, course);
  });

  const validCourses = uniqueCourseIds
    .map((id) => courseMap.get(id))
    .filter((course): course is Course => Boolean(course));

  if (validCourses.length === 0) {
    return Response.json(
      { error: "Brak aktywnych kursów w koszyku." },
      { status: 400 },
    );
  }

  const accessByCourseId = await getUserCourseAccessMap(
    admin,
    auth.user.id,
    validCourses.map((course) => course.id),
  );

  const coursesToCharge = validCourses.filter(
    (course) => !accessByCourseId[course.id]?.hasActiveAccess,
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
  let discountedCourseIds = new Set<string>(
    coursesWithEffectivePrice.map((course) => course.id),
  );

  if (couponCode) {
    const couponResult = await validateCoupon({
      code: couponCode,
      userId: auth.user.id,
      subtotalAmount,
      cartItems: coursesWithEffectivePrice.map((course) => ({
        courseId: course.id,
        amount: course.effectivePrice,
      })),
    });
    if (!couponResult.valid) {
      return Response.json({ error: couponResult.error }, { status: 400 });
    }
    discountAmount = couponResult.discountAmount ?? 0;
    couponId = couponResult.couponId;
    discountedCourseIds = new Set(
      couponResult.discountedCourseIds ??
        coursesWithEffectivePrice.map((course) => course.id),
    );
  }

  const discountableCourses = coursesWithEffectivePrice.filter((course) =>
    discountedCourseIds.has(course.id),
  );
  const discountableSubtotal = discountableCourses.reduce(
    (sum, course) => sum + course.effectivePrice,
    0,
  );
  const lastDiscountableCourseId =
    discountableCourses[discountableCourses.length - 1]?.id;
  let remainingDiscount = discountAmount;
  const discountedCourses = coursesWithEffectivePrice.map((course) => {
    if (!discountedCourseIds.has(course.id) || discountAmount <= 0) {
      return {
        ...course,
        finalPrice: course.effectivePrice,
      };
    }

    const rawDiscount =
      course.id === lastDiscountableCourseId
        ? remainingDiscount
        : Math.round(
            (course.effectivePrice / discountableSubtotal) * discountAmount,
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
          description: `${course.description} Dostęp: ${formatAccessDuration(
            course.access_duration_months ?? 6,
          )}.`,
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
      company_invoice_requested: String(shouldCreateCompanyInvoice),
    },
    customer_email: auth.user.email || undefined,
    ...(shouldCreateCompanyInvoice
      ? {
          billing_address_collection: "required" as const,
          customer_creation: "always" as const,
          tax_id_collection: {
            enabled: true,
            required: "if_supported" as const,
          },
          invoice_creation: {
            enabled: true,
            invoice_data: {
              description: "Faktura za zakup kursu online",
              metadata: {
                user_id: auth.user.id,
                course_ids: JSON.stringify(
                  discountedCourses.map((course) => course.id),
                ),
              },
            },
          },
          custom_text: {
            submit: {
              message:
                "Po opłaceniu zamówienia Stripe wyśle fakturę na podany adres e-mail.",
            },
          },
        }
      : {}),
  });

  return Response.json({ url: session.url });
}
