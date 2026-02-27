import type { NodeModule } from "@/lib/nodes/types";
import { promptNodeDefinition } from "./definitions";

const promptNode: NodeModule = {
  definition: promptNodeDefinition,

  async execute(inputs, context) {
    const template = (inputs.template as string) ?? "";
    const variables = (inputs.variables as Record<string, string>) ?? {};

    context.log(`テンプレートを処理中: "${template.slice(0, 50)}..."`);

    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value));
    }

    for (const [key, value] of Object.entries(inputs)) {
      if (key !== "template" && key !== "variables" && typeof value === "string") {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
      }
    }

    return { outputs: { text: result } };
  },
};

export default promptNode;
