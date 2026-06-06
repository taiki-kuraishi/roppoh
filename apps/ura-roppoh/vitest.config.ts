import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

import { VRT_ENV } from "./test/visual-regression/constant";

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react(), tailwindcss(), tsconfigPaths()],
        resolve: {
          dedupe: ["react", "react-dom"],
        },
        optimizeDeps: {
          include: ["react", "react-dom"],
        },
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: playwright(),
            expect: {
              toMatchScreenshot: {
                comparatorOptions: {
                  allowedMismatchedPixelRatio: 0.0001,
                },
              },
            },
          },
          env: VRT_ENV,
          include: ["test/visual-regression/**/*.spec.{ts,tsx}"],
          name: "visual",
          testTimeout: 10_000,
        },
      },
    ],
  },
});
