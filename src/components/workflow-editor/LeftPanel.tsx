"use client";

import type { NodeDefinition } from "@/lib/nodes/types";
import { useWorkflowStore } from "@/lib/store/workflow-store";
import ChatPanel from "./ChatPanel";
import NodeInspector from "./NodeInspector";

interface LeftPanelProps {
  definitions: NodeDefinition[];
}

export default function LeftPanel({ definitions }: LeftPanelProps) {
  const { activeLeftTab, setActiveLeftTab, selectedNodeId } = useWorkflowStore();

  return (
    <div
      className="w-[380px] flex flex-col h-full overflow-hidden shrink-0"
      style={{ background: "#252525", borderRight: "1px solid #333" }}
    >
      {/* タブ */}
      <div
        className="flex items-center gap-0 px-2 pt-2"
        style={{ borderBottom: "1px solid #333" }}
      >
        <button
          onClick={() => setActiveLeftTab("chat")}
          className="px-4 py-2 text-[13px] transition-colors relative"
          style={{
            color: activeLeftTab === "chat" ? "#dcddde" : "#555",
          }}
        >
          Chat
          {activeLeftTab === "chat" && (
            <div
              className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
              style={{ background: "#7c3aed" }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveLeftTab("node")}
          className="px-4 py-2 text-[13px] transition-colors relative"
          style={{
            color: activeLeftTab === "node" ? "#dcddde" : "#555",
            opacity: selectedNodeId ? 1 : 0.3,
          }}
          disabled={!selectedNodeId}
        >
          Node
          {activeLeftTab === "node" && selectedNodeId && (
            <div
              className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
              style={{ background: "#a78bfa" }}
            />
          )}
        </button>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-hidden">
        {activeLeftTab === "chat" ? (
          <ChatPanel />
        ) : selectedNodeId ? (
          <NodeInspector definitions={definitions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px]" style={{ color: "#555" }}>
              ノードをクリックして選択
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
