# Claude Code Workflow Creator

ファイルベースのAIエージェントノードを接続してワークフローを構築するビジュアルエディタ。

**Claude Code APIは使用しません。** 各ノードは独立したファイルとして存在し、ワークフローにインストールして接続します。

## コンセプト

- **ノード = ファイル**: 各AIエージェントノードは独立したTypeScriptファイル
- **インストール型**: ノードファイルをワークフローにインストールして利用
- **ビジュアル接続**: React Flowベースのノードエディタで直感的に接続
- **API不使用**: Claude Code等のAI APIを直接呼ばず、ローカルで完結

## ビルトインノード

| ノード | カテゴリ | 説明 |
|--------|----------|------|
| プロンプト | agent | テンプレートに変数を埋め込んでテキスト生成 |
| ファイル読込 | io | ファイル内容を読み込む |
| ファイル書込 | io | データをファイルに書き出す |
| シェル実行 | io | シェルコマンドを実行 |
| データ変換 | transform | JavaScript式でデータを変換 |
| マージ | transform | 複数入力を1つにまとめる |
| 条件分岐 | control | 条件でデータの流れを制御 |

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開くとワークフローエディタが表示されます。

## カスタムノードの作成

`src/nodes/` ディレクトリに新しいノードファイルを作成します:

```typescript
import type { NodeModule } from "@/lib/nodes/types";

const myNode: NodeModule = {
  definition: {
    id: "my-custom-node",
    name: "カスタムノード",
    description: "説明",
    category: "custom",
    color: "#6366f1",
    inputs: [
      { id: "input1", label: "入力", type: "string", required: true },
    ],
    outputs: [
      { id: "output1", label: "出力", type: "string" },
    ],
  },
  async execute(inputs, context) {
    const result = inputs.input1;
    return { outputs: { output1: result } };
  },
};

export default myNode;
```

作成後、`src/nodes/index.ts` でインポートして `registerNode()` で登録すれば、パレットに表示されます。

## アーキテクチャ

```
src/
├── app/                    # Next.js App Router
│   ├── api/workflow/       # ワークフロー実行API
│   └── page.tsx            # メインエディタ
├── components/
│   └── workflow-editor/    # エディタUIコンポーネント
├── lib/
│   ├── nodes/              # ノードシステム（型定義・レジストリ）
│   ├── workflow/           # ワークフローエンジン
│   └── store/              # Zustand状態管理
├── nodes/                  # ビルトインノード定義
node-packages/              # 外部カスタムノード
data/workflows/             # 保存済みワークフロー
```

## 技術スタック

- **Next.js 14** (App Router)
- **React Flow** (@xyflow/react) - ノードベースエディタ
- **Zustand** - 状態管理
- **TypeScript**
- **Tailwind CSS**
