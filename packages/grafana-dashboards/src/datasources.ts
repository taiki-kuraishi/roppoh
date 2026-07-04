/**
 * Grafana にコード provisioning 済みのデータソース UID。
 *
 * 値は `k8s/argocd/apps/grafana.yaml` の `datasources.datasources.yaml` と
 * 一致させること(ここを変えるときは両方を直す)。
 */
export const DATASOURCE_UID = {
  /** Prometheus 互換メトリクス (デフォルト) */
  mimir: "mimir",
  /** ログ */
  loki: "loki",
  /** トレース */
  tempo: "tempo",
} as const;

/**
 * パネル/ターゲットが参照するデータソース・テンプレ変数の名前。
 *
 * dashboard-linter の `template-datasource-rule` / `panel-datasource-rule` は
 * この名前の datasource 変数を要求するので、ハードコードせず変数経由で参照する。
 */
export const DATASOURCE_VARIABLE = "datasource";

/** Prometheus 系パネル/ターゲットに渡すデータソース参照 (`${datasource}`)。 */
export const prometheusDatasourceRef = {
  type: "prometheus",
  uid: `\${${DATASOURCE_VARIABLE}}`,
};

/** Loki(ログ)データソース参照。クラスタに 1 つなので UID 直指定。 */
export const lokiDatasourceRef = {
  type: "loki",
  uid: DATASOURCE_UID.loki,
};

/** Tempo(トレース)データソース参照。クラスタに 1 つなので UID 直指定。 */
export const tempoDatasourceRef = {
  type: "tempo",
  uid: DATASOURCE_UID.tempo,
};
