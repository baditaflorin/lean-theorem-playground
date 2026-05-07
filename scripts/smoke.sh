#!/usr/bin/env bash
set -euo pipefail

npm run build
export PLAYWRIGHT_PORT="${PLAYWRIGHT_PORT:-42791}"
npx playwright test --config=playwright.config.ts
