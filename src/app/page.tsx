"use client";

import WorkflowEditor from "@/components/workflow-editor/WorkflowEditor";
import { allNodeDefinitions } from "@/nodes/definitions";

// 古いストアキーを掃除（1回だけ実行）
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("synapse-store");
    localStorage.removeItem("synapse-store-v2");
  } catch {
    // ignore
  }
}

export default function Home() {
  return <WorkflowEditor definitions={allNodeDefinitions} />;
}
