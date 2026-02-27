import type { NodeModule } from "@/lib/nodes/types";
import { jsonParseDefinition } from "./definitions";

const jsonParseNode: NodeModule = {
  definition: jsonParseDefinition,

  async execute(inputs) {
    const text = inputs.text as string;
    const path = (inputs.path as string) ?? "";

    const parsed = JSON.parse(text);

    let extracted = parsed;
    if (path) {
      for (const key of path.split(".")) {
        if (extracted == null) break;
        extracted = (extracted as Record<string, unknown>)[key];
      }
    }

    return { outputs: { result: extracted, raw: parsed } };
  },
};

export default jsonParseNode;
