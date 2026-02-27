import type { NodeModule } from "@/lib/nodes/types";
import { conditionalNodeDefinition } from "./definitions";

const conditionalNode: NodeModule = {
  definition: conditionalNodeDefinition,

  async execute(inputs, context) {
    const data = inputs.data;
    const condition = inputs.condition as string;

    context.log(`条件を評価中: "${condition}"`);

    try {
      const fn = new Function("data", `"use strict"; return !!(${condition});`);
      const result = fn(data);

      if (result) {
        context.log("条件: True");
        return { outputs: { trueBranch: data, falseBranch: undefined } };
      } else {
        context.log("条件: False");
        return { outputs: { trueBranch: undefined, falseBranch: data } };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー";
      return { outputs: {}, error: `条件評価エラー: ${message}` };
    }
  },
};

export default conditionalNode;
