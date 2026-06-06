import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  retries: 0,
  testDir: "./test/vrt",
  timeout: 30 * 1000,

  expect: {
    timeout: 5000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.0001 },
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  use: {
    baseURL: "http://127.0.0.1:3002",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
    viewport: { height: 720, width: 1280 },
  },

  webServer: {
    command: "bun run dev -- --host 127.0.0.1",
    reuseExistingServer: false,
    timeout: 120 * 1000,
    url: "http://127.0.0.1:3002",
  },

  workers: undefined,
});
