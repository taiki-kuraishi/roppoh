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

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "自分のページ/レイアウト境界の外を相対パスで import することを禁止し、@/ エイリアスを強制する",
    },
    messages: {
      escapeSrc:
        "'{{specifier}}' は src/ の外を相対パスで参照しています。@/ エイリアスやパッケージ参照を使ってください。",
      escapeBoundary:
        "'{{specifier}}' は自分のページ/レイアウト境界の外を相対パスで参照しています。@/ エイリアスを使ってください。",
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
