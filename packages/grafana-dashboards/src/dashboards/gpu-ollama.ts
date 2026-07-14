import { DashboardBuilder, RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";

import { prometheusDatasourceRef } from "../datasources";
import { promStat, promTimeseries } from "../panels";
import { datasourceVariable } from "../variables";

/**
 * Z390 (nvidia.com/gpu=true) の GPU メトリクス (DCGM-exporter) + Ollama コンテナの
 * CPU/メモリ (cAdvisor)。
 *
 * DCGM のメトリクス名は dcgm-exporter Helm chart の values.yaml
 * customMetrics コメントブロックに列挙されている標準名 (chart version 4.8.2)。
 * job="dcgm-exporter" / job="kubernetes-cadvisor" は grafana-alloy.yaml で
 * 付与している。GPU は現在 z390 に 1 枚のみ (gpu="0")。
 */
const DCGM = 'job="dcgm-exporter"';
const CADVISOR_OLLAMA = 'job="kubernetes-cadvisor", namespace="ollama", container!=""';

const stat = (opts: { title: string; description: string; unit: string; expr: string }) =>
  promStat({ ...opts, datasource: prometheusDatasourceRef });

const timeseries = (opts: {
  title: string;
  description: string;
  unit: string;
  expr: string;
  legend: string;
}) => promTimeseries({ ...opts, datasource: prometheusDatasourceRef });

export const gpuOllamaDashboard = new DashboardBuilder("GPU / Ollama (z390)")
  .uid("roppoh-gpu-ollama")
  .description(
    "z390 の GPU 使用率/VRAM/温度/電力 (DCGM-exporter) と Ollama コンテナのリソース使用状況",
  )
  .tags(["generated", "gpu", "ollama", "dcgm"])
  .readonly()
  .refresh("15s")
  .time({ from: "now-6h", to: "now" })
  .timezone("browser")
  .withVariable(datasourceVariable)

  .withRow(new RowBuilder("GPU overview"))
  .withPanel(
    stat({
      title: "GPU utilization",
      description: "GPU コア使用率",
      unit: "percent",
      expr: `DCGM_FI_DEV_GPU_UTIL{${DCGM}}`,
    }),
  )
  .withPanel(
    stat({
      title: "VRAM used",
      description: "フレームバッファ使用量",
      unit: "decmbytes",
      expr: `DCGM_FI_DEV_FB_USED{${DCGM}}`,
    }),
  )
  .withPanel(
    stat({
      title: "GPU temperature",
      description: "GPU 温度",
      unit: "celsius",
      expr: `DCGM_FI_DEV_GPU_TEMP{${DCGM}}`,
    }),
  )
  .withPanel(
    stat({
      title: "Power usage",
      description: "消費電力",
      unit: "watt",
      expr: `DCGM_FI_DEV_POWER_USAGE{${DCGM}}`,
    }),
  )

  .withRow(new RowBuilder("GPU detail"))
  .withPanel(
    timeseries({
      title: "GPU / memory-copy utilization",
      description: "GPU コアおよびメモリコピーの使用率",
      unit: "percent",
      legend: "{{gpu}} / util",
      expr: `DCGM_FI_DEV_GPU_UTIL{${DCGM}}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "VRAM used / free",
      description: "フレームバッファの使用量/空き",
      unit: "decmbytes",
      legend: "{{gpu}} / used",
      expr: `DCGM_FI_DEV_FB_USED{${DCGM}}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Clocks (SM / memory)",
      description: "SM クロック / メモリクロック",
      unit: "short",
      legend: "{{gpu}} / sm",
      expr: `DCGM_FI_DEV_SM_CLOCK{${DCGM}}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Power usage",
      description: "消費電力の時系列",
      unit: "watt",
      legend: "{{gpu}}",
      expr: `DCGM_FI_DEV_POWER_USAGE{${DCGM}}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Encoder / decoder utilization",
      description: "NVENC/NVDEC 使用率",
      unit: "percent",
      legend: "{{gpu}} / enc",
      expr: `DCGM_FI_DEV_ENC_UTIL{${DCGM}}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "PCIe replay errors",
      description:
        "PCIe リプレイ回数の累積 (GPU-ホスト間通信エラーの異常を示す)。" +
        " DCGM_FI_DEV_XID_ERRORS はこの dcgm-exporter 構成では収集されない" +
        " (コンシューマ向け GeForce では NVML 経由の XID フィールド自体が非対応) ため代替",
      unit: "short",
      legend: "{{gpu}}",
      expr: `DCGM_FI_DEV_PCIE_REPLAY_COUNTER{${DCGM}}`,
    }),
  )

  .withRow(new RowBuilder("Ollama container"))
  .withPanel(
    timeseries({
      title: "Ollama CPU usage",
      description: "ollama コンテナの CPU 使用量 (コア換算)",
      unit: "short",
      legend: "{{pod}}/{{container}}",
      expr: `sum by (pod, container) (rate(container_cpu_usage_seconds_total{${CADVISOR_OLLAMA}}[$__rate_interval]))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Ollama memory (working set)",
      description: "ollama コンテナのメモリ working set (モデルロード時に増加)",
      unit: "bytes",
      legend: "{{pod}}/{{container}}",
      expr: `sum by (pod, container) (container_memory_working_set_bytes{${CADVISOR_OLLAMA}})`,
    }),
  );
