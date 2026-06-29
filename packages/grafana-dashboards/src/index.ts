import type { DashboardBuilder } from "@grafana/grafana-foundation-sdk/dashboard";

import { cfWorkersOtelDashboard } from "./dashboards/cf-workers-otel";
import { k8sNodesPodsDashboard } from "./dashboards/k8s-nodes-pods";

export interface DashboardEntry {
  /** 出力ファイル名 (`k8s/monitoring/dashboards/` 配下に生成) */
  filename: string;
  /** Foundation SDK の DashboardBuilder */
  builder: DashboardBuilder;
}

/**
 * 生成対象のダッシュボード一覧。
 * ここに追加すると `bun run build` で JSON が生成される。
 */
export const dashboards: DashboardEntry[] = [
  { filename: "k8s-nodes-pods.json", builder: k8sNodesPodsDashboard },
  { filename: "cf-workers-otel.json", builder: cfWorkersOtelDashboard },
];

export { cfWorkersOtelDashboard, k8sNodesPodsDashboard };
