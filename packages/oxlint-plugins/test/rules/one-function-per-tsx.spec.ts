import { describe, it } from "node:test";
import { RuleTester } from "oxlint/plugins-dev";

import rule from "../../src/rules/one-function-per-tsx.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const roppohSrc = "/repo/apps/roppoh/src";

new RuleTester().run("one-function-per-tsx", rule, {
  valid: [
    {
      name: "関数0個(JSX データ定数のみ)は許可",
      filename: `${roppohSrc}/layouts/sidebar-layout/components/sidebar-static-content/constant.tsx`,
      code: `export const sidebarContentList = [{ icon: <span>home</span>, label: "Home" }];`,
    },
    {
      name: "単一のコンポーネント + 定数は許可",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `const TITLE = "login";
export const LoginTitle = () => <h1>{TITLE}</h1>;`,
    },
    {
      name: "匿名 export default function は許可",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `export default function () {
  return <div />;
}`,
    },
    {
      name: "1関数 + lazy() 参照の定数は許可(page.tsx パターン)",
      filename: `${roppohSrc}/pages/user/page.tsx`,
      code: `import { lazy } from "react";
const CreateDialog = lazy(async () =>
  import("./components/create-dialog").then((m) => ({ default: m.CreateDialog })),
);
const DetailDialog = lazy(async () =>
  import("./components/detail-dialog").then((m) => ({ default: m.DetailDialog })),
);
export default function () {
  return (
    <div>
      <CreateDialog />
      <DetailDialog />
    </div>
  );
}`,
    },
    {
      name: "カリー化されたアロー関数は1関数として数える",
      filename: `${roppohSrc}/components/with-label.tsx`,
      code: `export const withLabel = (label: string) => (value: string) => (
  <span>
    {label}: {value}
  </span>
);`,
    },
    {
      name: "単一関数の内部のネスト関数は数えない",
      filename: `${roppohSrc}/pages/login/components/login-button.tsx`,
      code: `export const LoginButton = () => {
  const handleClick = () => {
    globalThis.console.log("click");
  };
  return <button onClick={handleClick} type="button" />;
};`,
    },
    {
      name: ".tsx 以外のファイルは対象外",
      filename: `${roppohSrc}/router.ts`,
      code: `const first = () => 1;
const second = () => 2;
export { first, second };`,
    },
  ],
  invalid: [
    {
      name: "const アロー関数2つは禁止",
      filename: `${roppohSrc}/pages/login/components/content.tsx`,
      code: `const First = () => <div />;
export const Second = () => <First />;`,
      errors: [{ messageId: "multipleFunctions" }],
    },
    {
      name: "function 宣言2つは禁止",
      filename: `${roppohSrc}/pages/login/components/content.tsx`,
      code: `function First() {
  return <div />;
}
export function Second() {
  return <First />;
}`,
      errors: [{ messageId: "multipleFunctions" }],
    },
    {
      name: "コンポーネント + ヘルパー関数の混在は禁止",
      filename: `${roppohSrc}/pages/login/components/content.tsx`,
      code: `const formatLabel = (value: string) => value.trim();
export const Label = ({ value }: { value: string }) => <span>{formatLabel(value)}</span>;`,
      errors: [{ messageId: "multipleFunctions" }],
    },
    {
      name: "複数行ジェネリクスアローを含む2関数は禁止(router パターン)",
      filename: `${roppohSrc}/router.tsx`,
      code: `const lazyDefault = (importFn: () => Promise<{ default: unknown }>) => async () => {
  const module = await importFn();
  return module.default;
};
const lazyNamed =
  <K extends string>(importFn: () => Promise<Record<K, unknown>>, name: K) =>
  async () => {
    const module = await importFn();
    return module[name];
  };
export { lazyDefault, lazyNamed };`,
      errors: [{ messageId: "multipleFunctions" }],
    },
    {
      name: "export default function + const アローは禁止",
      filename: `${roppohSrc}/pages/login/page.tsx`,
      code: `const Inner = () => <div />;
export default function () {
  return <Inner />;
}`,
      errors: [{ messageId: "multipleFunctions" }],
    },
    {
      name: "3関数なら2件報告される",
      filename: `${roppohSrc}/pages/login/components/content.tsx`,
      code: `const First = () => <div />;
const Second = () => <First />;
export const Third = () => <Second />;`,
      errors: [{ messageId: "multipleFunctions" }, { messageId: "multipleFunctions" }],
    },
  ],
});
