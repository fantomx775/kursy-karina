#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const mode = process.argv[2] ?? "all";
const dbUrl = process.env.E2E_DATABASE_URL;
const root = process.cwd();
const seedFile = process.env.E2E_SEED_FILE ?? resolve(root, "database", "seed_test_data.sql");
const resetFile = process.env.E2E_RESET_FILE ?? resolve(root, "database", "reset_e2e_state.sql");

if (!dbUrl) {
  console.error("E2E_DATABASE_URL is required to run seeding helper.");
  process.exit(1);
}

const runFile = (filePath) => {
  execFileSync("psql", [dbUrl, "-v", "ON_ERROR_STOP=1", "-f", filePath], {
    stdio: "inherit",
  });
};

if (mode === "seed") {
  runFile(seedFile);
} else if (mode === "reset") {
  runFile(resetFile);
} else {
  runFile(resetFile);
  runFile(seedFile);
}
