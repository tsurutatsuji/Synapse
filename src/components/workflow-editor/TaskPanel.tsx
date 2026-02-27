"use client";

import { useState, useMemo } from "react";
import type { NodeDefinition, NodeCategory } from "@/lib/nodes/types";
import { useWorkflowStore } from "@/lib/store/workflow-store";
import NodeInspector from "./NodeInspector";

interface TaskPanelProps {
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

type TaskTab = "nodes" | "inspector" | "settings";

export default function TaskPanel({ definitions }: TaskPanelProps) {
  const { addNode, currentWorkflow, selectedNodeId, selectNode } =
    useWorkflowStore();
  const [activeTab, setActiveTab] = useState<TaskTab>("nodes");

  // ノード選択されたらインスペクタータブに自動切替
  const effectiveTab = selectedNodeId ? "inspector" : activeTab === "inspector" ? "nodes" : activeTab;

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

  const apiKeyStatus = typeof window !== "undefined" ? "unknown" : "unknown";

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "#252525" }}
    >
      {/* タブヘッダー */}
      <div
        className="flex items-center gap-0 px-2 pt-2 shrink-0"
        style={{ borderBottom: "1px solid #333" }}
      >
        {(["nodes", "inspector", "settings"] as TaskTab[]).map((tab) => {
          const label = tab === "nodes" ? "Nodes" : tab === "inspector" ? "Inspector" : "Settings";
          const isActive = effectiveTab === tab;
          const isDisabled = tab === "inspector" && !selectedNodeId;
          return (
            <button
              key={tab}
              onClick={() => {
                if (tab === "inspector" && selectedNodeId) setActiveTab(tab);
                else if (tab !== "inspector") setActiveTab(tab);
              }}
              disabled={isDisabled}
              className="px-3 py-2 text-[12px] transition-colors relative"
              style={{
                color: isActive ? "#dcddde" : "#555",
                opacity: isDisabled ? 0.3 : 1,
              }}
            >
              {label}
              {isActive && (
                <div
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                  style={{ background: "#7c3aed" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-hidden">
        {effectiveTab === "nodes" && (
          <div className="h-full overflow-y-auto py-3 px-2">
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
                      className="text-[10px] font-medium tracking-[0.15em]"
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
                        className="w-full text-left px-3 py-1.5 rounded-[4px] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
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
                        <span className="text-[13px]">{def.name}</span>
                        <p className="text-[11px] mt-0.5" style={{ color: "#555" }}>
                          {def.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {effectiveTab === "inspector" && selectedNodeId && (
          <NodeInspector definitions={definitions} />
        )}

        {effectiveTab === "settings" && (
          <SettingsContent />
        )}
      </div>
    </div>
  );
}

/** API設定パネル */
function SettingsContent() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleTest = async () => {
    setStatus("testing");
    setErrorMsg("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "ping" }],
        }),
      });
      if (res.ok) {
        setStatus("ok");
      } else {
        const data = await res.json();
        setStatus("error");
        setErrorMsg(data.message || "接続に失敗しました");
      }
    } catch {
      setStatus("error");
      setErrorMsg("サーバーに接続できません");
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-5">
      <div>
        <h3 className="text-[12px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: "#555" }}>
          Claude API
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-[12px] mb-1" style={{ color: "#999" }}>
              接続ステータス
            </label>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background:
                    status === "ok" ? "#6ee7b7"
                    : status === "error" ? "#fca5a5"
                    : status === "testing" ? "#fcd34d"
                    : "#555",
                }}
              />
              <span className="text-[12px]" style={{
                color:
                  status === "ok" ? "#6ee7b7"
                  : status === "error" ? "#fca5a5"
                  : status === "testing" ? "#fcd34d"
                  : "#666",
              }}>
                {status === "ok" ? "接続OK"
                  : status === "error" ? "エラー"
                  : status === "testing" ? "テスト中..."
                  : "未テスト"}
              </span>
            </div>
            {errorMsg && (
              <p className="text-[11px] mt-1" style={{ color: "#fca5a5" }}>{errorMsg}</p>
            )}
          </div>

          <button
            onClick={handleTest}
            disabled={status === "testing"}
            className="w-full px-3 py-2 rounded-[4px] text-[12px] transition-colors disabled:opacity-50"
            style={{ background: "#7c3aed", color: "#fff" }}
          >
            接続テスト
          </button>

          <div
            className="rounded-[6px] p-3 text-[11px]"
            style={{ background: "#1e1e1e", border: "1px solid #333", color: "#666" }}
          >
            <p className="mb-2 font-medium" style={{ color: "#999" }}>APIキー設定方法:</p>
            <p>1. <code style={{ color: "#a78bfa" }}>.env.local</code> ファイルを開く</p>
            <p>2. <code style={{ color: "#a78bfa" }}>ANTHROPIC_API_KEY=sk-...</code> を設定</p>
            <p>3. サーバーを再起動 (<code style={{ color: "#a78bfa" }}>npm run dev</code>)</p>
            <p className="mt-2">
              APIキーは{" "}
              <span style={{ color: "#a78bfa" }}>console.anthropic.com</span>
              {" "}で取得できます
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[12px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: "#555" }}>
          アプリ情報
        </h3>
        <div className="space-y-1 text-[12px]" style={{ color: "#666" }}>
          <p>EasyClaw v0.1.0</p>
          <p>Next.js 14 / React 18</p>
          <p>AI Model: Claude Sonnet</p>
        </div>
      </div>
    </div>
  );
}
