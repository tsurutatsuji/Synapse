import { create } from "zustand";
import type {
  WorkflowDefinition,
  WorkflowRunState,
} from "@/lib/nodes/types";
import { v4 as uuidv4 } from "uuid";
import { forceDirectedLayout } from "@/lib/layout/force-layout";
import type { WorkflowProposal, ProposedNode, ProposedEdge } from "@/lib/chat/workflow-generator";

/** チャットメッセージ */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  /** 提案が含まれる場合 */
  proposal?: WorkflowProposal;
  /** Claude Code用の指示文 */
  claudeCodeInstruction?: string;
}

/** ワークフローエディタの状態管理 */
interface WorkflowStore {
  currentWorkflow: WorkflowDefinition | null;
  workflows: WorkflowDefinition[];
  runState: WorkflowRunState | null;
  selectedNodeId: string | null;
  isPaletteOpen: boolean;

  /** チャットメッセージ */
  chatMessages: ChatMessage[];
  /** 左パネルのアクティブタブ */
  activeLeftTab: "chat" | "node";

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

  // チャット操作
  addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  setActiveLeftTab: (tab: "chat" | "node") => void;

  // 提案操作
  approveProposal: (proposalId: string) => void;
  rejectProposal: (proposalId: string) => void;

  // 力学レイアウト
  applyForceLayout: () => void;

  // 提案からワークフロー構築
  buildFromProposal: (nodes: ProposedNode[], edges: ProposedEdge[]) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  currentWorkflow: null,
  workflows: [],
  runState: null,
  selectedNodeId: null,
  isPaletteOpen: true,
  chatMessages: [],
  activeLeftTab: "chat",

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
    set({
      selectedNodeId: nodeId,
      activeLeftTab: nodeId ? "node" : "chat",
    });
  },

  addEdge(sourceNodeId, sourcePortId, targetNodeId, targetPortId) {
    const edgeId = uuidv4();
    set((state) => {
      if (!state.currentWorkflow) return state;
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

  // ── チャット ──

  addChatMessage(msg) {
    const message: ChatMessage = {
      ...msg,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    }));
  },

  setActiveLeftTab(tab) {
    set({ activeLeftTab: tab });
  },

  // ── 提案 ──

  approveProposal(proposalId) {
    set((state) => ({
      chatMessages: state.chatMessages.map((m) =>
        m.proposal?.id === proposalId
          ? { ...m, proposal: { ...m.proposal, status: "approved" as const } }
          : m
      ),
    }));
  },

  rejectProposal(proposalId) {
    set((state) => ({
      chatMessages: state.chatMessages.map((m) =>
        m.proposal?.id === proposalId
          ? { ...m, proposal: { ...m.proposal, status: "rejected" as const } }
          : m
      ),
    }));
  },

  // ── 力学レイアウト ──

  applyForceLayout() {
    const { currentWorkflow } = get();
    if (!currentWorkflow || currentWorkflow.nodes.length === 0) return;

    const positions = forceDirectedLayout(
      currentWorkflow.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
      currentWorkflow.edges,
      { centerX: 400, centerY: 300 }
    );

    const posMap = new Map(positions.map((p) => [p.id, p]));
    set({
      currentWorkflow: {
        ...currentWorkflow,
        nodes: currentWorkflow.nodes.map((n) => {
          const pos = posMap.get(n.id);
          return pos ? { ...n, x: pos.x, y: pos.y } : n;
        }),
      },
    });
  },

  // ── 提案からワークフロー構築 ──

  buildFromProposal(proposedNodes, proposedEdges) {
    const state = get();

    // ワークフローがなければ自動作成
    if (!state.currentWorkflow) {
      get().createWorkflow("新しいワークフロー", "チャットから自動生成");
    }

    // ノード追加
    const nodeIds: string[] = [];
    for (const pn of proposedNodes) {
      const id = get().addNode(pn.definitionId, 0, 0, pn.config);
      nodeIds.push(id);
    }

    // エッジ追加
    for (const pe of proposedEdges) {
      if (nodeIds[pe.fromIndex] && nodeIds[pe.toIndex]) {
        get().addEdge(nodeIds[pe.fromIndex], pe.fromPort, nodeIds[pe.toIndex], pe.toPort);
      }
    }

    // 力学レイアウト適用
    get().applyForceLayout();
  },
}));
