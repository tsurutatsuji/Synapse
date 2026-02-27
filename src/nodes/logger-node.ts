import type { NodeModule } from "@/lib/nodes/types";
import { loggerDefinition } from "./definitions";

const loggerNode: NodeModule = {
  definition: loggerDefinition,

  async execute(inputs, context) {
    const label = (inputs.label as string) ?? "LOG";
    const data = inputs.data;

    const output = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    context.log(`[${label}] ${output}`);

    return { outputs: { passthrough: data, log: `[${label}] ${output}` } };
  },
};

export default loggerNode;
