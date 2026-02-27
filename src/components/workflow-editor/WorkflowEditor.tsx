"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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

// Obsidian風: 極小まで縮められる、画面幅に応じて最大も広い
const MIN_WIDTH = 48;
const CANVAS_MIN_WIDTH = 200;
const DEFAULT_TASK_WIDTH = 240;
const DEFAULT_CHAT_WIDTH = 360;

export default function WorkflowEditor({ definitions }: WorkflowEditorProps) {
  const [taskWidth, setTaskWidth] = useState(DEFAULT_TASK_WIDTH);
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
  const containerRef = useRef<HTMLDivElement>(null);

  // 画面幅を取得して、最大値を動的に計算
  const getMaxWidth = useCallback(() => {
    const total = containerRef.current?.clientWidth ?? 1200;
    // 右パネルに最低200px残す + ハンドル8px + もう片方のパネルの最小幅
    return total - CANVAS_MIN_WIDTH - MIN_WIDTH - 8;
  }, []);

  const handleTaskResize = useCallback((delta: number) => {
    setTaskWidth((w) => {
      const maxW = getMaxWidth() - chatWidth;
      return Math.max(MIN_WIDTH, Math.min(w + delta, maxW));
    });
  }, [chatWidth, getMaxWidth]);

  const handleChatResize = useCallback((delta: number) => {
    setChatWidth((w) => {
      const maxW = getMaxWidth() - taskWidth;
      return Math.max(MIN_WIDTH, Math.min(w + delta, maxW));
    });
  }, [taskWidth, getMaxWidth]);

  return (
    <div className="flex flex-col h-screen" style={{ background: "#1e1e1e", color: "#dcddde" }}>
      <Toolbar />
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* 左パネル: タスク */}
        <div style={{ width: taskWidth, minWidth: MIN_WIDTH }} className="shrink-0 h-full overflow-hidden">
          <TaskPanel definitions={definitions} />
        </div>

        {/* リサイズハンドル 1 */}
        <ResizeHandle onResize={handleTaskResize} />

        {/* 中央パネル: チャット */}
        <div style={{ width: chatWidth, minWidth: MIN_WIDTH }} className="shrink-0 h-full overflow-hidden">
          <ChatPanel />
        </div>

        {/* リサイズハンドル 2 */}
        <ResizeHandle onResize={handleChatResize} />

        {/* 右パネル: ワークフローキャンバス */}
        <ReactFlowProvider>
          <WorkflowCanvas definitions={definitions} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
