import { DashboardBuilder, RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { DataqueryBuilder as LokiQuery } from "@grafana/grafana-foundation-sdk/loki";
import { PanelBuilder as StatPanel } from "@grafana/grafana-foundation-sdk/stat";
import { PanelBuilder as TablePanel } from "@grafana/grafana-foundation-sdk/table";

import { lokiDatasourceRef } from "../datasources";
import { lokiLogs, lokiTimeseries } from "../panels";
import { lokiQueryVariable } from "../variables";

/**
 * 全 Pod コンテナログ (Loki, pod-tail)。
 *
 * grafana-alloy の loki.source.file が local.file_match 経由で
 * /var/log/pods 以下をテールし namespace/pod/container/node ラベルを付与する
 * (Phase 1 で修正、k8s/argocd/apps/grafana-alloy.yaml を参照)。
 * Cloudflare Workers の OTLP ログ (service_name ラベル) は
 * cf-workers-otel ダッシュボードで別途扱う (このダッシュボードの対象外)。
 */
const namespaceVariable = lokiQueryVariable({
  name: "namespace",
  label: "Namespace",
  query: "label_values(namespace)",
});
const containerVariable = lokiQueryVariable({
  name: "container",
  label: "Container",
  query: 'label_values({namespace=~"$namespace"}, container)',
});
const nodeVariable = lokiQueryVariable({
  name: "node",
  label: "Node",
  query: "label_values(node)",
});

const SELECTOR = '{namespace=~"$namespace", container=~"$container", node=~"$node"}';

export const logsAllContainersDashboard = new DashboardBuilder("Logs / All containers")
  .uid("roppoh-logs-all-containers")
  .description(
    "全 namespace/Pod/コンテナのログ (Loki, pod-tail)。Cloudflare Workers の OTLP ログは Cloudflare フォルダの cf-workers-otel を参照",
  )
  .tags(["generated", "logs", "loki"])
  .readonly()
  .refresh("30s")
  .time({ from: "now-1h", to: "now" })
  .timezone("browser")
  .withVariable(namespaceVariable)
  .withVariable(containerVariable)
  .withVariable(nodeVariable)

  .withRow(new RowBuilder("Overview"))
  .withPanel(
    new StatPanel()
      .title("Log volume (1h)")
      .description("選択範囲の総ログ行数")
      .datasource(lokiDatasourceRef)
      .unit("short")
      .withTarget(
        new LokiQuery()
          .datasource(lokiDatasourceRef)
          .refId("A")
          .expr(`sum(count_over_time(${SELECTOR} [$__range]))`)
          .instant(true),
      ),
  )
  .withPanel(
    new StatPanel()
      .title("Error/warn lines (1h)")
      .description("error/warn/fatal を含む行数 (大文字小文字を区別しない)")
      .datasource(lokiDatasourceRef)
      .unit("short")
      .withTarget(
        new LokiQuery()
          .datasource(lokiDatasourceRef)
          .refId("A")
          .expr(`sum(count_over_time(${SELECTOR} |~ "(?i)error|warn|fatal" [$__range]))`)
          .instant(true),
      ),
  )
  .withPanel(
    new TablePanel()
      .title("Top namespaces by volume")
      .description("ログ量上位 10 namespace")
      .datasource(lokiDatasourceRef)
      .unit("short")
      .withTarget(
        new LokiQuery()
          .datasource(lokiDatasourceRef)
          .refId("A")
          .expr(`topk(10, sum by (namespace) (count_over_time({namespace=~".+"} [$__range])))`)
          .instant(true),
      ),
  )

  .withRow(new RowBuilder("Volume & errors"))
  .withPanel(
    lokiTimeseries({
      title: "Log volume by namespace",
      description: "namespace 別ログ量レート",
      unit: "short",
      legend: "{{namespace}}",
      expr: `sum by (namespace) (count_over_time(${SELECTOR} [$__auto]))`,
    }),
  )
  .withPanel(
    lokiTimeseries({
      title: "Error/warn rate by namespace",
      description: "error/warn/fatal を含む行のレート",
      unit: "short",
      legend: "{{namespace}}",
      expr: `sum by (namespace) (count_over_time(${SELECTOR} |~ "(?i)error|warn|fatal" [$__auto]))`,
    }),
  )
  .withPanel(
    new TablePanel()
      .title("Top error-producing pods")
      .description("error/warn/fatal 行数が多い Pod (上位10)")
      .datasource(lokiDatasourceRef)
      .unit("short")
      .withTarget(
        new LokiQuery()
          .datasource(lokiDatasourceRef)
          .refId("A")
          .expr(
            `topk(10, sum by (namespace, pod) (count_over_time(${SELECTOR} |~ "(?i)error|warn|fatal" [$__range])))`,
          )
          .instant(true),
      ),
  )

  .withRow(new RowBuilder("Explorer"))
  .withPanel(
    lokiLogs({
      title: "Recent logs",
      description: "直近のログ (新しい順)",
      expr: SELECTOR,
    }),
  )
  .withPanel(
    lokiLogs({
      title: "Error logs",
      description: "error/warn/fatal を含むログ",
      expr: `${SELECTOR} |~ "(?i)error|warn|fatal"`,
    }),
  )

  .withRow(new RowBuilder("Parsing presets"))
  .withPanel(
    lokiLogs({
      title: "argocd (JSON structured logs)",
      description:
        'argocd-server 等は logrus JSON を出力する。`| json` でフィールドを展開できる (例: `{namespace="argocd"} | json | level="error"`)',
      expr: '{namespace="argocd"} | json',
    }),
  )
  .withPanel(
    lokiLogs({
      title: "cloudflared (logfmt)",
      description:
        'cloudflared は zerolog logfmt (key=value) を出力する。`| logfmt` でフィールドを展開できる (例: `{namespace="cloudflared"} | logfmt | level="ERR"`)',
      expr: '{namespace="cloudflared"} | logfmt',
    }),
  );
