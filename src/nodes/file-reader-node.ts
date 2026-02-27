import type { NodeModule } from "@/lib/nodes/types";
import { fileReaderDefinition } from "./definitions";

const fileReaderNode: NodeModule = {
  definition: fileReaderDefinition,

  async execute(inputs, context) {
    const filePath = inputs.filePath as string;
    const encoding = (inputs.encoding as BufferEncoding) ?? "utf-8";

    if (!filePath) {
      return { outputs: {}, error: "ファイルパスが指定されていません" };
    }

    context.log(`ファイルを読み込み中: ${filePath}`);

    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const content = await fs.readFile(filePath, { encoding });
      const fileName = path.basename(filePath);
      return { outputs: { content, fileName } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー";
      return { outputs: {}, error: `ファイル読み込みエラー: ${message}` };
    }
  },
};

export default fileReaderNode;
