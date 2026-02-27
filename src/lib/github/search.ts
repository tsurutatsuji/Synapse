/**
 * GitHub公開APIを使ったリポジトリ検索
 *
 * 認証不要（60リクエスト/時間の制限あり）。
 * サーバーサイドから呼び出す（CORS回避）。
 */

/** GitHub検索結果の1件 */
export interface GitHubRepo {
  /** リポジトリのフルネーム (owner/name) */
  fullName: string;
  /** リポジトリ名 */
  name: string;
  /** 説明 */
  description: string | null;
  /** スター数 */
  stars: number;
  /** リポジトリURL */
  url: string;
  /** 言語 */
  language: string | null;
  /** 最終更新日 */
  updatedAt: string;
  /** トピックタグ */
  topics: string[];
  /** オーナーのアバター */
  ownerAvatar: string;
  /** README内容（別途取得） */
  readme?: string;
}

/** 検索リクエスト */
export interface GitHubSearchRequest {
  /** 検索クエリ */
  query: string;
  /** 最大件数 (default: 5) */
  perPage?: number;
  /** ソート順 */
  sort?: "stars" | "updated" | "best-match";
}

/** 検索レスポンス */
export interface GitHubSearchResponse {
  repos: GitHubRepo[];
  totalCount: number;
  rateLimitRemaining: number;
  error?: string;
}

/**
 * GitHub Search Repositories API を呼び出す
 */
export async function searchGitHubRepos(
  req: GitHubSearchRequest
): Promise<GitHubSearchResponse> {
  const { query, perPage = 5, sort = "stars" } = req;

  const params = new URLSearchParams({
    q: query,
    sort: sort === "best-match" ? "" : sort,
    order: "desc",
    per_page: String(perPage),
  });

  // sort=best-match の場合はパラメータを削除（GitHubのデフォルト）
  if (sort === "best-match") {
    params.delete("sort");
  }

  const url = `https://api.github.com/search/repositories?${params}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Synapse-WorkflowBuilder",
    },
    // 10秒タイムアウト
    signal: AbortSignal.timeout(10000),
  });

  const rateLimitRemaining = parseInt(
    res.headers.get("x-ratelimit-remaining") ?? "0",
    10
  );

  if (!res.ok) {
    const body = await res.text();
    return {
      repos: [],
      totalCount: 0,
      rateLimitRemaining,
      error: `GitHub API ${res.status}: ${body.slice(0, 200)}`,
    };
  }

  const data = await res.json();

  const repos: GitHubRepo[] = (data.items ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) => ({
      fullName: item.full_name ?? "",
      name: item.name ?? "",
      description: item.description ?? null,
      stars: item.stargazers_count ?? 0,
      url: item.html_url ?? "",
      language: item.language ?? null,
      updatedAt: item.updated_at ?? "",
      topics: item.topics ?? [],
      ownerAvatar: item.owner?.avatar_url ?? "",
    })
  );

  return {
    repos,
    totalCount: data.total_count ?? 0,
    rateLimitRemaining,
  };
}

/**
 * リポジトリのREADMEを取得する
 */
export async function fetchReadme(
  fullName: string
): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${fullName}/readme`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
        "User-Agent": "Synapse-WorkflowBuilder",
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    // READMEの先頭2000文字だけ返す
    return text.slice(0, 2000);
  } catch {
    return null;
  }
}
