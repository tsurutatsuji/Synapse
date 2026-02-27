import { NextResponse } from "next/server";
import {
  searchGitHubRepos,
  fetchReadme,
  type GitHubSearchRequest,
} from "@/lib/github/search";

/**
 * GET /api/github/search?q=keyword&perPage=5&sort=stars&readme=fullName
 *
 * GitHub公開APIのプロキシ。
 * CORS回避 + レート制限の一元管理。
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // README取得モード
  const readmeRepo = searchParams.get("readme");
  if (readmeRepo) {
    const readme = await fetchReadme(readmeRepo);
    return NextResponse.json({ readme });
  }

  // 検索モード
  const query = searchParams.get("q");
  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter 'q'" },
      { status: 400 }
    );
  }

  const req: GitHubSearchRequest = {
    query,
    perPage: parseInt(searchParams.get("perPage") ?? "5", 10),
    sort: (searchParams.get("sort") as GitHubSearchRequest["sort"]) ?? "stars",
  };

  const result = await searchGitHubRepos(req);

  if (result.error) {
    return NextResponse.json(
      { error: result.error, rateLimitRemaining: result.rateLimitRemaining },
      { status: 502 }
    );
  }

  return NextResponse.json(result);
}
