import { expect, test } from "./fixtures/e2e";
import type { Page } from "@playwright/test";
import { clearClientState } from "./utils/state";
import { loginAsAdmin } from "./utils/auth";
import { makeCouponTestData } from "./utils/test-data";

const today = new Date().toISOString().slice(0, 10);

const createCouponPayload = (overrides = {}) => {
  const base = makeCouponTestData(`${Date.now()}`);
  return {
    name: base.name,
    code: base.code,
    discountType: base.discountType,
    discountValue: Number(base.discountValue),
    startDate: today,
    endDate: null,
    usageLimit: null,
    usageLimitPerUser: null,
    isActive: true,
    ...overrides,
  };
};

const fillCouponForm = async (
  page: Page,
  payload: ReturnType<typeof createCouponPayload>,
) => {
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nazwa").fill(payload.name);
  await dialog.getByLabel("Kod kuponu").fill(payload.code);
  const selects = dialog.locator("select");
  await selects.nth(0).selectOption(payload.discountType);
  const textInputs = dialog.locator('input[type="text"]');
  await textInputs.nth(2).fill(String(payload.discountValue));
  const dateInputs = dialog.locator('input[type="date"]');
  await dateInputs.first().fill(payload.startDate);
  await dialog.getByRole("button", { name: "Zapisz" }).click();
};

test.describe("Zarządzanie kuponami", () => {
  test.beforeEach(async ({ page }) => {
    await clearClientState(page);
    await loginAsAdmin(page);
    await page.goto("/admin");
  });

  test("tworzy i edytuje kupon z panelu admina", async ({ page }) => {
    const coupon = createCouponPayload();

    await page.getByRole("button", { name: "Dodaj kupon" }).click();
    await fillCouponForm(page, coupon);

    const row = page.getByRole("row").filter({ hasText: coupon.code });
    await expect(row).toBeVisible();

    const editedName = `${coupon.name} - EDIT`;
    await row.getByRole("button", { name: "Edytuj" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Nazwa").fill(editedName);
    await dialog.getByRole("button", { name: "Zapisz" }).click();

    await expect(row).toContainText(editedName);
  });

  test("usuwa kupon", async ({ page }) => {
    const coupon = createCouponPayload({ name: "Do usunięcia" });

    await page.getByRole("button", { name: "Dodaj kupon" }).click();
    await fillCouponForm(page, coupon);
    const row = page.getByRole("row").filter({ hasText: coupon.code });
    await expect(row).toBeVisible();

    await row.getByRole("button", { name: "Usuń" }).click();
    await expect(row).toBeHidden();
  });

  test("zwraca błąd dla duplikatu kodu i błędnych parametrów kuponu", async ({ page }) => {
    const base = createCouponPayload({ code: `DUP-${Date.now()}` });
    const duplicatePayload = { ...base };

    const firstResponse = await page.request.post("/api/admin/coupons", {
      data: duplicatePayload,
    });
    expect(firstResponse.status()).toBe(201);

    const duplicateResponse = await page.request.post("/api/admin/coupons", {
      data: duplicatePayload,
    });
    expect(duplicateResponse.status()).toBe(400);
    const duplicateJson = await duplicateResponse.json();
    expect(duplicateJson.error).toContain("code already exists");

    const invalidDiscountResponse = await page.request.post("/api/admin/coupons", {
      data: createCouponPayload({ code: `BADPCT-${Date.now()}`, discountValue: 150 }),
    });
    expect(invalidDiscountResponse.status()).toBe(400);
    const invalidDiscount = await invalidDiscountResponse.json();
    expect(invalidDiscount.error).toContain("Validation failed");

    const invalidDateResponse = await page.request.post("/api/admin/coupons", {
      data: createCouponPayload({
        code: `BADDATE-${Date.now()}`,
        startDate: "",
      }),
    });
    expect(invalidDateResponse.status()).toBe(400);

    const invalidLimitResponse = await page.request.post("/api/admin/coupons", {
      data: createCouponPayload({
        code: `BADLIMIT-${Date.now()}`,
        usageLimit: 0,
        usageLimitPerUser: -1,
      }),
    });
    expect(invalidLimitResponse.status()).toBe(400);
  });
});

