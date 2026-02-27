import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { generateNodeModule } from "@/lib/discovery/node-generator";
import { registerNode } from "@/lib/nodes/registry";
import { registerBuiltinNodes } from "@/nodes/index";
import { getAllNodeDefinitions } from "@/lib/nodes/registry";

const execAsync = promisify(exec);

// ビルトイン登録済みフラグ
let builtinsRegistered = false;

/**
 * POST /api/discovery/install
 *
 * GitHubリポジトリのnpmパッケージをインストールし、
 * ノードモジュールとして登録する。
 *
 * ノード間はAPI通信ではなくインメモリ受け渡し。
 */
export async function POST(request: Request) {
  if (!builtinsRegistered) {
    registerBuiltinNodes();
    builtinsRegistered = true;
  }

  const body = await request.json();
  const { repoFullName, role, category = "custom" } = body;

  if (!repoFullName || !role) {
    return NextResponse.json(
      { error: "repoFullName and role are required" },
      { status: 400 }
    );
  }

  const packageName = body.npmPackageName ?? repoFullName.split("/")[1] ?? "unknown";

  // 1. npm install を実行
  const projectRoot = path.resolve(process.cwd());
  try {
    const { stdout, stderr } = await execAsync(
      `npm install ${packageName} --save`,
      {
        cwd: projectRoot,
        timeout: 60000, // 60秒タイムアウト
      }
    );

    // 2. ノードモジュールを生成・登録
    const generated = generateNodeModule({
      repoFullName,
      npmPackageName: packageName,
      role,
      category,
    });

    registerNode(generated.nodeModule);

    return NextResponse.json({
      success: true,
      definitionId: generated.definitionId,
      installCommand: generated.installCommand,
      installOutput: stdout || stderr,
      allDefinitions: getAllNodeDefinitions(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        error: `パッケージインストール失敗: ${message}`,
        // インストール失敗でもノード定義だけは返す（手動設定用）
        definitionId: `github-${packageName}`,
      },
      { status: 500 }
    );
  }
}
