import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { E2E_DB_URL } from "./env";

const DEFAULT_SEED_FILE = resolve(process.cwd(), "database", "seed_test_data.sql");
const DEFAULT_RESET_FILE = resolve(process.cwd(), "database", "reset_e2e_state.sql");

function runSqlFile(filePath: string) {
  if (!E2E_DB_URL) {
    throw new Error(
      "E2E_DATABASE_URL is required for database setup and was not provided.",
    );
  }

  execFileSync("psql", [E2E_DB_URL, "-v", "ON_ERROR_STOP=1", "-f", filePath], {
    stdio: "inherit",
  });
}

async function run() {
  const seedMode = process.env.E2E_SEED_MODE ?? "all";
  if (seedMode === "seed") {
    runSqlFile(DEFAULT_SEED_FILE);
    return;
  }

  if (seedMode === "reset") {
    runSqlFile(DEFAULT_RESET_FILE);
    return;
  }

  runSqlFile(DEFAULT_RESET_FILE);
  runSqlFile(DEFAULT_SEED_FILE);
}

export default async function globalSetup() {
  if (process.env.E2E_SKIP_DB_SETUP === "true") {
    return;
  }

  run();
}
