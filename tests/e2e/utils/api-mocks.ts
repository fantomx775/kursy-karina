import { type Route } from "@playwright/test";

export const defaultCheckoutSessionResponse = {
  url: "https://payments.example.test/checkout/session/success",
};

export const defaultCheckoutVerifyResponse = {
  verified: true,
  order: { id: "00000000-0000-0000-0000-000000000001" },
};

export async function mockRouteForJson(
  route: Route,
  status: number,
  body: Record<string, unknown>,
) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
    headers: {
      "access-control-allow-origin": "*",
      "content-type": "application/json",
    },
  });
}

export const couponNotFoundResponse = {
  valid: false,
  error: "Coupon not found",
};
