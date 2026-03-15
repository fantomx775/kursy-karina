import type { Page } from "@playwright/test";

export const clearClientState = async (page: Page) => {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.removeItem("cart");
    sessionStorage.clear();
  });
};
