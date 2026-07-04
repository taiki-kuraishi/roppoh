import {
  DatasourceVariableBuilder,
  QueryVariableBuilder,
  VariableRefresh,
  VariableSort,
} from "@grafana/grafana-foundation-sdk/dashboard";

import {
  DATASOURCE_UID,
  DATASOURCE_VARIABLE,
  lokiDatasourceRef,
  prometheusDatasourceRef,
} from "./datasources";

/** `${datasource}` テンプレート変数 (Mimir をデフォルトにした Prometheus 系データソース切替)。 */
export const datasourceVariable = new DatasourceVariableBuilder(DATASOURCE_VARIABLE)
  .label("Data source")
  .type("prometheus")
  .current({ text: "Mimir", value: DATASOURCE_UID.mimir, selected: true });

interface QueryVariableOpts {
  name: string;
  label: string;
  query: string;
  datasource?: object;
  multi?: boolean;
  includeAll?: boolean;
}

/**
 * `label_values(...)` 系の Query variable を生成する汎用 helper。
 * デフォルトは Prometheus(`${datasource}`)、multi-select + All 付き。
 */
export const queryVariable = (opts: QueryVariableOpts) =>
  new QueryVariableBuilder(opts.name)
    .label(opts.label)
    .datasource(opts.datasource ?? prometheusDatasourceRef)
    .query(opts.query)
    .refresh(VariableRefresh.OnTimeRangeChanged)
    .sort(VariableSort.AlphabeticalAsc)
    .multi(opts.multi ?? true)
    .includeAll(opts.includeAll ?? true);

/** Loki の `label_values(<label>)` を使う Query variable。 */
export const lokiQueryVariable = (opts: Omit<QueryVariableOpts, "datasource">) =>
  queryVariable({ ...opts, datasource: lokiDatasourceRef });

/** `node` (n100/z390) テンプレート変数。cAdvisor/kubelet 系メトリクスの Prometheus セレクタを渡す。 */
export const nodeVariable = (jobSelector: string) =>
  queryVariable({
    name: "node",
    label: "Node",
    query: `label_values(up{${jobSelector}}, node)`,
  });

/** `namespace` テンプレート変数。cAdvisor 系メトリクスのセレクタを渡す。 */
export const namespaceVariable = (metricSelector: string) =>
  queryVariable({
    name: "namespace",
    label: "Namespace",
    query: `label_values(${metricSelector}, namespace)`,
  });
