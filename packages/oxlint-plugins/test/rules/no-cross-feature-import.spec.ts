import { describe, it } from "node:test";
import { RuleTester } from "oxlint/plugins-dev";

import rule from "../../src/rules/no-cross-feature-import.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const roppohSrc = "/repo/apps/roppoh/src";

new RuleTester().run("no-cross-feature-import", rule, {
  valid: [
    {
      name: "同一ページ内の components は相対 import できる",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `import { LoginButton } from "./components/login-button";`,
    },
    {
      name: "同一コンポーネント内のネストした components は import できる",
      filename: `${roppohSrc}/pages/login/components/form/index.tsx`,
      code: `import { Field } from "./components/field";`,
    },
    {
      name: "src/components は共有コンポーネントとしてどこからでも import できる",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `import { Header } from "@/components/header";`,
    },
    {
      name: "root/components はアプリ全体で共有できる",
      filename: `${roppohSrc}/layouts/sidebar-layout/index.tsx`,
      code: `import { useAuth } from "@/root/components/auth-provider";`,
    },
    {
      name: "他ページの components 以外のファイルは対象外",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `import { params } from "@/pages/consent/params";`,
    },
    {
      name: "bare specifier は対象外",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `import { Button } from "@roppoh/shadcn/button";`,
    },
    {
      name: "src 外のファイル(テスト等)は対象外",
      filename: "/repo/apps/roppoh/test/unit/login.test.tsx",
      code: `import { LoginButton } from "@/pages/login/components/login-button";`,
    },
  ],
  invalid: [
    {
      name: "他ページの components を alias で import できない",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `import { ConsentButton } from "@/pages/consent/components/consent-button";`,
      errors: [{ messageId: "crossFeature" }],
    },
    {
      name: "他ページの components を相対パスで import できない",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `import { ConsentButton } from "../consent/components/consent-button";`,
      errors: [{ messageId: "crossFeature" }],
    },
    {
      name: "兄弟コンポーネントのネストした components を import できない",
      filename: `${roppohSrc}/pages/account/components/delete-dialog/index.tsx`,
      code: `import { Form } from "../add-dialog/components/form";`,
      errors: [{ messageId: "crossFeature" }],
    },
    {
      name: "レイアウトの components をページから import できない",
      filename: `${roppohSrc}/pages/index/page.tsx`,
      code: `import { Header } from "@/layouts/sidebar-layout/components/header";`,
      errors: [{ messageId: "crossFeature" }],
    },
    {
      name: "export from も対象",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `export { ConsentButton } from "@/pages/consent/components/consent-button";`,
      errors: [{ messageId: "crossFeature" }],
    },
    {
      name: "dynamic import も対象",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `const mod = await import("@/pages/consent/components/consent-button");`,
      errors: [{ messageId: "crossFeature" }],
    },
    {
      name: "neo-fujimatsu の src/client 配下でも検出できる",
      filename: "/repo/apps/neo-fujimatsu/src/client/pages/sign-in/page.tsx",
      code: `import { Form } from "@/client/pages/account/components/form";`,
      errors: [{ messageId: "crossFeature" }],
    },
  ],
});
