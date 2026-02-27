/**
 * ノードシステムの型定義
 *
 * 各ノードは独立したファイルとして存在し、
 * ワークフローにインストールして接続する。
 * Claude Code APIは使用しない。
 */

/** ノードのポート（入力/出力）の型 */
export type PortType = "string" | "number" | "boolean" | "object" | "array" | "any";

/** ノードの入力ポート定義 */
export interface NodePort {
  id: string;
  label: string;
  type: PortType;
  required?: boolean;
  defaultValue?: unknown;
}

/** ノードのカテゴリ */
export type NodeCategory =
  | "agent"
  | "data"
  | "control"
  | "io"
  | "transform"
  | "custom";

/** ノード定義: 各ノードファイルがexportする情報 */
export interface NodeDefinition {
  /** ノードの一意なID（例: "prompt-node", "file-reader"） */
  id: string;
  /** 表示名 */
  name: string;
  /** 説明 */
  description: string;
  /** カテゴリ */
  category: NodeCategory;
  /** 入力ポート */
  inputs: NodePort[];
  /** 出力ポート */
  outputs: NodePort[];
  /** ノードの色（React Flowでの表示用） */
  color?: string;
  /** アイコン名 */
  icon?: string;
}

/** ノードの実行コンテキスト */
export interface NodeExecutionContext {
  /** ノードインスタンスID */
  instanceId: string;
  /** ワークフローID */
  workflowId: string;
  /** ログ出力 */
  log: (message: string) => void;
  /** ワークフローの共有ストア */
  store: Record<string, unknown>;
}

/** ノードの実行結果 */
export interface NodeExecutionResult {
  /** 出力データ（出力ポートIDをキーとする） */
  outputs: Record<string, unknown>;
  /** 実行ログ */
  logs?: string[];
  /** エラー情報 */
  error?: string;
}

/** ノードモジュール: 各ノードファイルがdefault exportするオブジェクト */
export interface NodeModule {
  /** ノード定義 */
  definition: NodeDefinition;
  /** 実行関数 */
  execute: (
    inputs: Record<string, unknown>,
    context: NodeExecutionContext
  ) => Promise<NodeExecutionResult>;
}

/** ワークフロー上のノードインスタンス */
export interface WorkflowNode {
  /** インスタンスID（UUID） */
  id: string;
  /** 参照するノード定義ID */
  nodeDefinitionId: string;
  /** キャンバス上のX座標 */
  x: number;
  /** キャンバス上のY座標 */
  y: number;
  /** ノード固有の設定値 */
  config: Record<string, unknown>;
}

/** ノード間の接続（エッジ） */
export interface WorkflowEdge {
  id: string;
  /** 接続元ノードインスタンスID */
  sourceNodeId: string;
  /** 接続元の出力ポートID */
  sourcePortId: string;
  /** 接続先ノードインスタンスID */
  targetNodeId: string;
  /** 接続先の入力ポートID */
  targetPortId: string;
}

/** ワークフロー定義 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  /** ワークフロー内のノードインスタンス */
  nodes: WorkflowNode[];
  /** ノード間の接続 */
  edges: WorkflowEdge[];
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
}

/** ワークフロー実行ステータス */
export type WorkflowRunStatus = "idle" | "running" | "completed" | "error";

/** ノードの実行状態 */
export interface NodeRunState {
  nodeId: string;
  status: WorkflowRunStatus;
  outputs?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

/** ワークフロー全体の実行状態 */
export interface WorkflowRunState {
  workflowId: string;
  status: WorkflowRunStatus;
  nodeStates: Record<string, NodeRunState>;
  startedAt?: string;
  completedAt?: string;
}
