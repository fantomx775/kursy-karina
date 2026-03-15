export const E2E_BASE_URL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:5000";

export const E2E_TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "TestHaslo123!";

export const E2E_USER = {
  student: {
    email: process.env.E2E_STUDENT_EMAIL ?? "student1@test.local",
    password: process.env.E2E_STUDENT_PASSWORD ?? E2E_TEST_PASSWORD,
  },
  studentWithPurchases: {
    email: process.env.E2E_STUDENT2_EMAIL ?? "student2@test.local",
    password: process.env.E2E_STUDENT2_PASSWORD ?? E2E_TEST_PASSWORD,
  },
  studentEmpty: {
    email: process.env.E2E_STUDENT4_EMAIL ?? "student4@test.local",
    password: process.env.E2E_STUDENT4_PASSWORD ?? E2E_TEST_PASSWORD,
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? "admin@test.local",
    password: process.env.E2E_ADMIN_PASSWORD ?? E2E_TEST_PASSWORD,
  },
};

export const E2E_DB_URL = process.env.E2E_DATABASE_URL;
