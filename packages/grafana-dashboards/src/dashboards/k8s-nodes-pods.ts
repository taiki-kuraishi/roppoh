import { DashboardBuilder, RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";

import { prometheusDatasourceRef } from "../datasources";
import { promStat, promTable, promTimeseries } from "../panels";
import { datasourceVariable, namespaceVariable, nodeVariable, queryVariable } from "../variables";

/**
 * Prometheus(cAdvisor)ジョブセレクタ。
 *
 * grafana-alloy の kubelet/cadvisor discovery.relabel は __meta_kubernetes_node_name
 * を instance/node へ明示的に書き込んでいる (k8s/argocd/apps/grafana-alloy.yaml、
 * 修正前は apiserver proxy 経由で __address__ が両ノードで同一になり node 別の
 * 内訳が取れなかった)。これにより namespace/pod/container だけでなく node 別の
 * 集計も可能。
 */
const CADVISOR = 'job="kubernetes-cadvisor"';

/** 実コンテナのみ (pause コンテナや cgroup 合算を除外) */
const REAL_CONTAINER = 'container!=""';

const stat = (opts: { title: string; description: string; unit: string; expr: string }) =>
  promStat({ ...opts, datasource: prometheusDatasourceRef });

const timeseries = (opts: {
  title: string;
  description: string;
  unit: string;
  expr: string;
  legend: string;
}) => promTimeseries({ ...opts, datasource: prometheusDatasourceRef });

const namespaceVar = namespaceVariable(`${CADVISOR}, ${REAL_CONTAINER}`);
const nodeVar = nodeVariable(CADVISOR);
const podVar = queryVariable({
  name: "pod",
  label: "Pod",
  query: `label_values(container_cpu_usage_seconds_total{${CADVISOR}, namespace=~"$namespace", node=~"$node"}, pod)`,
});

export const k8sNodesPodsDashboard = new DashboardBuilder("Kubernetes / Pods & Containers")
  .uid("roppoh-k8s-pods")
  .description(
    "cAdvisor + kubelet メトリクス (Mimir) による Pod / コンテナ / ノード単位のリソース可視化",
  )
  .tags(["generated", "kubernetes", "cadvisor"])
  .readonly()
  .refresh("30s")
  .time({ from: "now-6h", to: "now" })
  .timezone("browser")
  .withVariable(datasourceVariable)
  .withVariable(nodeVar)
  .withVariable(namespaceVar)
  .withVariable(podVar)

  .withRow(new RowBuilder("Cluster overview"))
  .withPanel(
    stat({
      title: "Namespaces",
      description: "メトリクスを出している namespace 数",
      unit: "short",
      expr: `count(count by (namespace) (container_cpu_usage_seconds_total{${CADVISOR}, ${REAL_CONTAINER}, node=~"$node"}))`,
    }),
  )
  .withPanel(
    stat({
      title: "Running pods",
      description: "稼働中の Pod 数 (cAdvisor が観測している実コンテナ持ち)",
      unit: "short",
      expr: `count(count by (namespace, pod) (container_cpu_usage_seconds_total{${CADVISOR}, ${REAL_CONTAINER}, node=~"$node"}))`,
    }),
  )
  .withPanel(
    stat({
      title: "Running containers",
      description: "稼働中のコンテナ数",
      unit: "short",
      expr: `count(count by (namespace, pod, container) (container_cpu_usage_seconds_total{${CADVISOR}, ${REAL_CONTAINER}, node=~"$node"}))`,
    }),
  )
  .withPanel(
    stat({
      title: "Cluster CPU (cores)",
      description: "選択ノードの CPU 使用量 (コア換算)",
      unit: "short",
      expr: `sum(rate(container_cpu_usage_seconds_total{${CADVISOR}, ${REAL_CONTAINER}, node=~"$node"}[$__rate_interval]))`,
    }),
  )
  .withPanel(
    stat({
      title: "Cluster memory (working set)",
      description: "選択ノードのメモリ working set",
      unit: "bytes",
      expr: `sum(container_memory_working_set_bytes{${CADVISOR}, ${REAL_CONTAINER}, node=~"$node"})`,
    }),
  )

  .withRow(new RowBuilder("By node"))
  .withPanel(
    timeseries({
      title: "CPU usage by node",
      description: "ノード別 CPU 使用量 (コア換算)。n100/z390 を区別できる",
      unit: "short",
      legend: "{{node}}",
      expr: `sum by (node) (rate(container_cpu_usage_seconds_total{${CADVISOR}, ${REAL_CONTAINER}, node=~"$node"}[$__rate_interval]))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Memory (working set) by node",
      description: "ノード別メモリ working set",
      unit: "bytes",
      legend: "{{node}}",
      expr: `sum by (node) (container_memory_working_set_bytes{${CADVISOR}, ${REAL_CONTAINER}, node=~"$node"})`,
    }),
  )

  .withRow(new RowBuilder("By namespace"))
  .withPanel(
    timeseries({
      title: "CPU usage by namespace",
      description: "namespace 別 CPU 使用量 (コア換算)",
      unit: "short",
      legend: "{{namespace}}",
      expr: `sum by (namespace) (rate(container_cpu_usage_seconds_total{${CADVISOR}, ${REAL_CONTAINER}, namespace=~"$namespace", node=~"$node"}[$__rate_interval]))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Memory (working set) by namespace",
      description: "namespace 別メモリ working set",
      unit: "bytes",
      legend: "{{namespace}}",
      expr: `sum by (namespace) (container_memory_working_set_bytes{${CADVISOR}, ${REAL_CONTAINER}, namespace=~"$namespace", node=~"$node"})`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Network received by namespace",
      description: "namespace 別ネットワーク受信レート",
      unit: "Bps",
      legend: "{{namespace}}",
      expr: `sum by (namespace) (rate(container_network_receive_bytes_total{${CADVISOR}, namespace=~"$namespace", node=~"$node"}[$__rate_interval]))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Network transmitted by namespace",
      description: "namespace 別ネットワーク送信レート",
      unit: "Bps",
      legend: "{{namespace}}",
      expr: `sum by (namespace) (rate(container_network_transmit_bytes_total{${CADVISOR}, namespace=~"$namespace", node=~"$node"}[$__rate_interval]))`,
    }),
  )

  .withRow(new RowBuilder("By pod"))
  .withPanel(
    timeseries({
      title: "Top pods by CPU",
      description: "CPU 使用量上位 15 Pod (コア換算)",
      unit: "short",
      legend: "{{namespace}}/{{pod}}",
      expr: `topk(15, sum by (namespace, pod) (rate(container_cpu_usage_seconds_total{${CADVISOR}, ${REAL_CONTAINER}, namespace=~"$namespace", pod=~"$pod", node=~"$node"}[$__rate_interval])))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Top pods by memory",
      description: "メモリ working set 上位 15 Pod",
      unit: "bytes",
      legend: "{{namespace}}/{{pod}}",
      expr: `topk(15, sum by (namespace, pod) (container_memory_working_set_bytes{${CADVISOR}, ${REAL_CONTAINER}, namespace=~"$namespace", pod=~"$pod", node=~"$node"}))`,
    }),
  )
  .withPanel(
    promTable({
      title: "Pod memory (current)",
      description: "現在のメモリ working set (Pod 単位スナップショット)",
      unit: "bytes",
      datasource: prometheusDatasourceRef,
      expr: `sum by (namespace, pod, node) (container_memory_working_set_bytes{${CADVISOR}, ${REAL_CONTAINER}, namespace=~"$namespace", pod=~"$pod", node=~"$node"})`,
    }),
  );
