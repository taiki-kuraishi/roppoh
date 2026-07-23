import type { Context, Rule } from "../lib/types.ts";

import { findFeatureBoundary, findSrcRoot, resolveImport, stripQuery } from "../lib/paths.ts";

interface Reportable {
  range: [number, number];
}

/** 違反していれば messageId を返す */
const detectViolation = (importer: string, srcRoot: string, stripped: string): string | null => {
  const resolved = resolveImport(importer, stripped);
  if (resolved === null || !resolved.startsWith(`${srcRoot}/`)) {
    return "escapeSrc";
  }
  const boundary = findFeatureBoundary(importer);
  if (boundary !== null && !resolved.startsWith(`${boundary}/`)) {
    return "escapeBoundary";
  }
  return null;
};

const checkSource = (context: Context, specifier: string, node: Reportable): void => {
  const stripped = stripQuery(specifier);
  const importer = context.physicalFilename;
  const srcRoot = findSrcRoot(importer);
  if (!stripped.startsWith(".") || srcRoot === null) {
    return;
  }
  const messageId = detectViolation(importer, srcRoot, stripped);
  if (messageId !== null) {
    context.report({ node, messageId, data: { specifier } });
  }
};

/**
 * 境界越え相対 import の禁止
 *
 * 内容: import specifier が相対パス(`./` `../`)で src/ の外、または
 * 自分の属するページ/レイアウト境界の外を参照している場合に検知する。
 *
 * 目的: 相対パスによる深い import ("../../../...") や境界を無視した
 * 参照を排除し、@/ エイリアス経由の一貫した import 経路を強制する。
 */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow relative imports that reach outside a page's or layout's own boundary, and require the @/ alias instead",
    },
    messages: {
      escapeSrc:
        "'{{specifier}}' uses a relative path that reaches outside src/. Use the @/ alias or a package reference instead.",
      escapeBoundary:
        "'{{specifier}}' uses a relative path that reaches outside its own page/layout boundary. Use the @/ alias instead.",
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
