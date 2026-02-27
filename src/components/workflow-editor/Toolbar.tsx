"use client";

import { useState } from "react";
import { useWorkflowStore } from "@/lib/store/workflow-store";

export default function Toolbar() {
  const {
    currentWorkflow,
    workflows,
    runState,
    createWorkflow,
    loadWorkflow,
    saveWorkflow,
    deleteWorkflow,
    setRunState,
  } = useWorkflowStore();

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    createWorkflow(newName.trim(), newDesc.trim());
    setNewName("");
    setNewDesc("");
    setShowNewDialog(false);
  };

  const handleRun = async () => {
    if (!currentWorkflow) return;
    // ワークフロー実行はサーバーサイドAPIで行う（将来実装）
    // ここではUI上の状態変更のみ
    setRunState({
      workflowId: currentWorkflow.id,
      status: "running",
      nodeStates: {},
      startedAt: new Date().toISOString(),
    });

    // API呼び出し（実装予定）
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
          workflowId: currentWorkflow.id,
          status: "error",
          nodeStates: {},
          completedAt: new Date().toISOString(),
        });
      }
    } catch {
      setRunState({
        workflowId: currentWorkflow.id,
        status: "error",
        nodeStates: {},
        completedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <>
      <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-3">
        {/* ロゴ */}
        <h1 className="text-sm font-bold text-gray-200 mr-4">
          Workflow Creator
        </h1>

        {/* ワークフロー操作 */}
        <button
          onClick={() => setShowNewDialog(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
        >
          新規作成
        </button>
        <button
          onClick={() => setShowListDialog(true)}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
        >
          ワークフロー一覧
        </button>
        <button
          onClick={saveWorkflow}
          disabled={!currentWorkflow}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          保存
        </button>

        {/* 現在のワークフロー名 */}
        {currentWorkflow && (
          <span className="text-gray-400 text-xs border-l border-gray-700 pl-3 ml-2">
            {currentWorkflow.name}
          </span>
        )}

        {/* 右寄せ: 実行ボタン */}
        <div className="ml-auto flex items-center gap-2">
          {runState?.status === "running" && (
            <span className="text-yellow-400 text-xs animate-pulse">
              実行中...
            </span>
          )}
          {runState?.status === "completed" && (
            <span className="text-green-400 text-xs">完了</span>
          )}
          {runState?.status === "error" && (
            <span className="text-red-400 text-xs">エラー</span>
          )}
          <button
            onClick={handleRun}
            disabled={!currentWorkflow || runState?.status === "running"}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            ▶ 実行
          </button>
        </div>
      </div>

      {/* 新規作成ダイアログ */}
      {showNewDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold text-gray-200 mb-4">
              新しいワークフロー
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">名前</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  placeholder="マイワークフロー"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">説明</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 resize-none"
                  rows={2}
                  placeholder="ワークフローの説明（任意）"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowNewDialog(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded disabled:opacity-50"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ワークフロー一覧ダイアログ */}
      {showListDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-[480px] max-h-[70vh] flex flex-col">
            <h2 className="text-lg font-semibold text-gray-200 mb-4">
              ワークフロー一覧
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2">
              {workflows.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  ワークフローがありません
                </p>
              ) : (
                workflows.map((wf) => (
                  <div
                    key={wf.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      currentWorkflow?.id === wf.id
                        ? "border-blue-500 bg-blue-950/30"
                        : "border-gray-700 hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">
                        {wf.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {wf.description || "説明なし"} ・ ノード: {wf.nodes.length}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        loadWorkflow(wf);
                        setShowListDialog(false);
                      }}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded"
                    >
                      開く
                    </button>
                    <button
                      onClick={() => deleteWorkflow(wf.id)}
                      className="px-3 py-1 bg-red-900/50 hover:bg-red-900 text-red-300 text-xs rounded"
                    >
                      削除
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-gray-700">
              <button
                onClick={() => setShowListDialog(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
