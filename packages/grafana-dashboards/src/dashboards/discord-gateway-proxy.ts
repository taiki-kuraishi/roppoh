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
 * 単位サフィックスの正確な形は実機の Grafana Explore で要確認。
 */
const SERVICE_NAME = 'service_name="discord-gateway-proxy"';

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
      expr: `go_goroutine_count{${SERVICE_NAME}}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Memory used",
      description: "Go ランタイムが使用するメモリ (go.memory.used)",
      unit: "bytes",
      legend: "memory",
      expr: `go_memory_used_bytes{${SERVICE_NAME}}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "GC cycles",
      description: "GC 実行回数のレート (go.memory.gc.cycles)",
      unit: "short",
      legend: "gc",
      expr: `rate(go_memory_gc_cycles_total{${SERVICE_NAME}}[$__rate_interval])`,
    }),
  );
