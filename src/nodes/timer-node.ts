import type { NodeModule } from "@/lib/nodes/types";
import { timerDefinition } from "./definitions";

const timerNode: NodeModule = {
  definition: timerDefinition,

  async execute(inputs) {
    const ms = (inputs.delay as number) ?? 1000;
    const passthrough = inputs.data;

    await new Promise((resolve) => setTimeout(resolve, ms));

    return { outputs: { data: passthrough, elapsed: ms } };
  },
};

export default timerNode;
