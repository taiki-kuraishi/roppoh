# R2 Data Catalog スキーマ管理プラン(`.proto` + buf を真実の源にした codegen)

> ステータス: **設計提案(未実装)**。コードはまだ何も変更していない。
> ワイヤー形式は現状どおり **JSON**(Pipelines HTTP ingest は JSON 前提)。
> protobuf は**ワイヤーには流さない**。あくまで IDL(スキーマ定義言語)兼 SoT として使う。

## 0. 背景と確定事実(前回調査の要約)

```
discord-gateway-proxy (Go)              Cloudflare                 SELECT (未実装)
  records.go の struct  ──JSON POST──▶  Pipelines stream ──▶ sink ──▶ Iceberg table (R2 Data Catalog)
                                          │                              │
                                          └ schema.fields (Terraform)    └ REST catalog (iceberg-js/PyIceberg で参照可)
```

- INSERT は Go proxy が `internal/pipeline/records.go` の struct を **JSON** にして Pipelines へ POST。
- スキーマの真実の源(現状)は Terraform の `cloudflare_pipeline_stream.schema.fields`。
- SELECT 側は未実装。Python は不在(Go + TS + Terraform)。

### ドリフトしうる 3 者

1. Terraform の `pipeline_stream.schema.fields`(取り込み検証契約)
2. Go の struct(`records.go`)= プロデューサが送る形
3. Iceberg テーブルの列定義(sink が作成)+ 将来の SELECT アプリ

### 言語では解決しない Cloudflare 側の制約(再掲)

- Pipelines の stream schema は**作成後変更不可**。Terraform でも `pipeline_stream.schema` /
  `pipeline_sink` は **ForceNew**。sink は既存 Iceberg テーブルに繋げず、テーブル名再利用は
  [workers-sdk #11555](https://github.com/cloudflare/workers-sdk/issues/11555) に直撃。
- R2 Data Catalog / R2 SQL はいずれも **beta**。

→ 本プランは **3 者のドリフト(定義の不一致)を構造的に消す**もの。Pipelines の「スキーマ変更運用」の
制約は §7 で別途扱う。

---

## 1. なぜ JSON ではなく `.proto` + buf か(採用理由)

**protoc の言語プラグインが目的ではない。** 目的は次の 2 点で、これは手書き JSON/Zod では自前実装になる:

1. **フィールド番号による進化規律を言語仕様として強制できる。** protobuf のフィールド番号は
   Iceberg のフィールド ID と同じ「不変・使い回し禁止」の思想。削除は `reserved` で番号を封印でき、
   誤った再利用は**コンパイルエラー**になる。
2. **`buf` によるガバナンス。** `buf lint`(命名・構造の規約)と `buf breaking`(**破壊的変更の検知**)を
   CI に置くと、「型変更・番号再利用・required 化」などスキーマ進化を壊す PR を**マージ前に落とせる**。
   これは今回の主目的(ドリフト防止・進化の安全性)に直球で効く。

**codegen 方式の決定**: Go/TS の struct を protoc-gen-go / ts-proto に任せると、marshaling 規約
(protojson の camelCase、presence 挙動)が現状のワイヤーと微妙にズレる。よって本プランは

> **proto は SoT + buf ガバナンス専用。4 ターゲットへの生成は「FileDescriptorSet を読む単一の
> bun スクリプト」で行い、Go/TS の形は現状の `records.go` とワイヤーに bit 一致させる。**

これにより「proto の恩恵(番号規律 + buf breaking)」だけを取り、生成物の形は完全に自分で制御する。
(protoc-gen-go / ts-proto を使う派生案は §8 に併記。)

---

## 2. `.proto` 定義(現状 3 テーブルを表現)

### 2-1. カスタムオプション(`proto/roppoh/events/v1/options.proto`)

proto のスカラ型は Iceberg/Pipelines に 1:1 で対応しないため、**マッピング情報をオプションで持つ**。

```proto
syntax = "proto3";
package roppoh.events.v1;
import "google/protobuf/descriptor.proto";

extend google.protobuf.MessageOptions {
  // 同一形状メッセージを複数テーブルに束ねる。format: "<table>:<stream>"
  repeated string table = 50101;
  string namespace      = 50102;
}

extend google.protobuf.FieldOptions {
  // proto スカラが曖昧な場合の論理型。未指定なら proto 型から自動導出。
  //   values: "timestamp" | "string" | "long" | "boolean"
  string logical_type = 50201;
  // Pipelines stream の required を明示上書き(既定は「proto optional でない = required」)。
  optional bool pipelines_required = 50202;
}
```

### 2-2. スキーマ本体(`proto/roppoh/events/v1/discord.proto`)

`presence_update_events` と `guild_presence_snapshot_events` は同形なので、
**1 メッセージを repeated `table` オプションで 2 テーブルに束ねる**(DRY)。

```proto
syntax = "proto3";
package roppoh.events.v1;
import "roppoh/events/v1/options.proto";

// フィールド番号 = Iceberg フィールド ID。採番後は不変、削除時は reserved で封印。
message PresenceRecord {
  option (namespace) = "discord";
  option (table)     = "presence_update_events:presence_update";
  option (table)     = "guild_presence_snapshot_events:guild_presence_snapshot";

  string received_at         = 1 [(logical_type) = "timestamp"]; // required(optional でない)
  string guild_id            = 2;                                // required
  string user_id             = 3;                                // required
  optional string status           = 4;   // nullable → Go *string / Iceberg optional
  optional string client_desktop   = 5;
  optional string client_mobile    = 6;
  optional string client_web       = 7;
  optional string activity_name    = 8;
  optional int64  activity_type    = 9;   // 0 が有効値なので presence 必須 → optional
  optional string activity_state   = 10;
  optional string activity_details = 11;
}

message VoiceRecord {
  option (namespace) = "discord";
  option (table)     = "voice_state_update_events:voice_state_update";

  string received_at = 1 [(logical_type) = "timestamp"];
  string guild_id    = 2;
  string user_id     = 3;
  optional string session_id = 5;
  optional string channel_id = 4;
  // self_* / mute / deaf は現状「Go では非 pointer bool・stream では required:false」。
  // proto optional にすると Go が *bool になり現状とズレるため、非 optional bool のまま
  // pipelines_required=false で「非 pointer だが stream 非必須」を明示表現する。
  bool self_mute = 6 [(pipelines_required) = false];
  bool self_deaf = 7 [(pipelines_required) = false];
  bool mute      = 8 [(pipelines_required) = false];
  bool deaf      = 9 [(pipelines_required) = false];
}
```

### 2-3. 2 つの独立した意味を持つ「knob」の対応表

現状スキーマには **(A) stream の required** と **(B) NULL と 0 の区別(Go の pointer)** という
**別々の 2 軸**が混在している。proto では次のように写す:

| 現状の意図                       | proto 表現                                   | Go 生成       | Pipelines `required` | Iceberg  |
| -------------------------------- | -------------------------------------------- | ------------- | -------------------- | -------- |
| 必須(received_at 等)             | 非 optional スカラ                           | 非 pointer    | `true`               | required |
| nullable・NULL≠0(Activity\* 等)  | `optional`                                   | pointer(`*T`) | `false`              | optional |
| 非必須だが非 pointer(voice bool) | 非 optional + `[(pipelines_required)=false]` | 非 pointer    | `false`              | optional |

### 2-4. 論理型 → 各ターゲット型

| logical   | proto                               | Pipelines   | Iceberg     | Go                     | TS              |
| --------- | ----------------------------------- | ----------- | ----------- | ---------------------- | --------------- |
| timestamp | `string [logical_type="timestamp"]` | `timestamp` | `timestamp` | `string`(ISO8601)※§7-1 | `string`        |
| string    | `string`                            | `string`    | `string`    | `string`/`*string`     | `string`/`null` |
| long      | `int64`                             | `int64`     | `long`      | `int64`/`*int64`       | `number`        |
| boolean   | `bool`                              | `bool`      | `boolean`   | `bool`/`*bool`         | `boolean`       |

---

## 3. buf セットアップ

[ga5](https://github.com/taiki-kuraishi/ga5) の構成に倣い、**`proto/` と `buf.yaml` / `buf.gen.yaml` は
リポジトリルート**に置く(`packages/event-schemas/` には proto を置かない)。`packages/event-schemas` は
proto を「消費して生成物を出す側」のパッケージ(ga5 の `packages/tracking-event` に相当)として扱う。

```yaml
# buf.yaml (リポジトリルート)
version: v2
modules:
  - path: proto
lint:
  use: [STANDARD]
breaking:
  use: [FILE] # 破壊的変更検知の既定ルールセット
```

```yaml
# buf.gen.yaml (リポジトリルート) — 本プランは「単一 bun 生成器」方式なので protoc プラグインは使わず、
# FileDescriptorSet を出すだけ。ここは buf build で代替してもよい。
# (§8 のプラグイン派生案を採る場合のみ protoc-gen-go / ts-proto をここに列挙する)
```

CI(`mise run lint` / GitHub Actions)に組み込むコマンド(リポジトリルートで実行):

```bash
buf lint                                                    # 規約
buf breaking --against '.git#branch=main'                   # ★ 破壊的変更をマージ前に検知(主目的)
buf build -o packages/event-schemas/descriptorset.binpb     # 生成器の入力
```

buf 本体は **mise で pin**(`.claude/rules/conventions.md` に従い mise.toml に追加)。

### 3-1. CI: `proto-ci.yml`(ga5 の構成を移植)

ga5 は [`bufbuild/buf-action@v1`](https://github.com/bufbuild/buf-action) を使い、`pull_request`
イベントで `buf lint` / `buf format`(diff チェック)/ `buf breaking`(PR のベースブランチに対して)
を追加設定なしで自動実行している。`push`/`archive`(BSR へのアーカイブ)/BSR への push はいずれも
`pull_request` では既定で off になるため、BSR トークンは不要。

```yaml
# .github/workflows/proto-ci.yml
name: proto-ci

on:
  pull_request:
    paths:
      - "proto/**"
      - "buf.yaml"
      - "buf.gen.yaml"
      - ".github/workflows/proto-ci.yml"

permissions:
  contents: read
  pull-requests: write

jobs:
  proto:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v7
      - uses: bufbuild/buf-action@v1
```

- ワークフロー名・`paths` トリガー・`permissions`・`timeout-minutes: 5` は ga5 の
  `proto-ci.yml` をそのまま踏襲。`actions/checkout@v7` のみ本リポジトリの他ワークフロー
  (`bun-ci.yml` など)の pin に合わせている。
- `bufbuild/buf-action@v1` が担うのは **lint / format / breaking のみ**。生成物
  (`src/roppoh/events/v1/*.gen.*`)の同期チェック(§5-2)はカバーされない ―― ga5 自身も
  codegen(`buf generate`)は CI 化しておらず、`mise run proto:gen` のローカル実行のみで
  完結させている。§5-2 の drift check を CI 化する場合は `proto-ci.yml` に別ステップとして
  追加するか、`packages/event-schemas` を含む既存の bun 系ワークフローに乗せるかを別途決める。

---

## 4. 単一 codegen 生成器(`packages/event-schemas/src/gen.ts`, bun)

`descriptorset.binpb` を読み、カスタムオプションを解釈して 4 ターゲットを出力する。
descriptor の読み取りは `@bufbuild/protobuf`(protobuf-es のランタイム)等で行える。
生成物は ga5 の `packages/tracking-event/src/tracking_event/v1/` と同様、**proto のパッケージパスを
そのままミラーした `packages/event-schemas/src/roppoh/events/v1/` 配下**に出す(独立した `gen/` という
トップレベルフォルダは作らず、ファイル名の `.gen.` サフィックスで自動生成物と分かるようにする)。

```
(repo root)              buf build -o packages/event-schemas/descriptorset.binpb
(packages/event-schemas)  bun run ./src/gen.ts
      ├──▶ src/roppoh/events/v1/pipelines.tf.gen.json    Terraform が jsondecode で読む(stream/sink 用)
      ├──▶ src/roppoh/events/v1/iceberg-schema.gen.json  Iceberg フィールド ID スキーマ(SELECT/マイグレーション用)
      ├──▶ src/roppoh/events/v1/records.gen.go           Go プロデューサの struct(現状 records.go と bit 一致)
      └──▶ src/roppoh/events/v1/tables.gen.ts            SELECT 用 TS 型 + テーブル記述子
```

- `pipelines.tf.gen.json` の要素形(現状の手書きと一致させる):
  ```json
  {
    "stream": "presence_update",
    "table": "presence_update_events",
    "namespace": "discord",
    "fields": [
      { "name": "received_at", "type": "timestamp", "required": true },
      { "name": "status", "type": "string", "required": false }
    ]
  }
  ```
  ※ Pipelines はフィールド ID を取らないので `fields` に id は含めない。ID は Iceberg 側のみ。
- `iceberg-schema.gen.json` にはフィールド ID(= proto 番号)を含める。
- 生成器は先頭で **バリデーション**(§5)を実行し、不正なら非ゼロ終了。

---

## 5. ドリフト検知(3 層)

1. **破壊的変更(主柱・proto 採用の本命)**
   `buf breaking --against main` を CI 必須化。フィールド番号の再利用、型変更、
   required 化などを PR 時に自動で落とす。手書き JSON では validate.ts に自作していた規律を
   **標準ツールで代替**。
2. **生成物の同期**
   ```bash
   buf build -o packages/event-schemas/descriptorset.binpb   # リポジトリルートで実行(buf.yaml がルートにあるため)
   (cd packages/event-schemas && bun run ./src/gen.ts)
   git diff --exit-code   # .proto を変えたのに src/roppoh/events/v1/*.gen.* 再生成し忘れたら CI 失敗
   ```
3. **実カタログとの突き合わせ(保険・定期)**
   iceberg-js の `loadTable`(または PyIceberg)で R2 Data Catalog の実スキーマを取得し
   `src/roppoh/events/v1/iceberg-schema.gen.json` と照合。加えて Pipelines の `pipelinesUserErrorsAdaptiveGroups`
   (`missing_field`/`type_mismatch`)を監視し、取り込み時点の実害ドリフトを検知。

`buf lint` も追加規律として、命名規則(snake_case 列名など)を enforce する。

---

## 6. パッケージ構成(ga5 の `proto/` + `packages/tracking-event` 構成を踏襲)

ga5 は `proto/` と `buf.yaml` / `buf.gen.yaml` をリポジトリルートに置き、生成物は消費側パッケージ
(`packages/tracking-event`)の `src/` 配下に **proto のパッケージパスをそのままミラーして**
(`src/tracking_event/v1/tracking_event_pb.ts`)出力する。トップレベルの `gen/` フォルダは作らず、
生成ファイルはサフィックス(`_pb.ts` 等)で見分ける。本プランもこれに倣う。

```
(repo root)
proto/roppoh/events/v1/
  options.proto
  discord.proto           # ★ 人間が編集する唯一の SoT
buf.yaml                  # modules: [{ path: proto }]
buf.gen.yaml               # プラグイン派生案(§8)を採る場合のみ実質使用

packages/event-schemas/    # 既存 packages/better-auth-query の規約に合わせる
  package.json             # name "@roppoh/event-schemas", private
                           # scripts: proto:gen / lint / breaking / type-check
  tsconfig.json
  turbo.json               # extends ["//"], type-check タスクの inputs に src/**/*.gen.* を含める
                           # (codegen 自体は turbo タスク化せず、root の mise `proto:gen` タスクで実行)
  src/
    gen.ts                 # descriptorset → 生成物を出す単一生成器
    validate.ts            # buf breaking で拾えない意味検証(logical_type の妥当性等)
    index.ts               # ★ 手書き。tables.gen.ts / iceberg-schema.gen.json を型付き re-export
    roppoh/events/v1/      # ★ 自動生成・コミット対象・手編集禁止(proto path をミラー)
      pipelines.tf.gen.json
      iceberg-schema.gen.json
      records.gen.go
      tables.gen.ts
```

- `proto:gen` スクリプトは ga5 の `"proto:gen": "cd ../../ && buf generate"` と同様、
  リポジトリルートに `cd` してから `buf build -o packages/event-schemas/descriptorset.binpb` →
  `bun run src/gen.ts` を実行する(`buf.yaml` がルートにあるため)。
- root 側にも ga5 の `mise.toml`(`[tasks."proto:gen"] run = "buf generate"`)と同様の
  **mise タスク** `proto:gen`(`.mise-tasks/proto/gen`)を追加する。中身は
  `buf build -o packages/event-schemas/descriptorset.binpb && bun --cwd packages/event-schemas
run src/gen.ts`。turbo タスクではなく mise タスクにするのは、本リポジトリの
  `.claude/rules/conventions.md` が「全ツールは mise 管理」と定めており、ga5 自身も
  `proto:gen` を turbo ではなく mise タスクとして実装しているため。
- **workspace パッケージ追加**なので `.docker/playwright/Dockerfile` の COPY 行追従が必須
  (`.claude/rules/workspace-packages.md`)。
- 共有依存(`@bufbuild/protobuf` 等)は root `package.json` の `catalog` に集約。
- `mise.toml` に **buf**(ga5 は `buf = "latest"`)の tool pin を追加
  (`.claude/rules/conventions.md`:全ツールは mise 管理)。

---

## 7. スキーマ「変更」運用(Pipelines の不変制約への対応)

`.proto` を変えた後の適用フロー。**buf breaking がガードになる**点が JSON 方式との差分。

- **列追加(additive)**
  1. `discord.proto` に新番号でフィールド追加 → `buf breaking` を通す(追加は非破壊なので通る)
     → `bun run gen`。
  2. Iceberg テーブルへ iceberg-js/PyIceberg で先に列追加(後方互換、データ書換不要)。
  3. Pipelines 側: stream schema は不変なので `terraform apply` が stream/sink/pipeline を
     ForceNew で再作成 → **sink は既存テーブルに繋げず #11555 に直撃**。§7-2 の実測結論待ち。
  4. 当面の安全策: テーブル名に版番号(`..._v2`)を付け新旧並存 → SELECT を切替。
- **リネーム / 削除**
  proto では番号据え置きで `name` 変更 / 削除は `reserved` 封印。`buf breaking` が
  意図しない削除・番号再利用を検知。Pipelines 経由だと sink 再作成が絡むため計画的に。

### 未確定事項

1. **【timestamp の Go 型】** proto に timestamp スカラが無いため `string`(ISO8601)で表現する方針。
   現状 Go は `time.Time`。生成器で Go を `string` にするか、`time.Time` 相当のラッパーを吐くか、
   int64 epoch にするかを決める(ワイヤーは現状 RFC3339 文字列なので ISO8601 が無難)。producer の
   軽微な変更を伴う。
2. **【要実測】** sink 所有テーブルを iceberg-js/PyIceberg で列追加したとき、sink writer が
   進化後スキーマを尊重するか凍結スキーマで壊れるか(Cloudflare 未文書化)。**使い捨てバケットで実測**。
3. **【書き込み経路】** Pipelines マネージド sink を維持(§7 の作り直し運用を許容)するか、
   書き込みを自前化して無停止進化を取るか。
4. **【Terraform state】** `for_each` 化に伴う既存リソースの `state mv` or 再作成手順。
5. **【マイグレーション実行言語】** iceberg-js(TS 統一・低レベル)か PyIceberg(高レベルだが Python 導入)。
   SoT が proto なのでこの決定はランナー層のみに閉じる。

---

## 8. 派生案: protoc-gen-go / ts-proto を使う(単一生成器を採らない場合)

- `buf.gen.yaml` に `protoc-gen-go` と `ts-proto`(or `protobuf-es`)を並べ、Go/TS を既製生成。
  Cloudflare 固有の `pipelines.tf.gen.json` / `iceberg-schema.gen.json` のみ自作生成器で出す。
- 利点: Go/TS の生成コードを書かなくてよい。
- 難点(本プランが単一生成器を主案にした理由): protoc-gen-go の struct は protobuf 反射用フィールドを
  持ち、`encoding/json` と相性が悪い。JSON は `protojson.MarshalOptions{UseProtoNames:true,
EmitDefaultValues:true}` で snake_case・現状 presence 挙動に寄せられるが、marshaling 経路が
  現状の `encoding/json` から変わる。ワイヤーの bit 一致検証(Phase 1)がやや面倒になる。

---

## 9. 段階的な進め方

1. **Phase 0**: §7-2 を使い捨てバケットで実測 → §7 の運用が現実的か確定。
2. **Phase 1**: リポジトリルートに `proto/roppoh/events/v1/discord.proto` を書き、
   `packages/event-schemas` を作る。`buf lint`/`buf breaking` を通し、単一生成器で
   `pipelines.tf.gen.json` / `records.gen.go` を生成 →
   **現状の手書き Terraform / records.go と bit 一致することを検証**(まだ切替えない)。
3. **Phase 2**: Terraform を `for_each` + `jsondecode(pipelines.tf.gen.json)` に、Go を生成 struct に
   切替(state 移行込み)。CI に `buf breaking` / `git diff --exit-code` を追加。
4. **Phase 3**: SELECT アプリを `tables.gen.ts` の型 + R2 SQL REST で実装。実カタログ照合の
   ドリフト検知ジョブを追加。

```

```
