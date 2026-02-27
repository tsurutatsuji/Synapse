import type { NodeDefinition, NodeModule } from "./types";

/**
 * ノードレジストリ
 * 利用可能なノード定義を管理する。
 * ビルトインノードと、外部からインストールされたカスタムノードの両方を扱う。
 */

const nodeRegistry = new Map<string, NodeModule>();

/** ノードをレジストリに登録する */
export function registerNode(nodeModule: NodeModule): void {
  const { id } = nodeModule.definition;
  if (nodeRegistry.has(id)) {
    console.warn(`Node "${id}" is already registered. Overwriting.`);
  }
  nodeRegistry.set(id, nodeModule);
}

/** 登録済みノードモジュールを取得する */
export function getNodeModule(definitionId: string): NodeModule | undefined {
  return nodeRegistry.get(definitionId);
}

/** 全ての登録済みノード定義を取得する */
export function getAllNodeDefinitions(): NodeDefinition[] {
  return Array.from(nodeRegistry.values()).map((m) => m.definition);
}

/** カテゴリ別にノード定義を取得する */
export function getNodeDefinitionsByCategory(
  category: string
): NodeDefinition[] {
  return getAllNodeDefinitions().filter((d) => d.category === category);
}

/** ノードの登録を解除する */
export function unregisterNode(definitionId: string): boolean {
  return nodeRegistry.delete(definitionId);
}

/** レジストリをクリアする */
export function clearRegistry(): void {
  nodeRegistry.clear();
}
