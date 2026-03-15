import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { E2E_DB_URL } from "../config/env";

const DEFAULT_RESET_FILE = resolve(process.cwd(), "database", "reset_e2e_state.sql");
const DEFAULT_SEED_FILE = resolve(process.cwd(), "database", "seed_test_data.sql");

export type SeedMode = "seed" | "reset" | "all";

const ensureDbUrl = () => {
  if (!E2E_DB_URL) {
    throw new Error(
      "E2E_DATABASE_URL is required to run database helpers.",
    );
  }
};

const runSqlFile = (filePath: string) => {
  ensureDbUrl();
  execFileSync("psql", [E2E_DB_URL, "-v", "ON_ERROR_STOP=1", "-f", filePath], {
    stdio: "inherit",
  });
};

export const seedTestDb = (mode: SeedMode = "all") => {
  if (mode === "seed") {
    runSqlFile(DEFAULT_SEED_FILE);
    return;
  }

  if (mode === "reset") {
    runSqlFile(DEFAULT_RESET_FILE);
    return;
  }

  runSqlFile(DEFAULT_RESET_FILE);
  runSqlFile(DEFAULT_SEED_FILE);
};

export const resetE2EDb = () => {
  runSqlFile(DEFAULT_RESET_FILE);
};

export const applySeedData = () => {
  runSqlFile(DEFAULT_SEED_FILE);
};
