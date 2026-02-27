"use client";

import { useMemo } from "react";
import type { NodeDefinition } from "@/lib/nodes/types";
import { useWorkflowStore } from "@/lib/store/workflow-store";

interface NodeInspectorProps {
  definitions: NodeDefinition[];
}

const categoryDotColors: Record<string, string> = {
  agent: "#a78bfa",
  io: "#6ee7b7",
  transform: "#fcd34d",
  control: "#fca5a5",
  data: "#93c5fd",
  custom: "#c4b5fd",
};

export default function NodeInspector({ definitions }: NodeInspectorProps) {
  const { currentWorkflow, selectedNodeId, updateNodeConfig, removeNode, runState } =
    useWorkflowStore();

  const selectedNode = useMemo(() => {
    if (!currentWorkflow || !selectedNodeId) return null;
    return currentWorkflow.nodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [currentWorkflow, selectedNodeId]);

  const definition = useMemo(() => {
    if (!selectedNode) return null;
    return definitions.find((d) => d.id === selectedNode.nodeDefinitionId) ?? null;
  }, [selectedNode, definitions]);

  const nodeRunState = useMemo(() => {
    if (!runState || !selectedNodeId) return null;
    return runState.nodeStates[selectedNodeId] ?? null;
  }, [runState, selectedNodeId]);

  if (!selectedNode || !definition) {
    return (
      <div className="w-72 p-4" style={{ background: "#252525", borderLeft: "1px solid #333" }}>
        <p className="text-[14px] text-center mt-8" style={{ color: "#555" }}>
          Select a node to inspect
        </p>
      </div>
    );
  }

  const dotColor = categoryDotColors[definition.category] ?? "#c4b5fd";

  const handleConfigChange = (key: string, value: string) => {
    const newConfig = { ...selectedNode.config, [key]: value };
    updateNodeConfig(selectedNode.id, newConfig);
  };

  return (
    <div
      className="w-72 flex flex-col h-full overflow-hidden"
      style={{ background: "#252525", borderLeft: "1px solid #333" }}
    >
      {/* ── ヘッダー ── */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid #333" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: dotColor, boxShadow: `0 0 4px ${dotColor}60` }}
          />
          <span className="text-[15px] font-medium" style={{ color: "#dcddde" }}>
            {definition.name}
          </span>
        </div>
        <p className="text-[12px] mt-1.5 pl-5" style={{ color: "#666" }}>
          {definition.description}
        </p>
      </div>

      {/* ── 設定フォーム ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <span className="text-[11px] font-medium tracking-[0.15em] uppercase" style={{ color: "#555" }}>
          Properties
        </span>
        {definition.inputs.map((port) => (
          <div key={port.id}>
            <label className="block text-[13px] mb-1" style={{ color: "#999" }}>
              {port.label}
              {port.required && (
                <span style={{ color: "#7c3aed" }} className="ml-0.5">*</span>
              )}
            </label>
            {port.type === "boolean" ? (
              <select
                value={String(selectedNode.config[port.id] ?? port.defaultValue ?? "false")}
                onChange={(e) => handleConfigChange(port.id, e.target.value)}
                className="w-full rounded-[4px] px-3 py-2 text-[14px] transition-colors"
                style={{
                  background: "#1e1e1e",
                  border: "1px solid #3a3a3a",
                  color: "#dcddde",
                }}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : (
              <textarea
                value={String(selectedNode.config[port.id] ?? port.defaultValue ?? "")}
                onChange={(e) => handleConfigChange(port.id, e.target.value)}
                rows={port.type === "object" || port.type === "array" ? 3 : 1}
                className="w-full rounded-[4px] px-3 py-2 text-[14px] resize-y transition-colors"
                style={{
                  background: "#1e1e1e",
                  border: "1px solid #3a3a3a",
                  color: "#dcddde",
                }}
                placeholder={port.type}
              />
            )}
          </div>
        ))}

        {/* ── 実行結果 ── */}
        {nodeRunState && (
          <div className="pt-2" style={{ borderTop: "1px solid #333" }}>
            <span className="text-[11px] font-medium tracking-[0.15em] uppercase" style={{ color: "#555" }}>
              Output
            </span>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background:
                      nodeRunState.status === "completed" ? "#6ee7b7"
                      : nodeRunState.status === "error" ? "#fca5a5"
                      : nodeRunState.status === "running" ? "#fcd34d"
                      : "#555",
                    boxShadow:
                      nodeRunState.status === "running"
                        ? "0 0 6px #fcd34d80"
                        : "none",
                  }}
                />
                <span className="text-[13px]" style={{ color: "#999" }}>
                  {nodeRunState.status}
                </span>
              </div>
              {nodeRunState.outputs && (
                <pre
                  className="text-[12px] rounded-[4px] p-2.5 overflow-auto max-h-40"
                  style={{ background: "#1e1e1e", color: "#999", border: "1px solid #333" }}
                >
                  {JSON.stringify(nodeRunState.outputs, null, 2)}
                </pre>
              )}
              {nodeRunState.error && (
                <p
                  className="text-[12px] rounded-[4px] p-2.5"
                  style={{ background: "#2d1b1b", color: "#fca5a5", border: "1px solid #4a2020" }}
                >
                  {nodeRunState.error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 削除ボタン ── */}
      <div className="px-4 py-3" style={{ borderTop: "1px solid #333" }}>
        <button
          onClick={() => removeNode(selectedNode.id)}
          className="w-full px-3 py-2 rounded-[4px] text-[13px] transition-all duration-150"
          style={{ background: "#2d1b1b", color: "#fca5a5", border: "1px solid #4a2020" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#3d2020")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2d1b1b")}
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}
