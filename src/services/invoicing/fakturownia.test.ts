import { describe, expect, it, vi } from "vitest";
import {
  FakturowniaClient,
  getFakturowniaConfig,
  normalizeFakturowniaBaseUrl,
  type FakturowniaConfig,
} from "./fakturownia";

const config: FakturowniaConfig = {
  apiToken: "token",
  baseUrl: "https://firma.fakturownia.pl",
  departmentId: "42",
  invoiceKind: "vat",
  paymentToDays: 0,
  paymentType: "card",
  sendEmail: true,
  taxRate: 23,
};

describe("Fakturownia config", () => {
  it("normalizes account domains", () => {
    expect(normalizeFakturowniaBaseUrl("firma")).toBe(
      "https://firma.fakturownia.pl",
    );
    expect(normalizeFakturowniaBaseUrl("firma.fakturownia.pl")).toBe(
      "https://firma.fakturownia.pl",
    );
    expect(normalizeFakturowniaBaseUrl("https://firma.fakturownia.pl/")).toBe(
      "https://firma.fakturownia.pl",
    );
  });

  it("reads env values", () => {
    expect(
      getFakturowniaConfig({
        FAKTUROWNIA_ACCOUNT_DOMAIN: "firma",
        FAKTUROWNIA_API_TOKEN: "token",
        FAKTUROWNIA_DEFAULT_TAX_RATE: "8",
        FAKTUROWNIA_INVOICE_KIND: "proforma",
        FAKTUROWNIA_PAYMENT_TO_DAYS: "7",
        FAKTUROWNIA_SEND_INVOICE_EMAIL: "false",
      }),
    ).toMatchObject({
      apiToken: "token",
      baseUrl: "https://firma.fakturownia.pl",
      invoiceKind: "proforma",
      paymentToDays: 7,
      sendEmail: false,
      taxRate: 8,
    });
  });
});

describe("FakturowniaClient", () => {
  it("creates invoices with the documented JSON envelope", async () => {
    const fetcher = vi.fn(async () => {
      return new Response(
        JSON.stringify({ id: 123, number: "FV/1/2026", token: "public" }),
        { status: 201 },
      );
    });
    const client = new FakturowniaClient(config, fetcher as typeof fetch);

    const invoice = await client.createInvoice({
      buyer_email: "firma@example.com",
      buyer_name: "Firma Testowa Sp. z o.o.",
      buyer_tax_no: "1234567890",
      issue_date: "2026-05-21",
      kind: "vat",
      number: null,
      payment_to: "2026-05-21",
      positions: [
        {
          name: "Kurs online",
          quantity: 1,
          tax: 23,
          total_price_gross: 499,
        },
      ],
      sell_date: "2026-05-21",
    });

    expect(invoice.id).toBe(123);
    expect(fetcher).toHaveBeenCalledWith(
      "https://firma.fakturownia.pl/invoices.json",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(body).toMatchObject({
      api_token: "token",
      invoice: {
        buyer_name: "Firma Testowa Sp. z o.o.",
        buyer_tax_no: "1234567890",
        department_id: "42",
        positions: [{ total_price_gross: 499 }],
      },
    });
  });

  it("sends invoice emails through the provider endpoint", async () => {
    const fetcher = vi.fn(async () => new Response("", { status: 200 }));
    const client = new FakturowniaClient(config, fetcher as typeof fetch);

    await client.sendInvoiceByEmail(123, "firma@example.com");

    const url = new URL(String(fetcher.mock.calls[0][0]));
    expect(url.pathname).toBe("/invoices/123/send_by_email.json");
    expect(url.searchParams.get("api_token")).toBe("token");
    expect(url.searchParams.get("email_to")).toBe("firma@example.com");
    expect(url.searchParams.get("email_pdf")).toBe("true");
  });
});
