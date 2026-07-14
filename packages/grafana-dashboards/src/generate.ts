import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { dashboards } from "./index";

const here = path.dirname(fileURLToPath(import.meta.url));
// リポジトリルート (packages/grafana-dashboards/src から 3 つ上)
const repoRoot = path.resolve(here, "../../..");
const outDir = path.join(repoRoot, "k8s/monitoring/dashboards");

mkdirSync(outDir, { recursive: true });

for (const { filename, builder } of dashboards) {
  const json = `${JSON.stringify(builder.build(), null, 2)}\n`;
  const target = path.join(outDir, filename);
  writeFileSync(target, json);
  console.log(`generated ${path.relative(repoRoot, target)}`);
}
