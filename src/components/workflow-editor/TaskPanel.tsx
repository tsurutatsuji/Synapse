"use client";

import { useState, useMemo } from "react";
import type { NodeDefinition, NodeCategory } from "@/lib/nodes/types";
import { useWorkflowStore, type Session } from "@/lib/store/workflow-store";
import NodeInspector from "./NodeInspector";

interface TaskPanelProps {
  definitions: NodeDefinition[];
}

const categoryLabels: Record<NodeCategory, string> = {
  agent: "つくる",
  data: "用意する",
  control: "流れを変える",
  io: "外とつながる",
  transform: "加工する",
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

type TaskTab = "sessions" | "nodes" | "inspector" | "settings";

/** セッション一覧アイテム */
function SessionItem({ session, isCurrent }: { session: Session; isCurrent: boolean }) {
  const { switchSession, deleteSession, renameSession } = useWorkflowStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);

  const nodeCount = session.workflow.nodes.length;
  const msgCount = session.chatMessages.length;
  const hasActiveNodes = session.isActive;

  const handleRename = () => {
    if (editTitle.trim()) {
      renameSession(session.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      onClick={() => switchSession(session.id)}
      className="group px-3 py-2.5 cursor-pointer transition-all duration-150 rounded-[6px] mx-1 mb-0.5"
      style={{
        background: isCurrent ? "#333" : "transparent",
        borderLeft: isCurrent ? "2px solid #a78bfa" : "2px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!isCurrent) e.currentTarget.style.background = "#2a2a2a";
      }}
      onMouseLeave={(e) => {
        if (!isCurrent) e.currentTarget.style.background = "transparent";
      }}
    >
      <div className="flex items-center gap-2">
        {/* ステータスドット */}
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: hasActiveNodes ? "#6ee7b7" : "#555",
            boxShadow: hasActiveNodes ? "0 0 6px #6ee7b7" : "none",
          }}
        />

        {/* タイトル */}
        {isEditing ? (
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); }}
            className="flex-1 text-[13px] bg-transparent border-b outline-none"
            style={{ color: "#dcddde", borderColor: "#a78bfa" }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="flex-1 text-[13px] truncate"
            style={{ color: isCurrent ? "#dcddde" : "#999" }}
            onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          >
            {session.title}
          </span>
        )}

        {/* 削除ボタン */}
        <button
          onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] px-1 rounded"
          style={{ color: "#666" }}
        >
          x
        </button>
      </div>

      {/* メタ情報 */}
      <div className="flex items-center gap-3 mt-1 pl-4">
        {nodeCount > 0 && (
          <span className="text-[11px]" style={{ color: "#555" }}>
            {nodeCount}ノード
          </span>
        )}
        {msgCount > 0 && (
          <span className="text-[11px]" style={{ color: "#555" }}>
            {msgCount}件
          </span>
        )}
        {hasActiveNodes && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#6ee7b715", color: "#6ee7b7" }}>
            実行中
          </span>
        )}
      </div>
    </div>
  );
}

export default function TaskPanel({ definitions }: TaskPanelProps) {
  const {
    addNode,
    currentWorkflow,
    selectedNodeId,
    sessions,
    currentSessionId,
    createSession,
  } = useWorkflowStore();
  const [activeTab, setActiveTab] = useState<TaskTab>("sessions");

  const effectiveTab = selectedNodeId ? "inspector" : activeTab === "inspector" ? "sessions" : activeTab;

  // セッションを「動いている」「止まっている」に分類
  const { activeSessions, inactiveSessions } = useMemo(() => {
    const store = useWorkflowStore.getState();
    const synced = sessions.map((s) => {
      if (s.id !== currentSessionId) return s;
      const hasActive = Object.values(store.nodeEnabled).some(Boolean);
      return { ...s, isActive: hasActive, workflow: store.currentWorkflow, chatMessages: store.chatMessages };
    });
    return {
      activeSessions: synced.filter((s) => s.isActive),
      inactiveSessions: synced.filter((s) => !s.isActive),
    };
  }, [sessions, currentSessionId]);

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
        {(["sessions", "nodes", "inspector", "settings"] as TaskTab[]).map((tab) => {
          const label = tab === "sessions" ? "Sessions"
            : tab === "nodes" ? "Nodes"
            : tab === "inspector" ? "Inspector"
            : "Settings";
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
        {/* ── Sessions Tab ── */}
        {effectiveTab === "sessions" && (
          <div className="h-full overflow-y-auto py-2">
            <button
              onClick={() => createSession()}
              className="w-full px-3 py-2 text-[13px] text-left transition-colors rounded-[4px] mx-1 mb-2"
              style={{ color: "#a78bfa", width: "calc(100% - 8px)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#7c3aed15"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              + 新しいセッション
            </button>

            {activeSessions.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 px-3 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#6ee7b7", boxShadow: "0 0 4px #6ee7b7" }} />
                  <span className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: "#6ee7b7" }}>
                    ACTIVE
                  </span>
                  <span className="text-[10px]" style={{ color: "#555" }}>{activeSessions.length}</span>
                </div>
                {activeSessions.map((s) => (
                  <SessionItem key={s.id} session={s} isCurrent={s.id === currentSessionId} />
                ))}
              </div>
            )}

            {inactiveSessions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-3 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#555" }} />
                  <span className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: "#555" }}>
                    INACTIVE
                  </span>
                  <span className="text-[10px]" style={{ color: "#444" }}>{inactiveSessions.length}</span>
                </div>
                {inactiveSessions.map((s) => (
                  <SessionItem key={s.id} session={s} isCurrent={s.id === currentSessionId} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Nodes Tab ── */}
        {effectiveTab === "nodes" && (
          <div className="h-full overflow-y-auto py-3 px-2">
            {categoryOrder.map((category) => {
              const nodes = groupedNodes.get(category);
              if (!nodes || nodes.length === 0) return null;
              return (
                <div key={category} className="mb-4">
                  <div className="flex items-center gap-2 px-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a78bfa", opacity: 0.6 }} />
                    <span className="text-[10px] font-medium tracking-[0.15em]" style={{ color: "#555" }}>
                      {categoryLabels[category]}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {nodes.map((def) => (
                      <button
                        key={def.id}
                        onClick={() => handleAddNode(def.id)}
                        disabled={!currentWorkflow}
                        className="w-full text-left px-3 py-1.5 rounded-[4px] transition-all duration-150 disabled:opacity-30"
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
                        <p className="text-[11px] mt-0.5" style={{ color: "#555" }}>{def.description}</p>
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

        {effectiveTab === "settings" && <SettingsContent />}
      </div>
    </div>
  );
}

function SettingsContent() {
  const [status, setStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleTest = async () => {
    setStatus("testing");
    setErrorMsg("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "ping" }] }),
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
        <h3 className="text-[12px] font-medium tracking-[0.15em] uppercase mb-3" style={{ color: "#555" }}>Claude API</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] mb-1" style={{ color: "#999" }}>接続ステータス</label>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{
                background: status === "ok" ? "#6ee7b7" : status === "error" ? "#fca5a5" : status === "testing" ? "#fcd34d" : "#555",
              }} />
              <span className="text-[12px]" style={{
                color: status === "ok" ? "#6ee7b7" : status === "error" ? "#fca5a5" : status === "testing" ? "#fcd34d" : "#666",
              }}>
                {status === "ok" ? "接続OK" : status === "error" ? "エラー" : status === "testing" ? "テスト中..." : "未テスト"}
              </span>
            </div>
            {errorMsg && <p className="text-[11px] mt-1" style={{ color: "#fca5a5" }}>{errorMsg}</p>}
          </div>
          <button
            onClick={handleTest}
            disabled={status === "testing"}
            className="w-full px-3 py-2 rounded-[4px] text-[12px] transition-colors disabled:opacity-50"
            style={{ background: "#7c3aed", color: "#fff" }}
          >
            接続テスト
          </button>
          <div className="rounded-[6px] p-3 text-[11px]" style={{ background: "#1e1e1e", border: "1px solid #333", color: "#666" }}>
            <p className="mb-2 font-medium" style={{ color: "#999" }}>APIキー設定方法:</p>
            <p>1. <code style={{ color: "#a78bfa" }}>.env.local</code> を開く</p>
            <p>2. <code style={{ color: "#a78bfa" }}>ANTHROPIC_API_KEY=sk-...</code> を設定</p>
            <p>3. サーバーを再起動</p>
          </div>
        </div>
      </div>
    </div>
  );
}
