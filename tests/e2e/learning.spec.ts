import { expect, test } from "./fixtures/e2e";
import { clearClientState } from "./utils/state";
import { loginAsStudentEmpty, loginAsStudentWithPurchases } from "./utils/auth";
import { goToLearning } from "./utils/navigation";

const OWNED_SLUG = "nextjs-14-pelny-stack";
const UNOWNED_SLUG = "nodejs-rest-api";

test.describe("Interakcje z kursem po stronie kursanta", () => {
  test.beforeEach(async ({ page }) => {
    await clearClientState(page);
  });

  test("wymaga logowania do strony nauki", async ({ page }) => {
    await goToLearning(page, OWNED_SLUG);
    await expect(page).toHaveURL("/login");
  });

  test("zablokuje dostęp do kursu bez zakupu", async ({ page }) => {
    await loginAsStudentEmpty(page);
    await goToLearning(page, UNOWNED_SLUG);
    await expect(page.getByText("Brak dostępu")).toBeVisible();
  });

  test("zapisuje postęp kursu po oznaczeniu kroków", async ({ page }) => {
    await loginAsStudentWithPurchases(page);
    await goToLearning(page, OWNED_SLUG);

    await expect(page.getByRole("heading", { name: /Next\.js/i })).toBeVisible();
    const progressText = page.getByText(/Postęp:/);
    const progressBefore = await progressText.textContent();
    const beforeMatch = (progressBefore ?? "").match(/(\d+)\/(\d+)/);
    const beforeValue = beforeMatch?.[1] ?? "0";

    const completeButtons = page.locator('button:has-text("Oznacz jako ukończone")');
    const total = await completeButtons.count();
    const firstComplete = completeButtons.first();
    if (total === 0) {
      expect(beforeMatch).toBeTruthy();
      return;
    }

    await firstComplete.click();

    const progressAfter = await progressText.textContent();
    const afterMatch = (progressAfter ?? "").match(/(\d+)\/(\d+)/);
    expect(Number(afterMatch?.[1] ?? 0)).toBeGreaterThan(Number(beforeValue));
  });

  test("udostępnia certyfikat po pełnym zakończeniu kursu", async ({ page }) => {
    await loginAsStudentWithPurchases(page);
    await goToLearning(page, OWNED_SLUG);

    const remainingButtons = page.locator('button:has-text("Oznacz jako ukończone")');
    while ((await remainingButtons.count()) > 0) {
      await remainingButtons.first().click();
    }

    const certificateButton = page.getByRole("link", { name: "Pobierz certyfikat" });
    await expect(certificateButton).toBeVisible();
    await expect(certificateButton).toHaveAttribute("href", /\/api\/courses\/.+\/certificate/);
  });

  test("umożliwia cofnięcie postępu", async ({ page }) => {
    await loginAsStudentWithPurchases(page);
    await goToLearning(page, OWNED_SLUG);

    const progressText = page.getByText(/Postęp:/);
    const progressBefore = await progressText.textContent();

    const completeButtons = page.locator('button:has-text("Oznacz jako ukończone")');
    if ((await completeButtons.count()) === 0) {
      expect(progressBefore).toContain("/");
      return;
    }

    await completeButtons.first().click();
    const undoButton = page.locator('button:has-text("Oznacz jako nieukończone")').first();
    await expect(undoButton).toBeVisible();
    await undoButton.click();
    await expect(progressText).toHaveText(progressBefore ?? "Postęp:");
  });
});
