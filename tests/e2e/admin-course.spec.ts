import { expect, test } from "./fixtures/e2e";
import { clearClientState } from "./utils/state";
import { loginAsAdmin } from "./utils/auth";
import { makeCourseTestData } from "./utils/test-data";

const YOU_TUBE_SAMPLE_URL = "https://www.youtube.com/watch?v=dGcsHMXbSOA";

test.describe("Zarządzanie kursami przez panel admina", () => {
  test.beforeEach(async ({ page }) => {
    await clearClientState(page);
    await loginAsAdmin(page);
  });

  test("tworzy nowy kurs i dodaje go do listy", async ({ page }) => {
    const courseData = makeCourseTestData(`-create-${Date.now()}`);

    await page.goto("/admin/courses/create");
    await expect(
      page.getByRole("heading", { name: "Tworzenie nowego kursu" }),
    ).toBeVisible();

    await page.locator("#title").fill(courseData.title);
    await page.locator("#description").fill(courseData.description);
    await page.locator("#price").fill(courseData.price);
    await page.locator("#status").selectOption("active");
    await page.locator('input[placeholder="Tytuł sekcji"]').fill(courseData.sectionTitle);
    await page.getByRole("button", { name: "+ Element YouTube" }).click();
    await page.locator('input[placeholder="Tytuł elementu"]').fill(courseData.itemTitle);
    await page
      .locator('input[placeholder*="URL YouTube"]')
      .fill(YOU_TUBE_SAMPLE_URL);
    await page.getByRole("button", { name: "Zapisz" }).click();

    await expect(page).toHaveURL("/admin");
    await expect(page.getByText(courseData.title)).toBeVisible();
  });

  test("waliduje formularz kursu przy braku tytułu sekcji", async ({ page }) => {
    await page.goto("/admin/courses/create");
    await page.locator("#title").fill("Kurs testowy bez sekcji");
    await page.locator("#description").fill("Opis");
    await page.locator("#price").fill("199");
    await page.locator('input[placeholder="Tytuł sekcji"]').clear();

    await page.getByRole("button", { name: "Zapisz" }).click();
    await expect(page.getByRole("alert")).toHaveText(
      "Dodaj co najmniej jedną sekcję i podaj jej tytuł.",
    );
  });

  test("sprawdza walidację unikalności slugu", async ({ page }) => {
    const existingSlugResponse = await page.request.get(
      `/api/admin/courses/validate-slug/react-od-zera`,
    );
    const duplicate = await existingSlugResponse.json();
    expect(duplicate.available).toBe(false);

    const unique = `e2e-${Date.now()}`;
    const uniqueResponse = await page.request.get(
      `/api/admin/courses/validate-slug/${unique}`,
    );
    const uniqueResult = await uniqueResponse.json();
    expect(uniqueResult.available).toBe(true);
  });

  test("edytuje istniejący kurs", async ({ page }) => {
    const listResponse = await page.request.get("/api/admin/courses");
    const listData = await listResponse.json();
    const firstCourse = listData.courses?.[0];
    if (!firstCourse) {
      throw new Error("Brak kursów do edycji.");
    }

    const editedTitle = `${firstCourse.title} (edit-${Date.now()})`;
    await page.goto(`/admin/courses/${firstCourse.id}/edit`);
    await page.locator("#title").fill(editedTitle);
    await page.getByRole("button", { name: "Zapisz" }).click();

    await expect(page).toHaveURL("/admin");
    await expect(page.getByText(editedTitle)).toBeVisible();
  });
});
