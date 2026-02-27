import type { NodeDefinition } from "@/lib/nodes/types";

/**
 * ノード定義一覧（クライアントサイドで使用可能）
 * 名前は「何をするか」で書く。技術用語ではなく目的ベース。
 */

export const promptNodeDefinition: NodeDefinition = {
  id: "prompt-node",
  name: "文章をつくる",
  description: "テンプレートに値を埋め込んで文章を自動生成",
  category: "agent",
  color: "#a78bfa",
  icon: "MessageSquare",
  inputs: [
    {
      id: "template",
      label: "テンプレート",
      type: "string",
      required: true,
      defaultValue: "{{input}}について教えてください",
    },
    {
      id: "variables",
      label: "埋め込む値",
      type: "object",
      required: false,
      defaultValue: {},
    },
  ],
  outputs: [
    { id: "text", label: "できた文章", type: "string" },
  ],
};

export const fileReaderDefinition: NodeDefinition = {
  id: "file-reader",
  name: "ファイルを読む",
  description: "PCにあるファイルの中身を取り出す",
  category: "io",
  color: "#a78bfa",
  icon: "FileInput",
  inputs: [
    { id: "filePath", label: "ファイルの場所", type: "string", required: true },
    { id: "encoding", label: "文字コード", type: "string", required: false, defaultValue: "utf-8" },
  ],
  outputs: [
    { id: "content", label: "中身", type: "string" },
    { id: "fileName", label: "ファイル名", type: "string" },
  ],
};

export const fileWriterDefinition: NodeDefinition = {
  id: "file-writer",
  name: "ファイルに保存",
  description: "データをファイルとしてPCに保存する",
  category: "io",
  color: "#a78bfa",
  icon: "FileOutput",
  inputs: [
    { id: "filePath", label: "保存先", type: "string", required: true },
    { id: "content", label: "保存する内容", type: "string", required: true },
    { id: "append", label: "追記する", type: "boolean", required: false, defaultValue: false },
  ],
  outputs: [
    { id: "filePath", label: "保存先", type: "string" },
    { id: "success", label: "成功したか", type: "boolean" },
  ],
};

export const transformNodeDefinition: NodeDefinition = {
  id: "transform-node",
  name: "データを加工する",
  description: "受け取ったデータを好きな形に変える",
  category: "transform",
  color: "#a78bfa",
  icon: "Shuffle",
  inputs: [
    { id: "data", label: "元のデータ", type: "any", required: true },
    { id: "expression", label: "どう変えるか", type: "string", required: true, defaultValue: "data" },
  ],
  outputs: [
    { id: "result", label: "加工後", type: "any" },
  ],
};

export const conditionalNodeDefinition: NodeDefinition = {
  id: "conditional-node",
  name: "もし〜なら",
  description: "条件によってデータの流れ先を変える",
  category: "control",
  color: "#a78bfa",
  icon: "GitBranch",
  inputs: [
    { id: "data", label: "チェックするデータ", type: "any", required: true },
    { id: "condition", label: "条件", type: "string", required: true, defaultValue: "data !== null" },
  ],
  outputs: [
    { id: "trueBranch", label: "当てはまる", type: "any" },
    { id: "falseBranch", label: "当てはまらない", type: "any" },
  ],
};

export const shellNodeDefinition: NodeDefinition = {
  id: "shell-node",
  name: "コマンドを実行",
  description: "PCでコマンドを動かして結果を受け取る",
  category: "io",
  color: "#a78bfa",
  icon: "Terminal",
  inputs: [
    { id: "command", label: "実行するコマンド", type: "string", required: true },
    { id: "cwd", label: "実行場所", type: "string", required: false },
  ],
  outputs: [
    { id: "stdout", label: "実行結果", type: "string" },
    { id: "stderr", label: "エラー", type: "string" },
    { id: "exitCode", label: "終了コード", type: "number" },
  ],
};

export const mergeNodeDefinition: NodeDefinition = {
  id: "merge-node",
  name: "まとめる",
  description: "複数のデータを1つにまとめる",
  category: "transform",
  color: "#a78bfa",
  icon: "Merge",
  inputs: [
    { id: "input1", label: "データ1", type: "any", required: false },
    { id: "input2", label: "データ2", type: "any", required: false },
    { id: "input3", label: "データ3", type: "any", required: false },
  ],
  outputs: [
    { id: "merged", label: "まとめたデータ", type: "object" },
    { id: "array", label: "リスト", type: "array" },
  ],
};

// ── よく使うノード ──

export const httpRequestDefinition: NodeDefinition = {
  id: "http-request",
  name: "Webからデータ取得",
  description: "URLを指定してWebからデータを取ってくる",
  category: "io",
  color: "#a78bfa",
  icon: "Globe",
  inputs: [
    { id: "url", label: "URL", type: "string", required: true, defaultValue: "https://api.example.com/data" },
    { id: "method", label: "方法", type: "string", required: false, defaultValue: "GET" },
    { id: "headers", label: "追加情報", type: "object", required: false, defaultValue: {} },
    { id: "body", label: "送るデータ", type: "string", required: false },
  ],
  outputs: [
    { id: "data", label: "取得したデータ", type: "any" },
    { id: "status", label: "成功/失敗", type: "number" },
    { id: "headers", label: "追加情報", type: "object" },
  ],
};

export const jsonParseDefinition: NodeDefinition = {
  id: "json-parse",
  name: "データを読み解く",
  description: "JSONデータから必要な部分を取り出す",
  category: "transform",
  color: "#a78bfa",
  icon: "Braces",
  inputs: [
    { id: "text", label: "JSONデータ", type: "string", required: true },
    { id: "path", label: "取り出す場所 (例: data.items)", type: "string", required: false },
  ],
  outputs: [
    { id: "result", label: "取り出した部分", type: "any" },
    { id: "raw", label: "全体", type: "object" },
  ],
};

export const textDefinition: NodeDefinition = {
  id: "text-input",
  name: "テキストを用意",
  description: "固定のテキストやメモを置いておく",
  category: "data",
  color: "#a78bfa",
  icon: "Type",
  inputs: [
    { id: "value", label: "テキスト", type: "string", required: false, defaultValue: "" },
  ],
  outputs: [
    { id: "text", label: "テキスト", type: "string" },
  ],
};

export const loggerDefinition: NodeDefinition = {
  id: "logger",
  name: "中身を確認",
  description: "通過するデータの中身をチェックする",
  category: "io",
  color: "#a78bfa",
  icon: "ScrollText",
  inputs: [
    { id: "data", label: "見たいデータ", type: "any", required: true },
    { id: "label", label: "メモ", type: "string", required: false, defaultValue: "LOG" },
  ],
  outputs: [
    { id: "passthrough", label: "そのまま通す", type: "any" },
    { id: "log", label: "確認結果", type: "string" },
  ],
};

export const timerDefinition: NodeDefinition = {
  id: "timer",
  name: "待ってから流す",
  description: "指定した時間だけ待ってからデータを次に送る",
  category: "control",
  color: "#a78bfa",
  icon: "Clock",
  inputs: [
    { id: "delay", label: "待つ時間 (ミリ秒)", type: "number", required: false, defaultValue: 1000 },
    { id: "data", label: "流すデータ", type: "any", required: false },
  ],
  outputs: [
    { id: "data", label: "データ", type: "any" },
    { id: "elapsed", label: "待った時間", type: "number" },
  ],
};

export const filterDefinition: NodeDefinition = {
  id: "filter",
  name: "選び出す",
  description: "条件に合うデータだけを選んで通す",
  category: "transform",
  color: "#a78bfa",
  icon: "Filter",
  inputs: [
    { id: "data", label: "データ", type: "any", required: true },
    { id: "expression", label: "選ぶ条件", type: "string", required: true, defaultValue: "item !== null" },
  ],
  outputs: [
    { id: "result", label: "選ばれたデータ", type: "any" },
    { id: "count", label: "何件あったか", type: "number" },
  ],
};

export const splitterDefinition: NodeDefinition = {
  id: "splitter",
  name: "テキストを分ける",
  description: "テキストを区切り文字でバラバラにする",
  category: "transform",
  color: "#a78bfa",
  icon: "Scissors",
  inputs: [
    { id: "text", label: "テキスト", type: "string", required: true },
    { id: "delimiter", label: "区切り文字", type: "string", required: false, defaultValue: "\n" },
  ],
  outputs: [
    { id: "items", label: "分けたリスト", type: "array" },
    { id: "count", label: "何個になったか", type: "number" },
  ],
};

/** 全ビルトインノード定義（クライアントサイド用） */
export const allNodeDefinitions: NodeDefinition[] = [
  // つくる
  promptNodeDefinition,
  textDefinition,
  // 加工する
  transformNodeDefinition,
  jsonParseDefinition,
  filterDefinition,
  splitterDefinition,
  mergeNodeDefinition,
  // 外とつながる
  httpRequestDefinition,
  fileReaderDefinition,
  fileWriterDefinition,
  shellNodeDefinition,
  loggerDefinition,
  // 流れをコントロール
  conditionalNodeDefinition,
  timerDefinition,
];
