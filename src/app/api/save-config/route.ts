import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { claudeApiKey, aiProvider, lineToken, lineSecret } = await req.json();

    if (!lineToken || !lineSecret) {
      return NextResponse.json({ error: "LINE の情報を入力してください" }, { status: 400 });
    }

    // Gemini Flash の場合は API キー不要
    if (aiProvider !== "gemini-flash" && !claudeApiKey) {
      return NextResponse.json({ error: "AIのAPIキーを入力してください" }, { status: 400 });
    }

    // ベータ版: DBが使えない環境でもウィザードを完了できるようにする
    // 設定データはクライアント側で保持し、.envダウンロードで利用する
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}
