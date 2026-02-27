"use client";

import { memo, useMemo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { NodeDefinition } from "@/lib/nodes/types";
import { useWorkflowStore } from "@/lib/store/workflow-store";

/** React Flow上で表示するカスタムノードのデータ型 */
export interface CustomNodeData {
  definition: NodeDefinition;
  config: Record<string, unknown>;
  runStatus?: "idle" | "running" | "completed" | "error";
  [key: string]: unknown;
}

/** アイコンマッピング（テキストベース） */
const iconMap: Record<string, string> = {
  MessageSquare: "💬",
  FileInput: "📄",
  FileOutput: "📝",
  Shuffle: "🔀",
  GitBranch: "🔀",
  Terminal: "⚡",
  Merge: "🔗",
};

function CustomNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const { definition, runStatus } = nodeData;
  const selectNode = useWorkflowStore((s) => s.selectNode);

  const statusColor = useMemo(() => {
    switch (runStatus) {
      case "running":
        return "ring-2 ring-yellow-400 animate-pulse";
      case "completed":
        return "ring-2 ring-green-400";
      case "error":
        return "ring-2 ring-red-400";
      default:
        return "";
    }
  }, [runStatus]);

  return (
    <div
      className={`
        bg-gray-800 rounded-lg shadow-lg border min-w-[200px]
        ${selected ? "border-blue-500" : "border-gray-600"}
        ${statusColor}
      `}
      onClick={() => selectNode(id)}
    >
      {/* ヘッダー */}
      <div
        className="px-3 py-2 rounded-t-lg flex items-center gap-2"
        style={{ backgroundColor: definition.color ?? "#6366f1" }}
      >
        <span className="text-sm">
          {iconMap[definition.icon ?? ""] ?? "⬡"}
        </span>
        <span className="text-white text-sm font-semibold truncate">
          {definition.name}
        </span>
        <span className="text-white/60 text-xs ml-auto">
          {definition.category}
        </span>
      </div>

      {/* 入力ポート */}
      <div className="px-3 py-1">
        {definition.inputs.map((port, i) => (
          <div key={port.id} className="relative flex items-center py-1">
            <Handle
              type="target"
              position={Position.Left}
              id={port.id}
              className="!w-3 !h-3 !bg-blue-400 !border-2 !border-gray-700"
              style={{ top: "auto" }}
            />
            <span className="text-gray-400 text-xs ml-2">{port.label}</span>
            <span className="text-gray-600 text-xs ml-auto">{port.type}</span>
          </div>
        ))}
      </div>

      {/* 区切り線 */}
      {definition.inputs.length > 0 && definition.outputs.length > 0 && (
        <div className="border-t border-gray-700 mx-2" />
      )}

      {/* 出力ポート */}
      <div className="px-3 py-1">
        {definition.outputs.map((port, i) => (
          <div key={port.id} className="relative flex items-center py-1">
            <span className="text-gray-400 text-xs">{port.label}</span>
            <span className="text-gray-600 text-xs ml-auto mr-2">
              {port.type}
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id={port.id}
              className="!w-3 !h-3 !bg-green-400 !border-2 !border-gray-700"
              style={{ top: "auto" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(CustomNode);
