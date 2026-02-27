import type { NodeModule } from "@/lib/nodes/types";
import { mergeNodeDefinition } from "./definitions";

const mergeNode: NodeModule = {
  definition: mergeNodeDefinition,

  async execute(inputs, context) {
    const values: unknown[] = [];
    const merged: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(inputs)) {
      if (value !== undefined && value !== null) {
        merged[key] = value;
        values.push(value);
      }
    }

    context.log(`${values.length}個の入力をマージしました`);

    return { outputs: { merged, array: values } };
  },
};

export default mergeNode;
