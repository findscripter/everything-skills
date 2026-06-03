---
name: react-flow-node-graph-architect
title: ReactFlow 节点图应用架构
description: 当用 ReactFlow 构建可交互节点图（树形导航/大数据量/复杂状态）时使用；做出层级展开、性能优化与状态管理（含撤销重做、自动布局、聚焦/搜索）的生产级实现；不适用于静态流程图、纯 SVG 绘图或非 ReactFlow 图库。触发词：ReactFlow、节点图、自动布局
domain: 研发/frontend
triggers: [ReactFlow, 节点图, 流程图编辑器, 树形导航, Dagre 自动布局, 节点图性能优化, 撤销重做, 聚焦模式]
tags: [前端, react, reactflow, 可视化, 性能优化, 状态管理, typescript]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [reactflow, dagre, lodash.debounce, React.memo, useMemo, useCallback]
requires: []
related: [react-state-management, tanstack-query, typescript-advanced-types, frontend-design]
combines_with: [react-state-management, d3js-data-viz, web-artifacts-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你要用 **ReactFlow** 搭建生产级的可交互节点图时使用本技能，典型场景：

- 需要**层级树形导航**（父子节点、可展开/折叠）。
- 数据量大（数百至上千节点），需要**增量渲染与 memo 化**控制性能。
- 需要**复杂状态管理**：选中、展开集合、撤销/重做、持久化、自动保存。
- 需要 **Dagre 自动布局**、**聚焦模式**、**节点搜索定位**等进阶交互。

不该用的边界：

- 只是画静态流程图/示意图，用 Mermaid、PlantUML 或纯 SVG 更省事。
- 使用的不是 ReactFlow（如 D3、Cytoscape、X6、vis-network），模式不直接通用。
- 节点数极小且无交互需求，直接用最简 `<ReactFlow>` 即可，无需本技能的优化套路。

## 步骤 / 指令

1. **起步**：装 `reactflow`，渲染最小图验证依赖与样式正常。
2. **定义类型**：先用 TypeScript 给节点 `data` 建模（`level`、`hasChildren`、`isExpanded`、`category` 等），类型先行避免后期返工。
3. **构建可见集**：树形场景用 `expandedIds: Set<string>` 递归从根节点计算可见节点/边，而非渲染全量。
4. **接状态管理**：用 `useReducer` 统一处理选中、展开、更新、撤销/重做；展开/选中走 action，保证可回溯。
5. **加性能层**：节点组件 `React.memo` + 自定义比较函数；`useMemo` 缓存样式化边；`Map` 做 O(1) 查找。
6. **接自动布局**：用 Dagre 计算坐标，并 `debounce`（约 150ms）+ 缓存结果，避免高频交互抖动。
7. **加进阶交互**（按需）：聚焦模式隔离选中节点及其直接连接；搜索后展开父链并 `fitView` 定位。
8. **校验性能**：节点数 > 500 提示虚拟化；单帧渲染估算 > 16ms（掉 60fps）则优化。

## 示例

最小可交互图：

```tsx
import ReactFlow, { Node, Edge } from "reactflow";

const nodes: Node[] = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "2", position: { x: 100, y: 100 }, data: { label: "Node 2" } },
];
const edges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

export default function Graph() {
  return <ReactFlow nodes={nodes} edges={edges} />;
}
```

树形可见集递归（只渲染展开路径）：

```typescript
const buildVisibleNodes = useCallback(
  (allNodes: TreeNode[], expandedIds: Set<string>) => {
    const visibleNodes = new Map<string, TreeNode>();
    const rootNodes = allNodes.filter((n) => n.data.level === 0);
    const addVisibleChildren = (node: TreeNode) => {
      visibleNodes.set(node.id, node);
      if (expandedIds.has(node.id)) {
        allNodes
          .filter((n) => n.parentNode === node.id)
          .forEach(addVisibleChildren);
      }
    };
    rootNodes.forEach(addVisibleChildren);
    return { nodes: Array.from(visibleNodes.values()) };
  },
  [],
);
```

memo 化节点 + memo 化样式边（命中重渲染热点）：

```typescript
const ProcessNode = memo(
  ({ data, selected }: NodeProps) => (
    <div className={`process-node ${selected ? "selected" : ""}`}>{data.label}</div>
  ),
  (prev, next) =>
    prev.data.label === next.data.label &&
    prev.selected === next.selected &&
    prev.data.isExpanded === next.data.isExpanded,
);

const styledEdges = useMemo(
  () =>
    edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        strokeWidth: selectedEdgeId === edge.id ? 3 : 2,
        stroke: selectedEdgeId === edge.id ? "#3b82f6" : "#94a3b8",
      },
      animated: selectedEdgeId === edge.id,
    })),
  [edges, selectedEdgeId],
);
```

Dagre 自动布局（去抖 + 缓存）：

```typescript
import dagre from "dagre";

const layoutOptions = { rankdir: "TB", nodesep: 100, ranksep: 150, marginx: 50, marginy: 50, edgesep: 10 };

const applyLayout = (nodes: Node[], edges: Edge[]) => {
  const g = new dagre.graphlib.Graph();
  g.setGraph(layoutOptions);
  g.setDefaultEdgeLabel(() => ({}));
  nodes.forEach((n) => g.setNode(n.id, { width: 200, height: 100 }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map((n) => ({
    ...n,
    position: { x: g.node(n.id).x - 100, y: g.node(n.id).y - 50 },
  }));
};

const debouncedLayout = useMemo(() => debounce(applyLayout, 150), []);
```

Reducer 管展开/选中（撤销重做的基础）：

```typescript
type GraphAction =
  | { type: "SELECT_NODE"; payload: string }
  | { type: "TOGGLE_EXPAND"; payload: string }
  | { type: "UNDO" } | { type: "REDO" };

const graphReducer = (state: GraphState, action: GraphAction): GraphState => {
  switch (action.type) {
    case "SELECT_NODE":
      return { ...state, selectedNodeId: action.payload, selectedEdgeId: null };
    case "TOGGLE_EXPAND": {
      const next = new Set(state.expandedNodeIds);
      next.has(action.payload) ? next.delete(action.payload) : next.add(action.payload);
      return { ...state, expandedNodeIds: next, isDirty: true };
    }
    default:
      return state;
  }
};
```

聚焦模式（隔离选中节点及其直接连接）：

```typescript
const useFocusMode = (selectedNodeId: string, allNodes: Node[], allEdges: Edge[]) =>
  useMemo(() => {
    if (!selectedNodeId) return { nodes: allNodes, edges: allEdges };
    const connected = new Set([selectedNodeId]);
    const focusedEdges = allEdges.filter((e) => {
      const hit = e.source === selectedNodeId || e.target === selectedNodeId;
      if (hit) { connected.add(e.source); connected.add(e.target); }
      return hit;
    });
    return { nodes: allNodes.filter((n) => connected.has(n.id)), edges: focusedEdges };
  }, [selectedNodeId, allNodes, allEdges]);
```

## 注意事项

性能红线（来自源技能的硬约束）：

- 节点 **> 500** → 上虚拟化或裁剪可见节点；**> 1000** 必须虚拟化。
- 单帧估算 **> 16ms** 会掉 60fps → 用 memo 化 + 增量渲染。
- 节点组件统一 `React.memo`；边创建/操作函数用 `useCallback`，依赖要稳定。
- 高频交互（拖拽、连续展开）时 `debounce` 布局计算并缓存结果。

内存与状态：

- 用 `Map` 做 O(1) 查找，替代 `array.find`：`new Map(allNodes.map((n) => [n.id, n]))`。
- `useEffect` 返回清理函数，清空 `nodesMapRef`/`edgesMapRef` 等残留引用，必要时用 `WeakMap` 存临时数据。
- 不该触发重渲染的对象（如自动保存数据）放 `useRef`，更新属性而非替换引用。

常见坑：

- 手动定位与自动布局冲突 → 用受控定位状态，分离「手动/自动」两种布局模式。
- 展开卡顿 → 增量渲染 + 变更检测（仅展开集变化时走增量更新，否则全量重建）。
- 过度重渲染 → `memo` + `useMemo` + `useCallback` 三件套，配稳定依赖。

边界提醒：本技能给的是估算式性能分析与模式，不能替代真实环境下的实测、Profiler 与专家评审；缺关键输入或约束时先暂停澄清。

## 互见

- 性能分析可配套一个静态扫描脚本（`scripts/graph-analyzer.js`）统计节点/边数、估算渲染时间并给优化建议，用于 CI 或代码审查。
- 与「前端性能优化」「React 渲染优化」类技能配合使用效果更佳。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
