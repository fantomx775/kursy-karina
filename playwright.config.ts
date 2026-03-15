import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:5000";
const parsedUrl = new URL(baseURL);
const serverPort = parsedUrl.port || "5000";
const isCI = process.env.CI === "true";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/config/global-setup.ts",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : 1,
  reporter: isCI
    ? [["html", { outputFolder: "playwright-report", open: "never" }], ["github"]]
    : "list",
  use: {
    baseURL,
    locale: "pl-PL",
    trace: "on-first-retry",
    video: "on-first-retry",
    screenshot: "on-first-retry",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  webServer: {
    command: `npm run dev -- -p ${serverPort}`,
    port: Number(serverPort),
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
