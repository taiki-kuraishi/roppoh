---
paths:
  - "packages/oxlint-plugins/src/rules/**/*.ts"
---

# oxlint-plugins ルール実装規約

`packages/oxlint-plugins/src/rules/` に oxlint カスタムルール(`roppoh/*`)を追加・変更する際の規約。

## message / description は英語

`meta.docs.description` と `meta.messages` の文言(値)は **英語** で書く。oxlint の
lint 出力はユーザーに直接表示されるため、他の oxlint 標準ルールと表記を揃える。
`messageId` のキー名(`dirCase` など)は英語のままで変更不要。

```typescript
// ✅
docs: {
  description: "Enforce kebab-case directory names and the pages/<name>/page.tsx directory structure",
},
messages: {
  dirCase: "Directory name '{{segment}}' must be kebab-case.",
},
```

```typescript
// ❌ 日本語の description / message
docs: { description: "ディレクトリ名の kebab-case を強制する" },
```

## ルール定義に TSDoc を付ける(日本語)

`const rule = { ... } satisfies Rule;` の直前に、以下 3 点を含む TSDoc コメントを
**日本語** で付ける。

- タイトル: ルールが何を強制する規約か一言で
- 内容: 何を検査して、いつ報告するか
- 目的: なぜこの規約が必要か(どんな問題を防ぐか)

```typescript
/**
 * ディレクトリ構造規約(kebab-case / pages)
 *
 * 内容: ディレクトリ名が kebab-case であること、および pages/ 配下が
 * pages/<name>/page.tsx という構造になっていることを検査する。
 *
 * 目的: neo-fujimatsu のページ解決規約を機械的に強制し、命名・配置の
 * ばらつきを防ぐ。
 */
const rule = {
  // ...
} satisfies Rule;
```

## 検証

ルールを変更したら:

```bash
bun run --filter @roppoh/oxlint-plugins test
```

## Related Documentation

- `.claude/rules/react-components.md` — これらのルールが `apps/**/*.tsx` に対して
  何を強制しているか(利用側の規約)
- `.claude/rules/packages.md` — `packages/**` 共通ルール
