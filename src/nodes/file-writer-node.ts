import type { NodeModule } from "@/lib/nodes/types";
import { fileWriterDefinition } from "./definitions";

const fileWriterNode: NodeModule = {
  definition: fileWriterDefinition,

  async execute(inputs, context) {
    const filePath = inputs.filePath as string;
    const content = inputs.content as string;
    const append = inputs.append as boolean;

    if (!filePath || content === undefined) {
      return { outputs: { success: false }, error: "ファイルパスまたは内容が指定されていません" };
    }

    context.log(`ファイルに書き込み中: ${filePath}`);

    try {
      const fs = await import("fs/promises");
      if (append) {
        await fs.appendFile(filePath, content, "utf-8");
      } else {
        await fs.writeFile(filePath, content, "utf-8");
      }
      return { outputs: { filePath, success: true } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー";
      return { outputs: { success: false }, error: `ファイル書き込みエラー: ${message}` };
    }
  },
};

export default fileWriterNode;
