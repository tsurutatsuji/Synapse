"use client";

import WorkflowEditor from "@/components/workflow-editor/WorkflowEditor";
import { allNodeDefinitions } from "@/nodes/definitions";

export default function Home() {
  return <WorkflowEditor definitions={allNodeDefinitions} />;
}
