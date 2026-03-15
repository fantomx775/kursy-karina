import { type Page, expect } from "@playwright/test";
import { E2E_USER } from "../config/env";

export async function loginByUi(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole("button", { name: "Zaloguj się", exact: true }).click();
  await page.waitForURL((url) => {
    return url.pathname === "/dashboard" || url.pathname === "/admin" || url.pathname === "/";
  });
}

export async function loginAsStudent(page: Page) {
  await loginByUi(page, E2E_USER.student.email, E2E_USER.student.password);
}

export async function loginAsStudentWithPurchases(page: Page) {
  await loginByUi(
    page,
    E2E_USER.studentWithPurchases.email,
    E2E_USER.studentWithPurchases.password,
  );
}

export async function loginAsStudentEmpty(page: Page) {
  await loginByUi(page, E2E_USER.studentEmpty.email, E2E_USER.studentEmpty.password);
}

export async function loginAsAdmin(page: Page) {
  await loginByUi(page, E2E_USER.admin.email, E2E_USER.admin.password);
  await expect(page).toHaveURL("/admin");
}
