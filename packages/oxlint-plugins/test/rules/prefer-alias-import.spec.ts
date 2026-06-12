import { describe, it } from "node:test";
import { RuleTester } from "oxlint/plugins-dev";

import rule from "../../src/rules/prefer-alias-import.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const roppohSrc = "/repo/apps/roppoh/src";

new RuleTester().run("prefer-alias-import", rule, {
  valid: [
    {
      name: "同一ページ内に留まる深い相対 import は許可",
      filename: `${roppohSrc}/pages/account/components/passkey-item/index.tsx`,
      code: `import { params } from "../../params";`,
    },
    {
      name: "境界をまたぐ import は @/ エイリアスなら許可",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `import { betterAuth } from "@/libs/better-auth";`,
    },
    {
      name: "境界を持たないファイル(root 等)は src 内なら相対 import を許可",
      filename: `${roppohSrc}/root/index.tsx`,
      code: `import { ssgoi } from "../libs/ssgoi";`,
    },
    {
      name: "bare specifier は対象外",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `import { Button } from "@roppoh/shadcn/button";`,
    },
    {
      name: "src 外のファイル(テスト等)は対象外",
      filename: "/repo/apps/roppoh/test/unit/login.test.tsx",
      code: `import { helper } from "../helpers/render";`,
    },
    {
      name: "クエリサフィックス付きの同一境界内 import は許可",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `import LockIcon from "./assets/lock-icon.svg?react";`,
    },
  ],
  invalid: [
    {
      name: "ページ境界の外への相対 import は禁止",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `import { betterAuth } from "../../libs/better-auth";`,
      errors: [{ messageId: "escapeBoundary" }],
    },
    {
      name: "レイアウト境界の外への相対 import は禁止",
      filename: `${roppohSrc}/layouts/sidebar-layout/components/header.tsx`,
      code: `import { AuthenticatedLayout } from "../../authenticated-layout";`,
      errors: [{ messageId: "escapeBoundary" }],
    },
    {
      name: "src の外への相対 import は禁止",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `import { helper } from "../../../test/helpers/render";`,
      errors: [{ messageId: "escapeSrc" }],
    },
    {
      name: "export from も対象",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `export { betterAuth } from "../../libs/better-auth";`,
      errors: [{ messageId: "escapeBoundary" }],
    },
    {
      name: "neo-fujimatsu の src/client 配下でも検出できる",
      filename: "/repo/apps/neo-fujimatsu/src/client/pages/sign-in/page.tsx",
      code: `import { betterAuth } from "../../libs/better-auth";`,
      errors: [{ messageId: "escapeBoundary" }],
    },
  ],
});
