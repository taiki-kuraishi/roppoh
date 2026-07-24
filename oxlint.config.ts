import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
    perf: "error",
    restriction: "error",
    style: "error",
    suspicious: "error",
  },
  ignorePatterns: [
    "apps/emdash",
    "packages/shadcn/src",
    "**/worker-configuration.d.ts",
    "packages/domain/src",
    // K8s/ 配下の configMapGenerator ソース(コンテナ内で standalone 実行する
    // スクリプト。アプリコードの規約は適用対象外)
    "k8s/**",
  ],
  jsPlugins: ["@roppoh/oxlint-plugins"],
  options: {
    typeAware: true,
    typeCheck: true,
  },
  overrides: [
    {
      files: ["apps/neo-fujimatsu/src/client/**"],
      rules: {
        "max-lines": ["error", { max: 150 }],
        "max-lines-per-function": ["error", { max: 100 }],
        "roppoh/file-structure": "error",
        "roppoh/no-cross-feature-import": "error",
        "roppoh/one-function-per-tsx": "error",
        "roppoh/prefer-alias-import": "error",
      },
    },
    {
      // Inertia resolves pages by PascalCase name (c.render('User/Index') ->
      // App/pages/User/Index.tsx), which conflicts with the repo-wide
      // Kebab-case filename rule below. Exempt only the pages tree.
      files: ["apps/roppoh/app/pages/**", "apps/web-console/app/pages/**"],
      rules: {
        "unicorn/filename-case": "off",
      },
    },
    {
      files: ["apps/roppoh/app/**", "apps/web-console/app/**"],
      rules: {
        "roppoh/file-structure-inertia": "error",
        "roppoh/no-cross-feature-import": "error",
        "roppoh/one-function-per-tsx": "error",
        "roppoh/prefer-alias-import": "error",
      },
    },
    {
      // Foundation SDK の DashboardBuilder/VariableBuilder は配列ではなく
      // 独自の .sort() を持つため、Array 前提の unicorn/no-array-sort は誤検知する
      files: ["packages/grafana-dashboards/**"],
      rules: {
        "unicorn/no-array-sort": "off",
      },
    },
  ],
  rules: {
    "eslint/no-unused-vars": "error",
    "eslint/sort-imports": "off",
    "func-names": "off",
    "func-style": "off",
    "id-length": "off",
    "max-params": "off",
    "no-console": "off",
    "no-duplicate-imports": "off",
    "no-empty-function": "off",
    "no-magic-numbers": "off",
    "no-ternary": "off",
    "no-undefined": "off",
    "no-void": "off",
    "oxc/no-async-await": "off",
    "oxc/no-optional-chaining": "off",
    "oxc/no-rest-spread-properties": "off",
    "typescript/explicit-function-return-type": "off",
    "typescript/explicit-module-boundary-types": "off",
    "unicorn/consistent-function-scoping": "off",
    "unicorn/filename-case": ["error", { case: "kebabCase" }],
    "unicorn/no-anonymous-default-export": "off",
    "unicorn/no-null": "off",
    "sort-keys": "off",
    "new-cap": "off",
  },
});
