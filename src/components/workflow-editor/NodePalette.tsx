"use client";

import { useMemo } from "react";
import type { NodeDefinition, NodeCategory } from "@/lib/nodes/types";
import { useWorkflowStore } from "@/lib/store/workflow-store";

interface NodePaletteProps {
  definitions: NodeDefinition[];
}

const categoryLabels: Record<NodeCategory, string> = {
  agent: "AGENT",
  data: "DATA",
  control: "CONTROL",
  io: "I/O",
  transform: "TRANSFORM",
  custom: "CUSTOM",
};

const categoryDotColors: Record<NodeCategory, string> = {
  agent: "#a78bfa",
  io: "#6ee7b7",
  transform: "#fcd34d",
  control: "#fca5a5",
  data: "#93c5fd",
  custom: "#c4b5fd",
};

const categoryOrder: NodeCategory[] = [
  "agent",
  "io",
  "transform",
  "control",
  "data",
  "custom",
];

export default function NodePalette({ definitions }: NodePaletteProps) {
  const { addNode, currentWorkflow, isPaletteOpen, togglePalette } =
    useWorkflowStore();

  const groupedNodes = useMemo(() => {
    const groups = new Map<NodeCategory, NodeDefinition[]>();
    for (const def of definitions) {
      const list = groups.get(def.category) ?? [];
      list.push(def);
      groups.set(def.category, list);
    }
    return groups;
  }, [definitions]);

  const handleAddNode = (definitionId: string) => {
    if (!currentWorkflow) return;
    const x = 250 + Math.random() * 200;
    const y = 150 + Math.random() * 200;
    addNode(definitionId, x, y);
  };

  if (!isPaletteOpen) {
    return (
      <button
        onClick={togglePalette}
        className="absolute left-4 top-4 z-10 rounded-ob px-4 py-2 text-[14px] transition-colors"
        style={{
          background: "#2b2b2b",
          border: "1px solid #3a3a3a",
          color: "#999",
        }}
      >
        Nodes
      </button>
    );
  }

  return (
    <div
      className="w-64 flex flex-col h-full overflow-hidden"
      style={{
        background: "#252525",
        borderRight: "1px solid #333",
      }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #333" }}
      >
        <span className="text-[12px] font-medium tracking-widest uppercase" style={{ color: "#666" }}>
          Nodes
        </span>
        <button
          onClick={togglePalette}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors"
          style={{ color: "#666" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#dcddde")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        >
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 2l6 6M8 2l-6 6" />
          </svg>
        </button>
      </div>

      {/* ノード一覧 */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {categoryOrder.map((category) => {
          const nodes = groupedNodes.get(category);
          if (!nodes || nodes.length === 0) return null;
          const dotColor = categoryDotColors[category];
          return (
            <div key={category} className="mb-4">
              <div className="flex items-center gap-2 px-2 mb-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: dotColor, boxShadow: `0 0 4px ${dotColor}60` }}
                />
                <span
                  className="text-[11px] font-medium tracking-[0.15em]"
                  style={{ color: "#555" }}
                >
                  {categoryLabels[category]}
                </span>
              </div>
              <div className="space-y-0.5">
                {nodes.map((def) => (
                  <button
                    key={def.id}
                    onClick={() => handleAddNode(def.id)}
                    disabled={!currentWorkflow}
                    className="w-full text-left px-3 py-2 rounded-[4px] transition-all duration-150 group disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ color: "#999" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#333";
                      e.currentTarget.style.color = "#dcddde";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#999";
                    }}
                  >
                    <span className="text-[14px]">{def.name}</span>
                    <p className="text-[12px] mt-0.5" style={{ color: "#555" }}>
                      {def.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
