export type FakturowniaTaxRate = number | string;

export type FakturowniaConfig = {
  apiToken: string;
  baseUrl: string;
  departmentId?: string;
  invoiceKind: string;
  paymentToDays: number;
  paymentType: string;
  sendEmail: boolean;
  taxRate: FakturowniaTaxRate;
};

export type FakturowniaPosition = {
  name: string;
  quantity: number;
  tax: FakturowniaTaxRate;
  total_price_gross: number;
};

export type FakturowniaInvoicePayload = {
  buyer_city?: string;
  buyer_country?: string;
  buyer_email?: string;
  buyer_name: string;
  buyer_post_code?: string;
  buyer_street?: string;
  buyer_tax_no: string;
  department_id?: string;
  issue_date: string;
  kind: string;
  lang?: string;
  number: null;
  oid?: string;
  paid_date?: string;
  payment_to: string;
  payment_type?: string;
  positions: FakturowniaPosition[];
  sell_date: string;
  status?: "issued" | "sent" | "paid" | "partial" | "rejected";
};

export type FakturowniaInvoiceResponse = {
  id: number | string;
  number?: string | null;
  token?: string | null;
  view_url?: string | null;
  pdf_url?: string | null;
  [key: string]: unknown;
};

type FakturowniaEnv = Record<string, string | undefined>;

type Fetcher = typeof fetch;

export class FakturowniaApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly responseBody: string,
  ) {
    super(message);
    this.name = "FakturowniaApiError";
  }
}

export function normalizeFakturowniaBaseUrl(domain: string): string {
  const trimmed = domain.trim().replace(/\/+$/, "");
  if (!trimmed) {
    throw new Error("Missing Fakturownia account domain.");
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const accountPrefix = trimmed.replace(/\.fakturownia\.pl$/i, "");
  return `https://${accountPrefix}.fakturownia.pl`;
}

export function getFakturowniaConfig(
  env: FakturowniaEnv = process.env as FakturowniaEnv,
): FakturowniaConfig {
  const apiToken = env.FAKTUROWNIA_API_TOKEN?.trim();
  const domain = (
    env.FAKTUROWNIA_ACCOUNT_DOMAIN ??
    env.FAKTUROWNIA_DOMAIN ??
    ""
  ).trim();

  if (!apiToken) {
    throw new Error("Missing FAKTUROWNIA_API_TOKEN.");
  }

  if (!domain) {
    throw new Error(
      "Missing FAKTUROWNIA_ACCOUNT_DOMAIN or FAKTUROWNIA_DOMAIN.",
    );
  }

  return {
    apiToken,
    baseUrl: normalizeFakturowniaBaseUrl(domain),
    departmentId: env.FAKTUROWNIA_DEPARTMENT_ID?.trim() || undefined,
    invoiceKind: env.FAKTUROWNIA_INVOICE_KIND?.trim() || "vat",
    paymentToDays: parseIntegerEnv(env.FAKTUROWNIA_PAYMENT_TO_DAYS, 0),
    paymentType: env.FAKTUROWNIA_PAYMENT_TYPE?.trim() || "card",
    sendEmail: env.FAKTUROWNIA_SEND_INVOICE_EMAIL?.trim() !== "false",
    taxRate: parseTaxRate(env.FAKTUROWNIA_DEFAULT_TAX_RATE),
  };
}

export function getFakturowniaPublicInvoiceUrl(
  config: Pick<FakturowniaConfig, "baseUrl">,
  invoice: Pick<FakturowniaInvoiceResponse, "token" | "view_url">,
): string | null {
  if (typeof invoice.view_url === "string" && invoice.view_url) {
    return invoice.view_url;
  }

  if (typeof invoice.token === "string" && invoice.token) {
    return `${config.baseUrl}/invoice/${encodeURIComponent(invoice.token)}`;
  }

  return null;
}

export class FakturowniaClient {
  constructor(
    private readonly config: FakturowniaConfig,
    private readonly fetcher: Fetcher = fetch,
  ) {}

  async createInvoice(
    invoice: FakturowniaInvoicePayload,
  ): Promise<FakturowniaInvoiceResponse> {
    const response = await this.fetcher(
      `${this.config.baseUrl}/invoices.json`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_token: this.config.apiToken,
          invoice: removeUndefined({
            ...invoice,
            department_id: invoice.department_id ?? this.config.departmentId,
          }),
        }),
      },
    );

    return readJsonResponse(response, "create invoice");
  }

  async sendInvoiceByEmail(
    invoiceId: string | number,
    email?: string,
  ): Promise<void> {
    const url = new URL(
      `${this.config.baseUrl}/invoices/${encodeURIComponent(
        String(invoiceId),
      )}/send_by_email.json`,
    );
    url.searchParams.set("api_token", this.config.apiToken);
    url.searchParams.set("email_pdf", "true");

    if (email) {
      url.searchParams.set("email_to", email);
      url.searchParams.set("update_buyer_email", "true");
    }

    const response = await this.fetcher(url.toString(), {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new FakturowniaApiError(
        `Fakturownia failed to send invoice email (${response.status}).`,
        response.status,
        body,
      );
    }
  }
}

async function readJsonResponse(
  response: Response,
  action: string,
): Promise<FakturowniaInvoiceResponse> {
  const body = await response.text();
  if (!response.ok) {
    throw new FakturowniaApiError(
      `Fakturownia failed to ${action} (${response.status}).`,
      response.status,
      body,
    );
  }

  const parsed = body ? JSON.parse(body) : {};
  if (!parsed || typeof parsed.id === "undefined") {
    throw new FakturowniaApiError(
      "Fakturownia invoice response did not include an id.",
      response.status,
      body,
    );
  }

  return parsed as FakturowniaInvoiceResponse;
}

function parseIntegerEnv(value: string | undefined, fallback: number): number {
  if (!value?.trim()) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseTaxRate(value: string | undefined): FakturowniaTaxRate {
  if (!value?.trim()) {
    return 23;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value.trim();
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => typeof entry !== "undefined"),
  ) as T;
}
