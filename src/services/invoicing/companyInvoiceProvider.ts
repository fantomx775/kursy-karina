export type CompanyInvoiceProvider = "stripe" | "fakturownia";

const PROVIDERS = new Set<CompanyInvoiceProvider>(["stripe", "fakturownia"]);

type CompanyInvoiceProviderEnv = Record<string, string | undefined>;

export function getCompanyInvoiceProvider(
  env: CompanyInvoiceProviderEnv = process.env as CompanyInvoiceProviderEnv,
): CompanyInvoiceProvider {
  const value = env.COMPANY_INVOICE_PROVIDER?.trim().toLowerCase();
  if (!value) {
    return "stripe";
  }

  if (PROVIDERS.has(value as CompanyInvoiceProvider)) {
    return value as CompanyInvoiceProvider;
  }

  throw new Error(
    "Invalid COMPANY_INVOICE_PROVIDER. Use 'stripe' or 'fakturownia'.",
  );
}

export function parseCompanyInvoiceProvider(
  value: unknown,
  fallback: CompanyInvoiceProvider = "stripe",
): CompanyInvoiceProvider {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  return PROVIDERS.has(normalized as CompanyInvoiceProvider)
    ? (normalized as CompanyInvoiceProvider)
    : fallback;
}
