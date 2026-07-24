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

/**
 * ディレクトリ構造規約(kebab-case / pages)
 *
 * 内容: ディレクトリ名が kebab-case であること、および pages/ 配下が
 * pages/<name>/page.tsx という構造になっていることを検査する。
 *
 * 目的: neo-fujimatsu のページ解決規約(ページディレクトリ名 kebab-case、
 * エントリファイルは page.tsx 固定)を機械的に強制し、命名・配置のばらつきを防ぐ。
 */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce kebab-case directory names and the pages/<name>/page.tsx directory structure",
    },
    messages: {
      dirCase: "Directory name '{{segment}}' must be kebab-case.",
      fileInPagesRoot:
        "Files are not allowed directly under pages/. Create a pages/<name>/ directory instead.",
      pageEntryName: "Only page.tsx is allowed as a .tsx file directly under pages/<name>/.",
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
