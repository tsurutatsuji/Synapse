import type { NodeModule } from "@/lib/nodes/types";
import { transformNodeDefinition } from "./definitions";

const transformNode: NodeModule = {
  definition: transformNodeDefinition,

  async execute(inputs, context) {
    const data = inputs.data;
    const expression = inputs.expression as string;

    if (!expression) {
      return { outputs: { result: data } };
    }

    context.log(`変換式を実行中: "${expression}"`);

    try {
      const fn = new Function("data", `"use strict"; return (${expression});`);
      const result = fn(data);
      return { outputs: { result } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー";
      return { outputs: {}, error: `変換エラー: ${message}` };
    }
  },
};

export default transformNode;
