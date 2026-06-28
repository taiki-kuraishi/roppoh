import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2, sandbox } from "@emdash-cms/cloudflare";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import webhookNotifier from "@emdash-cms/plugin-webhook-notifier";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
  adapter: cloudflare(),
  devToolbar: { enabled: false },
  fonts: [
    {
      cssVariable: "--font-sans",
      fallbacks: ["sans-serif"],
      name: "Inter",
      provider: fontProviders.google(),
      weights: [400, 500, 600, 700],
    },
    {
      cssVariable: "--font-mono",
      fallbacks: ["monospace"],
      name: "JetBrains Mono",
      provider: fontProviders.google(),
      weights: [400, 500],
    },
  ],
  image: {
    layout: "constrained",
    responsiveStyles: true,
  },
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB", session: "auto" }),
      storage: r2({ binding: "MEDIA" }),
      plugins: [formsPlugin()],
      sandboxed: [webhookNotifier],
      sandboxRunner: sandbox(),
      marketplace: "https://marketplace.emdashcms.com",
    }),
  ],
  output: "server",
});
