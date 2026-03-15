import { expect, test } from "./fixtures/e2e";
import { clearClientState } from "./utils/state";
import { loginAsAdmin, loginAsStudent, loginByUi } from "./utils/auth";
import { goToLogin } from "./utils/navigation";
import { goToAdmin } from "./utils/navigation";

test.describe("Autoryzacja i sesja", () => {
  test.beforeEach(async ({ page }) => {
    await clearClientState(page);
    await page.goto("/");
  });

  test("logowanie ucznia zakończone sukcesem", async ({ page }) => {
    await loginAsStudent(page);
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByRole("link", { name: "Mój panel" })).toBeVisible();
  });

  test("logowanie użytkownika z nieprawidłowymi danymi pozostaje na formularzu", async ({
    page,
  }) => {
    await goToLogin(page);
    await page.locator("#login-email").fill("student1@test.local");
    await page.locator("#login-password").fill("złe-hasło");
    await page.getByRole("button", { name: "Zaloguj się", exact: true }).click();
    await page.waitForURL("/login");
    await expect(page.locator("text=/bł|błąd|invalid/i")).toBeVisible();
  });

  test("logowanie admina i rola admin umożliwia dostęp do panelu", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole("heading", { name: "Panel administracyjny" })).toBeVisible();
  });

  test("ścieżki chronione wymagają zalogowania", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL("/login");
  });

  test("użytkownik bez sesji nie ma dostępu do dashboardu", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login");
  });

  test("użytkownik bez uprawnień nie wejdzie do panelu admina", async ({ page }) => {
    await loginByUi(
      page,
      "student1@test.local",
      "TestHaslo123!",
    );
    await goToAdmin(page);
    await expect(page).toHaveURL("/dashboard");
  });

  test("chroniona trasa zachowuje sesję po przeładowaniu", async ({ page }) => {
    await loginAsStudent(page);
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/dashboard");
    await page.reload();
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByRole("link", { name: "Moje kursy" })).toBeVisible();
  });
});
