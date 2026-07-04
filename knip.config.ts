import type { KnipConfig } from "knip";

export default {
  bun: { config: ["package.json"] },
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
  entry: [],
  ignore: [],
  ignoreBinaries: [".*"],
  ignoreDependencies: [],
  project: [],
  workspaces: {
    ".": { ignoreDependencies: ["turbo"] },
    "apps/emdash": {
      astro: {
        config: ["astro.config.mts"],
        entry: ["src/pages/**/*.{astro,mdx,js,ts}"],
      },
      ignore: ["src/**"],
    },
    "apps/roppoh": {},
    "apps/web-console": {
      // No index.html: the HTML shell is emitted by app/server.ts's rootView
      // (auto-detected by knip's wrangler plugin via the `main` field), and
      // Pages are loaded via import.meta.glob in app/client.tsx, so those two
      // Need to be listed explicitly.
      entry: ["app/client.tsx", "app/pages/**/*.tsx"],
    },
    "packages/better-auth": {},
  },
} satisfies KnipConfig;
