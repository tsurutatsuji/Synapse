import type {
  WorkflowDefinition,
  WorkflowRunState,
  NodeRunState,
  NodeExecutionContext,
  WorkflowEdge,
} from "../nodes/types";
import { getNodeModule } from "../nodes/registry";

/**
 * ワークフローエンジン
 *
 * ノード間の接続に基づいてトポロジカルソートを行い、
 * 依存順にノードを実行する。
 */

/** トポロジカルソートでノードの実行順序を決定する */
function topologicalSort(
  nodeIds: string[],
  edges: WorkflowEdge[]
): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const id of nodeIds) {
    inDegree.set(id, 0);
    adjacency.set(id, []);
  }

  for (const edge of edges) {
    const current = inDegree.get(edge.targetNodeId) ?? 0;
    inDegree.set(edge.targetNodeId, current + 1);
    adjacency.get(edge.sourceNodeId)?.push(edge.targetNodeId);
  }

  const queue: string[] = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjacency.get(current) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  if (sorted.length !== nodeIds.length) {
    throw new Error("ワークフローに循環参照が含まれています");
  }

  return sorted;
}

/** 特定のノードへの入力データを収集する */
function collectInputs(
  targetNodeId: string,
  edges: WorkflowEdge[],
  nodeOutputs: Record<string, Record<string, unknown>>
): Record<string, unknown> {
  const inputs: Record<string, unknown> = {};

  for (const edge of edges) {
    if (edge.targetNodeId === targetNodeId) {
      const sourceOutputs = nodeOutputs[edge.sourceNodeId];
      if (sourceOutputs && edge.sourcePortId in sourceOutputs) {
        inputs[edge.targetPortId] = sourceOutputs[edge.sourcePortId];
      }
    }
  }

  return inputs;
}

/** ワークフローを実行する */
export async function executeWorkflow(
  workflow: WorkflowDefinition,
  onStateChange?: (state: WorkflowRunState) => void
): Promise<WorkflowRunState> {
  const state: WorkflowRunState = {
    workflowId: workflow.id,
    status: "running",
    nodeStates: {},
    startedAt: new Date().toISOString(),
  };

  // 全ノードの初期状態を設定
  for (const node of workflow.nodes) {
    state.nodeStates[node.id] = {
      nodeId: node.id,
      status: "idle",
    };
  }

  onStateChange?.(state);

  try {
    // 実行順序を決定
    const nodeIds = workflow.nodes.map((n) => n.id);
    const executionOrder = topologicalSort(nodeIds, workflow.edges);

    // ノードの出力を保持する
    const nodeOutputs: Record<string, Record<string, unknown>> = {};
    const sharedStore: Record<string, unknown> = {};

    // 順番に実行
    for (const nodeId of executionOrder) {
      const workflowNode = workflow.nodes.find((n) => n.id === nodeId);
      if (!workflowNode) continue;

      const nodeModule = getNodeModule(workflowNode.nodeDefinitionId);
      if (!nodeModule) {
        const errorMsg = `ノード "${workflowNode.nodeDefinitionId}" が見つかりません。インストールされていますか？`;
        state.nodeStates[nodeId] = {
          nodeId,
          status: "error",
          error: errorMsg,
        };
        throw new Error(errorMsg);
      }

      // ノード状態を「実行中」に
      const nodeState: NodeRunState = {
        nodeId,
        status: "running",
        startedAt: new Date().toISOString(),
      };
      state.nodeStates[nodeId] = nodeState;
      onStateChange?.({ ...state });

      // 入力データを収集
      const inputs = collectInputs(nodeId, workflow.edges, nodeOutputs);

      // ノード固有の設定値も入力に含める
      const mergedInputs = { ...workflowNode.config, ...inputs };

      // 実行コンテキストを作成
      const logs: string[] = [];
      const context: NodeExecutionContext = {
        instanceId: nodeId,
        workflowId: workflow.id,
        log: (msg) => logs.push(msg),
        store: sharedStore,
      };

      // ノードを実行
      const result = await nodeModule.execute(mergedInputs, context);

      if (result.error) {
        state.nodeStates[nodeId] = {
          nodeId,
          status: "error",
          error: result.error,
          startedAt: nodeState.startedAt,
          completedAt: new Date().toISOString(),
        };
        throw new Error(result.error);
      }

      // 出力を保存
      nodeOutputs[nodeId] = result.outputs;
      state.nodeStates[nodeId] = {
        nodeId,
        status: "completed",
        outputs: result.outputs,
        startedAt: nodeState.startedAt,
        completedAt: new Date().toISOString(),
      };
      onStateChange?.({ ...state });
    }

    state.status = "completed";
    state.completedAt = new Date().toISOString();
  } catch (error) {
    state.status = "error";
    state.completedAt = new Date().toISOString();
  }

  onStateChange?.(state);
  return state;
}
