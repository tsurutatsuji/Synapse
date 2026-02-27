/**
 * ユーザーの入力テキストを解析し、ワークフロー提案と
 * Claude Code用の指示文を生成するユーティリティ。
 *
 * API呼び出しは行わず、パターンマッチングとテンプレートで動作する。
 */

export interface ProposedNode {
  definitionId: string;
  label: string;
  config: Record<string, unknown>;
}

export interface ProposedEdge {
  fromIndex: number;
  toIndex: number;
  fromPort: string;
  toPort: string;
}

export interface WorkflowProposal {
  id: string;
  status: "pending" | "approved" | "rejected";
  nodes: ProposedNode[];
  edges: ProposedEdge[];
  description: string;
}

interface PatternRule {
  keywords: string[];
  definitionId: string;
  label: string;
  config: Record<string, unknown>;
  defaultInputPort: string;
  defaultOutputPort: string;
}

const PATTERN_RULES: PatternRule[] = [
  {
    keywords: ["ファイル読", "ファイルを読", "読み込", "read", "load", "ロード", "インポート"],
    definitionId: "file-reader",
    label: "ファイル読込",
    config: { filePath: "", encoding: "utf-8" },
    defaultInputPort: "filePath",
    defaultOutputPort: "content",
  },
  {
    keywords: ["ファイル書", "ファイルに書", "書き込", "保存", "write", "save", "出力", "エクスポート"],
    definitionId: "file-writer",
    label: "ファイル書込",
    config: { filePath: "", content: "", append: "false" },
    defaultInputPort: "content",
    defaultOutputPort: "filePath",
  },
  {
    keywords: ["変換", "フォーマット", "パース", "transform", "convert", "整形", "加工"],
    definitionId: "transform-node",
    label: "データ変換",
    config: { data: "", expression: "data" },
    defaultInputPort: "data",
    defaultOutputPort: "result",
  },
  {
    keywords: ["条件", "分岐", "if", "判定", "フィルタ", "conditional"],
    definitionId: "conditional-node",
    label: "条件分岐",
    config: { data: "", condition: "data !== null" },
    defaultInputPort: "data",
    defaultOutputPort: "trueBranch",
  },
  {
    keywords: ["実行", "コマンド", "シェル", "shell", "bash", "ターミナル", "npm", "git"],
    definitionId: "shell-node",
    label: "シェル実行",
    config: { command: "" },
    defaultInputPort: "command",
    defaultOutputPort: "stdout",
  },
  {
    keywords: ["結合", "マージ", "まとめ", "merge", "combine", "集約"],
    definitionId: "merge-node",
    label: "マージ",
    config: {},
    defaultInputPort: "input1",
    defaultOutputPort: "merged",
  },
  {
    keywords: ["プロンプト", "テンプレ", "テキスト生成", "prompt", "template"],
    definitionId: "prompt-node",
    label: "プロンプト",
    config: { template: "", variables: "{}" },
    defaultInputPort: "template",
    defaultOutputPort: "text",
  },
];

function matchRules(text: string): PatternRule[] {
  const lower = text.toLowerCase();
  const matched: PatternRule[] = [];
  const usedDefs = new Set<string>();

  for (const rule of PATTERN_RULES) {
    if (usedDefs.has(rule.definitionId)) continue;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        matched.push(rule);
        usedDefs.add(rule.definitionId);
        break;
      }
    }
  }

  return matched;
}

let proposalCounter = 0;

export function generateProposal(userText: string): WorkflowProposal | null {
  const rules = matchRules(userText);
  if (rules.length === 0) return null;

  const nodes: ProposedNode[] = rules.map((r) => ({
    definitionId: r.definitionId,
    label: r.label,
    config: { ...r.config },
  }));

  // 順序通りにエッジを接続
  const edges: ProposedEdge[] = [];
  for (let i = 0; i < rules.length - 1; i++) {
    edges.push({
      fromIndex: i,
      toIndex: i + 1,
      fromPort: rules[i].defaultOutputPort,
      toPort: rules[i + 1].defaultInputPort,
    });
  }

  proposalCounter++;
  return {
    id: `proposal-${proposalCounter}`,
    status: "pending",
    nodes,
    edges,
    description: `${nodes.map((n) => n.label).join(" → ")} のワークフロー`,
  };
}

export function generateClaudeCodeInstruction(userText: string): string {
  return [
    "以下をClaude Codeにコピペして実行してください：",
    "",
    "```",
    `${userText}`,
    "",
    "必要なファイルを作成し、それぞれの役割を説明してください。",
    "作成したファイル一覧をJSON形式で出力してください：",
    '{"files": [{"path": "...", "description": "...", "type": "input|output|transform|config"}]}',
    "```",
  ].join("\n");
}

/**
 * 貼り付けられたコード/テキストからノードを自動生成
 */
export function parseCodeToNodes(code: string): ProposedNode[] {
  const nodes: ProposedNode[] = [];
  const lines = code.split("\n");

  // ファイルパスの検出
  const filePathRegex = /["']([./\w-]+\.\w+)["']/g;
  const filePaths = new Set<string>();
  for (const line of lines) {
    let match;
    while ((match = filePathRegex.exec(line)) !== null) {
      filePaths.add(match[1]);
    }
  }

  for (const fp of Array.from(filePaths)) {
    nodes.push({
      definitionId: "file-reader",
      label: fp.split("/").pop() ?? fp,
      config: { filePath: fp, encoding: "utf-8" },
    });
  }

  // シェルコマンドの検出
  const shellRegex = /(?:exec|spawn|system)\s*\(\s*["'](.+?)["']/g;
  let shellMatch;
  while ((shellMatch = shellRegex.exec(code)) !== null) {
    nodes.push({
      definitionId: "shell-node",
      label: shellMatch[1].slice(0, 20),
      config: { command: shellMatch[1] },
    });
  }

  // JSON files配列の検出
  try {
    const jsonMatch = code.match(/\{[\s\S]*"files"\s*:\s*\[[\s\S]*\][\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.files)) {
        for (const file of parsed.files) {
          const type = file.type ?? "input";
          const defId =
            type === "output" ? "file-writer" :
            type === "transform" ? "transform-node" :
            "file-reader";
          nodes.push({
            definitionId: defId,
            label: file.path?.split("/").pop() ?? "file",
            config: {
              filePath: file.path ?? "",
              ...(file.description ? { description: file.description } : {}),
            },
          });
        }
        return nodes; // JSON形式が見つかったらそれを優先
      }
    }
  } catch {
    // JSONパース失敗は無視
  }

  return nodes;
}
