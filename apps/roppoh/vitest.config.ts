import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

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
          },
          env: {},
          include: ["test/visual-regression/**/*.spec.{ts,tsx}"],
          name: "visual",
          testTimeout: 10_000,
        },
      },
    ],
  },
});
