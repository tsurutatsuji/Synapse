import type { NodeModule } from "@/lib/nodes/types";
import { filterDefinition } from "./definitions";

const filterNode: NodeModule = {
  definition: filterDefinition,

  async execute(inputs) {
    const data = inputs.data;
    const expression = (inputs.expression as string) ?? "true";

    if (!Array.isArray(data)) {
      // Single item: evaluate as boolean
      const fn = new Function("item", `return Boolean(${expression})`);
      const pass = fn(data);
      return { outputs: { result: pass ? data : null, count: pass ? 1 : 0 } };
    }

    const fn = new Function("item", "index", `return Boolean(${expression})`);
    const filtered = data.filter((item, index) => fn(item, index));

    return { outputs: { result: filtered, count: filtered.length } };
  },
};

export default filterNode;
