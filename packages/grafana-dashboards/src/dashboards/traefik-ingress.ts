import { DashboardBuilder, RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";

import { prometheusDatasourceRef } from "../datasources";
import { lokiLogs, promTimeseries } from "../panels";
import { datasourceVariable } from "../variables";

/**
 * Traefik (k3s 標準バンドルの ingress controller) の RED メトリクス。
 *
 * kube-system/traefik は `prometheus.io/scrape: "true"` アノテーションを
 * 既に持っており、grafana-alloy.yaml の annotated_pods (Phase 2d) で
 * 自動的にスクレイプ対象になる (job label は `<namespace>/<pod>` になる
 * ため namespace="kube-system" で絞り込む)。メトリクス名は Traefik 公式の
 * 安定した命名 (traefik_entrypoint_*, traefik_service_*, traefik_router_*)。
 */
const TRAEFIK = 'namespace="kube-system", job=~"kube-system/traefik.*"';

const timeseries = (opts: {
  title: string;
  description: string;
  unit: string;
  expr: string;
  legend: string;
}) => promTimeseries({ ...opts, datasource: prometheusDatasourceRef });

export const traefikIngressDashboard = new DashboardBuilder("Applications / Traefik ingress")
  .uid("roppoh-traefik-ingress")
  .description("Traefik (k3s 標準 ingress) のリクエストレート/レイテンシ/ステータス")
  .tags(["generated", "applications", "traefik"])
  .readonly()
  .refresh("30s")
  .time({ from: "now-6h", to: "now" })
  .timezone("browser")
  .withVariable(datasourceVariable)

  .withRow(new RowBuilder("Entrypoints"))
  .withPanel(
    timeseries({
      title: "Request rate by entrypoint",
      description: "entrypoint (web/websecure 等) 別リクエストレート",
      unit: "reqps",
      legend: "{{entrypoint}} / {{code}}",
      expr: `sum by (entrypoint, code) (rate(traefik_entrypoint_requests_total{${TRAEFIK}}[$__rate_interval]))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Request duration (p99) by entrypoint",
      description: "entrypoint 別リクエスト所要時間 (p99)",
      unit: "s",
      legend: "{{entrypoint}}",
      expr: `histogram_quantile(0.99, sum by (entrypoint, le) (rate(traefik_entrypoint_request_duration_seconds_bucket{${TRAEFIK}}[$__rate_interval])))`,
    }),
  )

  .withRow(new RowBuilder("Services & routers"))
  .withPanel(
    timeseries({
      title: "Request rate by service",
      description: "バックエンド service 別リクエストレート",
      unit: "reqps",
      legend: "{{service}} / {{code}}",
      expr: `sum by (service, code) (rate(traefik_service_requests_total{${TRAEFIK}}[$__rate_interval]))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "5xx rate by service",
      description: "バックエンド service 別 5xx エラーレート",
      unit: "reqps",
      legend: "{{service}}",
      expr: `sum by (service) (rate(traefik_service_requests_total{${TRAEFIK}, code=~"5.."}[$__rate_interval]))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Router request rate",
      description: "router 別リクエストレート",
      unit: "reqps",
      legend: "{{router}}",
      expr: `sum by (router) (rate(traefik_router_requests_total{${TRAEFIK}}[$__rate_interval]))`,
    }),
  )

  .withRow(new RowBuilder("Logs"))
  .withPanel(
    lokiLogs({
      title: "traefik logs",
      description: "traefik コンテナのログ (エラー含む)",
      expr: '{namespace="kube-system", container="traefik"}',
    }),
  );
