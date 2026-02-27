"use client";

import { useState, useCallback } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import type { NodeDefinition } from "@/lib/nodes/types";
import Toolbar from "./Toolbar";
import TaskPanel from "./TaskPanel";
import ChatPanel from "./ChatPanel";
import WorkflowCanvas from "./WorkflowCanvas";
import ResizeHandle from "./ResizeHandle";

interface WorkflowEditorProps {
  definitions: NodeDefinition[];
}

const MIN_PANEL_WIDTH = 180;
const DEFAULT_TASK_WIDTH = 240;
const DEFAULT_CHAT_WIDTH = 360;

export default function WorkflowEditor({ definitions }: WorkflowEditorProps) {
  const [taskWidth, setTaskWidth] = useState(DEFAULT_TASK_WIDTH);
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);

  const handleTaskResize = useCallback((delta: number) => {
    setTaskWidth((w) => Math.max(MIN_PANEL_WIDTH, Math.min(w + delta, 500)));
  }, []);

  const handleChatResize = useCallback((delta: number) => {
    setChatWidth((w) => Math.max(MIN_PANEL_WIDTH, Math.min(w + delta, 600)));
  }, []);

  return (
    <div className="flex flex-col h-screen" style={{ background: "#1e1e1e", color: "#dcddde" }}>
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        {/* 左パネル: タスク (ノード一覧 + Inspector + Settings) */}
        <div style={{ width: taskWidth }} className="shrink-0 h-full overflow-hidden">
          <TaskPanel definitions={definitions} />
        </div>

        {/* リサイズハンドル 1 */}
        <ResizeHandle onResize={handleTaskResize} direction="left" />

        {/* 中央パネル: チャット */}
        <div style={{ width: chatWidth }} className="shrink-0 h-full overflow-hidden">
          <ChatPanel />
        </div>

        {/* リサイズハンドル 2 */}
        <ResizeHandle onResize={handleChatResize} direction="left" />

        {/* 右パネル: ワークフローキャンバス */}
        <ReactFlowProvider>
          <WorkflowCanvas definitions={definitions} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
