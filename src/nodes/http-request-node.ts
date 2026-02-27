import type { NodeModule } from "@/lib/nodes/types";
import { httpRequestDefinition } from "./definitions";

const httpRequestNode: NodeModule = {
  definition: httpRequestDefinition,

  async execute(inputs) {
    const url = inputs.url as string;
    const method = (inputs.method as string) ?? "GET";
    const headers = (inputs.headers as Record<string, string>) ?? {};
    const body = inputs.body as string | undefined;

    const opts: RequestInit = {
      method,
      headers: { "Content-Type": "application/json", ...headers },
    };
    if (body && method !== "GET") opts.body = body;

    const res = await fetch(url, opts);
    const text = await res.text();

    let data: unknown = text;
    try { data = JSON.parse(text); } catch { /* plain text */ }

    return {
      outputs: {
        data,
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
      },
    };
  },
};

export default httpRequestNode;
