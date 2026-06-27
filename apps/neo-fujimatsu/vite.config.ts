import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    tailwindcss(),
    cloudflare({ configPath: "./wrangler.jsonc" }),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: { cors: false, port: 3002 },
});
