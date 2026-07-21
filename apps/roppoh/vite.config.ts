import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({ babel: { plugins: ["babel-plugin-react-compiler"] } }),
    tailwindcss(),
    cloudflare({ configPath: "./wrangler.jsonc" }),
    // Only app/server.ts + app/root-view.tsx are server-side; everything
    // Else under app/ is client React and must go through normal Fast
    // Refresh, not the SSR hot-reload full-page-reload path (matches
    // Vite-ssr-components' own React example, which excludes its client dir).
    ssrPlugin({
      hotReload: {
        ignore: ["app/client.tsx", "app/pages/**", "app/global.css"],
      },
    }),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: { port: 51_733 },
});
