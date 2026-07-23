import type { Context, Rule } from "../lib/types.ts";

import { findSrcRoot, resolveImport, stripQuery } from "../lib/paths.ts";

interface Reportable {
  range: [number, number];
}

/**
 * 解決済みパスの `components` セグメントから境界オーナー(`<name>/components/` の `<name>`)を
 * 計算し、importer がその外にいる場合に srcRoot 相対のオーナーパスを返す。
 * トップレベル直下の `components/`(共有コンポーネント置き場)は対象外。
 */
const findViolatedOwner = (importer: string, srcRoot: string, resolved: string): string | null => {
  const segments = resolved.slice(srcRoot.length + 1).split("/");
  for (let i = 0; i < segments.length; i += 1) {
    const upper = segments.slice(0, i);
    if (
      segments[i] === "components" &&
      upper.length > 0 &&
      !importer.startsWith(`${srcRoot}/${upper.join("/")}/`)
    ) {
      return upper.join("/");
    }
  }
  return null;
};

const checkSource = (context: Context, specifier: string, node: Reportable): void => {
  const importer = context.physicalFilename;
  const resolved = resolveImport(importer, stripQuery(specifier));
  const srcRoot = findSrcRoot(importer);
  if (resolved === null || srcRoot === null || findSrcRoot(resolved) !== srcRoot) {
    return;
  }
  const owner = findViolatedOwner(importer, srcRoot, resolved);
  if (owner !== null) {
    context.report({ node, messageId: "crossFeature", data: { owner } });
  }
};

/**
 * コロケーション境界の import 制限
 *
 * 内容: ページ/レイアウトディレクトリ配下の components/ を、その境界の
 * 外側(他のページ/レイアウトや共有領域)から import している場合に検知する。
 *
 * 目的: ページ/レイアウトごとにコロケーションされた components/ を
 * 「そのページ専用」の実装として閉じ込め、意図しない機能間の結合を防ぐ。
 * 共有が必要な場合は src/components/ への昇格を促す。
 */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow importing a page's or layout's components/ directory from outside its boundary",
    },
    messages: {
      crossFeature:
        "The components/ directory under '{{owner}}' is private to that page/layout. Promote it to src/components/ if you need to share it.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        checkSource(context, node.source.value, node.source);
      },
      ExportNamedDeclaration(node) {
        if (node.source !== null) {
          checkSource(context, node.source.value, node.source);
        }
      },
      ExportAllDeclaration(node) {
        checkSource(context, node.source.value, node.source);
      },
      ImportExpression(node) {
        const { source } = node;
        if (source.type === "Literal" && typeof source.value === "string") {
          checkSource(context, source.value, source);
        }
      },
    };
  },
} satisfies Rule;

export default rule;
