import { describe, it } from "node:test";
import { RuleTester } from "oxlint/plugins-dev";

import rule from "../../src/rules/file-structure-inertia.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const roppohApp = "/repo/apps/roppoh/app";

new RuleTester().run("file-structure-inertia", rule, {
  valid: [
    {
      name: "pages/ 直下の Index.tsx はルートページとして許可",
      filename: `${roppohApp}/pages/Index.tsx`,
      code: "export {};",
    },
    {
      name: "pages/<PascalName>/Index.tsx は正しい構造",
      filename: `${roppohApp}/pages/Login/Index.tsx`,
      code: "export {};",
    },
    {
      name: "pages/<PascalName>/ 直下の components は対象外",
      filename: `${roppohApp}/pages/Login/components/login-button.tsx`,
      code: "export {};",
    },
    {
      name: "pages/<PascalName>/ 直下の .ts ファイルは許可",
      filename: `${roppohApp}/pages/User/params.ts`,
      code: "export {};",
    },
    {
      name: "app 外のファイルは対象外",
      filename: "/repo/apps/roppoh/test/unit/health.test.ts",
      code: "export {};",
    },
    {
      name: "pages 以外のディレクトリは対象外(casing チェックしない)",
      filename: `${roppohApp}/layouts/compose.tsx`,
      code: "export {};",
    },
  ],
  invalid: [
    {
      name: "pages/ 直下のディレクトリ名は PascalCase 必須",
      filename: `${roppohApp}/pages/login/Index.tsx`,
      code: "export {};",
      errors: [{ messageId: "pageDirCase" }],
    },
    {
      name: "pages/<Name>/ 直下の .tsx は Index.tsx のみ",
      filename: `${roppohApp}/pages/Login/login-form.tsx`,
      code: "export {};",
      errors: [{ messageId: "pageEntryName" }],
    },
    {
      name: "pages/ 直下の .tsx は Index.tsx のみ",
      filename: `${roppohApp}/pages/other.tsx`,
      code: "export {};",
      errors: [{ messageId: "pageRootEntryName" }],
    },
  ],
});
