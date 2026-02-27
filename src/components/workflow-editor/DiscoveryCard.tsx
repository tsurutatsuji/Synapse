"use client";

import { useState, useCallback } from "react";
import type { DiscoverySession, PlannedNode } from "@/lib/discovery/planner";
import { autoSelectAll, manualSelect } from "@/lib/discovery/planner";
import type { GitHubRepo } from "@/lib/github/search";

interface DiscoveryCardProps {
  session: DiscoverySession;
  onSessionUpdate: (session: DiscoverySession) => void;
  onBuild: (session: DiscoverySession) => void;
}

/** ステータスに応じたドットの色 */
function statusColor(status: PlannedNode["searchStatus"]): string {
  switch (status) {
    case "use-existing":
      return "#6ee7b7";
    case "selected":
      return "#a78bfa";
    case "found":
      return "#fcd34d";
    case "searching":
      return "#93c5fd";
    case "not-found":
      return "#fca5a5";
    default:
      return "#555";
  }
}

function statusLabel(status: PlannedNode["searchStatus"]): string {
  switch (status) {
    case "use-existing":
      return "既存ノード";
    case "selected":
      return "選択済み";
    case "found":
      return "候補あり";
    case "searching":
      return "検索中...";
    case "not-found":
      return "未発見";
    default:
      return "待機中";
  }
}

/** 1つのノードの検索結果・候補表示 */
function NodeRow({
  node,
  selectionMode,
  onSelect,
}: {
  node: PlannedNode;
  selectionMode: "auto" | "manual";
  onSelect: (nodeId: string, repo: GitHubRepo) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-[4px] p-2 mb-1.5"
      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
    >
      {/* ノード行ヘッダー */}
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: statusColor(node.searchStatus),
            boxShadow: `0 0 4px ${statusColor(node.searchStatus)}60`,
          }}
        />
        <span className="text-[12px] flex-1" style={{ color: "#dcddde" }}>
          {node.role}
        </span>
        <span className="text-[10px]" style={{ color: statusColor(node.searchStatus) }}>
          {statusLabel(node.searchStatus)}
        </span>

        {/* 既存ノードの場合 */}
        {node.searchStatus === "use-existing" && node.matchedDefinitionId && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: "#6ee7b715", color: "#6ee7b7" }}
          >
            {node.matchedDefinitionId}
          </span>
        )}

        {/* 選択済みの場合 */}
        {node.searchStatus === "selected" && node.selectedRepo && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full truncate max-w-[120px]"
            style={{ background: "#7c3aed15", color: "#a78bfa" }}
          >
            {node.selectedRepo.fullName}
          </span>
        )}

        {/* 候補がある場合（手動モード）展開ボタン */}
        {node.searchStatus === "found" &&
          selectionMode === "manual" &&
          node.candidates.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] px-1.5 py-0.5 rounded-[3px]"
              style={{ background: "#fcd34d15", color: "#fcd34d" }}
            >
              {expanded ? "閉じる" : `${node.candidates.length}件`}
            </button>
          )}
      </div>

      {/* 候補リスト（手動モード、展開時） */}
      {expanded && node.candidates.length > 0 && (
        <div className="mt-2 space-y-1">
          {node.candidates.map((repo) => (
            <CandidateRow
              key={repo.fullName}
              repo={repo}
              onSelect={() => onSelect(node.id, repo)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** 候補の1行 */
function CandidateRow({
  repo,
  onSelect,
}: {
  repo: GitHubRepo;
  onSelect: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-[3px] cursor-pointer transition-colors"
      style={{ background: "#222" }}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={repo.ownerAvatar}
        alt=""
        className="w-4 h-4 rounded-full shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] truncate" style={{ color: "#a78bfa" }}>
          {repo.fullName}
        </div>
        {repo.description && (
          <div className="text-[10px] truncate" style={{ color: "#666" }}>
            {repo.description}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px]" style={{ color: "#fcd34d" }}>
          ★ {formatStars(repo.stars)}
        </span>
      </div>
      <button
        className="text-[10px] px-1.5 py-0.5 rounded-[3px] shrink-0"
        style={{ background: "#7c3aed20", color: "#a78bfa" }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        採用
      </button>
    </div>
  );
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/** メインのDiscoveryCardコンポーネント */
export default function DiscoveryCard({
  session,
  onSessionUpdate,
  onBuild,
}: DiscoveryCardProps) {
  const [isSearching, setIsSearching] = useState(false);

  /** GitHub検索を実行 */
  const runSearch = useCallback(async () => {
    setIsSearching(true);

    let updated: DiscoverySession = { ...session, status: "searching" };
    onSessionUpdate(updated);

    // 検索が必要なノードを順番に処理
    for (let i = 0; i < updated.nodes.length; i++) {
      const node = updated.nodes[i];
      if (node.searchStatus !== "pending") continue;

      // 検索中ステータスに更新
      updated = {
        ...updated,
        nodes: updated.nodes.map((n, j) =>
          j === i ? { ...n, searchStatus: "searching" as const } : n
        ),
      };
      onSessionUpdate(updated);

      // 各検索クエリを試す
      let allCandidates: GitHubRepo[] = [];
      for (const query of node.searchQueries) {
        try {
          const res = await fetch(
            `/api/github/search?q=${encodeURIComponent(query)}&perPage=5`
          );
          if (res.ok) {
            const data = await res.json();
            allCandidates = [...allCandidates, ...(data.repos ?? [])];
          }
        } catch {
          // ネットワークエラーは無視して次のクエリへ
        }
      }

      // 重複排除（fullName）
      const seen = new Set<string>();
      const uniqueCandidates = allCandidates.filter((r) => {
        if (seen.has(r.fullName)) return false;
        seen.add(r.fullName);
        return true;
      });

      // スター順にソート
      uniqueCandidates.sort((a, b) => b.stars - a.stars);

      // 上位5件に絞る
      const top = uniqueCandidates.slice(0, 5);

      updated = {
        ...updated,
        nodes: updated.nodes.map((n, j) =>
          j === i
            ? {
                ...n,
                candidates: top,
                searchStatus: top.length > 0 ? ("found" as const) : ("not-found" as const),
              }
            : n
        ),
      };
      onSessionUpdate(updated);
    }

    // 自動モードなら即選択
    if (updated.selectionMode === "auto") {
      updated = autoSelectAll(updated);
      onSessionUpdate(updated);
    } else {
      updated = { ...updated, status: "selecting" };
      onSessionUpdate(updated);
    }

    setIsSearching(false);
  }, [session, onSessionUpdate]);

  /** モード切替 */
  const toggleMode = useCallback(() => {
    const newMode = session.selectionMode === "auto" ? "manual" : "auto";
    let updated = { ...session, selectionMode: newMode as "auto" | "manual" };

    // autoに切り替えた場合、候補ありのノードを自動選択
    if (newMode === "auto") {
      updated = autoSelectAll(updated);
    }

    onSessionUpdate(updated);
  }, [session, onSessionUpdate]);

  /** 手動選択 */
  const handleSelect = useCallback(
    (nodeId: string, repo: GitHubRepo) => {
      const updated = manualSelect(session, nodeId, repo);
      onSessionUpdate(updated);
    },
    [session, onSessionUpdate]
  );

  const needsSearch = session.nodes.some((n) => n.searchStatus === "pending");
  const existingOnly = session.nodes.every((n) => n.searchStatus === "use-existing");
  const isReady = session.status === "ready" || existingOnly;

  return (
    <div
      className="mt-2 rounded-[6px] overflow-hidden"
      style={{ background: "#1e1e1e", border: "1px solid #333" }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid #2a2a2a" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: isReady ? "#6ee7b7" : "#fcd34d",
              boxShadow: `0 0 6px ${isReady ? "#6ee7b760" : "#fcd34d60"}`,
            }}
          />
          <span className="text-[11px] font-medium tracking-wider uppercase" style={{ color: "#666" }}>
            Node Discovery
          </span>
          <span className="text-[11px]" style={{ color: "#555" }}>
            ({session.nodes.length}ノード)
          </span>
        </div>

        {/* 自動/手動切替 */}
        {!existingOnly && (
          <button
            onClick={toggleMode}
            className="text-[10px] px-2 py-0.5 rounded-full transition-colors"
            style={{
              background:
                session.selectionMode === "auto" ? "#6ee7b715" : "#a78bfa15",
              color: session.selectionMode === "auto" ? "#6ee7b7" : "#a78bfa",
              border: `1px solid ${
                session.selectionMode === "auto" ? "#6ee7b730" : "#a78bfa30"
              }`,
            }}
          >
            {session.selectionMode === "auto" ? "自動選択" : "手動選択"}
          </button>
        )}
      </div>

      {/* ノードリスト */}
      <div className="px-3 py-2 space-y-0">
        {session.nodes.map((node) => (
          <NodeRow
            key={node.id}
            node={node}
            selectionMode={session.selectionMode}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* アクション */}
      <div className="px-3 pb-3 flex gap-2">
        {needsSearch && !isSearching && (
          <button
            onClick={runSearch}
            className="flex-1 px-3 py-1.5 rounded-[4px] text-[12px] transition-colors"
            style={{ background: "#fcd34d20", color: "#fcd34d", border: "1px solid #fcd34d30" }}
          >
            GitHub で検索する
          </button>
        )}

        {isSearching && (
          <div className="flex-1 flex items-center justify-center gap-2 py-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#fcd34d" }}
            />
            <span className="text-[12px]" style={{ color: "#fcd34d" }}>
              GitHub を検索中...
            </span>
          </div>
        )}

        {isReady && (
          <button
            onClick={() => onBuild(session)}
            className="flex-1 px-3 py-1.5 rounded-[4px] text-[12px] transition-colors"
            style={{ background: "#7c3aed", color: "#fff" }}
          >
            このノード構成で構築する
          </button>
        )}
      </div>
    </div>
  );
}
