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
    ".": { ignoreDependencies: ["turbo"] },
    "apps/emdash": {
      astro: {
        config: ["astro.config.mts"],
        entry: ["src/pages/**/*.{astro,mdx,js,ts}"],
      },
      ignore: ["src/**"],
    },
    "apps/roppoh": {},
    "packages/better-auth": {},
    "packages/better-auth-database": {
      entry: ["src/auth.ts"],
      ignore: ["src/relations.ts"], // Generated code
    },
  },
} satisfies KnipConfig;
