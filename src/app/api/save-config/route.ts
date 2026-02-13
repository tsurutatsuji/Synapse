import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function POST(req: NextRequest) {
  try {
    const { email, claudeApiKey, lineToken, lineSecret } = await req.json();

    if (!email || !claudeApiKey || !lineToken || !lineSecret) {
      return NextResponse.json({ error: "すべての項目を入力してください" }, { status: 400 });
    }

    await fs.mkdir(DATA_DIR, { recursive: true });

    const config = {
      email,
      claudeApiKey,
      lineToken,
      lineSecret,
      createdAt: new Date().toISOString(),
    };

    const safeEmail = email.replace(/[^a-zA-Z0-9@._-]/g, "_");
    await fs.writeFile(
      path.join(DATA_DIR, `${safeEmail}.json`),
      JSON.stringify(config, null, 2)
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}
