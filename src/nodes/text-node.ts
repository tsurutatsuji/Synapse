import type { NodeModule } from "@/lib/nodes/types";
import { textDefinition } from "./definitions";

const textNode: NodeModule = {
  definition: textDefinition,

  async execute(inputs) {
    const value = (inputs.value as string) ?? "";
    return { outputs: { text: value } };
  },
};

export default textNode;
