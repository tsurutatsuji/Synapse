import { create } from "zustand";
import type {
  WorkflowDefinition,
  WorkflowRunState,
  NodeDefinition,
} from "@/lib/nodes/types";
import { v4 as uuidv4 } from "uuid";

/** ワークフローエディタの状態管理 */
interface WorkflowStore {
  /** 現在編集中のワークフロー */
  currentWorkflow: WorkflowDefinition | null;
  /** 保存済みワークフロー一覧 */
  workflows: WorkflowDefinition[];
  /** 実行状態 */
  runState: WorkflowRunState | null;
  /** 選択中のノードID */
  selectedNodeId: string | null;
  /** ノードパレットの表示/非表示 */
  isPaletteOpen: boolean;

  // ワークフロー操作
  createWorkflow: (name: string, description: string) => WorkflowDefinition;
  loadWorkflow: (workflow: WorkflowDefinition) => void;
  saveWorkflow: () => void;
  deleteWorkflow: (id: string) => void;

  // ノード操作
  addNode: (definitionId: string, x: number, y: number, config?: Record<string, unknown>) => string;
  removeNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void;
  selectNode: (nodeId: string | null) => void;

  // エッジ操作
  addEdge: (
    sourceNodeId: string,
    sourcePortId: string,
    targetNodeId: string,
    targetPortId: string
  ) => void;
  removeEdge: (edgeId: string) => void;

  // 実行状態
  setRunState: (state: WorkflowRunState | null) => void;

  // UI操作
  togglePalette: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  currentWorkflow: null,
  workflows: [],
  runState: null,
  selectedNodeId: null,
  isPaletteOpen: true,

  createWorkflow(name, description) {
    const workflow: WorkflowDefinition = {
      id: uuidv4(),
      name,
      description,
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      currentWorkflow: workflow,
      workflows: [...state.workflows, workflow],
    }));
    return workflow;
  },

  loadWorkflow(workflow) {
    set({ currentWorkflow: workflow, selectedNodeId: null, runState: null });
  },

  saveWorkflow() {
    const { currentWorkflow, workflows } = get();
    if (!currentWorkflow) return;
    const updated = {
      ...currentWorkflow,
      updatedAt: new Date().toISOString(),
    };
    set({
      currentWorkflow: updated,
      workflows: workflows.map((w) => (w.id === updated.id ? updated : w)),
    });
  },

  deleteWorkflow(id) {
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
      currentWorkflow:
        state.currentWorkflow?.id === id ? null : state.currentWorkflow,
    }));
  },

  addNode(definitionId, x, y, config = {}) {
    const nodeId = uuidv4();
    set((state) => {
      if (!state.currentWorkflow) return state;
      return {
        currentWorkflow: {
          ...state.currentWorkflow,
          nodes: [
            ...state.currentWorkflow.nodes,
            { id: nodeId, nodeDefinitionId: definitionId, x, y, config },
          ],
          updatedAt: new Date().toISOString(),
        },
      };
    });
    return nodeId;
  },

  removeNode(nodeId) {
    set((state) => {
      if (!state.currentWorkflow) return state;
      return {
        currentWorkflow: {
          ...state.currentWorkflow,
          nodes: state.currentWorkflow.nodes.filter((n) => n.id !== nodeId),
          edges: state.currentWorkflow.edges.filter(
            (e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId
          ),
          updatedAt: new Date().toISOString(),
        },
        selectedNodeId:
          state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      };
    });
  },

  updateNodePosition(nodeId, x, y) {
    set((state) => {
      if (!state.currentWorkflow) return state;
      return {
        currentWorkflow: {
          ...state.currentWorkflow,
          nodes: state.currentWorkflow.nodes.map((n) =>
            n.id === nodeId ? { ...n, x, y } : n
          ),
        },
      };
    });
  },

  updateNodeConfig(nodeId, config) {
    set((state) => {
      if (!state.currentWorkflow) return state;
      return {
        currentWorkflow: {
          ...state.currentWorkflow,
          nodes: state.currentWorkflow.nodes.map((n) =>
            n.id === nodeId ? { ...n, config } : n
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  selectNode(nodeId) {
    set({ selectedNodeId: nodeId });
  },

  addEdge(sourceNodeId, sourcePortId, targetNodeId, targetPortId) {
    const edgeId = uuidv4();
    set((state) => {
      if (!state.currentWorkflow) return state;
      // 重複エッジを防止
      const exists = state.currentWorkflow.edges.some(
        (e) =>
          e.sourceNodeId === sourceNodeId &&
          e.sourcePortId === sourcePortId &&
          e.targetNodeId === targetNodeId &&
          e.targetPortId === targetPortId
      );
      if (exists) return state;

      return {
        currentWorkflow: {
          ...state.currentWorkflow,
          edges: [
            ...state.currentWorkflow.edges,
            { id: edgeId, sourceNodeId, sourcePortId, targetNodeId, targetPortId },
          ],
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  removeEdge(edgeId) {
    set((state) => {
      if (!state.currentWorkflow) return state;
      return {
        currentWorkflow: {
          ...state.currentWorkflow,
          edges: state.currentWorkflow.edges.filter((e) => e.id !== edgeId),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  setRunState(runState) {
    set({ runState });
  },

  togglePalette() {
    set((state) => ({ isPaletteOpen: !state.isPaletteOpen }));
  },
}));
