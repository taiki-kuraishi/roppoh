import {
  DashboardBuilder,
  DatasourceVariableBuilder,
  QueryVariableBuilder,
  RowBuilder,
  VariableRefresh,
  VariableSort,
} from "@grafana/grafana-foundation-sdk/dashboard";
import {
  DataqueryBuilder as PrometheusQuery,
  PromQueryFormat,
} from "@grafana/grafana-foundation-sdk/prometheus";
import { PanelBuilder as StatPanel } from "@grafana/grafana-foundation-sdk/stat";
import { PanelBuilder as TablePanel } from "@grafana/grafana-foundation-sdk/table";
import { PanelBuilder as TimeSeriesPanel } from "@grafana/grafana-foundation-sdk/timeseries";

import { DATASOURCE_UID, DATASOURCE_VARIABLE, prometheusDatasourceRef } from "../datasources";

/**
 * Prometheus(cAdvisor)ジョブセレクタ。
 *
 * 注意: grafana-alloy のスクレイプ設定は `node` ラベルを付与していない
 * (全ノードが apiserver proxy 経由で instance が同一になる) ため、
 * このダッシュボードは node ラベルに依存せず namespace / pod / container で
 * 集計する。ノード別の内訳が必要になったら Alloy 側の relabel で
 * `__meta_kubernetes_node_name` -> `node` を付与する必要がある。
 */
const CADVISOR = 'job="kubernetes-cadvisor"';

/** 実コンテナのみ (pause コンテナや cgroup 合算を除外) */
const REAL_CONTAINER = 'container!=""';

const promTarget = (expr: string, legend?: string) => {
  const target = new PrometheusQuery().datasource(prometheusDatasourceRef).expr(expr).refId("A");
  return legend === undefined ? target : target.legendFormat(legend);
};

const stat = (opts: { title: string; description: string; unit: string; expr: string }) =>
  new StatPanel()
    .title(opts.title)
    .description(opts.description)
    .datasource(prometheusDatasourceRef)
    .unit(opts.unit)
    .withTarget(promTarget(opts.expr));

const timeseries = (opts: {
  title: string;
  description: string;
  unit: string;
  expr: string;
  legend: string;
}) =>
  new TimeSeriesPanel()
    .title(opts.title)
    .description(opts.description)
    .datasource(prometheusDatasourceRef)
    .unit(opts.unit)
    .fillOpacity(10)
    .withTarget(promTarget(opts.expr, opts.legend));

const datasourceVariable = new DatasourceVariableBuilder(DATASOURCE_VARIABLE)
  .label("Data source")
  .type("prometheus")
  .current({ text: "Mimir", value: DATASOURCE_UID.mimir, selected: true });

const namespaceVariable = new QueryVariableBuilder("namespace")
  .label("Namespace")
  .datasource(prometheusDatasourceRef)
  .query(`label_values(container_cpu_usage_seconds_total{${CADVISOR}}, namespace)`)
  .refresh(VariableRefresh.OnTimeRangeChanged)
  .sort(VariableSort.AlphabeticalAsc)
  .multi(true)
  .includeAll(true);

const podVariable = new QueryVariableBuilder("pod")
  .label("Pod")
  .datasource(prometheusDatasourceRef)
  .query(
    `label_values(container_cpu_usage_seconds_total{${CADVISOR}, namespace=~"$namespace"}, pod)`,
  )
  .refresh(VariableRefresh.OnTimeRangeChanged)
  .sort(VariableSort.AlphabeticalAsc)
  .multi(true)
  .includeAll(true);

export const k8sNodesPodsDashboard = new DashboardBuilder("Kubernetes / Pods & Containers")
  .uid("roppoh-k8s-pods")
  .description("cAdvisor + kubelet メトリクス (Mimir) による Pod / コンテナ単位のリソース可視化")
  .tags(["generated", "kubernetes", "cadvisor"])
  .readonly()
  .refresh("30s")
  .time({ from: "now-6h", to: "now" })
  .timezone("browser")
  .withVariable(datasourceVariable)
  .withVariable(namespaceVariable)
  .withVariable(podVariable)

  .withRow(new RowBuilder("Cluster overview"))
  .withPanel(
    stat({
      title: "Namespaces",
      description: "メトリクスを出している namespace 数",
      unit: "short",
      expr: `count(count by (namespace) (container_cpu_usage_seconds_total{${CADVISOR}, ${REAL_CONTAINER}}))`,
    }),
  )
  .withPanel(
    stat({
      title: "Running pods",
      description: "稼働中の Pod 数 (cAdvisor が観測している実コンテナ持ち)",
      unit: "short",
      expr: `count(count by (namespace, pod) (container_cpu_usage_seconds_total{${CADVISOR}, ${REAL_CONTAINER}}))`,
    }),
  )
  .withPanel(
    stat({
      title: "Running containers",
      description: "稼働中のコンテナ数",
      unit: "short",
      expr: `count(count by (namespace, pod, container) (container_cpu_usage_seconds_total{${CADVISOR}, ${REAL_CONTAINER}}))`,
    }),
  )
  .withPanel(
    stat({
      title: "Cluster CPU (cores)",
      description: "クラスタ全体の CPU 使用量 (コア換算)",
      unit: "short",
      expr: `sum(rate(container_cpu_usage_seconds_total{${CADVISOR}, ${REAL_CONTAINER}}[$__rate_interval]))`,
    }),
  )
  .withPanel(
    stat({
      title: "Cluster memory (working set)",
      description: "クラスタ全体のメモリ working set",
      unit: "bytes",
      expr: `sum(container_memory_working_set_bytes{${CADVISOR}, ${REAL_CONTAINER}})`,
    }),
  )

  .withRow(new RowBuilder("By namespace"))
  .withPanel(
    timeseries({
      title: "CPU usage by namespace",
      description: "namespace 別 CPU 使用量 (コア換算)",
      unit: "short",
      legend: "{{namespace}}",
      expr: `sum by (namespace) (rate(container_cpu_usage_seconds_total{${CADVISOR}, ${REAL_CONTAINER}, namespace=~"$namespace"}[$__rate_interval]))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Memory (working set) by namespace",
      description: "namespace 別メモリ working set",
      unit: "bytes",
      legend: "{{namespace}}",
      expr: `sum by (namespace) (container_memory_working_set_bytes{${CADVISOR}, ${REAL_CONTAINER}, namespace=~"$namespace"})`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Network received by namespace",
      description: "namespace 別ネットワーク受信レート",
      unit: "Bps",
      legend: "{{namespace}}",
      expr: `sum by (namespace) (rate(container_network_receive_bytes_total{${CADVISOR}, namespace=~"$namespace"}[$__rate_interval]))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Network transmitted by namespace",
      description: "namespace 別ネットワーク送信レート",
      unit: "Bps",
      legend: "{{namespace}}",
      expr: `sum by (namespace) (rate(container_network_transmit_bytes_total{${CADVISOR}, namespace=~"$namespace"}[$__rate_interval]))`,
    }),
  )

  .withRow(new RowBuilder("By pod"))
  .withPanel(
    timeseries({
      title: "Top pods by CPU",
      description: "CPU 使用量上位 15 Pod (コア換算)",
      unit: "short",
      legend: "{{namespace}}/{{pod}}",
      expr: `topk(15, sum by (namespace, pod) (rate(container_cpu_usage_seconds_total{${CADVISOR}, ${REAL_CONTAINER}, namespace=~"$namespace", pod=~"$pod"}[$__rate_interval])))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Top pods by memory",
      description: "メモリ working set 上位 15 Pod",
      unit: "bytes",
      legend: "{{namespace}}/{{pod}}",
      expr: `topk(15, sum by (namespace, pod) (container_memory_working_set_bytes{${CADVISOR}, ${REAL_CONTAINER}, namespace=~"$namespace", pod=~"$pod"}))`,
    }),
  )
  .withPanel(
    new TablePanel()
      .title("Pod memory (current)")
      .description("現在のメモリ working set (Pod 単位スナップショット)")
      .datasource(prometheusDatasourceRef)
      .unit("bytes")
      .withTarget(
        new PrometheusQuery()
          .datasource(prometheusDatasourceRef)
          .expr(
            `sum by (namespace, pod) (container_memory_working_set_bytes{${CADVISOR}, ${REAL_CONTAINER}, namespace=~"$namespace", pod=~"$pod"})`,
          )
          .refId("A")
          .format(PromQueryFormat.Table)
          .instant(),
      ),
  );
