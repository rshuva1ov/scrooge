#!/usr/bin/env node

import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hookPath = join(root, ".git", "hooks", "pre-push");

if (!existsSync(join(root, ".git"))) {
  process.exit(0);
}

const hook = `#!/bin/sh
set -e
cd "$(dirname "$0")/../.."
echo "▶ pre-push: type-check"
pnpm type-check
echo "▶ pre-push: test"
pnpm test
echo "▶ pre-push: build"
pnpm build
echo "✔ pre-push checks passed"
`;

try {
  mkdirSync(dirname(hookPath), { recursive: true });
  writeFileSync(hookPath, hook, { mode: 0o755 });
  chmodSync(hookPath, 0o755);
  console.log("Installed git pre-push hook");
} catch (error) {
  const code = error && typeof error === "object" && "code" in error ? error.code : null;

  if (code === "EPERM" || code === "EACCES") {
    console.warn("Skipped git pre-push hook install (no permission). Run: pnpm prepush");
    process.exit(0);
  }

  throw error;
}
