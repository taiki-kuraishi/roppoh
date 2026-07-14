import { DashboardBuilder, RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";

import { prometheusDatasourceRef } from "../datasources";
import { lokiLogs, lokiTimeseries, promTimeseries } from "../panels";
import { datasourceVariable } from "../variables";

/**
 * Discord-gateway-proxy (z390, Go) のログ + Go runtime メトリクス。
 *
 * internal/telemetry/telemetry.go を確認した結果、このアプリは
 * go.opentelemetry.io/contrib/instrumentation/runtime による Go
 * ランタイムメトリクス (goroutine数/GC/メモリ) のみを OTLP で送信しており、
 * 独自のビジネスメトリクスは無い。また otel.Tracer を使ったスパン生成箇所が
 * コード上に存在しないため、トレースは (バグではなく) 常に空。
 * このダッシュボードはログを中心に、参考として Go runtime メトリクスを添える。
 *
 * OTLP メトリクスは semconv v1.41.0 (go.goroutine.count 等、ドット区切り) で
 * 送信され、Alloy の otelcol.exporter.prometheus がドット→アンダースコア
 * 変換 + 単位サフィックス付与を行う (add_metric_suffixes 既定 true)。
 *
 * ラベルは service_name ではなく job になる点に注意: deployment.yaml の
 * OTEL_RESOURCE_ATTRIBUTES に service.namespace=discord を設定しているため、
 * otelcol.exporter.prometheus が job="discord/discord-gateway-proxy"
 * ({namespace}/{name} 形式) を生成し、単独の service_name ラベルは付与されない
 * (実機の Mimir で確認済み)。
 *
 * go.opentelemetry.io/contrib/instrumentation/runtime v0.69.0 が実際にエクス
 * ポートするメトリクスは go.memory.{used,limit,allocated,allocations,gc.goal},
 * go.goroutine.count, go.processor.limit, go.config.gogc の8種のみで、GC
 * 実行回数 (cycles) は含まれない (OTEL_GO_X_DEPRECATED_RUNTIME_METRICS=true
 * で有効化される非推奨セットにのみ runtime.go.gc.count として存在)。
 */
const JOB = 'job="discord/discord-gateway-proxy"';

const timeseries = (opts: {
  title: string;
  description: string;
  unit: string;
  expr: string;
  legend: string;
}) => promTimeseries({ ...opts, datasource: prometheusDatasourceRef });

export const discordGatewayProxyDashboard = new DashboardBuilder(
  "Applications / discord-gateway-proxy",
)
  .uid("roppoh-discord-gateway-proxy")
  .description(
    "discord-gateway-proxy (z390) のログと Go runtime メトリクス。ビジネスメトリクス/トレースは現状未計装",
  )
  .tags(["generated", "applications", "discord-gateway-proxy"])
  .readonly()
  .refresh("30s")
  .time({ from: "now-6h", to: "now" })
  .timezone("browser")
  .withVariable(datasourceVariable)

  .withRow(new RowBuilder("Logs"))
  .withPanel(
    lokiTimeseries({
      title: "Log volume",
      description: "ログ件数レート",
      unit: "short",
      legend: "logs",
      expr: `sum(count_over_time({namespace="discord-gateway-proxy"} [$__auto]))`,
    }),
  )
  .withPanel(
    lokiTimeseries({
      title: "Error/warn rate",
      description: "error/warn を含む行のレート (JSON レベルフィールドに依存しない行フィルタ)",
      unit: "short",
      legend: "matches",
      expr: `sum(count_over_time({namespace="discord-gateway-proxy"} |~ "(?i)error|warn" [$__auto]))`,
    }),
  )
  .withPanel(
    lokiLogs({
      title: "Recent logs",
      description: "直近のログ (OTel LogRecord 形式の JSON)",
      expr: '{namespace="discord-gateway-proxy"} | json',
    }),
  )
  .withPanel(
    lokiLogs({
      title: "Error logs",
      description: "error/warn を含むログ",
      expr: '{namespace="discord-gateway-proxy"} |~ "(?i)error|warn"',
    }),
  )

  .withRow(new RowBuilder("Go runtime (参考、単位サフィックスは要確認)"))
  .withPanel(
    timeseries({
      title: "Goroutines",
      description: "稼働中の goroutine 数 (go.goroutine.count)",
      unit: "short",
      legend: "goroutines",
      expr: `go_goroutine_count{${JOB}}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Memory used",
      description: "Go ランタイムが使用するメモリ (go.memory.used, 内訳: go_memory_type)",
      unit: "bytes",
      legend: "{{go_memory_type}}",
      expr: `go_memory_used_bytes{${JOB}}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Heap allocation rate",
      description:
        "ヒープアロケーションのレート (go.memory.allocated)。GC 実行回数 (cycles) 自体は" +
        " go.opentelemetry.io/contrib/instrumentation/runtime が現状エクスポートしないため、" +
        " GC 負荷の代理指標として用いる",
      unit: "Bps",
      legend: "allocated",
      expr: `rate(go_memory_allocated_bytes_total{${JOB}}[$__rate_interval])`,
    }),
  );
