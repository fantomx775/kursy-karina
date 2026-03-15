import { expect, type Page } from "@playwright/test";

export const spinnerSelector = '[role="status"][aria-label="Ładowanie"]';

export async function waitForSpinnerToDisappear(
  page: Page,
  timeoutMs = 8000,
) {
  const spinner = page.locator(spinnerSelector);
  await expect(spinner).toHaveCount(0, { timeout: timeoutMs });
}
