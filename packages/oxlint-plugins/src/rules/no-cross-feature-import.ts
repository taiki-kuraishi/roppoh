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

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "ページ/レイアウトの components/ 配下を、その境界の外から import することを禁止する",
    },
    messages: {
      crossFeature:
        "'{{owner}}' の components/ 配下はそのページ/レイアウト専用です。共有する場合は src/components/ へ昇格してください。",
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
