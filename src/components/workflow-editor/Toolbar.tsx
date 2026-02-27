"use client";

import { useState } from "react";
import { useWorkflowStore } from "@/lib/store/workflow-store";

function ToolbarButton({
  children,
  onClick,
  disabled,
  variant = "default",
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "accent" | "run";
  title?: string;
}) {
  const baseStyle: React.CSSProperties = {
    background:
      variant === "accent" ? "#7c3aed" :
      variant === "run" ? "transparent" :
      "transparent",
    color:
      variant === "accent" ? "#fff" :
      variant === "run" ? "#a78bfa" :
      "#999",
    border:
      variant === "run" ? "1px solid #7c3aed40" :
      variant === "accent" ? "1px solid #7c3aed" :
      "1px solid transparent",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="px-3 py-1.5 rounded-[4px] text-[13px] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
      style={baseStyle}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background =
            variant === "accent" ? "#6d28d9" :
            variant === "run" ? "#7c3aed20" :
            "#333";
          if (variant === "default") e.currentTarget.style.color = "#dcddde";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = baseStyle.background as string;
          e.currentTarget.style.color = baseStyle.color as string;
        }
      }}
    >
      {children}
    </button>
  );
}

export default function Toolbar() {
  const {
    currentWorkflow,
    workflows,
    runState,
    nodeEnabled,
    nodeAliveness,
    loadWorkflow,
    saveWorkflow,
    deleteWorkflow,
    setRunState,
    applyForceLayout,
  } = useWorkflowStore();

  const [showListDialog, setShowListDialog] = useState(false);

  // ONになっているノードの数
  const activeCount = Object.values(nodeEnabled).filter(Boolean).length;
  const aliveCount = Object.values(nodeAliveness).filter((a) => a === "idle" || a === "active").length;

  const handleRun = async () => {
    setRunState({
      workflowId: currentWorkflow.id,
      status: "running",
      nodeStates: {},
      startedAt: new Date().toISOString(),
    });

    try {
      const res = await fetch("/api/workflow/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow: currentWorkflow }),
      });
      if (res.ok) {
        const result = await res.json();
        setRunState(result);
      } else {
        setRunState({
          workflowId: currentWorkflow.id, status: "error", nodeStates: {},
          completedAt: new Date().toISOString(),
        });
      }
    } catch {
      setRunState({
        workflowId: currentWorkflow.id, status: "error", nodeStates: {},
        completedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <>
      <div
        className="h-12 flex items-center px-4 gap-2"
        style={{ background: "#252525", borderBottom: "1px solid #333" }}
      >
        {/* ロゴ */}
        <div className="flex items-center gap-2 mr-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 6px #a78bfa60" }} />
          <span className="text-[15px] font-semibold tracking-wide" style={{ color: "#dcddde" }}>
            Synapse
          </span>
        </div>

        <div className="w-px h-4 mx-1" style={{ background: "#3a3a3a" }} />

        <ToolbarButton onClick={saveWorkflow}>
          Save
        </ToolbarButton>
        <ToolbarButton onClick={() => setShowListDialog(true)}>
          Spaces
        </ToolbarButton>

        <div className="w-px h-4 mx-1" style={{ background: "#3a3a3a" }} />

        <ToolbarButton
          onClick={applyForceLayout}
          disabled={currentWorkflow.nodes.length === 0}
          title="力学レイアウト"
        >
          Auto Layout
        </ToolbarButton>

        {/* ノード数とステータス */}
        <div className="flex items-center gap-3 ml-3">
          <span className="text-[12px]" style={{ color: "#555" }}>
            {currentWorkflow.nodes.length} nodes
          </span>
          {activeCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#6ee7b7", boxShadow: "0 0 4px #6ee7b7" }} />
              <span className="text-[11px]" style={{ color: "#6ee7b7" }}>
                {activeCount} ON
              </span>
            </div>
          )}
          {aliveCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full node-breathing" style={{ background: "#a78bfa" }} />
              <span className="text-[11px]" style={{ color: "#a78bfa" }}>
                {aliveCount} alive
              </span>
            </div>
          )}
        </div>

        {/* 右寄せ: ステータス + 実行 */}
        <div className="ml-auto flex items-center gap-2">
          {runState?.status === "running" && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#fcd34d", boxShadow: "0 0 6px #fcd34d80" }} />
              <span className="text-[12px]" style={{ color: "#fcd34d" }}>Running</span>
            </div>
          )}
          {runState?.status === "completed" && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#6ee7b7" }} />
              <span className="text-[12px]" style={{ color: "#6ee7b7" }}>Done</span>
            </div>
          )}
          {runState?.status === "error" && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#fca5a5" }} />
              <span className="text-[12px]" style={{ color: "#fca5a5" }}>Error</span>
            </div>
          )}
          <ToolbarButton
            onClick={handleRun}
            disabled={currentWorkflow.nodes.length === 0 || runState?.status === "running"}
            variant="run"
          >
            Run
          </ToolbarButton>
        </div>
      </div>

      {/* 空間一覧モーダル */}
      {showListDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div
            className="rounded-ob p-5 w-96 max-h-[60vh] flex flex-col animate-fade-in"
            style={{ background: "#2b2b2b", border: "1px solid #3a3a3a", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
          >
            <h2 className="text-[16px] font-medium mb-3" style={{ color: "#dcddde" }}>
              Saved Spaces
            </h2>
            <div className="flex-1 overflow-y-auto space-y-1">
              {workflows.length === 0 ? (
                <p className="text-[12px] text-center py-8" style={{ color: "#555" }}>
                  保存された空間はまだありません。「Save」で現在の空間を保存できます。
                </p>
              ) : (
                workflows.map((wf) => (
                  <div
                    key={wf.id}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-[4px] transition-colors"
                    style={{
                      background: currentWorkflow.id === wf.id ? "#7c3aed15" : "transparent",
                      border: `1px solid ${currentWorkflow.id === wf.id ? "#7c3aed40" : "transparent"}`,
                    }}
                    onMouseEnter={(e) => {
                      if (currentWorkflow.id !== wf.id) e.currentTarget.style.background = "#333";
                    }}
                    onMouseLeave={(e) => {
                      if (currentWorkflow.id !== wf.id) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] truncate" style={{ color: "#dcddde" }}>
                        {wf.name}
                      </p>
                      <p className="text-[12px] truncate" style={{ color: "#555" }}>
                        {wf.nodes.length} nodes / {wf.edges.length} connections
                      </p>
                    </div>
                    <button
                      onClick={() => { loadWorkflow(wf); setShowListDialog(false); }}
                      className="px-2 py-1 rounded-[3px] text-[12px] transition-colors"
                      style={{ color: "#a78bfa", border: "1px solid #7c3aed40" }}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteWorkflow(wf.id)}
                      className="px-2 py-1 rounded-[3px] text-[12px] transition-colors"
                      style={{ color: "#fca5a5", border: "1px solid #4a202040" }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-3 pt-2" style={{ borderTop: "1px solid #333" }}>
              <button
                onClick={() => setShowListDialog(false)}
                className="px-4 py-2 text-[13px] rounded-[4px]"
                style={{ color: "#666" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
