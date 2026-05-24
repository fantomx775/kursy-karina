import {
  FakturowniaClient,
  getFakturowniaConfig,
  getFakturowniaPublicInvoiceUrl,
  type FakturowniaConfig,
  type FakturowniaInvoicePayload,
  type FakturowniaPosition,
} from "./fakturownia";

type CheckoutCustomerDetails = {
  address?: {
    city?: string | null;
    country?: string | null;
    line1?: string | null;
    line2?: string | null;
    postal_code?: string | null;
  } | null;
  business_name?: string | null;
  email?: string | null;
  individual_name?: string | null;
  name?: string | null;
  tax_ids?: Array<{
    type?: string | null;
    value?: string | null;
  }> | null;
};

export type CheckoutSessionForFakturownia = {
  customer_details?: CheckoutCustomerDetails | null;
  customer_email?: string | null;
};

export type CheckoutLineItemForFakturownia = {
  amount_total?: number | null;
  description?: string | null;
  quantity?: number | null;
};

export type IssuedFakturowniaInvoice = {
  id: string;
  number: string | null;
  provider: "fakturownia";
  status: "issued";
  url: string | null;
};

type IssueInvoiceArgs = {
  env?: Parameters<typeof getFakturowniaConfig>[0];
  fetcher?: typeof fetch;
  issuedAt?: Date;
  lineItems: CheckoutLineItemForFakturownia[];
  orderId: string;
  session: CheckoutSessionForFakturownia;
};

export async function issueFakturowniaInvoiceForCheckout({
  env,
  fetcher,
  issuedAt = new Date(),
  lineItems,
  orderId,
  session,
}: IssueInvoiceArgs): Promise<IssuedFakturowniaInvoice> {
  const config = getFakturowniaConfig(env);
  const payload = buildFakturowniaInvoicePayload({
    config,
    issuedAt,
    lineItems,
    orderId,
    session,
  });
  const client = new FakturowniaClient(config, fetcher);
  const invoice = await client.createInvoice(payload);

  if (config.sendEmail && payload.buyer_email) {
    await client.sendInvoiceByEmail(invoice.id, payload.buyer_email);
  }

  return {
    id: String(invoice.id),
    number: invoice.number ?? null,
    provider: "fakturownia",
    status: "issued",
    url: getFakturowniaPublicInvoiceUrl(config, invoice),
  };
}

export function buildFakturowniaInvoicePayload({
  config,
  issuedAt,
  lineItems,
  orderId,
  session,
}: {
  config: FakturowniaConfig;
  issuedAt: Date;
  lineItems: CheckoutLineItemForFakturownia[];
  orderId: string;
  session: CheckoutSessionForFakturownia;
}): FakturowniaInvoicePayload {
  const details = session.customer_details;
  const address = details?.address;
  const buyerName =
    details?.business_name?.trim() ||
    details?.name?.trim() ||
    details?.individual_name?.trim();
  const taxId = selectTaxId(details?.tax_ids);

  if (!buyerName) {
    throw new Error("Missing company name from Stripe Checkout session.");
  }

  if (!taxId) {
    throw new Error("Missing tax ID from Stripe Checkout session.");
  }

  const positions = buildInvoicePositions(lineItems, config.taxRate);
  if (positions.length === 0) {
    throw new Error("Missing paid line items from Stripe Checkout session.");
  }

  const issueDate = formatDate(issuedAt);
  const paymentTo = formatDate(addDays(issuedAt, config.paymentToDays));
  const buyerStreet = [address?.line1, address?.line2]
    .filter(Boolean)
    .join(", ");

  return {
    buyer_city: address?.city ?? undefined,
    buyer_country: address?.country ?? undefined,
    buyer_email: details?.email ?? session.customer_email ?? undefined,
    buyer_name: buyerName,
    buyer_post_code: address?.postal_code ?? undefined,
    buyer_street: buyerStreet || undefined,
    buyer_tax_no: taxId,
    issue_date: issueDate,
    kind: config.invoiceKind,
    lang: "pl",
    number: null,
    oid: orderId,
    paid_date: issueDate,
    payment_to: paymentTo,
    payment_type: config.paymentType,
    positions,
    sell_date: issueDate,
    status: "paid",
  };
}

function buildInvoicePositions(
  lineItems: CheckoutLineItemForFakturownia[],
  taxRate: FakturowniaConfig["taxRate"],
): FakturowniaPosition[] {
  return lineItems
    .map((item) => ({
      name: item.description?.trim() || "Kurs online",
      quantity: item.quantity ?? 1,
      tax: taxRate,
      total_price_gross: centsToPln(item.amount_total ?? 0),
    }))
    .filter((item) => item.total_price_gross > 0);
}

function selectTaxId(
  taxIds: CheckoutCustomerDetails["tax_ids"],
): string | null {
  const preferred = taxIds?.find((taxId) => taxId.type === "pl_nip");
  const fallback = taxIds?.[0];
  return preferred?.value?.trim() || fallback?.value?.trim() || null;
}

function centsToPln(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
