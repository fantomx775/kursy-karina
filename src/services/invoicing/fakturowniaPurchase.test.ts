import { describe, expect, it, vi } from "vitest";
import type { FakturowniaConfig } from "./fakturownia";
import {
  buildFakturowniaInvoicePayload,
  issueFakturowniaInvoiceForCheckout,
} from "./fakturowniaPurchase";

const config: FakturowniaConfig = {
  apiToken: "token",
  baseUrl: "https://firma.fakturownia.pl",
  invoiceKind: "vat",
  paymentToDays: 7,
  paymentType: "card",
  sendEmail: true,
  taxRate: 23,
};

const session = {
  customer_details: {
    address: {
      city: "Warszawa",
      country: "PL",
      line1: "Prosta 1",
      line2: "lok. 2",
      postal_code: "00-001",
    },
    business_name: "Firma Testowa Sp. z o.o.",
    email: "firma@example.com",
    name: "Firma Testowa",
    tax_ids: [{ type: "pl_nip", value: "1234567890" }],
  },
};

describe("buildFakturowniaInvoicePayload", () => {
  it("maps Stripe Checkout company details and line items", () => {
    const payload = buildFakturowniaInvoicePayload({
      config,
      issuedAt: new Date("2026-05-21T12:00:00.000Z"),
      lineItems: [
        {
          amount_total: 49900,
          description: "Kurs Node.js",
          quantity: 1,
        },
      ],
      orderId: "order-1",
      session,
    });

    expect(payload).toMatchObject({
      buyer_city: "Warszawa",
      buyer_email: "firma@example.com",
      buyer_name: "Firma Testowa Sp. z o.o.",
      buyer_post_code: "00-001",
      buyer_street: "Prosta 1, lok. 2",
      buyer_tax_no: "1234567890",
      issue_date: "2026-05-21",
      oid: "order-1",
      payment_to: "2026-05-28",
      payment_type: "card",
      sell_date: "2026-05-21",
      status: "paid",
    });
    expect(payload.positions).toEqual([
      {
        name: "Kurs Node.js",
        quantity: 1,
        tax: 23,
        total_price_gross: 499,
      },
    ]);
  });

  it("requires a tax id", () => {
    expect(() =>
      buildFakturowniaInvoicePayload({
        config,
        issuedAt: new Date("2026-05-21T12:00:00.000Z"),
        lineItems: [{ amount_total: 49900, description: "Kurs", quantity: 1 }],
        orderId: "order-1",
        session: {
          customer_details: {
            business_name: "Firma Testowa Sp. z o.o.",
            tax_ids: [],
          },
        },
      }),
    ).toThrow("Missing tax ID");
  });
});

describe("issueFakturowniaInvoiceForCheckout", () => {
  it("creates the invoice and sends it by email", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ id: 321, number: "FV/321/2026", token: "public" }),
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(new Response("", { status: 200 }));

    const result = await issueFakturowniaInvoiceForCheckout({
      env: {
        FAKTUROWNIA_ACCOUNT_DOMAIN: "firma",
        FAKTUROWNIA_API_TOKEN: "token",
      },
      fetcher: fetcher as typeof fetch,
      issuedAt: new Date("2026-05-21T12:00:00.000Z"),
      lineItems: [{ amount_total: 49900, description: "Kurs", quantity: 1 }],
      orderId: "order-1",
      session,
    });

    expect(result).toEqual({
      id: "321",
      number: "FV/321/2026",
      provider: "fakturownia",
      status: "issued",
      url: "https://firma.fakturownia.pl/invoice/public",
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(String(fetcher.mock.calls[1][0])).toContain("send_by_email.json");
  });
});
