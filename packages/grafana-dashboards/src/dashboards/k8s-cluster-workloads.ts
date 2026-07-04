import {
  DashboardBuilder,
  QueryVariableBuilder,
  RowBuilder,
  VariableRefresh,
  VariableSort,
} from "@grafana/grafana-foundation-sdk/dashboard";

import { prometheusDatasourceRef } from "../datasources";
import { promStat, promTable, promTimeseries } from "../panels";
import { datasourceVariable } from "../variables";

/**
 * クラスタオブジェクトの状態 (kube-state-metrics)。
 *
 * cAdvisor/kubelet では取れない Pod restart・Deployment/StatefulSet/DaemonSet の
 * ready-vs-desired・Node 状態・PVC/Job/CronJob・GPU allocatable を可視化する。
 * job="kube-state-metrics" は grafana-alloy.yaml で付与している。
 */
const KSM = 'job="kube-state-metrics"';

const namespaceVariable = new QueryVariableBuilder("namespace")
  .label("Namespace")
  .datasource(prometheusDatasourceRef)
  .query(`label_values(kube_pod_info{${KSM}}, namespace)`)
  .refresh(VariableRefresh.OnTimeRangeChanged)
  .sort(VariableSort.AlphabeticalAsc)
  .multi(true)
  .includeAll(true);

const stat = (opts: { title: string; description: string; unit: string; expr: string }) =>
  promStat({ ...opts, datasource: prometheusDatasourceRef });

const timeseries = (opts: {
  title: string;
  description: string;
  unit: string;
  expr: string;
  legend: string;
}) => promTimeseries({ ...opts, datasource: prometheusDatasourceRef });

export const k8sClusterWorkloadsDashboard = new DashboardBuilder(
  "Kubernetes / Cluster & Workload state",
)
  .uid("roppoh-k8s-cluster-workloads")
  .description(
    "kube-state-metrics によるクラスタオブジェクトの状態 (Pod restart / Deployment・StatefulSet・DaemonSet の ready-vs-desired / Node / PVC / Job・CronJob / GPU allocatable)",
  )
  .tags(["generated", "kubernetes", "kube-state-metrics"])
  .readonly()
  .refresh("30s")
  .time({ from: "now-24h", to: "now" })
  .timezone("browser")
  .withVariable(datasourceVariable)
  .withVariable(namespaceVariable)

  .withRow(new RowBuilder("Cluster overview"))
  .withPanel(
    stat({
      title: "Nodes ready",
      description: "Ready 状態の Node 数",
      unit: "short",
      expr: `sum(kube_node_status_condition{${KSM}, condition="Ready", status="true"})`,
    }),
  )
  .withPanel(
    stat({
      title: "Pods not running",
      description: "Running/Succeeded 以外の Pod 数 (Pending/Failed/Unknown)",
      unit: "short",
      expr: `sum(kube_pod_status_phase{${KSM}, namespace=~"$namespace", phase!~"Running|Succeeded"})`,
    }),
  )
  .withPanel(
    stat({
      title: "GPU allocatable (cluster)",
      description: "クラスタ全体の nvidia.com/gpu allocatable (現状 z390 に 1)",
      unit: "short",
      expr: `sum(kube_node_status_allocatable{${KSM}, resource=~".*gpu.*"})`,
    }),
  )
  .withPanel(
    stat({
      title: "CronJobs",
      description: "登録済み CronJob 数",
      unit: "short",
      expr: `count(kube_cronjob_next_schedule_time{${KSM}, namespace=~"$namespace"})`,
    }),
  )

  .withRow(new RowBuilder("Pod restarts"))
  .withPanel(
    timeseries({
      title: "Pod restart rate",
      description: "namespace 別の Pod restart 増加率",
      unit: "short",
      legend: "{{namespace}}",
      expr: `sum by (namespace) (increase(kube_pod_container_status_restarts_total{${KSM}, namespace=~"$namespace"}[$__range]))`,
    }),
  )
  .withPanel(
    promTable({
      title: "Top restarting pods (24h)",
      description: "直近の restart 回数が多い Pod",
      unit: "short",
      datasource: prometheusDatasourceRef,
      expr: `topk(10, sum by (namespace, pod, container) (increase(kube_pod_container_status_restarts_total{${KSM}, namespace=~"$namespace"}[$__range])))`,
    }),
  )

  .withRow(new RowBuilder("Workload ready vs desired"))
  .withPanel(
    timeseries({
      title: "Deployments: ready vs desired",
      description: "Deployment の準備済み/期待レプリカ数",
      unit: "short",
      legend: "{{namespace}}/{{deployment}} ready",
      expr: `kube_deployment_status_replicas_available{${KSM}, namespace=~"$namespace"}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "DaemonSets: ready vs desired",
      description: "DaemonSet の準備済み/期待 Pod 数",
      unit: "short",
      legend: "{{namespace}}/{{daemonset}} ready",
      expr: `kube_daemonset_status_number_ready{${KSM}, namespace=~"$namespace"}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "StatefulSets: ready vs desired",
      description: "StatefulSet の準備済み/期待レプリカ数",
      unit: "short",
      legend: "{{namespace}}/{{statefulset}} ready",
      expr: `kube_statefulset_status_replicas_ready{${KSM}, namespace=~"$namespace"}`,
    }),
  )

  .withRow(new RowBuilder("Storage / Jobs"))
  .withPanel(
    promTable({
      title: "PVC requested capacity",
      description: "PersistentVolumeClaim ごとの要求容量",
      unit: "bytes",
      datasource: prometheusDatasourceRef,
      expr: `kube_persistentvolumeclaim_resource_requests_storage_bytes{${KSM}, namespace=~"$namespace"}`,
    }),
  )
  .withPanel(
    timeseries({
      title: "Job success / failure",
      description: "Job の成功/失敗数 (namespace 別)",
      unit: "short",
      legend: "{{namespace}} / succeeded",
      expr: `sum by (namespace) (kube_job_status_succeeded{${KSM}, namespace=~"$namespace"})`,
    }),
  );
