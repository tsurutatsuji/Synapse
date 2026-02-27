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

/** 全ビルトインノード定義（クライアントサイド用） */
export const allNodeDefinitions: NodeDefinition[] = [
  promptNodeDefinition,
  fileReaderDefinition,
  fileWriterDefinition,
  transformNodeDefinition,
  conditionalNodeDefinition,
  shellNodeDefinition,
  mergeNodeDefinition,
];
