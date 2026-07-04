import { DashboardBuilder, RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";

import { prometheusDatasourceRef } from "../datasources";
import { lokiLogs, promStat, promTimeseries } from "../panels";
import { datasourceVariable } from "../variables";

/**
 * 可観測性パイプライン自身の健全性 (self-monitoring)。
 *
 * Phase 1 で Mimir remote_write の URL 誤りにより起動以来メトリクスが
 * 0 件だったことが判明したが、self-monitoring があれば即座に検知できたはず。
 * Alloy (job="alloy") と Grafana (job="grafana") は grafana-alloy.yaml で
 * 明示的にスクレイプしている。Mimir/Loki/Tempo は複数コンポーネントに
 * 分かれておりメトリクス self-scrape は今回スコープ外 (フォローアップ課題、
 * ログのみここでカバー)。
 */
const ALLOY = 'job="alloy"';
const GRAFANA = 'job="grafana"';

const stat = (opts: { title: string; description: string; unit: string; expr: string }) =>
  promStat({ ...opts, datasource: prometheusDatasourceRef });

const timeseries = (opts: {
  title: string;
  description: string;
  unit: string;
  expr: string;
  legend: string;
}) => promTimeseries({ ...opts, datasource: prometheusDatasourceRef });

export const observabilityStackDashboard = new DashboardBuilder("Monitoring / Observability stack")
  .uid("roppoh-observability-stack")
  .description(
    "可観測性パイプライン自身 (Alloy/Grafana) の健全性。Mimir/Loki/Tempo のメトリクス self-scrape はフォローアップ課題",
  )
  .tags(["generated", "monitoring", "self-monitoring"])
  .readonly()
  .refresh("30s")
  .time({ from: "now-6h", to: "now" })
  .timezone("browser")
  .withVariable(datasourceVariable)

  .withRow(new RowBuilder("Alloy"))
  .withPanel(
    stat({
      title: "Alloy up",
      description: "self-scrape ターゲットの生存 (1=up)",
      unit: "short",
      expr: `up{${ALLOY}}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Alloy component evaluation",
      description: "コンポーネント評価の所要時間 (p99)",
      unit: "s",
      legend: "{{node}}",
      expr: `histogram_quantile(0.99, sum by (node, le) (rate(alloy_component_evaluation_seconds_bucket{${ALLOY}}[$__rate_interval])))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Alloy Prometheus remote_write failures",
      description:
        "remote_write の失敗サンプル数 (増加していれば push 先が壊れている可能性、Phase 1 で見つかった404はこれで検知できたはず)",
      unit: "short",
      legend: "{{node}} / {{reason}}",
      expr: `sum by (node, reason) (rate(prometheus_remote_storage_samples_failed_total{${ALLOY}}[$__rate_interval]))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Alloy Loki send failures",
      description: "Loki への書き込み失敗数",
      unit: "short",
      legend: "{{node}}",
      expr: `sum by (node) (rate(loki_write_dropped_bytes_total{${ALLOY}}[$__rate_interval]))`,
    }),
  )

  .withRow(new RowBuilder("Grafana"))
  .withPanel(
    stat({
      title: "Grafana up",
      description: "self-scrape ターゲットの生存 (1=up)",
      unit: "short",
      expr: `up{${GRAFANA}}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Grafana HTTP request duration (p99)",
      description: "Grafana API/UI のリクエスト所要時間",
      unit: "s",
      legend: "{{handler}}",
      expr: `histogram_quantile(0.99, sum by (handler, le) (rate(grafana_http_request_duration_seconds_bucket{${GRAFANA}}[$__rate_interval])))`,
    }),
  )

  .withRow(new RowBuilder("Logs (Mimir / Loki / Tempo)"))
  .withPanel(
    lokiLogs({
      title: "Mimir error logs",
      description: "grafana-mimir-* 全コンポーネントの error ログ",
      expr: '{namespace="monitoring", pod=~"grafana-mimir-.*"} |~ "(?i)error"',
    }),
  )
  .withPanel(
    lokiLogs({
      title: "Loki / Tempo error logs",
      description: "grafana-loki / grafana-tempo の error ログ",
      expr: '{namespace="monitoring", pod=~"grafana-loki-.*|grafana-tempo-.*"} |~ "(?i)error"',
    }),
  );
