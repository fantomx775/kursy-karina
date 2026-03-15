import { test as base, expect } from "@playwright/test";
import { loginAsAdmin, loginAsStudent, loginAsStudentWithPurchases } from "../utils/auth";

type E2EFixtures = {
  loginAsStudent: () => Promise<void>;
  loginAsStudentWithPurchases: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
};

export const test = base.extend<E2EFixtures>({
  loginAsStudent: async ({ page }, use) => {
    await use(async () => {
      await loginAsStudent(page);
    });
  },
  loginAsAdmin: async ({ page }, use) => {
    await use(async () => {
      await loginAsAdmin(page);
    });
  },
  loginAsStudentWithPurchases: async ({ page }, use) => {
    await use(async () => {
      await loginAsStudentWithPurchases(page);
    });
  },
});

export { expect };
