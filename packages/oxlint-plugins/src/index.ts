import fileStructureInertia from "./rules/file-structure-inertia.ts";
import fileStructure from "./rules/file-structure.ts";
import noCrossFeatureImport from "./rules/no-cross-feature-import.ts";
import oneFunctionPerTsx from "./rules/one-function-per-tsx.ts";
import preferAliasImport from "./rules/prefer-alias-import.ts";

const plugin = {
  meta: {
    name: "roppoh",
  },
  rules: {
    "file-structure": fileStructure,
    "file-structure-inertia": fileStructureInertia,
    "no-cross-feature-import": noCrossFeatureImport,
    "one-function-per-tsx": oneFunctionPerTsx,
    "prefer-alias-import": preferAliasImport,
  },
};

export default plugin;
