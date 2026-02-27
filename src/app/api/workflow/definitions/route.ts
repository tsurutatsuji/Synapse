import { NextResponse } from "next/server";
import { registerBuiltinNodes } from "@/nodes";
import { getAllNodeDefinitions } from "@/lib/nodes/registry";

let initialized = false;
function ensureInitialized() {
  if (!initialized) {
    registerBuiltinNodes();
    initialized = true;
  }
}

export async function GET() {
  ensureInitialized();
  const definitions = getAllNodeDefinitions();
  return NextResponse.json(definitions);
}
