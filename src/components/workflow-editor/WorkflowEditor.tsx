"use client";

import { ReactFlowProvider } from "@xyflow/react";
import type { NodeDefinition } from "@/lib/nodes/types";
import Toolbar from "./Toolbar";
import LeftPanel from "./LeftPanel";
import WorkflowCanvas from "./WorkflowCanvas";

interface WorkflowEditorProps {
  definitions: NodeDefinition[];
}

export default function WorkflowEditor({ definitions }: WorkflowEditorProps) {
  return (
    <div className="flex flex-col h-screen" style={{ background: "#1e1e1e", color: "#dcddde" }}>
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        {/* 左パネル: チャット + ノード設定 */}
        <LeftPanel definitions={definitions} />

        {/* 右パネル: グラフマップ */}
        <ReactFlowProvider>
          <WorkflowCanvas definitions={definitions} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
