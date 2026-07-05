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
 *
 * 電力 (node_rapl_*_joules_total) は追加設定不要で両ノードから既に取得できている
 * (Intel RAPL, /sys/class/powercap 経由)。GPU 電力は dcgm-exporter 側
 * (DCGM_FI_DEV_POWER_USAGE) で gpu-ollama ダッシュボードに既にある。
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
  .withPanel(
    stat({
      title: "CPU power (package)",
      description: "Intel RAPL package ドメインの平均消費電力",
      unit: "watt",
      expr: `rate(node_rapl_package_joules_total{${JOB}, node=~"$node"}[$__rate_interval])`,
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

  .withRow(new RowBuilder("Power"))
  .withPanel(
    timeseries({
      title: "CPU power by RAPL domain",
      description:
        "Intel RAPL ドメイン別の消費電力 (package = CPU パッケージ全体、core/dram/uncore は内訳。" +
        "内訳ドメインは CPU 世代により有無が異なる)",
      unit: "watt",
      legend: "{{node}} / {{domain}}",
      expr: `label_replace(rate(node_rapl_package_joules_total{${JOB}, node=~"$node"}[$__rate_interval]), "domain", "package", "", "")
        or label_replace(rate(node_rapl_core_joules_total{${JOB}, node=~"$node"}[$__rate_interval]), "domain", "core", "", "")
        or label_replace(rate(node_rapl_dram_joules_total{${JOB}, node=~"$node"}[$__rate_interval]), "domain", "dram", "", "")
        or label_replace(rate(node_rapl_uncore_joules_total{${JOB}, node=~"$node"}[$__rate_interval]), "domain", "uncore", "", "")`,
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
