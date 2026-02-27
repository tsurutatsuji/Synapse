import { registerNode } from "@/lib/nodes/registry";
import promptNode from "./prompt-node";
import fileReaderNode from "./file-reader-node";
import fileWriterNode from "./file-writer-node";
import transformNode from "./transform-node";
import conditionalNode from "./conditional-node";
import shellNode from "./shell-node";
import mergeNode from "./merge-node";

/**
 * ビルトインノードを全て登録する。
 * アプリ起動時に一度呼び出す。
 */
export function registerBuiltinNodes(): void {
  registerNode(promptNode);
  registerNode(fileReaderNode);
  registerNode(fileWriterNode);
  registerNode(transformNode);
  registerNode(conditionalNode);
  registerNode(shellNode);
  registerNode(mergeNode);
}

export {
  promptNode,
  fileReaderNode,
  fileWriterNode,
  transformNode,
  conditionalNode,
  shellNode,
  mergeNode,
};
