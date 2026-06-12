import { describe, it } from "node:test";
import { RuleTester } from "oxlint/plugins-dev";

import rule from "../../src/rules/file-structure.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const roppohSrc = "/repo/apps/roppoh/src";

new RuleTester().run("file-structure", rule, {
  valid: [
    {
      name: "pages/<name>/page.tsx は正しい構造",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: "export {};",
    },
    {
      name: "ページ配下の components は許可",
      filename: `${roppohSrc}/pages/login/components/login-button.tsx`,
      code: "export {};",
    },
    {
      name: "pages/<name>/ 直下の .ts ファイルは許可",
      filename: `${roppohSrc}/pages/account/params.ts`,
      code: "export {};",
    },
    {
      name: "数字のみのディレクトリ名(404)は kebab-case として許可",
      filename: `${roppohSrc}/pages/404/page.tsx`,
      code: "export {};",
    },
    {
      name: "layouts 直下のファイルは許可",
      filename: `${roppohSrc}/layouts/authenticated-layout.tsx`,
      code: "export {};",
    },
    {
      name: "src 外のファイルは対象外",
      filename: "/repo/apps/roppoh/test/unit/loginPage.test.tsx",
      code: "export {};",
    },
    {
      name: "neo-fujimatsu の src/client 構造も許可",
      filename: "/repo/apps/neo-fujimatsu/src/client/pages/sign-in/page.tsx",
      code: "export {};",
    },
  ],
  invalid: [
    {
      name: "camelCase のディレクトリ名は禁止",
      filename: `${roppohSrc}/pages/loginPage/page.tsx`,
      code: "export {};",
      errors: [{ messageId: "dirCase" }],
    },
    {
      name: "PascalCase のディレクトリ名は禁止",
      filename: `${roppohSrc}/root/components/AuthProvider/index.tsx`,
      code: "export {};",
      errors: [{ messageId: "dirCase" }],
    },
    {
      name: "pages/ 直下にファイルを置けない",
      filename: `${roppohSrc}/pages/index.tsx`,
      code: "export {};",
      errors: [{ messageId: "fileInPagesRoot" }],
    },
    {
      name: "pages/<name>/ 直下の .tsx は page.tsx のみ",
      filename: `${roppohSrc}/pages/login/login-form.tsx`,
      code: "export {};",
      errors: [{ messageId: "pageEntryName" }],
    },
  ],
});
