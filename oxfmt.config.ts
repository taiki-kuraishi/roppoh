import { defineConfig } from "oxfmt";

export default defineConfig({
  /*
   * K8s/monitoring/dashboards/*.json は packages/grafana-dashboards の
   * generate.ts が出力するコード生成物。CI の drift check
   * (.github/workflows/dashboard-drift-ci.yml) が生出力とそのまま比較する
   * ため、フォーマッタで整形すると常に差分が出てしまう。除外する
   */
  ignorePatterns: ["worker-configuration.d.ts", "k8s/monitoring/dashboards/*.json"],
  printWidth: 100,
  semi: true,
  singleQuote: false,
  sortImports: {
    groups: [
      "type-import",
      ["value-builtin", "value-external"],
      "type-internal",
      "value-internal",
      ["type-parent", "type-sibling", "type-index"],
      ["value-parent", "value-sibling", "value-index"],
      "unknown",
    ],
  },
  trailingComma: "all",
  useTabs: false,
});
