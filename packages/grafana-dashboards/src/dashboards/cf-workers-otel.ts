import {
  DashboardBuilder,
  QueryVariableBuilder,
  RowBuilder,
  VariableRefresh,
  VariableSort,
} from "@grafana/grafana-foundation-sdk/dashboard";

import { lokiDatasourceRef } from "../datasources";
import { lokiLogs, lokiTimeseries, tempoSearch } from "../panels";

/**
 * Loki ストリームセレクタ。`service_name` ラベルは grafana-alloy の
 * otelcol.exporter.loki にラベルヒントを付与して生成している
 * (k8s/argocd/apps/grafana-alloy.yaml を参照)。$service は Worker 名。
 */
const SERVICE_SELECTOR = '{service_name=~"$service"}';

const serviceVariable = new QueryVariableBuilder("service")
  .label("Service")
  .datasource(lokiDatasourceRef)
  .query("label_values(service_name)")
  .refresh(VariableRefresh.OnTimeRangeChanged)
  .sort(VariableSort.AlphabeticalAsc)
  .multi(true)
  .includeAll(true);

export const cfWorkersOtelDashboard = new DashboardBuilder("Cloudflare Workers / Traces & Logs")
  .uid("roppoh-cf-workers")
  .description(
    "Cloudflare Workers の OTel トレース (Tempo) とログ (Loki)。service 変数で Worker を切り替え。",
  )
  .tags(["generated", "cloudflare", "otel"])
  .readonly()
  .refresh("30s")
  .time({ from: "now-1h", to: "now" })
  .timezone("browser")
  .withVariable(serviceVariable)

  .withRow(new RowBuilder("Traces (Tempo)"))
  .withPanel(
    tempoSearch({
      title: "Recent traces",
      description: "直近のトレース (TraceQL 検索)",
      traceql: '{ resource.service.name =~ "$service" }',
    }),
  )
  .withPanel(
    tempoSearch({
      title: "Error traces",
      description: "エラーステータスのトレース (intrinsic status)",
      traceql: '{ resource.service.name =~ "$service" && status = error }',
    }),
  )
  .withPanel(
    tempoSearch({
      title: "Slow traces (>500ms)",
      description: "500ms を超える遅いトレース (intrinsic duration)",
      traceql: '{ resource.service.name =~ "$service" && duration > 500ms }',
    }),
  )

  .withRow(new RowBuilder("Logs (Loki)"))
  .withPanel(
    lokiTimeseries({
      title: "Log volume",
      description: "service 別ログ件数レート",
      unit: "short",
      legend: "logs",
      expr: `sum(count_over_time(${SERVICE_SELECTOR} [$__auto]))`,
    }),
  )
  .withPanel(
    lokiTimeseries({
      title: "Error / warn rate",
      description: "error/warn/fatal を含む行のレート (行フィルタで level に非依存)",
      unit: "short",
      legend: "matches",
      expr: `sum(count_over_time(${SERVICE_SELECTOR} |~ "(?i)error|warn|fatal" [$__auto]))`,
    }),
  )
  .withPanel(
    lokiLogs({
      title: "Recent logs",
      description: "直近のログ (新しい順)",
      expr: SERVICE_SELECTOR,
    }),
  )
  .withPanel(
    lokiLogs({
      title: "Error logs",
      description: "error/fatal を含むログ",
      expr: `${SERVICE_SELECTOR} |~ "(?i)error|fatal"`,
    }),
  );
