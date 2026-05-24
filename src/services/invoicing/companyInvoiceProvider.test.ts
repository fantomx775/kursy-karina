import { describe, expect, it } from "vitest";
import {
  getCompanyInvoiceProvider,
  parseCompanyInvoiceProvider,
} from "./companyInvoiceProvider";

describe("company invoice provider config", () => {
  it("defaults to Stripe", () => {
    expect(getCompanyInvoiceProvider({})).toBe("stripe");
  });

  it("accepts Fakturownia from env", () => {
    expect(
      getCompanyInvoiceProvider({ COMPANY_INVOICE_PROVIDER: " fakturownia " }),
    ).toBe("fakturownia");
  });

  it("rejects unsupported providers", () => {
    expect(() =>
      getCompanyInvoiceProvider({ COMPANY_INVOICE_PROVIDER: "other" }),
    ).toThrow("Invalid COMPANY_INVOICE_PROVIDER");
  });

  it("parses persisted provider metadata with a fallback", () => {
    expect(parseCompanyInvoiceProvider("fakturownia")).toBe("fakturownia");
    expect(parseCompanyInvoiceProvider("other", "stripe")).toBe("stripe");
  });
});
