"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useWorkflowStore, type ChatMessage } from "@/lib/store/workflow-store";
import { parseCodeToNodes } from "@/lib/chat/workflow-generator";
import { planNodes } from "@/lib/discovery/planner";
import type { DiscoverySession } from "@/lib/discovery/planner";
import DiscoveryCard from "./DiscoveryCard";

// ── 思考中のドットアニメーション ──
function ThinkingBubble() {
  return (
    <div className="flex justify-start mb-4">
      <div
        className="rounded-[14px] px-5 py-3.5 flex items-center gap-2"
        style={{ background: "#2a2a2a", border: "1px solid #3a3a3a" }}
      >
        <span className="text-[15px]" style={{ color: "#a78bfa" }}>考え中</span>
        <span className="flex gap-1">
          <span
            className="w-[6px] h-[6px] rounded-full animate-bounce"
            style={{ background: "#a78bfa", animationDelay: "0ms", animationDuration: "1.2s" }}
          />
          <span
            className="w-[6px] h-[6px] rounded-full animate-bounce"
            style={{ background: "#a78bfa", animationDelay: "200ms", animationDuration: "1.2s" }}
          />
          <span
            className="w-[6px] h-[6px] rounded-full animate-bounce"
            style={{ background: "#a78bfa", animationDelay: "400ms", animationDuration: "1.2s" }}
          />
        </span>
      </div>
    </div>
  );
}

// ── ストリーミング中のバブル（カーソル点滅付き） ──
function StreamingBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start mb-4">
      <div
        className="max-w-[90%] rounded-[14px] px-5 py-3.5"
        style={{ background: "#2a2a2a", border: "1px solid #3a3a3a" }}
      >
        <div className="text-[15px] leading-[1.7] whitespace-pre-wrap" style={{ color: "#e0e0e0" }}>
          {text}
          <span
            className="inline-block w-[2px] h-[18px] ml-0.5 align-text-bottom animate-pulse"
            style={{ background: "#a78bfa" }}
          />
        </div>
      </div>
    </div>
  );
}

/** 承認カード */
function ApprovalCard({ message }: { message: ChatMessage }) {
  const { approveProposal, rejectProposal, buildFromProposal, addChatMessage } =
    useWorkflowStore();
  const proposal = message.proposal;
  if (!proposal) return null;

  const isPending = proposal.status === "pending";

  const handleApprove = () => {
    approveProposal(proposal.id);
    buildFromProposal(proposal.nodes, proposal.edges);
    addChatMessage({
      role: "system",
      content: `ワークフロー「${proposal.description}」を構築しました。右のグラフマップで確認できます。`,
    });
  };

  const handleReject = () => {
    rejectProposal(proposal.id);
    addChatMessage({
      role: "system",
      content: "提案を却下しました。別の指示をどうぞ。",
    });
  };

  return (
    <div
      className="mt-3 rounded-[10px] p-4"
      style={{
        background: "#1e1e1e",
        border: `1px solid ${
          proposal.status === "approved" ? "#6ee7b740" :
          proposal.status === "rejected" ? "#fca5a540" :
          "#7c3aed40"
        }`,
      }}
    >
      <div className="text-[12px] font-medium tracking-wider uppercase mb-2" style={{ color: "#666" }}>
        Workflow Proposal
      </div>
      <div className="text-[15px] mb-3" style={{ color: "#dcddde" }}>
        {proposal.description}
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {proposal.nodes.map((n, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-full text-[13px]"
            style={{ background: "#7c3aed20", color: "#a78bfa", border: "1px solid #7c3aed30" }}
          >
            {n.label}
          </span>
        ))}
      </div>

      {isPending ? (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            className="flex-1 px-4 py-2.5 rounded-[8px] text-[15px] font-medium transition-colors"
            style={{ background: "#7c3aed", color: "#fff" }}
          >
            OK - 構築する
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2.5 rounded-[8px] text-[15px] transition-colors"
            style={{ background: "transparent", color: "#666", border: "1px solid #3a3a3a" }}
          >
            やり直す
          </button>
        </div>
      ) : (
        <div
          className="text-[14px] px-3 py-1.5 rounded-[6px] inline-block"
          style={{
            background: proposal.status === "approved" ? "#6ee7b715" : "#fca5a515",
            color: proposal.status === "approved" ? "#6ee7b7" : "#fca5a5",
          }}
        >
          {proposal.status === "approved" ? "構築済み" : "却下済み"}
        </div>
      )}
    </div>
  );
}

/** ディスカバリーカードのラッパー */
function DiscoveryCardWrapper({ message }: { message: ChatMessage }) {
  const { updateDiscoverySession, buildFromDiscovery, addChatMessage } =
    useWorkflowStore();
  const session = message.discovery;
  if (!session) return null;

  const handleUpdate = (updated: DiscoverySession) => {
    updateDiscoverySession(message.id, updated);
  };

  const handleBuild = async (finalSession: DiscoverySession) => {
    const githubNodes = finalSession.nodes.filter(
      (n) => n.selectedRepo && n.searchStatus === "selected"
    );

    if (githubNodes.length > 0) {
      addChatMessage({
        role: "system",
        content: `${githubNodes.length}個のパッケージをインストール中...`,
      });

      for (const node of githubNodes) {
        if (!node.selectedRepo) continue;
        try {
          const res = await fetch("/api/discovery/install", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              repoFullName: node.selectedRepo.fullName,
              role: node.role,
              category: "custom",
            }),
          });
          const data = await res.json();
          if (data.success) {
            addChatMessage({
              role: "system",
              content: `${node.selectedRepo.name} をインストール・登録しました`,
            });
          } else {
            addChatMessage({
              role: "system",
              content: `${node.selectedRepo.name}: ${data.error}`,
            });
          }
        } catch {
          addChatMessage({
            role: "system",
            content: `${node.selectedRepo?.name}: ネットワークエラー`,
          });
        }
      }
    }

    buildFromDiscovery(finalSession);
    updateDiscoverySession(message.id, { ...finalSession, status: "built" });

    addChatMessage({
      role: "system",
      content: `ワークフローを構築しました（${finalSession.nodes.length}ノード）。右のグラフマップで確認できます。\nノード間はインメモリでデータを受け渡します。API通信設定は不要です。`,
    });
  };

  if (session.status === "built") {
    return (
      <div
        className="mt-3 rounded-[10px] p-3"
        style={{ background: "#1e1e1e", border: "1px solid #6ee7b730" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "#6ee7b7", boxShadow: "0 0 6px #6ee7b760" }}
          />
          <span className="text-[14px]" style={{ color: "#6ee7b7" }}>
            構築完了 ({session.nodes.length}ノード)
          </span>
        </div>
      </div>
    );
  }

  return (
    <DiscoveryCard
      session={session}
      onSessionUpdate={handleUpdate}
      onBuild={handleBuild}
    />
  );
}

/** メッセージバブル */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className="max-w-[90%] rounded-[14px] px-5 py-3.5"
        style={{
          background: isUser ? "#7c3aed25" : isSystem ? "#333" : "#2a2a2a",
          border: `1px solid ${isUser ? "#7c3aed40" : "#3a3a3a"}`,
        }}
      >
        {isSystem && (
          <div className="text-[12px] tracking-wider uppercase mb-1.5" style={{ color: "#555" }}>
            System
          </div>
        )}
        <div
          className="text-[15px] leading-[1.7] whitespace-pre-wrap"
          style={{ color: isUser ? "#e0e0e0" : isSystem ? "#aaa" : "#e0e0e0" }}
        >
          {message.content}
        </div>
        {message.proposal && <ApprovalCard message={message} />}
        {message.discovery && <DiscoveryCardWrapper message={message} />}
        {message.claudeCodeInstruction && (
          <ClaudeCodeBlock instruction={message.claudeCodeInstruction} />
        )}
      </div>
    </div>
  );
}

/** Claude Code指示文コピーブロック */
function ClaudeCodeBlock({ instruction }: { instruction: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(instruction);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  };

  return (
    <div
      className="mt-3 rounded-[8px] overflow-hidden"
      style={{ border: "1px solid #3a3a3a" }}
    >
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: "#2b2b2b", borderBottom: "1px solid #3a3a3a" }}
      >
        <span className="text-[12px] tracking-wider" style={{ color: "#666" }}>
          CLAUDE CODE
        </span>
        <button
          onClick={handleCopy}
          className="text-[13px] px-3 py-0.5 rounded-[4px] transition-colors"
          style={{
            color: copied ? "#6ee7b7" : "#a78bfa",
            background: copied ? "#6ee7b715" : "#7c3aed15",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre
        className="px-4 py-3 text-[14px] whitespace-pre-wrap overflow-x-auto"
        style={{ background: "#1a1a1a", color: "#aaa" }}
      >
        {instruction}
      </pre>
    </div>
  );
}

export default function ChatPanel() {
  const { chatMessages, addChatMessage } = useWorkflowStore();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"chat" | "paste">("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const thinkingRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages, streamingText, isThinking]);

  /** Claude APIをストリーミングで呼び出す */
  const callClaudeAPI = useCallback(async (userText: string) => {
    setIsLoading(true);
    setIsThinking(true);
    thinkingRef.current = true;
    setStreamingText("");

    const apiMessages = chatMessages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));
    apiMessages.push({ role: "user", content: userText });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        let data;
        try { data = await res.json(); } catch { data = {}; }
        if (data.error === "API_KEY_NOT_SET") {
          addChatMessage({
            role: "system",
            content: "Claude APIキーが未設定です。ディスカバリーモードでGitHub検索を使えます。",
          });
        } else {
          addChatMessage({
            role: "system",
            content: `エラー: ${data.message || "不明なエラー"}`,
          });
        }
        setIsLoading(false);
        setIsThinking(false);
        thinkingRef.current = false;
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        addChatMessage({ role: "system", content: "ストリームの取得に失敗しました。" });
        setIsLoading(false);
        setIsThinking(false);
        thinkingRef.current = false;
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";
      let proposal = null;
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "delta") {
              if (thinkingRef.current) {
                setIsThinking(false);
                thinkingRef.current = false;
              }
              accumulated += event.text;
              setStreamingText(accumulated);
            } else if (event.type === "done") {
              proposal = event.proposal;
            } else if (event.type === "error") {
              addChatMessage({ role: "system", content: `エラー: ${event.message}` });
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      // Clean text
      let cleanText = accumulated;
      if (proposal) {
        cleanText = accumulated.replace(/```workflow\s*[\s\S]*?```/, "").trim();
      }

      if (proposal) {
        addChatMessage({
          role: "assistant",
          content: cleanText || "ワークフローを提案します。",
          proposal: {
            id: `api-${Date.now()}`,
            status: "pending" as const,
            nodes: proposal.nodes ?? [],
            edges: proposal.edges ?? [],
            description: proposal.description ?? "ワークフロー提案",
          },
        });
      } else {
        addChatMessage({
          role: "assistant",
          content: cleanText || "応答がありませんでした。",
        });
      }
    } catch {
      addChatMessage({
        role: "system",
        content: "通信エラーが発生しました。サーバーが起動しているか確認してください。",
      });
    } finally {
      setIsLoading(false);
      setIsThinking(false);
      thinkingRef.current = false;
      setStreamingText("");
    }
  }, [chatMessages, addChatMessage]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    if (mode === "paste") {
      addChatMessage({ role: "user", content: text });

      const nodes = parseCodeToNodes(text);
      if (nodes.length > 0) {
        const edges = nodes.slice(0, -1).map((_, i) => ({
          fromIndex: i,
          toIndex: i + 1,
          fromPort: "content",
          toPort: "filePath",
        }));

        addChatMessage({
          role: "assistant",
          content: `コードから ${nodes.length} 個のノードを検出しました。`,
          proposal: {
            id: `paste-${Date.now()}`,
            status: "pending" as const,
            nodes,
            edges,
            description: `${nodes.length}個のノードを検出`,
          },
        });
      } else {
        addChatMessage({
          role: "assistant",
          content: "ノードを検出できませんでした。",
        });
      }
      setMode("chat");
      return;
    }

    addChatMessage({ role: "user", content: text });

    const session = planNodes(text);
    const hasGitHubSearch = session.nodes.some((n) => n.searchStatus === "pending");
    const hasBuiltin = session.nodes.some((n) => n.searchStatus === "use-existing");

    if (hasGitHubSearch || (hasBuiltin && session.nodes.length > 0)) {
      const summary = session.nodes
        .map((n) => {
          if (n.searchStatus === "use-existing") return `${n.role} (既存)`;
          return `${n.role} (GitHub検索)`;
        })
        .join("、");

      addChatMessage({
        role: "assistant",
        content: `${session.nodes.length}個のノードが必要です: ${summary}\n\nGitHub検索が必要なノードは「GitHub で検索する」ボタンで探せます。既存ノードだけならそのまま構築できます。`,
        discovery: session,
      });
    } else {
      callClaudeAPI(text);
    }
  }, [input, mode, isLoading, addChatMessage, callClaudeAPI]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#252525" }}>
      {/* ヘッダー */}
      <div
        className="flex items-center px-5 py-3 shrink-0"
        style={{ borderBottom: "1px solid #333" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: "#a78bfa",
              boxShadow: "0 0 8px #a78bfa60",
              animation: isLoading ? "pulse 2s infinite" : "none",
            }}
          />
          <span className="text-[16px] font-medium" style={{ color: "#dcddde" }}>
            Claude
          </span>
        </div>
        {isLoading && (
          <div className="ml-auto">
            <span className="text-[14px]" style={{ color: "#a78bfa" }}>応答中</span>
          </div>
        )}
      </div>

      {/* メッセージエリア */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
        {chatMessages.length === 0 && !isThinking && !streamingText && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="flex items-center gap-3 opacity-30">
              <div className="w-4 h-4 rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 10px #a78bfa60" }} />
              <div className="w-px h-5" style={{ background: "#a78bfa40" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#6ee7b7", boxShadow: "0 0 8px #6ee7b760" }} />
            </div>
            <p className="text-[17px] text-center" style={{ color: "#666" }}>
              何を作りたいか教えてください
            </p>
            <p className="text-[14px] text-center max-w-[280px] leading-relaxed" style={{ color: "#4a4a4a" }}>
              必要なノードを自動分析し、GitHubから探して連結します。API通信の設定は不要です。
            </p>
          </div>
        )}
        {chatMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isThinking && <ThinkingBubble />}
        {streamingText && !isThinking && <StreamingBubble text={streamingText} />}
      </div>

      {/* 入力エリア */}
      <div className="px-5 pb-5 pt-2 shrink-0" style={{ borderTop: "1px solid #333" }}>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode("chat")}
            className="px-3 py-1.5 rounded-[6px] text-[13px] transition-colors"
            style={{
              background: mode === "chat" ? "#7c3aed20" : "transparent",
              color: mode === "chat" ? "#a78bfa" : "#555",
              border: `1px solid ${mode === "chat" ? "#7c3aed30" : "transparent"}`,
            }}
          >
            チャット
          </button>
          <button
            onClick={() => setMode("paste")}
            className="px-3 py-1.5 rounded-[6px] text-[13px] transition-colors"
            style={{
              background: mode === "paste" ? "#6ee7b720" : "transparent",
              color: mode === "paste" ? "#6ee7b7" : "#555",
              border: `1px solid ${mode === "paste" ? "#6ee7b730" : "transparent"}`,
            }}
          >
            コード貼り付け
          </button>
        </div>

        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={mode === "paste" ? 4 : 1}
            className="flex-1 rounded-[10px] px-4 py-3 text-[15px] resize-none"
            style={{
              background: "#1e1e1e",
              border: `1px solid ${mode === "paste" ? "#6ee7b730" : "#3a3a3a"}`,
              color: "#e0e0e0",
              lineHeight: "1.5",
            }}
            placeholder={
              mode === "paste"
                ? "Claude Codeの出力を貼り付け..."
                : "メッセージを入力..."
            }
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="self-end px-4 py-3 rounded-[10px] text-[15px] font-medium transition-all disabled:opacity-30"
            style={{ background: "#7c3aed", color: "#fff" }}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
