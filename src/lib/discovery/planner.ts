/**
 * ノードディスカバリープランナー
 *
 * ユーザーの要望を分析して:
 * 1. 必要なノードを特定
 * 2. 既存レジストリで解決できるか判定
 * 3. 不足分をGitHub検索で探す
 * 4. 自動 or 手動で選択
 *
 * Anthropic APIは不要。パターンマッチ + GitHub公開APIのみ。
 */

import type { GitHubRepo } from "@/lib/github/search";

/** ノードの必要性を表す1ステップ */
export interface PlannedNode {
  /** 一意ID */
  id: string;
  /** このノードの役割の説明 */
  role: string;
  /** GitHub検索に使うキーワード群 */
  searchQueries: string[];
  /** 既存ノード定義IDにマッチした場合 */
  matchedDefinitionId: string | null;
  /** GitHub検索の候補 */
  candidates: GitHubRepo[];
  /** 選択されたリポジトリ (auto or manual) */
  selectedRepo: GitHubRepo | null;
  /** 検索ステータス */
  searchStatus: "pending" | "searching" | "found" | "not-found" | "selected" | "use-existing";
}

/** ディスカバリーセッション全体 */
export interface DiscoverySession {
  id: string;
  /** ユーザーの元の要望 */
  userRequest: string;
  /** 計画されたノード群 */
  nodes: PlannedNode[];
  /** 選択モード */
  selectionMode: "auto" | "manual";
  /** 全体ステータス */
  status: "planning" | "searching" | "selecting" | "ready" | "built";
}

// ────────────────────────────────────────
// パターン辞書: キーワード → ノード役割 + 検索語
// ────────────────────────────────────────

interface NodePattern {
  /** マッチ用キーワード (日本語 + 英語) */
  keywords: string[];
  /** ノードの役割名 */
  role: string;
  /** 既存ノード定義ID (あれば) */
  builtinId: string | null;
  /** GitHub検索クエリ */
  searchQueries: string[];
}

const NODE_PATTERNS: NodePattern[] = [
  // === 既存ノードで解決できるもの ===
  {
    keywords: ["ファイル読", "ファイルを読", "読み込み", "read file", "load file"],
    role: "ファイル読み込み",
    builtinId: "file-reader",
    searchQueries: [],
  },
  {
    keywords: ["ファイル書", "ファイルに書", "書き込み", "保存", "write file", "save file"],
    role: "ファイル書き込み",
    builtinId: "file-writer",
    searchQueries: [],
  },
  {
    keywords: ["シェル", "コマンド実行", "ターミナル", "shell", "command"],
    role: "コマンド実行",
    builtinId: "shell-node",
    searchQueries: [],
  },
  {
    keywords: ["条件分岐", "if ", "条件", "フィルタ", "conditional", "branch"],
    role: "条件分岐",
    builtinId: "conditional-node",
    searchQueries: [],
  },
  {
    keywords: ["マージ", "結合", "まとめ", "merge", "combine"],
    role: "データ結合",
    builtinId: "merge-node",
    searchQueries: [],
  },
  {
    keywords: ["テンプレート", "プロンプト", "template", "prompt"],
    role: "テンプレート展開",
    builtinId: "prompt-node",
    searchQueries: [],
  },
  {
    keywords: ["変換", "transform", "パース", "parse", "フォーマット"],
    role: "データ変換",
    builtinId: "transform-node",
    searchQueries: [],
  },

  // === GitHub検索が必要なもの ===
  {
    keywords: ["画像", "リサイズ", "image", "resize", "サムネイル", "thumbnail"],
    role: "画像処理",
    builtinId: null,
    searchQueries: ["image resize javascript", "sharp image processing"],
  },
  {
    keywords: ["pdf", "PDF"],
    role: "PDF処理",
    builtinId: null,
    searchQueries: ["pdf generator javascript", "pdf parse javascript"],
  },
  {
    keywords: ["http", "api", "fetch", "リクエスト", "request", "REST", "rest"],
    role: "HTTP通信",
    builtinId: null,
    searchQueries: ["http request node javascript", "fetch api wrapper"],
  },
  {
    keywords: ["s3", "S3", "アップロード", "upload", "ストレージ", "storage", "クラウド"],
    role: "クラウドストレージ",
    builtinId: null,
    searchQueries: ["s3 upload javascript", "cloud storage javascript sdk"],
  },
  {
    keywords: ["メール", "email", "mail", "smtp", "送信"],
    role: "メール送信",
    builtinId: null,
    searchQueries: ["email send javascript nodemailer", "smtp javascript"],
  },
  {
    keywords: ["データベース", "db", "sql", "mongo", "DB"],
    role: "データベース接続",
    builtinId: null,
    searchQueries: ["database connector javascript", "sql query builder"],
  },
  {
    keywords: ["スクレイピング", "scrape", "crawl", "クロール", "ウェブ取得"],
    role: "ウェブスクレイピング",
    builtinId: null,
    searchQueries: ["web scraper javascript", "cheerio scraping"],
  },
  {
    keywords: ["csv", "CSV", "スプレッドシート", "excel", "Excel"],
    role: "CSV/Excel処理",
    builtinId: null,
    searchQueries: ["csv parser javascript", "xlsx javascript"],
  },
  {
    keywords: ["json", "JSON", "yaml", "YAML"],
    role: "データ形式変換",
    builtinId: null,
    searchQueries: ["json yaml converter javascript"],
  },
  {
    keywords: ["暗号", "encrypt", "decrypt", "hash", "ハッシュ"],
    role: "暗号化/ハッシュ",
    builtinId: null,
    searchQueries: ["encryption javascript crypto", "hash utility javascript"],
  },
  {
    keywords: ["zip", "圧縮", "展開", "compress", "archive"],
    role: "圧縮/展開",
    builtinId: null,
    searchQueries: ["zip archive javascript", "compression javascript"],
  },
  {
    keywords: ["slack", "Slack", "通知", "notify", "webhook"],
    role: "通知/Webhook",
    builtinId: null,
    searchQueries: ["slack webhook javascript", "notification api javascript"],
  },
  {
    keywords: ["github", "GitHub", "リポジトリ", "repo"],
    role: "GitHub連携",
    builtinId: null,
    searchQueries: ["github api javascript octokit", "github rest api client"],
  },
  {
    keywords: ["翻訳", "translate", "多言語"],
    role: "テキスト翻訳",
    builtinId: null,
    searchQueries: ["translation api javascript", "google translate javascript"],
  },
  {
    keywords: ["認証", "auth", "login", "ログイン", "oauth", "jwt"],
    role: "認証処理",
    builtinId: null,
    searchQueries: ["authentication javascript", "jwt token javascript"],
  },
  {
    keywords: ["ai ", "AI", "llm", "LLM", "機械学習", "推論"],
    role: "AI/LLM連携",
    builtinId: null,
    searchQueries: ["llm api client javascript", "openai api javascript"],
  },
];

let sessionCounter = 0;

/**
 * ユーザーの要望テキストからノード計画を生成する
 */
export function planNodes(userText: string): DiscoverySession {
  const lower = userText.toLowerCase();
  const matchedNodes: PlannedNode[] = [];
  const usedRoles = new Set<string>();
  let nodeIdCounter = 0;

  for (const pattern of NODE_PATTERNS) {
    if (usedRoles.has(pattern.role)) continue;

    const matched = pattern.keywords.some((kw) => lower.includes(kw.toLowerCase()));
    if (!matched) continue;

    usedRoles.add(pattern.role);
    nodeIdCounter++;

    matchedNodes.push({
      id: `node-${nodeIdCounter}`,
      role: pattern.role,
      searchQueries: pattern.searchQueries,
      matchedDefinitionId: pattern.builtinId,
      candidates: [],
      selectedRepo: null,
      searchStatus: pattern.builtinId ? "use-existing" : "pending",
    });
  }

  // パターンに完全マッチしないキーワードがある場合、汎用検索ノードとして追加
  // 日本語の動詞「〜したい」「〜する」等を検出してフォールバック
  if (matchedNodes.length === 0) {
    nodeIdCounter++;
    matchedNodes.push({
      id: `node-${nodeIdCounter}`,
      role: userText.slice(0, 30),
      searchQueries: [
        `${extractKeywords(userText)} javascript`,
        `${extractKeywords(userText)} npm package`,
      ],
      matchedDefinitionId: null,
      candidates: [],
      selectedRepo: null,
      searchStatus: "pending",
    });
  }

  sessionCounter++;
  return {
    id: `discovery-${sessionCounter}`,
    userRequest: userText,
    nodes: matchedNodes,
    selectionMode: "auto",
    status: "planning",
  };
}

/**
 * 日本語テキストからGitHub検索用のキーワードを抽出する簡易関数
 */
function extractKeywords(text: string): string {
  // 英単語を抽出
  const englishWords = text.match(/[a-zA-Z]{2,}/g) ?? [];
  if (englishWords.length > 0) {
    return englishWords.slice(0, 3).join(" ");
  }
  // 日本語の場合はカタカナ語を抽出（技術用語はカタカナが多い）
  const katakana = text.match(/[\u30A0-\u30FF]{2,}/g) ?? [];
  if (katakana.length > 0) {
    return katakana.slice(0, 3).join(" ");
  }
  // どちらもなければ先頭をそのまま
  return text.slice(0, 20);
}

/**
 * 計画からGitHub検索が必要なノードのインデックスを返す
 */
export function getNodesNeedingSearch(session: DiscoverySession): number[] {
  return session.nodes
    .map((n, i) => (n.searchStatus === "pending" ? i : -1))
    .filter((i) => i >= 0);
}

/**
 * 全ノードの選択が完了しているかチェック
 */
export function isSessionReady(session: DiscoverySession): boolean {
  return session.nodes.every(
    (n) => n.searchStatus === "use-existing" || n.searchStatus === "selected"
  );
}

/**
 * 自動選択: 各ノードの候補からスター数最多を自動選択
 */
export function autoSelectAll(session: DiscoverySession): DiscoverySession {
  return {
    ...session,
    nodes: session.nodes.map((node) => {
      if (node.searchStatus !== "found" || node.candidates.length === 0) {
        return node;
      }
      // スター数でソート済みなので先頭を選択
      const best = node.candidates[0];
      return {
        ...node,
        selectedRepo: best,
        searchStatus: "selected" as const,
      };
    }),
    status: "ready",
  };
}

/**
 * 手動選択: 特定ノードにリポジトリを設定
 */
export function manualSelect(
  session: DiscoverySession,
  nodeId: string,
  repo: GitHubRepo
): DiscoverySession {
  const updated = {
    ...session,
    nodes: session.nodes.map((n) =>
      n.id === nodeId
        ? { ...n, selectedRepo: repo, searchStatus: "selected" as const }
        : n
    ),
  };
  if (isSessionReady(updated)) {
    updated.status = "ready";
  }
  return updated;
}
