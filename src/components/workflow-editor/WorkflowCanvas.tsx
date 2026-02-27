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
import type { NodeDefinition, WorkflowDefinition } from "@/lib/nodes/types";
import { useWorkflowStore } from "@/lib/store/workflow-store";

const nodeTypes = { custom: CustomNode };

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

  // ワークフローのノードをReact Flowのノード形式に変換
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
            name: "不明なノード",
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

  // ワークフローのエッジをReact Flowのエッジ形式に変換
  const rfEdges: Edge[] = useMemo(() => {
    if (!currentWorkflow) return [];
    return currentWorkflow.edges.map((we) => ({
      id: we.id,
      source: we.sourceNodeId,
      sourceHandle: we.sourcePortId,
      target: we.targetNodeId,
      targetHandle: we.targetPortId,
      animated: runState?.status === "running",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    }));
  }, [currentWorkflow, runState]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // ノードが移動された時
  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      updateNodePosition(node.id, node.position.x, node.position.y);
    },
    [updateNodePosition]
  );

  // 新しいエッジが接続された時
  const onConnect = useCallback(
    (connection: Connection) => {
      if (
        connection.source &&
        connection.sourceHandle &&
        connection.target &&
        connection.targetHandle
      ) {
        addWorkflowEdge(
          connection.source,
          connection.sourceHandle,
          connection.target,
          connection.targetHandle
        );
        setEdges((eds) => addEdge({ ...connection, style: { stroke: "#6366f1", strokeWidth: 2 } }, eds));
      }
    },
    [addWorkflowEdge, setEdges]
  );

  // エッジが削除された時
  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      for (const edge of deletedEdges) {
        removeWorkflowEdge(edge.id);
      }
    },
    [removeWorkflowEdge]
  );

  // ノードクリック時
  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // キャンバスクリック時（ノード選択解除）
  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  // currentWorkflowが変更されたらReact Flowの状態を同期
  useMemo(() => {
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [rfNodes, rfEdges, setNodes, setEdges]);

  if (!currentWorkflow) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">ワークフローが選択されていません</p>
          <p className="text-gray-600 text-sm">
            新しいワークフローを作成するか、既存のワークフローを開いてください
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
        className="bg-gray-950"
        defaultEdgeOptions={{
          style: { stroke: "#6366f1", strokeWidth: 2 },
          type: "smoothstep",
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#374151"
        />
        <Controls className="!bg-gray-800 !border-gray-600 !rounded-lg [&>button]:!bg-gray-800 [&>button]:!border-gray-600 [&>button]:!text-gray-300 [&>button:hover]:!bg-gray-700" />
        <MiniMap
          className="!bg-gray-800 !border-gray-600 !rounded-lg"
          nodeColor={(node) => {
            const data = node.data as CustomNodeData;
            return data?.definition?.color ?? "#6366f1";
          }}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  );
}
