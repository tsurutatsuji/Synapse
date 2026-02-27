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

/** Obsidianグラフビューのカテゴリカラー */
const categoryColors: Record<string, string> = {
  agent:     "#a78bfa",
  io:        "#6ee7b7",
  transform: "#fcd34d",
  control:   "#fca5a5",
  data:      "#93c5fd",
  custom:    "#c4b5fd",
};

function CustomNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const { definition, runStatus } = nodeData;
  const selectNode = useWorkflowStore((s) => s.selectNode);

  const color = categoryColors[definition.category] ?? categoryColors.custom;

  // 実行ステータスに応じたドットサイズとグロー
  const dotStyle = useMemo((): React.CSSProperties => {
    const base: React.CSSProperties = {
      background: color,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    };

    if (runStatus === "running") {
      return {
        ...base,
        boxShadow: `0 0 20px ${color}, 0 0 40px ${color}80, 0 0 60px ${color}40`,
      };
    }
    if (runStatus === "completed") {
      return {
        ...base,
        boxShadow: `0 0 12px ${color}cc, 0 0 24px ${color}40`,
      };
    }
    if (runStatus === "error") {
      return {
        ...base,
        background: "#fca5a5",
        boxShadow: "0 0 16px #fca5a5cc, 0 0 32px #fca5a540",
      };
    }
    // idle / default
    if (selected) {
      return {
        ...base,
        boxShadow: `0 0 12px ${color}cc, 0 0 24px ${color}60`,
      };
    }
    return {
      ...base,
      boxShadow: `0 0 8px ${color}60`,
    };
  }, [color, runStatus, selected]);

  return (
    <div
      className="flex flex-col items-center gap-2 cursor-pointer group"
      onClick={() => selectNode(id)}
      style={{ minWidth: 60 }}
    >
      {/* ── ドット本体 ── */}
      <div className="relative">
        {/* グロー背景（running時のアニメーション） */}
        {runStatus === "running" && (
          <div
            className="absolute inset-[-8px] rounded-full node-running-glow"
            style={{ background: `${color}15` }}
          />
        )}

        {/* メインドット */}
        <div
          className={`
            w-7 h-7 rounded-full relative
            ${runStatus === "running" ? "node-running-glow" : ""}
            ${selected ? "scale-110" : "group-hover:scale-105"}
            transition-transform duration-200
          `}
          style={dotStyle}
        />

        {/* 左ハンドル（入力） */}
        {definition.inputs.map((port, i) => (
          <Handle
            key={port.id}
            type="target"
            position={Position.Left}
            id={port.id}
            className="!w-3 !h-3 !rounded-full !border-2 !border-[#1e1e1e] !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-200"
            style={{
              background: color,
              top: `${14 + (i - (definition.inputs.length - 1) / 2) * 10}px`,
              left: "-6px",
            }}
          />
        ))}

        {/* 右ハンドル（出力） */}
        {definition.outputs.map((port, i) => (
          <Handle
            key={port.id}
            type="source"
            position={Position.Right}
            id={port.id}
            className="!w-3 !h-3 !rounded-full !border-2 !border-[#1e1e1e] !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-200"
            style={{
              background: color,
              top: `${14 + (i - (definition.outputs.length - 1) / 2) * 10}px`,
              right: "-6px",
            }}
          />
        ))}
      </div>

      {/* ── ラベル ── */}
      <span
        className={`
          text-[13px] text-center leading-tight max-w-[120px] truncate
          transition-colors duration-200
          ${selected ? "" : "group-hover:!text-[#dcddde]"}
        `}
        style={{ color: selected ? color : "#999" }}
      >
        {definition.name}
      </span>
    </div>
  );
}

export default memo(CustomNode);
