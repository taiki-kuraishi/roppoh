import type { KnipConfig } from "knip";

export default {
  bun: { config: ["package.json"] },
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
  entry: [],
  // K8s/ 配下の configMapGenerator ソースはコンテナ内で standalone 実行する
  // スクリプトで、JS/TS の依存グラフには含まれない
  ignore: ["k8s/**"],
  ignoreBinaries: [".*"],
  ignoreDependencies: [],
  project: [],
  workspaces: {
    // `doctor.config.ts` is read directly by the react-doctor CLI, not
    // Imported by any app code.
    ".": { ignoreDependencies: ["turbo"], entry: ["doctor.config.ts"] },
    "apps/emdash": {
      astro: {
        config: ["astro.config.mts"],
        entry: ["src/pages/**/*.{astro,mdx,js,ts}"],
      },
      ignore: ["src/**"],
    },
    "apps/roppoh": {
      // Same setup as apps/web-console: no index.html, the HTML shell comes
      // From app/server.ts's rootView and pages are loaded via
      // Import.meta.glob in app/client.tsx.
      entry: ["app/client.tsx", "app/pages/**/*.tsx"],
    },
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
