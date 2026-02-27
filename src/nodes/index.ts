import { registerNode } from "@/lib/nodes/registry";
import promptNode from "./prompt-node";
import fileReaderNode from "./file-reader-node";
import fileWriterNode from "./file-writer-node";
import transformNode from "./transform-node";
import conditionalNode from "./conditional-node";
import shellNode from "./shell-node";
import mergeNode from "./merge-node";
import httpRequestNode from "./http-request-node";
import jsonParseNode from "./json-parse-node";
import textNode from "./text-node";
import loggerNode from "./logger-node";
import timerNode from "./timer-node";
import filterNode from "./filter-node";
import splitterNode from "./splitter-node";

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
  registerNode(httpRequestNode);
  registerNode(jsonParseNode);
  registerNode(textNode);
  registerNode(loggerNode);
  registerNode(timerNode);
  registerNode(filterNode);
  registerNode(splitterNode);
}

export {
  promptNode,
  fileReaderNode,
  fileWriterNode,
  transformNode,
  conditionalNode,
  shellNode,
  mergeNode,
  httpRequestNode,
  jsonParseNode,
  textNode,
  loggerNode,
  timerNode,
  filterNode,
  splitterNode,
};
