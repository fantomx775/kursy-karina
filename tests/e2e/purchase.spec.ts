import { expect, test } from "./fixtures/e2e";
import { clearClientState } from "./utils/state";
import { loginAsStudent, loginAsStudentWithPurchases } from "./utils/auth";
import { goToCourseDetail } from "./utils/navigation";
import {
  mockCheckoutSession,
  mockCouponApi,
} from "./utils/checkout";
import { defaultCheckoutVerifyResponse } from "./utils/api-mocks";

const NODEJS_SLUG = "nodejs-rest-api";
const STARTUP_COUPON = "START2025";

test.describe("Zakup i koszyk", () => {
  test.beforeEach(async ({ page }) => {
    await clearClientState(page);
  });

  test("dodaje kurs do koszyka i prezentuje podsumowanie", async ({ page }) => {
    await loginAsStudent(page);
    await goToCourseDetail(page, NODEJS_SLUG);

    await page
      .getByRole("button", { name: "Dodaj do koszyka" })
      .click();

    await expect(page).toHaveURL("/cart");
    await expect(page.getByText("Node.js i REST API")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Przejdź do płatności" }),
    ).toBeVisible();
  });

  test("akceptuje ważny kupon", async ({ page }) => {
    await loginAsStudent(page);
    await goToCourseDetail(page, NODEJS_SLUG);
    await page.getByRole("button", { name: "Dodaj do koszyka" }).click();

    await mockCouponApi(page, "ok");
    await page.locator('input[placeholder="Kod kuponu"]').fill(STARTUP_COUPON);
    await page.getByRole("button", { name: "Zastosuj kupon" }).click();
    await expect(
      page.getByText(`Kod ${STARTUP_COUPON} został zastosowany.`),
    ).toBeVisible();
  });

  test("odrzuca nieprawidłowy kupon", async ({ page }) => {
    await loginAsStudent(page);
    await goToCourseDetail(page, NODEJS_SLUG);
    await page.getByRole("button", { name: "Dodaj do koszyka" }).click();

    await mockCouponApi(page, "invalid");
    await page.locator('input[placeholder="Kod kuponu"]').fill("ZZZZ");
    await page.getByRole("button", { name: "Zastosuj kupon" }).click();
    await expect(
      page.getByText("Nieprawidłowy kod kuponu."),
    ).toBeVisible();
  });

  test("przekierowuje do strony anulowania płatności", async ({ page }) => {
    await loginAsStudent(page);
    await goToCourseDetail(page, NODEJS_SLUG);
    await page.getByRole("button", { name: "Dodaj do koszyka" }).click();

    await mockCheckoutSession(page, "/cancel");
    await page.getByRole("button", { name: "Przejdź do płatności" }).click();
    await expect(page).toHaveURL("/cancel");
    await expect(
      page.getByRole("heading", { name: "Płatność anulowana" }),
    ).toBeVisible();
  });

  test("obsługuje sukces zakupu i czyści koszyk", async ({ page }) => {
    await loginAsStudent(page);
    await goToCourseDetail(page, NODEJS_SLUG);
    await page.getByRole("button", { name: "Dodaj do koszyka" }).click();

    await mockCheckoutSession(page, "/success?session_id=e2e-success");
    await page.route("**/api/checkout/verify", (route) => {
      void route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultCheckoutVerifyResponse),
      });
    });
    await page.getByRole("button", { name: "Przejdź do płatności" }).click();

    await expect(page).toHaveURL(/\/success\?session_id=/);
    await expect(
      page.getByRole("heading", { name: "Sukces!" }),
    ).toBeVisible();

    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: "Koszyk jest pusty" })).toBeVisible();
  });

  test("blokuje płatność gdy kurs jest już zakupiony", async ({ page }) => {
    await loginAsStudentWithPurchases(page);
    await goToCourseDetail(page, NODEJS_SLUG);
    await page.getByRole("button", { name: "Dodaj do koszyka" }).click();
    await page.goto("/cart");

    await page.getByRole("button", { name: "Przejdź do płatności" }).click();
    await expect(
      page.getByText("Wszystkie kursy są już zakupione."),
    ).toBeVisible();
  });
});
