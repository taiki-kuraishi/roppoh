import { DashboardBuilder, RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";

import { prometheusDatasourceRef } from "../datasources";
import { lokiLogs, promStat, promTimeseries } from "../panels";
import { datasourceVariable } from "../variables";

/**
 * このクラスタ全体を動かす GitOps エンジン (ArgoCD) 自身の健全性。
 *
 * argocd namespace の公式マニフェストはアノテーションを持たないため
 * grafana-alloy.yaml で app.kubernetes.io/name + 既知のメトリクスポート
 * 番号を使って明示的にスクレイプしている
 * (job="argocd-application-controller" 等)。メトリクス名は ArgoCD 公式の
 * 安定した命名 (argocd_app_*, argocd_app_reconcile_*, argocd_git_request_*)。
 */
const CONTROLLER = 'job="argocd-application-controller"';
const REPO_SERVER = 'job="argocd-repo-server"';

const stat = (opts: { title: string; description: string; unit: string; expr: string }) =>
  promStat({ ...opts, datasource: prometheusDatasourceRef });

const timeseries = (opts: {
  title: string;
  description: string;
  unit: string;
  expr: string;
  legend: string;
}) => promTimeseries({ ...opts, datasource: prometheusDatasourceRef });

export const argocdGitopsDashboard = new DashboardBuilder("Applications / ArgoCD (GitOps)")
  .uid("roppoh-argocd-gitops")
  .description(
    "ArgoCD 自身の Application 同期状態/health、リコンサイル頻度、repo-server の Git 操作",
  )
  .tags(["generated", "applications", "argocd", "gitops"])
  .readonly()
  .refresh("30s")
  .time({ from: "now-24h", to: "now" })
  .timezone("browser")
  .withVariable(datasourceVariable)

  .withRow(new RowBuilder("Application health"))
  .withPanel(
    stat({
      title: "Apps out of sync",
      description: "sync_status が Synced 以外の Application 数",
      unit: "short",
      expr: `count(argocd_app_info{${CONTROLLER}, sync_status!="Synced"})`,
    }),
  )
  .withPanel(
    stat({
      title: "Apps unhealthy",
      description: "health_status が Healthy 以外の Application 数",
      unit: "short",
      expr: `count(argocd_app_info{${CONTROLLER}, health_status!="Healthy"})`,
    }),
  )
  .withPanel(
    stat({
      title: "Total apps",
      description: "管理下の Application 数",
      unit: "short",
      expr: `count(argocd_app_info{${CONTROLLER}})`,
    }),
  )

  .withRow(new RowBuilder("Sync / reconcile"))
  .withPanel(
    timeseries({
      title: "App sync status by app",
      description: "Application 別の sync/health 状態 (1=該当)",
      unit: "short",
      legend: "{{name}} / {{sync_status}}",
      expr: `argocd_app_info{${CONTROLLER}}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Reconcile duration (p99)",
      description: "Application リコンサイル所要時間 (p99)",
      unit: "s",
      legend: "reconcile",
      expr: `histogram_quantile(0.99, sum by (le) (rate(argocd_app_reconcile_bucket{${CONTROLLER}}[$__rate_interval])))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Reconcile count",
      description: "リコンサイル実行回数のレート",
      unit: "short",
      legend: "reconcile",
      expr: `sum(rate(argocd_app_reconcile_count{${CONTROLLER}}[$__rate_interval]))`,
    }),
  )

  .withRow(new RowBuilder("Repo server (Git)"))
  .withPanel(
    timeseries({
      title: "Git request duration (p99)",
      description: "repo-server の Git 操作 (fetch/ls-remote 等) 所要時間",
      unit: "s",
      legend: "{{repo}} / {{request_type}}",
      expr: `histogram_quantile(0.99, sum by (repo, request_type, le) (rate(argocd_git_request_duration_seconds_bucket{${REPO_SERVER}}[$__rate_interval])))`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Git request rate",
      description: "repo-server の Git 操作レート",
      unit: "short",
      legend: "{{repo}} / {{request_type}}",
      expr: `sum by (repo, request_type) (rate(argocd_git_request_total{${REPO_SERVER}}[$__rate_interval]))`,
    }),
  )

  .withRow(new RowBuilder("Logs"))
  .withPanel(
    lokiLogs({
      title: "argocd-application-controller logs",
      description: "sync/reconcile のイベントログ (JSON 構造化)",
      expr: '{namespace="argocd", container="application-controller"} | json',
    }),
  )
  .withPanel(
    lokiLogs({
      title: "argocd error logs (all components)",
      description: "argocd namespace 全体の error ログ",
      expr: '{namespace="argocd"} | json | level="error"',
    }),
  );
