"use client";

import { memo, useMemo, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { NodeDefinition, NodeAliveness } from "@/lib/nodes/types";
import { useWorkflowStore } from "@/lib/store/workflow-store";

export interface CustomNodeData {
  definition: NodeDefinition;
  config: Record<string, unknown>;
  runStatus?: "idle" | "running" | "completed" | "error";
  aliveness?: NodeAliveness;
  enabled?: boolean;
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
  const { definition, runStatus, aliveness = "dormant", enabled = false } = nodeData;
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const toggleNodeEnabled = useWorkflowStore((s) => s.toggleNodeEnabled);

  const color = categoryColors[definition.category] ?? categoryColors.custom;
  const isAlive = enabled && (aliveness === "idle" || aliveness === "active" || aliveness === "completed");

  /** ON/OFFトグル（ダブルクリック） */
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNodeEnabled(id);
  }, [id, toggleNodeEnabled]);

  // ドットのスタイル
  const dotStyle = useMemo((): React.CSSProperties => {
    const base: React.CSSProperties = {
      background: color,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    };

    // OFFの場合: 暗く、グローなし
    if (!enabled) {
      return {
        ...base,
        background: `${color}40`,
        boxShadow: "none",
        filter: "saturate(0.3)",
      };
    }

    if (runStatus === "running" || aliveness === "active") {
      return {
        ...base,
        boxShadow: `0 0 20px ${color}, 0 0 40px ${color}80, 0 0 60px ${color}40`,
      };
    }
    if (runStatus === "error" || aliveness === "error") {
      return {
        ...base,
        background: "#fca5a5",
        boxShadow: "0 0 16px #fca5a5cc, 0 0 32px #fca5a540",
      };
    }
    // ON + idle: 呼吸するグロー
    if (isAlive) {
      return {
        ...base,
        boxShadow: `0 0 10px ${color}99, 0 0 20px ${color}40`,
      };
    }
    // ON + dormant
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
  }, [color, runStatus, aliveness, enabled, isAlive, selected]);

  return (
    <div
      className="flex flex-col items-center gap-2 cursor-pointer group"
      onClick={() => selectNode(id)}
      onDoubleClick={handleDoubleClick}
      style={{ minWidth: 60 }}
    >
      {/* ── ドット本体 ── */}
      <div className="relative">
        {/* 呼吸アニメーション背景（ONかつaliveの場合） */}
        {isAlive && (
          <div
            className="absolute inset-[-6px] rounded-full node-breathing"
            style={{ background: `${color}12` }}
          />
        )}

        {/* 実行中のアニメーション */}
        {(runStatus === "running" || aliveness === "active") && (
          <div
            className="absolute inset-[-8px] rounded-full node-running-glow"
            style={{ background: `${color}15` }}
          />
        )}

        {/* メインドット */}
        <div
          className={`
            rounded-full relative
            ${!enabled ? "w-5 h-5" : "w-7 h-7"}
            ${(runStatus === "running" || aliveness === "active") ? "node-running-glow" : ""}
            ${isAlive ? "node-breathing" : ""}
            ${selected ? "scale-110" : "group-hover:scale-105"}
            transition-all duration-300
          `}
          style={dotStyle}
        />

        {/* ON/OFFインジケーター */}
        {enabled && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
            style={{
              background: isAlive ? "#6ee7b7" : color,
              boxShadow: isAlive ? "0 0 4px #6ee7b7" : "none",
            }}
          />
        )}

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
              top: `${(enabled ? 14 : 10) + (i - (definition.inputs.length - 1) / 2) * 10}px`,
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
              top: `${(enabled ? 14 : 10) + (i - (definition.outputs.length - 1) / 2) * 10}px`,
              right: "-6px",
            }}
          />
        ))}
      </div>

      {/* ── ラベル ── */}
      <span
        className={`
          text-[13px] text-center leading-tight max-w-[120px] truncate
          transition-all duration-300
          ${selected ? "" : "group-hover:!text-[#dcddde]"}
        `}
        style={{
          color: !enabled ? "#555" : selected ? color : "#999",
          opacity: enabled ? 1 : 0.6,
        }}
      >
        {definition.name}
      </span>
    </div>
  );
}

export default memo(CustomNode);
