"use client";

import { ReactFlowProvider } from "@xyflow/react";
import type { NodeDefinition } from "@/lib/nodes/types";
import Toolbar from "./Toolbar";
import NodePalette from "./NodePalette";
import WorkflowCanvas from "./WorkflowCanvas";
import NodeInspector from "./NodeInspector";
import { useWorkflowStore } from "@/lib/store/workflow-store";

interface WorkflowEditorProps {
  definitions: NodeDefinition[];
}

export default function WorkflowEditor({ definitions }: WorkflowEditorProps) {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <NodePalette definitions={definitions} />
        <ReactFlowProvider>
          <WorkflowCanvas definitions={definitions} />
        </ReactFlowProvider>
        {selectedNodeId && <NodeInspector definitions={definitions} />}
      </div>
    </div>
  );
}
