import type { Context, Rule } from "../lib/types.ts";

import { findSrcRoot, isKebabCase } from "../lib/paths.ts";

const FILE_HEAD = { line: 1, column: 0 };

const reportDirCaseViolations = (context: Context, segments: string[]): void => {
  for (const segment of segments) {
    if (!isKebabCase(segment)) {
      context.report({ loc: FILE_HEAD, messageId: "dirCase", data: { segment } });
    }
  }
};

const reportPagesViolations = (context: Context, segments: string[], basename: string): void => {
  if (segments.at(-1) === "pages") {
    context.report({ loc: FILE_HEAD, messageId: "fileInPagesRoot" });
  } else if (segments.at(-2) === "pages" && basename.endsWith(".tsx") && basename !== "page.tsx") {
    context.report({ loc: FILE_HEAD, messageId: "pageEntryName" });
  }
};

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "ディレクトリ名の kebab-case と pages/<name>/page.tsx のディレクトリ構造を強制する",
    },
    messages: {
      dirCase: "ディレクトリ名 '{{segment}}' は kebab-case にしてください。",
      fileInPagesRoot:
        "pages/ 直下にファイルを置けません。pages/<name>/ ディレクトリを作成してください。",
      pageEntryName: "pages/<name>/ 直下の .tsx ファイルは page.tsx のみ許可されています。",
    },
  },
  create(context) {
    return {
      Program() {
        const filename = context.physicalFilename;
        const srcRoot = findSrcRoot(filename);
        if (srcRoot === null) {
          return;
        }
        const segments = filename.slice(srcRoot.length + 1).split("/");
        const basename = segments.pop();
        if (basename === undefined) {
          return;
        }
        reportDirCaseViolations(context, segments);
        reportPagesViolations(context, segments, basename);
      },
    };
  },
} satisfies Rule;

export default rule;
