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

/** カテゴリ別のミニマップドットカラー */
const categoryMinimapColors: Record<string, string> = {
  agent: "#a78bfa",
  io: "#6ee7b7",
  transform: "#fcd34d",
  control: "#fca5a5",
  data: "#93c5fd",
  custom: "#c4b5fd",
};

interface WorkflowCanvasProps {
  definitions: NodeDefinition[];
}

export default function WorkflowCanvas({ definitions }: WorkflowCanvasProps) {
  const {
    currentWorkflow,
    runState,
    updateNodePosition,
    addEdge: addWorkflowEdge,
    removeEdge: removeWorkflowEdge,
    selectNode,
  } = useWorkflowStore();

  const rfNodes: Node[] = useMemo(() => {
    if (!currentWorkflow) return [];
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
            name: "Unknown",
            description: "",
            category: "custom",
            inputs: [],
            outputs: [],
          },
          config: wn.config,
          runStatus: nodeRunState?.status ?? "idle",
        } satisfies CustomNodeData,
      };
    });
  }, [currentWorkflow, definitions, runState]);

  const rfEdges: Edge[] = useMemo(() => {
    if (!currentWorkflow) return [];
    return currentWorkflow.edges.map((we) => ({
      id: we.id,
      source: we.sourceNodeId,
      sourceHandle: we.sourcePortId,
      target: we.targetNodeId,
      targetHandle: we.targetPortId,
      animated: runState?.status === "running",
      style: { stroke: "#a78bfa", strokeWidth: 1.5, opacity: 0.5 },
    }));
  }, [currentWorkflow, runState]);

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
          addEdge({ ...connection, style: { stroke: "#a78bfa", strokeWidth: 1.5, opacity: 0.5 } }, eds)
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

  if (!currentWorkflow) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "#1e1e1e" }}>
        <div className="text-center">
          <div
            className="w-8 h-8 rounded-full mx-auto mb-4"
            style={{ background: "#7c3aed20", border: "1px solid #7c3aed40" }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 8px #a78bfa60" }} />
            </div>
          </div>
          <p className="text-[16px] mb-2" style={{ color: "#666" }}>
            No workflow open
          </p>
          <p className="text-[13px]" style={{ color: "#444" }}>
            Create a new workflow or open an existing one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full">
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
          style: { stroke: "#a78bfa", strokeWidth: 1.5, opacity: 0.5 },
          type: "smoothstep",
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
    </div>
  );
}
