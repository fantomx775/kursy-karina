import type { Page, Route } from "@playwright/test";
import {
  defaultCheckoutSessionResponse,
  defaultCheckoutVerifyResponse,
  mockRouteForJson,
} from "./api-mocks";

export const mockCheckoutFlow = async (page: Page) => {
  await page.route("**/api/checkout/session", async (route: Route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    await mockRouteForJson(route, 200, {
      ...defaultCheckoutSessionResponse,
    });
  });

  await page.route("**/api/checkout/verify", async (route: Route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    await mockRouteForJson(route, 200, defaultCheckoutVerifyResponse);
  });
};

export const mockCheckoutSession = async (page: Page, sessionUrl = defaultCheckoutSessionResponse.url) => {
  await page.route("**/api/checkout/session", async (route: Route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    await mockRouteForJson(route, 200, { url: sessionUrl });
  });
};

export const mockCouponApi = async (
  page: Page,
  status: "ok" | "invalid" = "ok",
) => {
  await page.route("**/api/coupons/validate", async (route: Route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    if (status === "invalid") {
      await mockRouteForJson(route, 400, {
        error: "Nieprawidłowy kod kuponu.",
      });
      return;
    }

    await mockRouteForJson(route, 200, {
      discountAmount: 300,
      couponId: "c0000001-0000-1111-2222-000000000001",
    });
  });
};

export const stopCheckoutRoutes = async (page: Page) => {
  await page.unroute("**/api/checkout/session");
  await page.unroute("**/api/checkout/verify");
  await page.unroute("**/api/coupons/validate");
};

export const createFailingCheckoutMock = async (page: Page, errorMessage: string) => {
  await page.route("**/api/checkout/session", async (route: Route) => {
    await mockRouteForJson(route, 400, {
      error: errorMessage,
    });
  });
};
