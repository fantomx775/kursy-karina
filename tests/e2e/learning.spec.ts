import { expect, test } from "./fixtures/e2e";
import { clearClientState } from "./utils/state";
import { loginAsStudentEmpty, loginAsStudentWithPurchases } from "./utils/auth";
import { goToLearning } from "./utils/navigation";

const OWNED_SLUG = "nextjs-14-pelny-stack";
const UNOWNED_SLUG = "nodejs-rest-api";

async function solveSeededQuiz(page: import("@playwright/test").Page) {
  await page.getByLabel("app").check();
  await page.getByLabel("layout.tsx").check();
  await page.getByLabel("page.tsx").check();
  await page.getByRole("button", { name: "Sprawdz" }).click();
}

test.describe("Interakcje z kursem po stronie kursanta", () => {
  test.beforeEach(async ({ page }) => {
    await clearClientState(page);
  });

  test("wymaga logowania do strony nauki", async ({ page }) => {
    await goToLearning(page, OWNED_SLUG);
    await expect(page).toHaveURL("/login");
  });

  test("blokuje dostep do kursu bez zakupu", async ({ page }) => {
    await loginAsStudentEmpty(page);
    await goToLearning(page, UNOWNED_SLUG);
    await expect(page.getByText("Brak dostepu")).toBeVisible();
  });

  test("zapisuje postep kursu po oznaczeniu zwyklych krokow", async ({ page }) => {
    await loginAsStudentWithPurchases(page);
    await goToLearning(page, OWNED_SLUG);

    await expect(page.getByRole("heading", { name: /Next\.js/i })).toBeVisible();
    const progressText = page.getByText(/Postep:/);
    const progressBefore = await progressText.textContent();
    const beforeMatch = (progressBefore ?? "").match(/(\d+)\/(\d+)/);
    const beforeValue = beforeMatch?.[1] ?? "0";

    const completeButtons = page.locator('button:has-text("Oznacz jako ukonczone")');
    const total = await completeButtons.count();
    if (total === 0) {
      expect(beforeMatch).toBeTruthy();
      return;
    }

    await completeButtons.first().click();

    const progressAfter = await progressText.textContent();
    const afterMatch = (progressAfter ?? "").match(/(\d+)\/(\d+)/);
    expect(Number(afterMatch?.[1] ?? 0)).toBeGreaterThan(Number(beforeValue));
  });

  test("trwale zalicza quiz i nie cofa progresu po blednej powtorce", async ({ page }) => {
    await loginAsStudentWithPurchases(page);
    await goToLearning(page, OWNED_SLUG);

    const progressText = page.getByText(/Postep:/);
    const before = await progressText.textContent();

    await solveSeededQuiz(page);

    await expect(page.getByRole("status")).toContainText("Quiz");
    const afterPass = await progressText.textContent();
    expect(afterPass).not.toBe(before);

    await page.getByLabel("pages").check();
    await page.getByLabel("getServerSideProps").check();
    await page.getByRole("button", { name: "Sprawdz" }).click();

    await expect(page.getByRole("status")).toContainText(
      "Quiz pozostaje zaliczony",
    );
    await expect(progressText).toHaveText(afterPass ?? "");
  });

  test("udostepnia certyfikat po pelnym zakonczeniu kursu wraz z quizem", async ({
    page,
  }) => {
    await loginAsStudentWithPurchases(page);
    await goToLearning(page, OWNED_SLUG);

    const remainingButtons = page.locator('button:has-text("Oznacz jako ukonczone")');
    while ((await remainingButtons.count()) > 0) {
      await remainingButtons.first().click();
    }

    await solveSeededQuiz(page);

    const certificateButton = page.getByRole("link", { name: "Pobierz certyfikat" });
    await expect(certificateButton).toBeVisible();
    await expect(certificateButton).toHaveAttribute(
      "href",
      /\/api\/courses\/.+\/certificate/,
    );
  });

  test("umozliwia cofniecie postepu dla zwyklych materialow", async ({ page }) => {
    await loginAsStudentWithPurchases(page);
    await goToLearning(page, OWNED_SLUG);

    const progressText = page.getByText(/Postep:/);
    const progressBefore = await progressText.textContent();

    const completeButtons = page.locator('button:has-text("Oznacz jako ukonczone")');
    if ((await completeButtons.count()) === 0) {
      expect(progressBefore).toContain("/");
      return;
    }

    await completeButtons.first().click();
    const undoButton = page
      .locator('button:has-text("Oznacz jako nieukonczone")')
      .first();
    await expect(undoButton).toBeVisible();
    await undoButton.click();
    await expect(progressText).toHaveText(progressBefore ?? "Postep:");
  });
});
