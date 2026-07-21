import { defineConfig, devices } from "@playwright/test";

// Behavioral (non-visual) Playwright tests: no toHaveScreenshot, so no need
// For the Docker-pinned rendering environment test:vrt uses. Runs directly
// On the host.
export default defineConfig({
  retries: 0,
  testDir: "./test/e2e",
  timeout: 30 * 1000,

  expect: {
    timeout: 5000,
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  use: {
    baseURL: "http://127.0.0.1:51733",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
    viewport: { height: 720, width: 1280 },
  },

  webServer: {
    command: "bun run dev -- --host 127.0.0.1",
    reuseExistingServer: false,
    timeout: 120 * 1000,
    url: "http://127.0.0.1:51733",
  },
});
