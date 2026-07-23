import type { Context, Rule } from "../lib/types.ts";

import { findSrcRoot } from "../lib/paths.ts";

const FILE_HEAD = { line: 1, column: 0 };

const PASCAL_CASE = /^[A-Z][a-zA-Z0-9]*$/;

const isPascalCase = (segment: string): boolean => PASCAL_CASE.test(segment);

const reportPagesViolations = (context: Context, segments: string[], basename: string): void => {
  if (segments.at(-1) !== "pages") {
    return;
  }
  if (basename !== "Index.tsx" && !basename.endsWith(".ts")) {
    context.report({ loc: FILE_HEAD, messageId: "pageRootEntryName" });
  }
};

const reportPageDirViolations = (context: Context, segments: string[], basename: string): void => {
  if (segments.at(-2) !== "pages") {
    return;
  }
  const dirName = segments.at(-1);
  if (dirName === undefined) {
    return;
  }
  if (!isPascalCase(dirName)) {
    context.report({ loc: FILE_HEAD, messageId: "pageDirCase", data: { segment: dirName } });
  }
  if (basename.endsWith(".tsx") && basename !== "Index.tsx") {
    context.report({ loc: FILE_HEAD, messageId: "pageEntryName" });
  }
};

/**
 * ディレクトリ構造規約(PascalCase / Inertia pages)
 *
 * 内容: pages/ 配下のディレクトリ名が PascalCase であること、および
 * pages/<PascalName>/Index.tsx という構造になっていることを検査する。
 *
 * 目的: roppoh / web-console が採用する Inertia のページ解決規約
 * (ページディレクトリ名 PascalCase、エントリファイルは Index.tsx 固定)を
 * 機械的に強制し、命名・配置のばらつきを防ぐ。
 */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce the pages/<PascalName>/Index.tsx directory structure to match Inertia's page resolution convention",
    },
    messages: {
      pageDirCase: "Directory name '{{segment}}' directly under pages/ must be PascalCase.",
      pageRootEntryName: "Only Index.tsx is allowed as a .tsx file directly under pages/.",
      pageEntryName: "Only Index.tsx is allowed as a .tsx file directly under pages/<Name>/.",
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
        if (basename === undefined || !segments.includes("pages")) {
          return;
        }
        reportPagesViolations(context, segments, basename);
        reportPageDirViolations(context, segments, basename);
      },
    };
  },
} satisfies Rule;

export default rule;
