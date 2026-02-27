/**
 * 力学モデル（Fruchterman-Reingold）による自動レイアウト
 *
 * ノード間に斥力（反発力）、エッジに引力を適用して
 * Obsidianグラフビューのような有機的な配置を実現する。
 */

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function forceDirectedLayout(
  nodes: { id: string; x: number; y: number }[],
  edges: { sourceNodeId: string; targetNodeId: string }[],
  options: {
    iterations?: number;
    repulsion?: number;
    attraction?: number;
    damping?: number;
    centerX?: number;
    centerY?: number;
  } = {}
): { id: string; x: number; y: number }[] {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) {
    return [{ id: nodes[0].id, x: options.centerX ?? 400, y: options.centerY ?? 300 }];
  }

  const {
    iterations = 120,
    repulsion = 6000,
    attraction = 0.008,
    damping = 0.92,
    centerX = 400,
    centerY = 300,
  } = options;

  // ノード初期化（位置が0,0なら中心周辺にランダム配置）
  const layoutNodes: LayoutNode[] = nodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    const radius = 100 + nodes.length * 20;
    return {
      id: n.id,
      x: n.x !== 0 ? n.x : centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 50,
      y: n.y !== 0 ? n.y : centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 50,
      vx: 0,
      vy: 0,
    };
  });

  const nodeMap = new Map(layoutNodes.map((n) => [n.id, n]));

  for (let iter = 0; iter < iterations; iter++) {
    const temp = 1 - iter / iterations; // 温度（徐々に減衰）

    // 斥力: 全ノード対に対して
    for (let i = 0; i < layoutNodes.length; i++) {
      for (let j = i + 1; j < layoutNodes.length; j++) {
        const a = layoutNodes[i];
        const b = layoutNodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (repulsion * temp) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    // 引力: エッジで接続されたノード対
    for (const edge of edges) {
      const source = nodeMap.get(edge.sourceNodeId);
      const target = nodeMap.get(edge.targetNodeId);
      if (!source || !target) continue;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) continue;

      const force = dist * attraction;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    }

    // 中心への引力
    for (const node of layoutNodes) {
      node.vx += (centerX - node.x) * 0.002 * temp;
      node.vy += (centerY - node.y) * 0.002 * temp;
    }

    // 速度適用 + 減衰
    for (const node of layoutNodes) {
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
    }
  }

  return layoutNodes.map((n) => ({
    id: n.id,
    x: Math.round(n.x),
    y: Math.round(n.y),
  }));
}
