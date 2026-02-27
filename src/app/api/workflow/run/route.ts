import { NextRequest, NextResponse } from "next/server";
import type { WorkflowDefinition, WorkflowRunState } from "@/lib/nodes/types";
import { registerBuiltinNodes } from "@/nodes";
import { executeWorkflow } from "@/lib/workflow/engine";

// サーバーサイドでノードを登録
let initialized = false;
function ensureInitialized() {
  if (!initialized) {
    registerBuiltinNodes();
    initialized = true;
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureInitialized();

    const body = await request.json();
    const workflow = body.workflow as WorkflowDefinition;

    if (!workflow || !workflow.nodes || !workflow.edges) {
      return NextResponse.json(
        { error: "無効なワークフロー定義です" },
        { status: 400 }
      );
    }

    const result = await executeWorkflow(workflow);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "不明なエラー";
    const errorState: WorkflowRunState = {
      workflowId: "unknown",
      status: "error",
      nodeStates: {},
      completedAt: new Date().toISOString(),
    };
    return NextResponse.json(
      { ...errorState, error: message },
      { status: 500 }
    );
  }
}
