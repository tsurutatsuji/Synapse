"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useWorkflowStore, type ChatMessage } from "@/lib/store/workflow-store";
import {
  generateProposal,
  generateClaudeCodeInstruction,
  parseCodeToNodes,
} from "@/lib/chat/workflow-generator";

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
      className="mt-2 rounded-[6px] p-3"
      style={{
        background: "#1e1e1e",
        border: `1px solid ${
          proposal.status === "approved" ? "#6ee7b740" :
          proposal.status === "rejected" ? "#fca5a540" :
          "#7c3aed40"
        }`,
      }}
    >
      <div className="text-[11px] font-medium tracking-wider uppercase mb-2" style={{ color: "#666" }}>
        Workflow Proposal
      </div>
      <div className="text-[13px] mb-2" style={{ color: "#dcddde" }}>
        {proposal.description}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {proposal.nodes.map((n, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded-full text-[11px]"
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
            className="flex-1 px-3 py-1.5 rounded-[4px] text-[13px] transition-colors"
            style={{ background: "#7c3aed", color: "#fff" }}
          >
            OK - 構築する
          </button>
          <button
            onClick={handleReject}
            className="px-3 py-1.5 rounded-[4px] text-[13px] transition-colors"
            style={{ background: "transparent", color: "#666", border: "1px solid #333" }}
          >
            やり直す
          </button>
        </div>
      ) : (
        <div
          className="text-[12px] px-2 py-1 rounded-[4px] inline-block"
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
      className="mt-2 rounded-[6px] overflow-hidden"
      style={{ border: "1px solid #333" }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ background: "#2b2b2b", borderBottom: "1px solid #333" }}
      >
        <span className="text-[11px] tracking-wider" style={{ color: "#666" }}>
          CLAUDE CODE
        </span>
        <button
          onClick={handleCopy}
          className="text-[11px] px-2 py-0.5 rounded-[3px] transition-colors"
          style={{
            color: copied ? "#6ee7b7" : "#a78bfa",
            background: copied ? "#6ee7b715" : "#7c3aed15",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre
        className="px-3 py-2 text-[12px] whitespace-pre-wrap overflow-x-auto"
        style={{ background: "#1a1a1a", color: "#999" }}
      >
        {instruction}
      </pre>
    </div>
  );
}

/** メッセージバブル */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className="max-w-[90%] rounded-[8px] px-3 py-2"
        style={{
          background: isUser ? "#7c3aed20" : isSystem ? "#333" : "#252525",
          border: `1px solid ${isUser ? "#7c3aed30" : "#333"}`,
        }}
      >
        {isSystem && (
          <div className="text-[10px] tracking-wider uppercase mb-1" style={{ color: "#555" }}>
            System
          </div>
        )}
        <div
          className="text-[13px] whitespace-pre-wrap"
          style={{ color: isUser ? "#dcddde" : "#999" }}
        >
          {message.content}
        </div>
        {message.proposal && <ApprovalCard message={message} />}
        {message.claudeCodeInstruction && (
          <ClaudeCodeBlock instruction={message.claudeCodeInstruction} />
        )}
      </div>
    </div>
  );
}

export default function ChatPanel() {
  const { chatMessages, addChatMessage } = useWorkflowStore();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"chat" | "paste">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    if (mode === "paste") {
      // コード貼り付けモード → 自動ノード生成
      addChatMessage({ role: "user", content: text });

      const nodes = parseCodeToNodes(text);
      if (nodes.length > 0) {
        const edges = nodes.slice(0, -1).map((_, i) => ({
          fromIndex: i,
          toIndex: i + 1,
          fromPort: "content",
          toPort: "filePath",
        }));

        const proposal = {
          id: `paste-${Date.now()}`,
          status: "pending" as const,
          nodes,
          edges,
          description: `${nodes.length}個のノードを検出`,
        };

        addChatMessage({
          role: "assistant",
          content: `コードから ${nodes.length} 個のノードを検出しました。`,
          proposal,
        });
      } else {
        addChatMessage({
          role: "assistant",
          content: "ノードを検出できませんでした。ファイルパスやコマンドを含むコードを貼り付けてください。",
        });
      }
      setMode("chat");
      return;
    }

    // チャットモード
    addChatMessage({ role: "user", content: text });

    // 提案生成
    const proposal = generateProposal(text);
    const instruction = generateClaudeCodeInstruction(text);

    if (proposal) {
      addChatMessage({
        role: "assistant",
        content: "ワークフローを提案します。よければ「OK」を押してください。",
        proposal,
        claudeCodeInstruction: instruction,
      });
    } else {
      addChatMessage({
        role: "assistant",
        content:
          "具体的なワークフローは検出できませんでした。\n" +
          "以下のClaude Code用の指示をコピーして実行し、結果を「貼り付け」モードで貼り付けてください。",
        claudeCodeInstruction: instruction,
      });
    }
  }, [input, mode, addChatMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* メッセージエリア */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="flex items-center gap-3 opacity-30">
              <div className="w-3 h-3 rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 8px #a78bfa60" }} />
              <div className="w-px h-4" style={{ background: "#a78bfa40" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#6ee7b7", boxShadow: "0 0 6px #6ee7b760" }} />
            </div>
            <p className="text-[14px] text-center" style={{ color: "#555" }}>
              何を作りたいか教えてください
            </p>
            <p className="text-[12px] text-center max-w-[240px]" style={{ color: "#444" }}>
              Claude Codeが必要なノードと接続を自動的に提案します
            </p>
          </div>
        )}
        {chatMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* 入力エリア */}
      <div className="px-3 pb-3 pt-1" style={{ borderTop: "1px solid #333" }}>
        {/* モード切替 */}
        <div className="flex gap-1 mb-2">
          <button
            onClick={() => setMode("chat")}
            className="px-2.5 py-1 rounded-[4px] text-[11px] transition-colors"
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
            className="px-2.5 py-1 rounded-[4px] text-[11px] transition-colors"
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
            className="flex-1 rounded-[6px] px-3 py-2 text-[13px] resize-none"
            style={{
              background: "#1e1e1e",
              border: `1px solid ${mode === "paste" ? "#6ee7b730" : "#3a3a3a"}`,
              color: "#dcddde",
            }}
            placeholder={
              mode === "paste"
                ? "Claude Codeの出力を貼り付け..."
                : "何を作りたいですか？"
            }
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="self-end px-3 py-2 rounded-[6px] text-[13px] transition-colors disabled:opacity-30"
            style={{ background: "#7c3aed", color: "#fff" }}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
