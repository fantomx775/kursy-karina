import { type Page } from "@playwright/test";

export async function goToLogin(page: Page, baseURL = "") {
  await page.goto(`${baseURL}/login`);
}

export async function goToCourses(page: Page, baseURL = "") {
  await page.goto(`${baseURL}/courses`);
}

export async function goToCart(page: Page, baseURL = "") {
  await page.goto(`${baseURL}/cart`);
}

export async function goToDashboard(page: Page, baseURL = "") {
  await page.goto(`${baseURL}/dashboard`);
}

export async function goToAdmin(page: Page, baseURL = "") {
  await page.goto(`${baseURL}/admin`);
}

export async function goToCourseDetail(page: Page, slug: string, baseURL = "") {
  await page.goto(`${baseURL}/courses/${slug}`);
}

export async function goToLearning(page: Page, slug: string, baseURL = "") {
  await page.goto(`${baseURL}/learn/${slug}`);
}

export async function waitForPageReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
}
