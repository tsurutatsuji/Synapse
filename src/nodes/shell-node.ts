import type { NodeModule } from "@/lib/nodes/types";
import { shellNodeDefinition } from "./definitions";

const shellNode: NodeModule = {
  definition: shellNodeDefinition,

  async execute(inputs, context) {
    const command = inputs.command as string;
    const cwd = inputs.cwd as string | undefined;

    if (!command) {
      return { outputs: {}, error: "コマンドが指定されていません" };
    }

    context.log(`コマンドを実行中: ${command}`);

    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);

      const result = await execAsync(command, {
        cwd: cwd || undefined,
        timeout: 30000,
        maxBuffer: 1024 * 1024,
      });

      return {
        outputs: { stdout: result.stdout, stderr: result.stderr, exitCode: 0 },
      };
    } catch (error: unknown) {
      const execError = error as {
        stdout?: string;
        stderr?: string;
        code?: number;
        message?: string;
      };
      return {
        outputs: {
          stdout: execError.stdout ?? "",
          stderr: execError.stderr ?? execError.message ?? "",
          exitCode: execError.code ?? 1,
        },
      };
    }
  },
};

export default shellNode;
