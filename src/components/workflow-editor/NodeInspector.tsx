"use client";

import { useMemo } from "react";
import type { NodeDefinition } from "@/lib/nodes/types";
import { useWorkflowStore } from "@/lib/store/workflow-store";

interface NodeInspectorProps {
  definitions: NodeDefinition[];
}

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
      <div className="w-72 bg-gray-900 border-l border-gray-700 p-4">
        <p className="text-gray-500 text-sm text-center mt-8">
          ノードを選択して設定を表示
        </p>
      </div>
    );
  }

  const handleConfigChange = (key: string, value: string) => {
    const newConfig = { ...selectedNode.config, [key]: value };
    updateNodeConfig(selectedNode.id, newConfig);
  };

  return (
    <div className="w-72 bg-gray-900 border-l border-gray-700 flex flex-col h-full overflow-hidden">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: definition.color }}
          />
          <h2 className="text-sm font-semibold text-gray-200">
            {definition.name}
          </h2>
        </div>
        <p className="text-xs text-gray-500 mt-1">{definition.description}</p>
      </div>

      {/* 設定フォーム */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            設定
          </h3>
          {definition.inputs.map((port) => (
            <div key={port.id} className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">
                {port.label}
                {port.required && (
                  <span className="text-red-400 ml-1">*</span>
                )}
              </label>
              {port.type === "boolean" ? (
                <select
                  value={String(selectedNode.config[port.id] ?? port.defaultValue ?? "false")}
                  onChange={(e) => handleConfigChange(port.id, e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : (
                <textarea
                  value={String(selectedNode.config[port.id] ?? port.defaultValue ?? "")}
                  onChange={(e) => handleConfigChange(port.id, e.target.value)}
                  rows={port.type === "object" || port.type === "array" ? 3 : 1}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500 resize-y"
                  placeholder={`${port.type}型`}
                />
              )}
            </div>
          ))}
        </div>

        {/* 実行結果 */}
        {nodeRunState && (
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              実行結果
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    nodeRunState.status === "completed"
                      ? "bg-green-400"
                      : nodeRunState.status === "error"
                      ? "bg-red-400"
                      : nodeRunState.status === "running"
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-gray-600"
                  }`}
                />
                <span className="text-xs text-gray-400">
                  {nodeRunState.status}
                </span>
              </div>
              {nodeRunState.outputs && (
                <pre className="text-xs text-gray-400 bg-gray-800 rounded p-2 overflow-auto max-h-40">
                  {JSON.stringify(nodeRunState.outputs, null, 2)}
                </pre>
              )}
              {nodeRunState.error && (
                <p className="text-xs text-red-400 bg-red-950 rounded p-2">
                  {nodeRunState.error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 削除ボタン */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => removeNode(selectedNode.id)}
          className="w-full px-3 py-2 bg-red-900/50 hover:bg-red-900 text-red-300 rounded text-sm transition-colors"
        >
          ノードを削除
        </button>
      </div>
    </div>
  );
}
