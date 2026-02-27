"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import CustomNode from "./CustomNode";
import type { CustomNodeData } from "./CustomNode";
import type { NodeDefinition } from "@/lib/nodes/types";
import { useWorkflowStore } from "@/lib/store/workflow-store";

const nodeTypes = { custom: CustomNode };

const categoryMinimapColors: Record<string, string> = {
  agent: "#a78bfa",
  io: "#6ee7b7",
  transform: "#fcd34d",
  control: "#fca5a5",
  data: "#93c5fd",
  custom: "#c4b5fd",
};

const defaultEdgeStyle = { stroke: "#a78bfa", strokeWidth: 1, opacity: 0.35 };
const enabledEdgeStyle = { stroke: "#a78bfa", strokeWidth: 1.5, opacity: 0.7 };
const disabledEdgeStyle = { stroke: "#555", strokeWidth: 1, opacity: 0.2, strokeDasharray: "4 4" };

interface WorkflowCanvasProps {
  definitions: NodeDefinition[];
}

/** 接続確認ダイアログ */
function ConnectionConfirmDialog() {
  const pendingConnection = useWorkflowStore((s) => s.pendingConnection);
  const confirmConnection = useWorkflowStore((s) => s.confirmConnection);
  const setPendingConnection = useWorkflowStore((s) => s.setPendingConnection);
  const currentWorkflow = useWorkflowStore((s) => s.currentWorkflow);

  if (!pendingConnection) return null;

  const sourceNode = currentWorkflow.nodes.find((n) => n.id === pendingConnection.sourceNodeId);
  const targetNode = currentWorkflow.nodes.find((n) => n.id === pendingConnection.targetNodeId);

  const handleConfirm = () => {
    confirmConnection(pendingConnection.edgeId);
  };

  const handleCancel = () => {
    setPendingConnection(null);
  };

  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-[8px] px-4 py-3 flex items-center gap-3 animate-fade-in"
      style={{
        background: "#2b2b2b",
        border: "1px solid #7c3aed40",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px #7c3aed20",
      }}
    >
      <div
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ background: "#a78bfa", boxShadow: "0 0 8px #a78bfa" }}
      />
      <span className="text-[13px]" style={{ color: "#dcddde" }}>
        このつながりをONにしますか？
      </span>
      <span className="text-[11px]" style={{ color: "#666" }}>
        {sourceNode?.nodeDefinitionId ?? "?"} → {targetNode?.nodeDefinitionId ?? "?"}
      </span>
      <button
        onClick={handleConfirm}
        className="px-3 py-1 rounded-[4px] text-[12px] transition-colors"
        style={{ background: "#7c3aed", color: "#fff" }}
      >
        ONにする
      </button>
      <button
        onClick={handleCancel}
        className="px-2 py-1 rounded-[4px] text-[12px] transition-colors"
        style={{ color: "#666" }}
      >
        あとで
      </button>
    </div>
  );
}

export default function WorkflowCanvas({ definitions }: WorkflowCanvasProps) {
  const {
    currentWorkflow,
    runState,
    nodeAliveness,
    nodeEnabled,
    edgeEnabled,
    updateNodePosition,
    addEdge: addWorkflowEdge,
    removeEdge: removeWorkflowEdge,
    selectNode,
  } = useWorkflowStore();

  const rfNodes: Node[] = useMemo(() => {
    return currentWorkflow.nodes.map((wn) => {
      const def = definitions.find((d) => d.id === wn.nodeDefinitionId);
      const nodeRunState = runState?.nodeStates[wn.id];
      return {
        id: wn.id,
        type: "custom",
        position: { x: wn.x, y: wn.y },
        data: {
          definition: def ?? {
            id: wn.nodeDefinitionId,
            name: wn.config._role as string || wn.nodeDefinitionId,
            description: "",
            category: "custom",
            inputs: [{ id: "input", label: "入力", type: "any" }],
            outputs: [{ id: "output", label: "出力", type: "any" }],
          },
          config: wn.config,
          runStatus: nodeRunState?.status ?? "idle",
          aliveness: nodeAliveness[wn.id] ?? "dormant",
          enabled: nodeEnabled[wn.id] ?? false,
        } satisfies CustomNodeData,
      };
    });
  }, [currentWorkflow, definitions, runState, nodeAliveness, nodeEnabled]);

  const rfEdges: Edge[] = useMemo(() => {
    const isRunning = runState?.status === "running";
    return currentWorkflow.edges.map((we) => {
      const isOn = edgeEnabled[we.id] ?? false;
      return {
        id: we.id,
        source: we.sourceNodeId,
        sourceHandle: we.sourcePortId,
        target: we.targetNodeId,
        targetHandle: we.targetPortId,
        animated: isRunning && isOn,
        type: "default",
        style: isRunning && isOn
          ? { stroke: "#a78bfa", strokeWidth: 2, opacity: 0.8 }
          : isOn
            ? enabledEdgeStyle
            : disabledEdgeStyle,
      };
    });
  }, [currentWorkflow, runState, edgeEnabled]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      updateNodePosition(node.id, node.position.x, node.position.y);
    },
    [updateNodePosition]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.sourceHandle && connection.target && connection.targetHandle) {
        addWorkflowEdge(connection.source, connection.sourceHandle, connection.target, connection.targetHandle);
        setEdges((eds) =>
          addEdge({ ...connection, style: defaultEdgeStyle }, eds)
        );
      }
    },
    [addWorkflowEdge, setEdges]
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      for (const edge of deletedEdges) removeWorkflowEdge(edge.id);
    },
    [removeWorkflowEdge]
  );

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => selectNode(node.id),
    [selectNode]
  );

  const onPaneClick = useCallback(() => selectNode(null), [selectNode]);

  useMemo(() => {
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [rfNodes, rfEdges, setNodes, setEdges]);

  // 空間は常に存在する。ノードが0個でも空間を表示する。
  const isEmpty = currentWorkflow.nodes.length === 0;

  return (
    <div className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        style={{ background: "#1e1e1e" }}
        defaultEdgeOptions={{
          style: defaultEdgeStyle,
          type: "default",
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={0.8}
          color="#333333"
        />
        <Controls
          className="!rounded-ob !shadow-ob-md"
          style={{
            background: "#2b2b2b",
            border: "1px solid #3a3a3a",
          }}
        />
        <MiniMap
          className="!rounded-ob !shadow-ob-md"
          style={{
            background: "#252525",
            border: "1px solid #3a3a3a",
          }}
          nodeColor={(node) => {
            const data = node.data as CustomNodeData;
            const category = data?.definition?.category ?? "custom";
            return categoryMinimapColors[category] ?? "#c4b5fd";
          }}
          maskColor="rgba(30, 30, 30, 0.7)"
        />
      </ReactFlow>

      {/* 空の場合のヒント */}
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="flex items-center justify-center gap-6 mb-6 opacity-20">
              <div className="w-4 h-4 rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 12px #a78bfa60" }} />
              <div className="w-px h-6" style={{ background: "#a78bfa40" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#6ee7b7", boxShadow: "0 0 8px #6ee7b760" }} />
              <div className="w-px h-6" style={{ background: "#6ee7b740" }} />
              <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#fcd34d", boxShadow: "0 0 8px #fcd34d60" }} />
            </div>
            <p className="text-[14px] mb-1" style={{ color: "#555" }}>
              Space
            </p>
            <p className="text-[12px]" style={{ color: "#444" }}>
              左のチャットで何を作りたいか伝えてください
            </p>
            <p className="text-[11px] mt-1" style={{ color: "#3a3a3a" }}>
              ノードをダブルクリックでON/OFF
            </p>
          </div>
        </div>
      )}

      {/* 接続確認ダイアログ */}
      <ConnectionConfirmDialog />
    </div>
  );
}
