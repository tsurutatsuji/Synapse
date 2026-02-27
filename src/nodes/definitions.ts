import type { NodeDefinition } from "@/lib/nodes/types";

/**
 * ノード定義一覧（クライアントサイドで使用可能）
 * 実行ロジックを含まないメタデータのみ。
 */

export const promptNodeDefinition: NodeDefinition = {
  id: "prompt-node",
  name: "プロンプト",
  description: "テンプレートに変数を埋め込んでテキストを生成",
  category: "agent",
  color: "#6366f1",
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
      label: "変数",
      type: "object",
      required: false,
      defaultValue: {},
    },
  ],
  outputs: [
    { id: "text", label: "生成テキスト", type: "string" },
  ],
};

export const fileReaderDefinition: NodeDefinition = {
  id: "file-reader",
  name: "ファイル読込",
  description: "ファイルの内容を読み込んで出力する",
  category: "io",
  color: "#10b981",
  icon: "FileInput",
  inputs: [
    { id: "filePath", label: "ファイルパス", type: "string", required: true },
    { id: "encoding", label: "エンコーディング", type: "string", required: false, defaultValue: "utf-8" },
  ],
  outputs: [
    { id: "content", label: "ファイル内容", type: "string" },
    { id: "fileName", label: "ファイル名", type: "string" },
  ],
};

export const fileWriterDefinition: NodeDefinition = {
  id: "file-writer",
  name: "ファイル書込",
  description: "データをファイルに書き込む",
  category: "io",
  color: "#f59e0b",
  icon: "FileOutput",
  inputs: [
    { id: "filePath", label: "ファイルパス", type: "string", required: true },
    { id: "content", label: "内容", type: "string", required: true },
    { id: "append", label: "追記モード", type: "boolean", required: false, defaultValue: false },
  ],
  outputs: [
    { id: "filePath", label: "書き込み先パス", type: "string" },
    { id: "success", label: "成功", type: "boolean" },
  ],
};

export const transformNodeDefinition: NodeDefinition = {
  id: "transform-node",
  name: "データ変換",
  description: "JavaScript式でデータを変換する",
  category: "transform",
  color: "#8b5cf6",
  icon: "Shuffle",
  inputs: [
    { id: "data", label: "入力データ", type: "any", required: true },
    { id: "expression", label: "変換式", type: "string", required: true, defaultValue: "data" },
  ],
  outputs: [
    { id: "result", label: "変換結果", type: "any" },
  ],
};

export const conditionalNodeDefinition: NodeDefinition = {
  id: "conditional-node",
  name: "条件分岐",
  description: "条件に基づいてデータの流れを制御する",
  category: "control",
  color: "#ef4444",
  icon: "GitBranch",
  inputs: [
    { id: "data", label: "入力データ", type: "any", required: true },
    { id: "condition", label: "条件式", type: "string", required: true, defaultValue: "data !== null" },
  ],
  outputs: [
    { id: "trueBranch", label: "True", type: "any" },
    { id: "falseBranch", label: "False", type: "any" },
  ],
};

export const shellNodeDefinition: NodeDefinition = {
  id: "shell-node",
  name: "シェル実行",
  description: "シェルコマンドを実行して結果を取得",
  category: "io",
  color: "#374151",
  icon: "Terminal",
  inputs: [
    { id: "command", label: "コマンド", type: "string", required: true },
    { id: "cwd", label: "作業ディレクトリ", type: "string", required: false },
  ],
  outputs: [
    { id: "stdout", label: "標準出力", type: "string" },
    { id: "stderr", label: "標準エラー", type: "string" },
    { id: "exitCode", label: "終了コード", type: "number" },
  ],
};

export const mergeNodeDefinition: NodeDefinition = {
  id: "merge-node",
  name: "マージ",
  description: "複数の入力を1つにまとめる",
  category: "transform",
  color: "#06b6d4",
  icon: "Merge",
  inputs: [
    { id: "input1", label: "入力1", type: "any", required: false },
    { id: "input2", label: "入力2", type: "any", required: false },
    { id: "input3", label: "入力3", type: "any", required: false },
  ],
  outputs: [
    { id: "merged", label: "結合データ", type: "object" },
    { id: "array", label: "配列", type: "array" },
  ],
};

// ── よく使うノード ──

export const httpRequestDefinition: NodeDefinition = {
  id: "http-request",
  name: "HTTP通信",
  description: "URLにリクエストを送信してレスポンスを取得",
  category: "io",
  color: "#3b82f6",
  icon: "Globe",
  inputs: [
    { id: "url", label: "URL", type: "string", required: true, defaultValue: "https://api.example.com/data" },
    { id: "method", label: "メソッド", type: "string", required: false, defaultValue: "GET" },
    { id: "headers", label: "ヘッダー", type: "object", required: false, defaultValue: {} },
    { id: "body", label: "ボディ", type: "string", required: false },
  ],
  outputs: [
    { id: "data", label: "レスポンス", type: "any" },
    { id: "status", label: "ステータス", type: "number" },
    { id: "headers", label: "ヘッダー", type: "object" },
  ],
};

export const jsonParseDefinition: NodeDefinition = {
  id: "json-parse",
  name: "JSON解析",
  description: "JSON文字列を解析してデータを抽出",
  category: "transform",
  color: "#f97316",
  icon: "Braces",
  inputs: [
    { id: "text", label: "JSON文字列", type: "string", required: true },
    { id: "path", label: "パス (例: data.items)", type: "string", required: false },
  ],
  outputs: [
    { id: "result", label: "抽出結果", type: "any" },
    { id: "raw", label: "全体", type: "object" },
  ],
};

export const textDefinition: NodeDefinition = {
  id: "text-input",
  name: "テキスト",
  description: "固定テキストを出力する（定数値・メモ）",
  category: "data",
  color: "#64748b",
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
  name: "ログ",
  description: "データの中身をログに出力（デバッグ用）",
  category: "io",
  color: "#a3a3a3",
  icon: "ScrollText",
  inputs: [
    { id: "data", label: "データ", type: "any", required: true },
    { id: "label", label: "ラベル", type: "string", required: false, defaultValue: "LOG" },
  ],
  outputs: [
    { id: "passthrough", label: "パススルー", type: "any" },
    { id: "log", label: "ログ文字列", type: "string" },
  ],
};

export const timerDefinition: NodeDefinition = {
  id: "timer",
  name: "タイマー",
  description: "指定時間待機してからデータを流す",
  category: "control",
  color: "#eab308",
  icon: "Clock",
  inputs: [
    { id: "delay", label: "待機時間 (ms)", type: "number", required: false, defaultValue: 1000 },
    { id: "data", label: "パススルー", type: "any", required: false },
  ],
  outputs: [
    { id: "data", label: "データ", type: "any" },
    { id: "elapsed", label: "経過 (ms)", type: "number" },
  ],
};

export const filterDefinition: NodeDefinition = {
  id: "filter",
  name: "フィルター",
  description: "条件に合うデータだけを通す",
  category: "transform",
  color: "#14b8a6",
  icon: "Filter",
  inputs: [
    { id: "data", label: "データ", type: "any", required: true },
    { id: "expression", label: "条件式", type: "string", required: true, defaultValue: "item !== null" },
  ],
  outputs: [
    { id: "result", label: "結果", type: "any" },
    { id: "count", label: "件数", type: "number" },
  ],
};

export const splitterDefinition: NodeDefinition = {
  id: "splitter",
  name: "分割",
  description: "テキストを区切り文字で分割して配列にする",
  category: "transform",
  color: "#d946ef",
  icon: "Scissors",
  inputs: [
    { id: "text", label: "テキスト", type: "string", required: true },
    { id: "delimiter", label: "区切り文字", type: "string", required: false, defaultValue: "\n" },
  ],
  outputs: [
    { id: "items", label: "配列", type: "array" },
    { id: "count", label: "件数", type: "number" },
  ],
};

/** 全ビルトインノード定義（クライアントサイド用） */
export const allNodeDefinitions: NodeDefinition[] = [
  // 基本
  promptNodeDefinition,
  textDefinition,
  // データ変換
  transformNodeDefinition,
  jsonParseDefinition,
  filterDefinition,
  splitterDefinition,
  mergeNodeDefinition,
  // 入出力
  httpRequestDefinition,
  fileReaderDefinition,
  fileWriterDefinition,
  shellNodeDefinition,
  loggerDefinition,
  // 制御
  conditionalNodeDefinition,
  timerDefinition,
];
