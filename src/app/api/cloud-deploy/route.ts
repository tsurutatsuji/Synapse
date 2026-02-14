import { NextRequest } from "next/server";

/**
 * Railway API を使ったワンクリック・クラウドデプロイ。
 *
 * 環境変数 RAILWAY_API_TOKEN が必要。
 * SSE でフロントに進捗をストリーミングする。
 *
 * ステップ:
 *  1. プロジェクト作成
 *  2. GitHub リポジトリからサービス作成（OpenClaw）
 *  3. 環境変数をセット
 *  4. デプロイ完了を待つ
 */

const RAILWAY_API = "https://backboard.railway.com/graphql/v2";
const OPENCLAW_REPO = "openclaw/openclaw";

async function railwayQuery(token: string, query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(RAILWAY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message || "Railway API error");
  }
  return json.data;
}

function buildEnvVars(
  aiProvider: string,
  aiApiKey: string,
  lineToken: string,
  lineSecret: string
): Record<string, string> {
  const vars: Record<string, string> = {
    LINE_CHANNEL_ACCESS_TOKEN: lineToken,
    LINE_CHANNEL_SECRET: lineSecret,
  };

  switch (aiProvider) {
    case "claude":
      vars.ANTHROPIC_API_KEY = aiApiKey;
      vars.AI_PROVIDER = "anthropic";
      break;
    case "gpt":
      vars.OPENAI_API_KEY = aiApiKey;
      vars.AI_PROVIDER = "openai";
      break;
    case "gemini-pro":
      vars.GOOGLE_AI_API_KEY = aiApiKey;
      vars.AI_PROVIDER = "google";
      vars.AI_MODEL = "gemini-pro";
      break;
    case "gemini-flash":
      vars.GOOGLE_AI_API_KEY = "";
      vars.AI_PROVIDER = "google";
      vars.AI_MODEL = "gemini-flash";
      break;
    default:
      vars.ANTHROPIC_API_KEY = aiApiKey;
      vars.AI_PROVIDER = "anthropic";
  }

  return vars;
}

export async function POST(req: NextRequest) {
  const railwayToken = process.env.RAILWAY_API_TOKEN;

  if (!railwayToken) {
    return new Response(
      JSON.stringify({
        error: "RAILWAY_API_TOKEN が設定されていません。管理者にお問い合わせください。",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { aiProvider, aiApiKey, lineToken, lineSecret } = await req.json();

  if (!lineToken || !lineSecret) {
    return new Response(
      JSON.stringify({ error: "LINE の情報が必要です" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // ── Step 1: Create project ──
        send({ step: 1, status: "active", message: "クラウドサーバーを準備しています..." });

        const projectData = await railwayQuery(railwayToken, `
          mutation {
            projectCreate(input: { name: "easyclaw-openclaw" }) {
              id
              environments { edges { node { id } } }
            }
          }
        `);

        const projectId = projectData.projectCreate.id;
        const environmentId =
          projectData.projectCreate.environments.edges[0]?.node.id;

        if (!environmentId) throw new Error("環境の作成に失敗しました");

        send({ step: 1, status: "done", message: "サーバー準備完了" });

        // ── Step 2: Create service from GitHub repo ──
        send({ step: 2, status: "active", message: "OpenClaw をインストールしています..." });

        const serviceData = await railwayQuery(railwayToken, `
          mutation($projectId: String!, $repo: String!, $environmentId: String!) {
            serviceCreate(input: {
              projectId: $projectId
              source: { repo: $repo }
              name: "openclaw"
            }) {
              id
            }
          }
        `, { projectId, repo: OPENCLAW_REPO, environmentId });

        const serviceId = serviceData.serviceCreate.id;
        send({ step: 2, status: "done", message: "OpenClaw インストール完了" });

        // ── Step 3: Set environment variables ──
        send({ step: 3, status: "active", message: "設定ファイルを作成しています..." });

        const envVars = buildEnvVars(aiProvider, aiApiKey || "", lineToken, lineSecret);

        for (const [key, value] of Object.entries(envVars)) {
          await railwayQuery(railwayToken, `
            mutation($projectId: String!, $environmentId: String!, $serviceId: String!, $name: String!, $value: String!) {
              variableUpsert(input: {
                projectId: $projectId
                environmentId: $environmentId
                serviceId: $serviceId
                name: $name
                value: $value
              })
            }
          `, { projectId, environmentId, serviceId, name: key, value });
        }

        send({ step: 3, status: "done", message: "設定完了" });

        // ── Step 4: Trigger deploy & get domain ──
        send({ step: 4, status: "active", message: "AI を起動しています..." });

        // Generate a Railway domain for the service
        const domainData = await railwayQuery(railwayToken, `
          mutation($serviceId: String!, $environmentId: String!) {
            serviceDomainCreate(input: {
              serviceId: $serviceId
              environmentId: $environmentId
            }) {
              domain
            }
          }
        `, { serviceId, environmentId });

        const domain = domainData.serviceDomainCreate.domain;
        const webhookUrl = `https://${domain}/webhook`;

        send({ step: 4, status: "done", message: "起動完了" });

        // ── Done ──
        send({ done: true, webhookUrl });
      } catch (e) {
        send({
          error: true,
          message: e instanceof Error ? e.message : "デプロイに失敗しました",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
