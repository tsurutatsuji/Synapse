/**
 * GitHub上のnpmパッケージからノードモジュールを動的生成する
 *
 * 1. npm install でパッケージを取得
 * 2. パッケージのREADME/package.jsonを読んでI/Oを推定
 * 3. ノード定義 + 実行ラッパーを生成
 * 4. レジストリに登録
 *
 * ノード間通信はAPIではなく、ワークフローエンジンの
 * インメモリデータパッシングで行う。
 */

import type { NodeDefinition, NodeModule, NodeCategory } from "@/lib/nodes/types";

/** GitHubリポジトリからノードを生成するリクエスト */
export interface NodeGenerationRequest {
  /** リポジトリのフルネーム (owner/name) */
  repoFullName: string;
  /** npmパッケージ名（repo名と異なる場合） */
  npmPackageName?: string;
  /** このノードが果たす役割 */
  role: string;
  /** ノードのカテゴリ */
  category: NodeCategory;
  /** READMEテキスト（事前取得済みの場合） */
  readme?: string;
}

/** 生成されたノードの情報 */
export interface GeneratedNodeInfo {
  /** 生成されたノード定義ID */
  definitionId: string;
  /** npm install コマンド */
  installCommand: string;
  /** 生成されたNodeModule（サーバーで実行可能な形） */
  nodeModule: NodeModule;
  /** ソースコード（保存用） */
  sourceCode: string;
}

/**
 * パッケージ名を推定する
 * repo名がnpmパッケージ名と一致するケースが多い
 */
export function inferPackageName(repoFullName: string, repoName: string): string {
  // scopeなしの場合はrepo名をそのまま使う
  return repoName;
}

/**
 * リポジトリ情報からノード定義を生成する
 *
 * README等を解析して入出力ポートを推定する。
 * 完全な静的解析は不可能なので、汎用的なポート構成にする。
 */
export function generateNodeDefinition(req: NodeGenerationRequest): NodeDefinition {
  const packageName = req.npmPackageName ?? req.repoFullName.split("/")[1] ?? "unknown";
  const definitionId = `github-${packageName}`;

  return {
    id: definitionId,
    name: req.role,
    description: `GitHub: ${req.repoFullName} から取得`,
    category: req.category,
    color: "#c084fc",
    icon: "Package",
    inputs: [
      {
        id: "input",
        label: "入力データ",
        type: "any",
        required: false,
      },
      {
        id: "config",
        label: "設定",
        type: "object",
        required: false,
        defaultValue: {},
      },
    ],
    outputs: [
      {
        id: "output",
        label: "出力データ",
        type: "any",
      },
      {
        id: "error",
        label: "エラー",
        type: "string",
      },
    ],
  };
}

/**
 * ノード実行ラッパーのソースコードを生成する
 *
 * これはサーバーサイドで実行される。
 * パッケージを require() して呼び出す単純なラッパー。
 */
export function generateNodeSource(
  packageName: string,
  role: string
): string {
  return `
/**
 * 自動生成ノード: ${role}
 * パッケージ: ${packageName}
 *
 * GitHub上のパッケージを直接importして使用。
 * ノード間はワークフローエンジンのインメモリ受け渡し。
 * API通信は不要。
 */

const pkg = require("${packageName}");

module.exports = {
  definition: {
    id: "github-${packageName}",
    name: "${role}",
    description: "GitHub: ${packageName}",
    category: "custom",
    inputs: [
      { id: "input", label: "入力データ", type: "any", required: false },
      { id: "config", label: "設定", type: "object", required: false, defaultValue: {} },
    ],
    outputs: [
      { id: "output", label: "出力データ", type: "any" },
      { id: "error", label: "エラー", type: "string" },
    ],
  },
  async execute(inputs, context) {
    try {
      context.log("パッケージ ${packageName} を実行中...");
      const config = inputs.config ?? {};
      const input = inputs.input;

      // パッケージのデフォルトエクスポートを呼び出し
      // 実際の使い方はパッケージごとに異なるため、
      // 生成後にユーザーが調整する想定
      let result;
      if (typeof pkg === "function") {
        result = await pkg(input, config);
      } else if (typeof pkg.default === "function") {
        result = await pkg.default(input, config);
      } else {
        result = { package: pkg, input, config, note: "パッケージの使い方をconfigで指定してください" };
      }

      return { outputs: { output: result } };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { outputs: { output: null, error: message }, error: message };
    }
  },
};
`.trim();
}

/**
 * ノードモジュールを動的に生成する
 *
 * 注意: 実際のrequire()はサーバーサイドでのみ動作する。
 * クライアントサイドでは定義のみを返す。
 */
export function generateNodeModule(req: NodeGenerationRequest): GeneratedNodeInfo {
  const packageName = req.npmPackageName ?? req.repoFullName.split("/")[1] ?? "unknown";
  const definition = generateNodeDefinition(req);
  const sourceCode = generateNodeSource(packageName, req.role);

  // NodeModuleを生成（実行関数はサーバーで動的ロード）
  const nodeModule: NodeModule = {
    definition,
    async execute(inputs, context) {
      try {
        context.log(`パッケージ ${packageName} を実行中...`);
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pkg = require(packageName);
        const config = (inputs.config as Record<string, unknown>) ?? {};
        const input = inputs.input;

        let result: unknown;
        if (typeof pkg === "function") {
          result = await pkg(input, config);
        } else if (typeof pkg.default === "function") {
          result = await pkg.default(input, config);
        } else {
          result = { package: Object.keys(pkg), input, config };
        }

        return { outputs: { output: result } };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { outputs: { output: null, error: message }, error: message };
      }
    },
  };

  return {
    definitionId: definition.id,
    installCommand: `npm install ${packageName}`,
    nodeModule,
    sourceCode,
  };
}
