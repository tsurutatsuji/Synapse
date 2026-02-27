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

/** Obsidian風: 統一されたドットカラー（紫ベース） */
const DOT_COLOR = "#a78bfa";
const DOT_COLOR_DIM = "#a78bfa50";
const DOT_COLOR_GLOW = "#a78bfa";

function CustomNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const { definition, runStatus, aliveness = "dormant", enabled = false, config } = nodeData;
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const toggleNodeEnabled = useWorkflowStore((s) => s.toggleNodeEnabled);

  const isAlive = enabled && (aliveness === "idle" || aliveness === "active" || aliveness === "completed");

  /** ON/OFFトグル（ダブルクリック） */
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNodeEnabled(id);
  }, [id, toggleNodeEnabled]);

  // 表示名: _fileName > definition.name
  const displayName = (config._fileName as string) ?? definition.name;

  // ドットスタイル
  const dotStyle = useMemo((): React.CSSProperties => {
    const base: React.CSSProperties = {
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    };

    // OFFの場合: 暗い
    if (!enabled) {
      return {
        ...base,
        background: DOT_COLOR_DIM,
        boxShadow: "none",
      };
    }

    if (runStatus === "running" || aliveness === "active") {
      return {
        ...base,
        background: DOT_COLOR,
        boxShadow: `0 0 12px ${DOT_COLOR_GLOW}, 0 0 24px ${DOT_COLOR_GLOW}60`,
      };
    }
    if (runStatus === "error" || aliveness === "error") {
      return {
        ...base,
        background: "#fca5a5",
        boxShadow: "0 0 8px #fca5a580",
      };
    }
    // ON + alive
    if (isAlive) {
      return {
        ...base,
        background: DOT_COLOR,
        boxShadow: `0 0 6px ${DOT_COLOR_GLOW}80`,
      };
    }
    // ON + selected
    if (selected) {
      return {
        ...base,
        background: DOT_COLOR,
        boxShadow: `0 0 8px ${DOT_COLOR_GLOW}99`,
      };
    }
    // ON + dormant
    return {
      ...base,
      background: DOT_COLOR,
      boxShadow: `0 0 4px ${DOT_COLOR_GLOW}40`,
    };
  }, [runStatus, aliveness, enabled, isAlive, selected]);

  return (
    <div
      className="flex flex-col items-center gap-1 cursor-pointer group"
      onClick={() => selectNode(id)}
      onDoubleClick={handleDoubleClick}
      style={{ minWidth: 50 }}
    >
      {/* ── ドット本体 ── */}
      <div className="relative">
        {/* 呼吸アニメーション */}
        {isAlive && (
          <div
            className="absolute inset-[-4px] rounded-full node-breathing"
            style={{ background: `${DOT_COLOR}10` }}
          />
        )}

        {/* 実行中パルス */}
        {(runStatus === "running" || aliveness === "active") && (
          <div
            className="absolute inset-[-6px] rounded-full node-running-glow"
            style={{ background: `${DOT_COLOR}12` }}
          />
        )}

        {/* メインドット — Obsidian風に小さく */}
        <div
          className={`
            rounded-full relative
            ${!enabled ? "w-3 h-3" : isAlive ? "w-4 h-4" : "w-3.5 h-3.5"}
            ${(runStatus === "running" || aliveness === "active") ? "node-running-glow" : ""}
            ${isAlive ? "node-breathing" : ""}
            ${selected ? "scale-110" : "group-hover:scale-105"}
            transition-all duration-300
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
            className="!w-2 !h-2 !rounded-full !border-[1.5px] !border-[#1e1e1e] !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-200"
            style={{
              background: DOT_COLOR,
              top: `${(enabled ? 8 : 6) + (i - (definition.inputs.length - 1) / 2) * 8}px`,
              left: "-4px",
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
            className="!w-2 !h-2 !rounded-full !border-[1.5px] !border-[#1e1e1e] !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-200"
            style={{
              background: DOT_COLOR,
              top: `${(enabled ? 8 : 6) + (i - (definition.outputs.length - 1) / 2) * 8}px`,
              right: "-4px",
            }}
          />
        ))}
      </div>

      {/* ── ラベル（機能名） ── */}
      <span
        className={`
          text-[11px] text-center leading-tight max-w-[100px] truncate
          transition-all duration-300
          ${selected ? "" : "group-hover:!text-[#dcddde]"}
        `}
        style={{
          color: !enabled ? "#555" : selected ? DOT_COLOR : "#888",
          opacity: enabled ? 1 : 0.5,
        }}
      >
        {displayName}
      </span>
    </div>
  );
}

export default memo(CustomNode);
