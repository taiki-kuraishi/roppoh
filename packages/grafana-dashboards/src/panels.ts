import { LogsSortOrder } from "@grafana/grafana-foundation-sdk/common";
import { PanelBuilder as LogsPanel } from "@grafana/grafana-foundation-sdk/logs";
import {
  DataqueryBuilder as LokiQuery,
  LokiQueryDirection,
} from "@grafana/grafana-foundation-sdk/loki";
import {
  DataqueryBuilder as PrometheusQuery,
  PromQueryFormat,
} from "@grafana/grafana-foundation-sdk/prometheus";
import { PanelBuilder as StatPanel } from "@grafana/grafana-foundation-sdk/stat";
import { PanelBuilder as TablePanel } from "@grafana/grafana-foundation-sdk/table";
import { SearchTableType, TempoQueryBuilder } from "@grafana/grafana-foundation-sdk/tempo";
import { PanelBuilder as TimeSeriesPanel } from "@grafana/grafana-foundation-sdk/timeseries";

import { lokiDatasourceRef, tempoDatasourceRef } from "./datasources";

/**
 * ダッシュボード間で共有するパネル/ターゲット生成 helper。
 *
 * 個々のダッシュボードファイル (src/dashboards/*.ts) は、パネル固有の
 * PromQL/LogQL/TraceQL 式だけを渡してこれらを呼び出す。
 */

/** Prometheus クエリターゲットを生成する (datasource は呼び出し側が渡す)。 */
const promTarget = (datasource: object, expr: string, legend?: string) => {
  const target = new PrometheusQuery().datasource(datasource).expr(expr).refId("A");
  return legend === undefined ? target : target.legendFormat(legend);
};

interface PromPanelOpts {
  title: string;
  description: string;
  unit: string;
  expr: string;
  datasource: object;
}

/** 単一の Prometheus クエリを表示する Stat パネル。 */
export const promStat = (opts: PromPanelOpts) =>
  new StatPanel()
    .title(opts.title)
    .description(opts.description)
    .datasource(opts.datasource)
    .unit(opts.unit)
    .withTarget(promTarget(opts.datasource, opts.expr));

/** 単一の Prometheus クエリを表示する TimeSeries パネル。 */
export const promTimeseries = (opts: PromPanelOpts & { legend?: string }) =>
  new TimeSeriesPanel()
    .title(opts.title)
    .description(opts.description)
    .datasource(opts.datasource)
    .unit(opts.unit)
    .fillOpacity(10)
    .withTarget(promTarget(opts.datasource, opts.expr, opts.legend));

/** 現在値スナップショットを表示する Table パネル (instant クエリ)。 */
export const promTable = (opts: PromPanelOpts) =>
  new TablePanel()
    .title(opts.title)
    .description(opts.description)
    .datasource(opts.datasource)
    .unit(opts.unit)
    .withTarget(
      new PrometheusQuery()
        .datasource(opts.datasource)
        .expr(opts.expr)
        .refId("A")
        .format(PromQueryFormat.Table)
        .instant(),
    );

interface LokiPanelOpts {
  title: string;
  description: string;
  unit: string;
  expr: string;
  legend: string;
}

/** LogQL クエリを表示する TimeSeries パネル (ログ量/エラー率など)。 */
export const lokiTimeseries = (opts: LokiPanelOpts) =>
  new TimeSeriesPanel()
    .title(opts.title)
    .description(opts.description)
    .datasource(lokiDatasourceRef)
    .unit(opts.unit)
    .fillOpacity(10)
    .withTarget(
      new LokiQuery()
        .datasource(lokiDatasourceRef)
        .refId("A")
        .expr(opts.expr)
        .legendFormat(opts.legend),
    );

/** LogQL クエリを生ログとして表示する Logs パネル。 */
export const lokiLogs = (opts: { title: string; description: string; expr: string }) =>
  new LogsPanel()
    .title(opts.title)
    .description(opts.description)
    .datasource(lokiDatasourceRef)
    .showTime(true)
    .wrapLogMessage(true)
    .enableLogDetails(true)
    .sortOrder(LogsSortOrder.Descending)
    .withTarget(
      new LokiQuery()
        .datasource(lokiDatasourceRef)
        .refId("A")
        .expr(opts.expr)
        .direction(LokiQueryDirection.Backward)
        .maxLines(200),
    );

/** TraceQL 検索結果を一覧表示する Table パネル。 */
export const tempoSearch = (opts: { title: string; description: string; traceql: string }) =>
  new TablePanel()
    .title(opts.title)
    .description(opts.description)
    .datasource(tempoDatasourceRef)
    .unit("none")
    .withTarget(
      new TempoQueryBuilder()
        .datasource(tempoDatasourceRef)
        .refId("A")
        .queryType("traceql")
        .tableType(SearchTableType.Traces)
        .limit(20)
        .filters([])
        .query(opts.traceql),
    );
