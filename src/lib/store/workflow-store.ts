import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  WorkflowDefinition,
  WorkflowRunState,
  NodeAliveness,
} from "@/lib/nodes/types";
import { v4 as uuidv4 } from "uuid";
import { forceDirectedLayout } from "@/lib/layout/force-layout";
import type { WorkflowProposal, ProposedNode, ProposedEdge } from "@/lib/chat/workflow-generator";
import type { DiscoverySession } from "@/lib/discovery/planner";

// ── デフォルト空間: 起動時に自動生成。常に存在する。 ──
const DEFAULT_SPACE_ID = "space-default";

function createDefaultSpace(): WorkflowDefinition {
  return {
    id: DEFAULT_SPACE_ID,
    name: "Space",
    description: "全てのノードが共存する空間",
    nodes: [],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/** チャットメッセージ */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  proposal?: WorkflowProposal;
  claudeCodeInstruction?: string;
  discovery?: DiscoverySession;
}

/** 空間ストアの状態管理 */
interface WorkflowStore {
  // ── 空間（常に存在する。null にならない） ──
  currentWorkflow: WorkflowDefinition;
  workflows: WorkflowDefinition[];
  runState: WorkflowRunState | null;
  selectedNodeId: string | null;
  isPaletteOpen: boolean;

  /** 各ノードの「生きている」状態（空間が存続する限り保持） */
  nodeAliveness: Record<string, NodeAliveness>;
  /** 各ノードのON/OFF（trueで活性化） */
  nodeEnabled: Record<string, boolean>;
  /** 各エッジのON/OFF */
  edgeEnabled: Record<string, boolean>;
  /** 各ノードの最新出力キャッシュ */
  nodeOutputCache: Record<string, Record<string, unknown>>;
  /** 接続確認ダイアログ用 */
  pendingConnection: { edgeId: string; sourceNodeId: string; targetNodeId: string } | null;

  chatMessages: ChatMessage[];
  activeLeftTab: "chat" | "node";

  // 空間操作（旧ワークフロー互換）
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

  // ノード活動状態
  setNodeAliveness: (nodeId: string, status: NodeAliveness) => void;
  setNodeOutput: (nodeId: string, outputs: Record<string, unknown>) => void;

  // ON/OFF操作
  toggleNodeEnabled: (nodeId: string) => void;
  toggleEdgeEnabled: (edgeId: string) => void;
  setPendingConnection: (conn: { edgeId: string; sourceNodeId: string; targetNodeId: string } | null) => void;
  confirmConnection: (edgeId: string) => void;

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

  // ディスカバリー操作
  updateDiscoverySession: (messageId: string, session: DiscoverySession) => void;
  buildFromDiscovery: (session: DiscoverySession) => void;
}

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set, get) => ({
  // ── 空間は起動時から存在する ──
  currentWorkflow: createDefaultSpace(),
  workflows: [],
  runState: null,
  selectedNodeId: null,
  isPaletteOpen: true,
  nodeAliveness: {},
  nodeEnabled: {},
  edgeEnabled: {},
  nodeOutputCache: {},
  pendingConnection: null,
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
    const updated = {
      ...currentWorkflow,
      updatedAt: new Date().toISOString(),
    };
    const exists = workflows.some((w) => w.id === updated.id);
    set({
      currentWorkflow: updated,
      workflows: exists
        ? workflows.map((w) => (w.id === updated.id ? updated : w))
        : [...workflows, updated],
    });
  },

  deleteWorkflow(id) {
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
      // デフォルト空間は削除しても再生成
      currentWorkflow:
        state.currentWorkflow.id === id ? createDefaultSpace() : state.currentWorkflow,
    }));
  },

  addNode(definitionId, x, y, config = {}) {
    const nodeId = uuidv4();
    set((state) => ({
      currentWorkflow: {
        ...state.currentWorkflow,
        nodes: [
          ...state.currentWorkflow.nodes,
          { id: nodeId, nodeDefinitionId: definitionId, x, y, config },
        ],
        updatedAt: new Date().toISOString(),
      },
      nodeAliveness: { ...state.nodeAliveness, [nodeId]: "dormant" as NodeAliveness },
      nodeEnabled: { ...state.nodeEnabled, [nodeId]: false },
    }));
    return nodeId;
  },

  removeNode(nodeId) {
    set((state) => {
      const { [nodeId]: _alive, ...restAliveness } = state.nodeAliveness;
      const { [nodeId]: _output, ...restOutputs } = state.nodeOutputCache;
      const { [nodeId]: _enabled, ...restEnabled } = state.nodeEnabled;
      // エッジの enabled も掃除
      const removedEdgeIds = new Set(
        state.currentWorkflow.edges
          .filter((e) => e.sourceNodeId === nodeId || e.targetNodeId === nodeId)
          .map((e) => e.id)
      );
      const cleanedEdgeEnabled: Record<string, boolean> = {};
      for (const [eid, val] of Object.entries(state.edgeEnabled)) {
        if (!removedEdgeIds.has(eid)) cleanedEdgeEnabled[eid] = val;
      }
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
        nodeAliveness: restAliveness,
        nodeOutputCache: restOutputs,
        nodeEnabled: restEnabled,
        edgeEnabled: cleanedEdgeEnabled,
      };
    });
  },

  updateNodePosition(nodeId, x, y) {
    set((state) => ({
      currentWorkflow: {
        ...state.currentWorkflow,
        nodes: state.currentWorkflow.nodes.map((n) =>
          n.id === nodeId ? { ...n, x, y } : n
        ),
      },
    }));
  },

  updateNodeConfig(nodeId, config) {
    set((state) => ({
      currentWorkflow: {
        ...state.currentWorkflow,
        nodes: state.currentWorkflow.nodes.map((n) =>
          n.id === nodeId ? { ...n, config } : n
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
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
        // 新しい接続はOFF状態 + 確認ダイアログを表示
        edgeEnabled: { ...state.edgeEnabled, [edgeId]: false },
        pendingConnection: { edgeId, sourceNodeId, targetNodeId },
      };
    });
  },

  removeEdge(edgeId) {
    set((state) => ({
      currentWorkflow: {
        ...state.currentWorkflow,
        edges: state.currentWorkflow.edges.filter((e) => e.id !== edgeId),
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  setRunState(runState) {
    if (runState?.nodeStates) {
      const alivenessUpdates: Record<string, NodeAliveness> = {};
      for (const [nodeId, ns] of Object.entries(runState.nodeStates)) {
        if (ns.status === "running") alivenessUpdates[nodeId] = "active";
        else if (ns.status === "completed") alivenessUpdates[nodeId] = "completed";
        else if (ns.status === "error") alivenessUpdates[nodeId] = "error";
      }
      // 実行完了後: completed → idle（生きてる状態）に遷移
      if (runState.status === "completed") {
        for (const [nodeId, ns] of Object.entries(runState.nodeStates)) {
          if (ns.status === "completed") {
            alivenessUpdates[nodeId] = "idle";
          }
          if (ns.outputs) {
            get().setNodeOutput(nodeId, ns.outputs);
          }
        }
      }

      set((state) => ({
        runState,
        nodeAliveness: { ...state.nodeAliveness, ...alivenessUpdates },
      }));
    } else {
      set({ runState });
    }
  },

  setNodeAliveness(nodeId, status) {
    set((state) => ({
      nodeAliveness: { ...state.nodeAliveness, [nodeId]: status },
    }));
  },

  setNodeOutput(nodeId, outputs) {
    set((state) => ({
      nodeOutputCache: { ...state.nodeOutputCache, [nodeId]: outputs },
    }));
  },

  // ── ON/OFF ──

  toggleNodeEnabled(nodeId) {
    set((state) => {
      const wasEnabled = state.nodeEnabled[nodeId] ?? false;
      const newEnabled = !wasEnabled;
      return {
        nodeEnabled: { ...state.nodeEnabled, [nodeId]: newEnabled },
        nodeAliveness: {
          ...state.nodeAliveness,
          [nodeId]: newEnabled ? "idle" : "dormant",
        },
      };
    });
  },

  toggleEdgeEnabled(edgeId) {
    set((state) => ({
      edgeEnabled: { ...state.edgeEnabled, [edgeId]: !(state.edgeEnabled[edgeId] ?? false) },
    }));
  },

  setPendingConnection(conn) {
    set({ pendingConnection: conn });
  },

  confirmConnection(edgeId) {
    set((state) => ({
      edgeEnabled: { ...state.edgeEnabled, [edgeId]: true },
      pendingConnection: null,
    }));
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
    if (currentWorkflow.nodes.length === 0) return;

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
    const nodeIds: string[] = [];
    for (const pn of proposedNodes) {
      const id = get().addNode(pn.definitionId, 0, 0, pn.config);
      nodeIds.push(id);
    }

    for (const pe of proposedEdges) {
      if (nodeIds[pe.fromIndex] && nodeIds[pe.toIndex]) {
        get().addEdge(nodeIds[pe.fromIndex], pe.fromPort, nodeIds[pe.toIndex], pe.toPort);
      }
    }

    get().applyForceLayout();
  },

  // ── ディスカバリー ──

  updateDiscoverySession(messageId, session) {
    set((state) => ({
      chatMessages: state.chatMessages.map((m) =>
        m.id === messageId ? { ...m, discovery: session } : m
      ),
    }));
  },

  buildFromDiscovery(session) {
    const nodeIds: string[] = [];
    for (const node of session.nodes) {
      if (node.matchedDefinitionId) {
        const id = get().addNode(node.matchedDefinitionId, 0, 0, {});
        nodeIds.push(id);
      } else if (node.selectedRepo) {
        const packageName = node.selectedRepo.name;
        const defId = `github-${packageName}`;
        const id = get().addNode(defId, 0, 0, {
          _source: "github",
          _repo: node.selectedRepo.fullName,
          _role: node.role,
        });
        nodeIds.push(id);
      }
    }

    for (let i = 0; i < nodeIds.length - 1; i++) {
      get().addEdge(nodeIds[i], "output", nodeIds[i + 1], "input");
    }

    get().applyForceLayout();
  },
}),
    {
      name: "synapse-store",
      partialize: (state) => ({
        currentWorkflow: state.currentWorkflow,
        workflows: state.workflows,
        nodeAliveness: state.nodeAliveness,
        nodeEnabled: state.nodeEnabled,
        edgeEnabled: state.edgeEnabled,
        nodeOutputCache: state.nodeOutputCache,
        chatMessages: state.chatMessages,
      }),
    }
  )
);
