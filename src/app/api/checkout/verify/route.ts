import { revalidatePath } from "next/cache";
import { authenticateUser } from "@/services/auth/server";
import {
  parseCompanyInvoiceProvider,
  type CompanyInvoiceProvider,
} from "@/services/invoicing/companyInvoiceProvider";
import { issueFakturowniaInvoiceForCheckout } from "@/services/invoicing/fakturowniaPurchase";
import {
  buildPendingOrderItems,
  type CheckoutCourseSnapshot,
} from "@/services/checkout/orderItems";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { stripe } from "@/services/stripe";

type ExistingOrder = {
  id: string;
  company_invoice_requested: boolean | null;
  invoice_id: string | null;
  invoice_number: string | null;
  invoice_provider: string | null;
  invoice_status: string | null;
  invoice_url: string | null;
};

type InvoiceResponse = {
  provider: CompanyInvoiceProvider;
  status: "issued" | "pending" | "failed";
  error?: string;
  id?: string | null;
  number?: string | null;
  url?: string | null;
} | null;

const ORDER_WITH_INVOICE_SELECT =
  "id, company_invoice_requested, invoice_provider, invoice_id, invoice_number, invoice_url, invoice_status";

export async function POST(request: Request) {
  const auth = await authenticateUser();
  if (!auth.success) {
    return Response.json(
      { error: auth.error, verified: false },
      { status: auth.statusCode },
    );
  }

  const { sessionId } = await request.json();
  const userId = auth.user.id;

  if (!sessionId) {
    return Response.json({ error: "Missing session ID" }, { status: 400 });
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

  const courseIds = parseCourseIds(session.metadata?.course_ids);
  if (courseIds.length === 0) {
    return Response.json(
      { error: "No course IDs in session", verified: false },
      { status: 400 },
    );
  }

  const paymentId = session.payment_intent?.toString() ?? sessionId;
  const admin = createAdminSupabaseClient();
  const coursesResult = await loadCheckoutCourses(admin, courseIds);

  if (coursesResult.error) {
    console.error("Failed to load checkout courses", coursesResult.error);
    return Response.json(
      { error: "Failed to load checkout courses", verified: false },
      { status: 500 },
    );
  }

  const { data: existingOrder, error: existingOrderError } = await admin
    .from("orders")
    .select(ORDER_WITH_INVOICE_SELECT)
    .eq("payment_intent_id", paymentId)
    .eq("user_id", userId)
    .eq("status", "paid")
    .maybeSingle<ExistingOrder>();

  if (existingOrderError) {
    console.error("Failed to check existing order", existingOrderError);
    return Response.json(
      { error: "Failed to check existing order", verified: false },
      { status: 500 },
    );
  }

  if (existingOrder) {
    const ensureItemsResult = await ensureOrderItemsForCourses({
      admin,
      courseIds,
      courses: coursesResult.courses,
      orderId: existingOrder.id,
    });

    if (!ensureItemsResult.success) {
      return Response.json(
        { error: "Failed to create order items", verified: false },
        { status: 500 },
      );
    }

    const invoice = await syncCompanyInvoiceForOrder({
      admin,
      order: existingOrder,
      session,
      sessionId,
    });

    revalidatePath("/dashboard");
    return Response.json({ verified: true, order: existingOrder, invoice });
  }

  const couponId = session.metadata?.coupon_id || null;
  const subtotalAmount = Number(session.metadata?.subtotal_amount ?? 0);
  const discountAmount = Number(session.metadata?.discount_amount ?? 0);
  const totalAmount = Number(session.metadata?.total_amount ?? 0);
  const companyInvoiceRequested =
    session.metadata?.company_invoice_requested === "true";
  const companyInvoiceProvider = parseCompanyInvoiceProvider(
    session.metadata?.company_invoice_provider,
    "stripe",
  );

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
      company_invoice_requested: companyInvoiceRequested,
      invoice_provider: companyInvoiceRequested ? companyInvoiceProvider : null,
      invoice_status: companyInvoiceRequested ? "pending" : null,
      invoice_id:
        companyInvoiceRequested && companyInvoiceProvider === "stripe"
          ? getStripeInvoiceId(session)
          : null,
    })
    .select(ORDER_WITH_INVOICE_SELECT)
    .single<ExistingOrder>();

  if (orderError || !order) {
    console.error("Failed to create order", orderError);
    return Response.json(
      { error: "Failed to create order", verified: false },
      { status: 500 },
    );
  }

  const ensureItemsResult = await ensureOrderItemsForCourses({
    admin,
    courseIds,
    courses: coursesResult.courses,
    orderId: order.id,
  });

  if (!ensureItemsResult.success) {
    return Response.json(
      { error: "Failed to create order items", verified: false },
      { status: 500 },
    );
  }

  if (couponId) {
    const { error: couponUsageError } = await admin
      .from("coupon_usage")
      .insert({
        coupon_id: couponId,
        user_id: userId,
        order_id: order.id,
        discount_amount: discountAmount,
      });

    if (couponUsageError) {
      console.error("Failed to record coupon usage", couponUsageError);
    }
  }

  const invoice = await syncCompanyInvoiceForOrder({
    admin,
    order,
    session,
    sessionId,
  });

  revalidatePath("/dashboard");
  return Response.json({ verified: true, order, invoice });
}

async function loadCheckoutCourses(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  courseIds: string[],
): Promise<
  | { courses: CheckoutCourseSnapshot[]; error: null }
  | { courses: []; error: unknown }
> {
  const { data, error } = await admin
    .from("courses")
    .select("id, title, price, access_duration_months")
    .in("id", courseIds);

  if (error) {
    return { courses: [], error };
  }

  return { courses: (data ?? []) as CheckoutCourseSnapshot[], error: null };
}

async function ensureOrderItemsForCourses({
  admin,
  courseIds,
  courses,
  orderId,
}: {
  admin: ReturnType<typeof createAdminSupabaseClient>;
  courseIds: string[];
  courses: CheckoutCourseSnapshot[];
  orderId: string;
}): Promise<{ success: true } | { success: false; error: unknown }> {
  const { data: existingItems, error: existingItemsError } = await admin
    .from("order_items")
    .select("course_id")
    .eq("order_id", orderId);

  if (existingItemsError) {
    console.error("Failed to load existing order items", existingItemsError);
    return { success: false, error: existingItemsError };
  }

  const missingItems = buildPendingOrderItems({
    orderId,
    courseIds,
    courses,
    existingCourseIds:
      existingItems?.map((item: { course_id: string }) => item.course_id) ?? [],
  });

  if (missingItems.length === 0) {
    return { success: true };
  }

  const { error: itemsError } = await admin
    .from("order_items")
    .insert(missingItems);

  if (itemsError) {
    console.error("Failed to create order items", itemsError);
    return { success: false, error: itemsError };
  }

  return { success: true };
}

async function syncCompanyInvoiceForOrder({
  admin,
  order,
  session,
  sessionId,
}: {
  admin: ReturnType<typeof createAdminSupabaseClient>;
  order: ExistingOrder;
  session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>;
  sessionId: string;
}): Promise<InvoiceResponse> {
  const companyInvoiceRequested =
    session.metadata?.company_invoice_requested === "true" ||
    order.company_invoice_requested === true;

  if (!companyInvoiceRequested) {
    return null;
  }

  const provider = parseCompanyInvoiceProvider(
    session.metadata?.company_invoice_provider ?? order.invoice_provider,
    "stripe",
  );

  if (provider === "stripe") {
    const invoiceId = getStripeInvoiceId(session) ?? order.invoice_id;
    const status = invoiceId ? "issued" : "pending";

    await admin
      .from("orders")
      .update({
        company_invoice_requested: true,
        invoice_id: invoiceId,
        invoice_provider: "stripe",
        invoice_status: status,
      })
      .eq("id", order.id);

    return {
      id: invoiceId,
      number: order.invoice_number,
      provider,
      status,
      url: order.invoice_url,
    };
  }

  if (order.invoice_status === "issued" && order.invoice_id) {
    return {
      id: order.invoice_id,
      number: order.invoice_number,
      provider,
      status: "issued",
      url: order.invoice_url,
    };
  }

  await admin
    .from("orders")
    .update({
      company_invoice_requested: true,
      invoice_error: null,
      invoice_provider: "fakturownia",
      invoice_status: "pending",
    })
    .eq("id", order.id);

  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
      limit: 100,
    });
    const invoice = await issueFakturowniaInvoiceForCheckout({
      lineItems: lineItems.data,
      orderId: order.id,
      session,
    });

    await admin
      .from("orders")
      .update({
        invoice_error: null,
        invoice_id: invoice.id,
        invoice_issued_at: new Date().toISOString(),
        invoice_number: invoice.number,
        invoice_provider: "fakturownia",
        invoice_status: "issued",
        invoice_url: invoice.url,
      })
      .eq("id", order.id);

    return invoice;
  } catch (error) {
    const message = toSafeInvoiceError(error);
    console.error("Fakturownia invoice creation failed", error);

    await admin
      .from("orders")
      .update({
        invoice_error: message,
        invoice_provider: "fakturownia",
        invoice_status: "failed",
      })
      .eq("id", order.id);

    return {
      error: message,
      provider,
      status: "failed",
    };
  }
}

function parseCourseIds(value: unknown): string[] {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (courseId): courseId is string =>
        typeof courseId === "string" && courseId.length > 0,
    );
  } catch {
    return [];
  }
}

function getStripeInvoiceId(
  session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>,
): string | null {
  const invoice = session.invoice;
  if (!invoice) {
    return null;
  }

  return typeof invoice === "string" ? invoice : invoice.id;
}

function toSafeInvoiceError(error: unknown): string {
  if (error instanceof Error) {
    return error.message.slice(0, 1000);
  }

  return "Unknown invoice creation error.";
}
