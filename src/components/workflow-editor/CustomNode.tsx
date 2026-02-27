"use client";

import { memo, useMemo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { NodeDefinition } from "@/lib/nodes/types";
import { useWorkflowStore } from "@/lib/store/workflow-store";

export interface CustomNodeData {
  definition: NodeDefinition;
  config: Record<string, unknown>;
  runStatus?: "idle" | "running" | "completed" | "error";
  [key: string]: unknown;
}

const categoryColors: Record<string, { bg: string; border: string; dot: string }> = {
  agent:     { bg: "#7c3aed20", border: "#7c3aed", dot: "#a78bfa" },
  io:        { bg: "#10b98120", border: "#10b981", dot: "#6ee7b7" },
  transform: { bg: "#f59e0b20", border: "#f59e0b", dot: "#fcd34d" },
  control:   { bg: "#ef444420", border: "#ef4444", dot: "#fca5a5" },
  data:      { bg: "#3b82f620", border: "#3b82f6", dot: "#93c5fd" },
  custom:    { bg: "#8b5cf620", border: "#8b5cf6", dot: "#c4b5fd" },
};

function CustomNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const { definition, runStatus } = nodeData;
  const selectNode = useWorkflowStore((s) => s.selectNode);

  const colors = categoryColors[definition.category] ?? categoryColors.custom;

  const statusStyle = useMemo(() => {
    switch (runStatus) {
      case "running":
        return "animate-pulse-glow";
      case "completed":
        return "shadow-[0_0_12px_rgba(16,185,129,0.3)]";
      case "error":
        return "shadow-[0_0_12px_rgba(239,68,68,0.3)]";
      default:
        return "";
    }
  }, [runStatus]);

  return (
    <div
      className={`
        rounded-ob min-w-[220px] transition-all duration-200 animate-fade-in
        ${selected ? "shadow-ob-glow" : "shadow-ob-md"}
        ${statusStyle}
      `}
      style={{
        background: "#2b2b2b",
        border: `1px solid ${selected ? colors.border : "#3a3a3a"}`,
      }}
      onClick={() => selectNode(id)}
    >
      {/* ── ヘッダー ── */}
      <div
        className="px-4 py-2.5 rounded-t-ob flex items-center gap-2.5"
        style={{ background: colors.bg }}
      >
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{
            background: colors.dot,
            boxShadow: `0 0 6px ${colors.dot}80`,
          }}
        />
        <span
          className="text-[14px] font-medium tracking-wide truncate"
          style={{ color: "#dcddde" }}
        >
          {definition.name}
        </span>
      </div>

      {/* ── 入力ポート ── */}
      {definition.inputs.length > 0 && (
        <div className="px-4 py-2">
          {definition.inputs.map((port) => (
            <div key={port.id} className="relative flex items-center py-1">
              <Handle
                type="target"
                position={Position.Left}
                id={port.id}
                className="!w-2.5 !h-2.5 !rounded-full !border-0"
                style={{
                  top: "auto",
                  background: colors.dot,
                  boxShadow: `0 0 4px ${colors.dot}60`,
                }}
              />
              <span className="text-[13px] ml-2" style={{ color: "#999" }}>
                {port.label}
              </span>
              <span className="text-[11px] ml-auto" style={{ color: "#555" }}>
                {port.type}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── 区切り線 ── */}
      {definition.inputs.length > 0 && definition.outputs.length > 0 && (
        <div className="mx-4" style={{ borderTop: "1px solid #3a3a3a" }} />
      )}

      {/* ── 出力ポート ── */}
      {definition.outputs.length > 0 && (
        <div className="px-4 py-2">
          {definition.outputs.map((port) => (
            <div key={port.id} className="relative flex items-center py-1">
              <span className="text-[13px]" style={{ color: "#999" }}>
                {port.label}
              </span>
              <span className="text-[11px] ml-auto mr-2" style={{ color: "#555" }}>
                {port.type}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={port.id}
                className="!w-2.5 !h-2.5 !rounded-full !border-0"
                style={{
                  top: "auto",
                  background: colors.dot,
                  boxShadow: `0 0 4px ${colors.dot}60`,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(CustomNode);
