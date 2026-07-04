import type { DashboardBuilder } from "@grafana/grafana-foundation-sdk/dashboard";

import { argocdGitopsDashboard } from "./dashboards/argocd-gitops";
import { cfWorkersOtelDashboard } from "./dashboards/cf-workers-otel";
import { discordGatewayProxyDashboard } from "./dashboards/discord-gateway-proxy";
import { gpuOllamaDashboard } from "./dashboards/gpu-ollama";
import { k8sClusterWorkloadsDashboard } from "./dashboards/k8s-cluster-workloads";
import { k8sNodesPodsDashboard } from "./dashboards/k8s-nodes-pods";
import { logsAllContainersDashboard } from "./dashboards/logs-all-containers";
import { nodesHostDashboard } from "./dashboards/nodes-host";
import { observabilityStackDashboard } from "./dashboards/observability-stack";
import { traefikIngressDashboard } from "./dashboards/traefik-ingress";

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
  { filename: "nodes-host.json", builder: nodesHostDashboard },
  { filename: "gpu-ollama.json", builder: gpuOllamaDashboard },
  { filename: "k8s-cluster-workloads.json", builder: k8sClusterWorkloadsDashboard },
  { filename: "k8s-nodes-pods.json", builder: k8sNodesPodsDashboard },
  { filename: "logs-all-containers.json", builder: logsAllContainersDashboard },
  { filename: "traefik-ingress.json", builder: traefikIngressDashboard },
  { filename: "argocd-gitops.json", builder: argocdGitopsDashboard },
  { filename: "discord-gateway-proxy.json", builder: discordGatewayProxyDashboard },
  { filename: "observability-stack.json", builder: observabilityStackDashboard },
  { filename: "cf-workers-otel.json", builder: cfWorkersOtelDashboard },
];

export {
  argocdGitopsDashboard,
  cfWorkersOtelDashboard,
  discordGatewayProxyDashboard,
  gpuOllamaDashboard,
  k8sClusterWorkloadsDashboard,
  k8sNodesPodsDashboard,
  logsAllContainersDashboard,
  nodesHostDashboard,
  observabilityStackDashboard,
  traefikIngressDashboard,
};
