import fileStructure from "./rules/file-structure.ts";
import noCrossFeatureImport from "./rules/no-cross-feature-import.ts";
import preferAliasImport from "./rules/prefer-alias-import.ts";

const plugin = {
  meta: {
    name: "roppoh",
  },
  rules: {
    "file-structure": fileStructure,
    "no-cross-feature-import": noCrossFeatureImport,
    "prefer-alias-import": preferAliasImport,
  },
};

export default plugin;
