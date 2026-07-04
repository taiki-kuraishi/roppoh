import { DashboardBuilder, RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";

import { prometheusDatasourceRef } from "../datasources";
import { promStat, promTimeseries } from "../panels";
import { datasourceVariable, nodeVariable } from "../variables";

/**
 * ホスト OS メトリクス (node_exporter 相当)。
 *
 * grafana-alloy の prometheus.exporter.unix "node" が両ノード (n100/z390) の
 * ホスト /proc /sys / を読み、job="node-exporter" ラベルで Mimir に送る
 * (k8s/argocd/apps/grafana-alloy.yaml を参照)。instance/node には
 * KUBE_NODE_NAME が明示されているため per-node の内訳が可能。
 */
const JOB = 'job="node-exporter"';

const stat = (opts: { title: string; description: string; unit: string; expr: string }) =>
  promStat({ ...opts, datasource: prometheusDatasourceRef });

const timeseries = (opts: {
  title: string;
  description: string;
  unit: string;
  expr: string;
  legend: string;
}) => promTimeseries({ ...opts, datasource: prometheusDatasourceRef });

const nodeVar = nodeVariable(JOB);

export const nodesHostDashboard = new DashboardBuilder("Nodes / Host OS")
  .uid("roppoh-nodes-host")
  .description(
    "node_exporter 相当 (prometheus.exporter.unix) によるホスト OS メトリクス (n100/z390)",
  )
  .tags(["generated", "nodes", "node-exporter"])
  .readonly()
  .refresh("30s")
  .time({ from: "now-6h", to: "now" })
  .timezone("browser")
  .withVariable(datasourceVariable)
  .withVariable(nodeVar)

  .withRow(new RowBuilder("Overview"))
  .withPanel(
    stat({
      title: "CPU busy",
      description: "idle 以外の CPU 時間の割合 (ノード平均)",
      unit: "percent",
      expr: `100 - (avg by (node) (rate(node_cpu_seconds_total{${JOB}, mode="idle", node=~"$node"}[$__rate_interval])) * 100)`,
    }),
  )
  .withPanel(
    stat({
      title: "Load average (1m)",
      description: "直近1分の load average",
      unit: "short",
      expr: `node_load1{${JOB}, node=~"$node"}`,
    }),
  )
  .withPanel(
    stat({
      title: "Memory used",
      description: "使用中メモリの割合 (1 - MemAvailable/MemTotal)",
      unit: "percent",
      expr: `100 * (1 - node_memory_MemAvailable_bytes{${JOB}, node=~"$node"} / node_memory_MemTotal_bytes{${JOB}, node=~"$node"})`,
    }),
  )
  .withPanel(
    stat({
      title: "Root filesystem used",
      description: "/ の使用率",
      unit: "percent",
      expr: `100 * (1 - node_filesystem_avail_bytes{${JOB}, node=~"$node", mountpoint="/"} / node_filesystem_size_bytes{${JOB}, node=~"$node", mountpoint="/"})`,
    }),
  )
  .withPanel(
    stat({
      title: "Uptime",
      description: "起動からの経過時間",
      unit: "s",
      expr: `time() - node_boot_time_seconds{${JOB}, node=~"$node"}`,
    }),
  )

  .withRow(new RowBuilder("CPU & Load"))
  .withPanel(
    timeseries({
      title: "CPU usage by mode",
      description: "モード別 CPU 使用率 (idle を除く)",
      unit: "percent",
      legend: "{{node}} / {{mode}}",
      expr: `sum by (node, mode) (rate(node_cpu_seconds_total{${JOB}, node=~"$node", mode!="idle"}[$__rate_interval])) * 100`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Load average (1m/5m/15m)",
      description: "ノード別 load average",
      unit: "short",
      legend: "{{node}} / 1m",
      expr: `node_load1{${JOB}, node=~"$node"}`,
    }),
  )

  .withRow(new RowBuilder("Memory"))
  .withPanel(
    timeseries({
      title: "Memory available",
      description: "利用可能メモリ (MemAvailable)",
      unit: "bytes",
      legend: "{{node}}",
      expr: `node_memory_MemAvailable_bytes{${JOB}, node=~"$node"}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Swap used",
      description: "Swap 使用量 (SwapTotal - SwapFree)",
      unit: "bytes",
      legend: "{{node}}",
      expr: `node_memory_SwapTotal_bytes{${JOB}, node=~"$node"} - node_memory_SwapFree_bytes{${JOB}, node=~"$node"}`,
    }),
  )

  .withRow(new RowBuilder("Disk"))
  .withPanel(
    timeseries({
      title: "Filesystem available",
      description: "マウントポイント別の空き容量",
      unit: "bytes",
      legend: "{{node}} / {{mountpoint}}",
      expr: `node_filesystem_avail_bytes{${JOB}, node=~"$node", fstype!=""}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Disk IO time",
      description: "デバイス別の I/O 時間比率 (busy 率)",
      unit: "percentunit",
      legend: "{{node}} / {{device}}",
      expr: `rate(node_disk_io_time_seconds_total{${JOB}, node=~"$node"}[$__rate_interval])`,
    }),
  )

  .withRow(new RowBuilder("Network"))
  .withPanel(
    timeseries({
      title: "Network received",
      description: "インターフェース別の受信レート (loopback を除く)",
      unit: "Bps",
      legend: "{{node}} / {{device}}",
      expr: `rate(node_network_receive_bytes_total{${JOB}, node=~"$node", device!="lo"}[$__rate_interval])`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Network transmitted",
      description: "インターフェース別の送信レート (loopback を除く)",
      unit: "Bps",
      legend: "{{node}} / {{device}}",
      expr: `rate(node_network_transmit_bytes_total{${JOB}, node=~"$node", device!="lo"}[$__rate_interval])`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Network errors",
      description: "受信/送信エラー数 (loopback を除く)",
      unit: "short",
      legend: "{{node}} / {{device}} / {{direction}}",
      expr: `label_replace(rate(node_network_receive_errs_total{${JOB}, node=~"$node", device!="lo"}[$__rate_interval]), "direction", "rx", "", "") or label_replace(rate(node_network_transmit_errs_total{${JOB}, node=~"$node", device!="lo"}[$__rate_interval]), "direction", "tx", "", "")`,
    }),
  );
