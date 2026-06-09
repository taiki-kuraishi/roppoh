import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
    cloudflare({ configPath: "./wrangler.jsonc" }),
    devtoolsJson(),
    VitePWA({
      base: "/",
      devOptions: { enabled: false },
      includeAssets: ["public/**"],
      manifest: {
        background_color: "#000000",
        display: "standalone",
        icons: [
          {
            sizes: "192x192",
            src: "icons/tsar-192x192.png",
            type: "image/png",
          },
          {
            sizes: "512x512",
            src: "icons/tsar-512x512.png",
            type: "image/png",
          },
        ],
        name: "Ura Roppoh",
        short_name: "Ura Roppoh",
        theme_color: "#000000",
      },
      outDir: "dist",
      registerType: "autoUpdate",
      scope: "/",
      strategies: "generateSW",
      workbox: {
        globDirectory: "dist",
        globPatterns: ["**/*.{css,svg,js,html}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: { port: 51_731 },
});
