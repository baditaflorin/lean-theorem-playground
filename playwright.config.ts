import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4173);

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: `http://127.0.0.1:${port}/lean-theorem-playground/`,
    trace: "on-first-retry",
  },
  webServer: {
    command: `npx vite preview --host 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}/lean-theorem-playground/`,
    reuseExistingServer: true,
    timeout: 20_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
