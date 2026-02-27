import type { NodeModule } from "@/lib/nodes/types";
import { splitterDefinition } from "./definitions";

const splitterNode: NodeModule = {
  definition: splitterDefinition,

  async execute(inputs) {
    const text = (inputs.text as string) ?? "";
    const delimiter = (inputs.delimiter as string) ?? "\n";

    const parts = text.split(delimiter).filter((s) => s.length > 0);

    return { outputs: { items: parts, count: parts.length } };
  },
};

export default splitterNode;
