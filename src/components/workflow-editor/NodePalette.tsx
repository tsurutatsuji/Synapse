"use client";

import { useMemo } from "react";
import type { NodeDefinition, NodeCategory } from "@/lib/nodes/types";
import { useWorkflowStore } from "@/lib/store/workflow-store";

interface NodePaletteProps {
  definitions: NodeDefinition[];
}

const categoryLabels: Record<NodeCategory, string> = {
  agent: "エージェント",
  data: "データ",
  control: "制御フロー",
  io: "入出力",
  transform: "変換",
  custom: "カスタム",
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
    // キャンバスの中央付近にランダムに配置
    const x = 250 + Math.random() * 200;
    const y = 150 + Math.random() * 200;
    addNode(definitionId, x, y);
  };

  if (!isPaletteOpen) {
    return (
      <button
        onClick={togglePalette}
        className="absolute left-4 top-4 z-10 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-700 text-sm"
      >
        ノード一覧 &rarr;
      </button>
    );
  }

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-200">ノードパレット</h2>
        <button
          onClick={togglePalette}
          className="text-gray-500 hover:text-gray-300 text-lg"
        >
          &times;
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {categoryOrder.map((category) => {
          const nodes = groupedNodes.get(category);
          if (!nodes || nodes.length === 0) return null;
          return (
            <div key={category} className="mb-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-1">
                {categoryLabels[category]}
              </h3>
              <div className="space-y-1">
                {nodes.map((def) => (
                  <button
                    key={def.id}
                    onClick={() => handleAddNode(def.id)}
                    disabled={!currentWorkflow}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: def.color }}
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white">
                        {def.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 pl-5">
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
