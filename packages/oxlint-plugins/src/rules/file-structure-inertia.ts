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

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Inertia のページ解決規約に合わせて pages/<PascalName>/Index.tsx のディレクトリ構造を強制する",
    },
    messages: {
      pageDirCase: "pages/ 直下のディレクトリ名 '{{segment}}' は PascalCase にしてください。",
      pageRootEntryName: "pages/ 直下に置ける .tsx は Index.tsx のみです。",
      pageEntryName: "pages/<Name>/ 直下の .tsx ファイルは Index.tsx のみ許可されています。",
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
