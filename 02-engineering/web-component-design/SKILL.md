---
name: web-component-design
title: Web 组件设计模式
description: 当构建 React/Vue/Svelte 组件库、设计组件 API 或落地前端设计系统时使用；做组合模式选型、CSS-in-JS 方案选择与可复用组件 API 的设计落地；不适用于纯样式微调、单页面一次性 UI 或后端逻辑；触发词：组件库、设计系统、复合组件、组件 API、CSS-in-JS
domain: 研发/frontend
triggers: [组件库, 设计系统, 复合组件, render props, 组件 API 设计, CSS-in-JS, Tailwind, styled-components, 可复用组件, Vue 插槽, Svelte runes, forwardRef]
tags: [前端, 组件设计, 设计系统, react, vue, svelte, css-in-js, ui]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [React, Vue 3, Svelte 5, Tailwind CSS, class-variance-authority, styled-components, Emotion, CSS Modules, Vanilla Extract]
requires: []
related: []
combines_with: []
license: MIT
source: wshobson/agents
source_license: MIT
---
采用现代框架，用清晰的组合模式与样式方案，构建可复用、易维护的 UI 组件。

## 何时使用

适用：
- 设计可复用组件库或设计系统
- 实现复杂的组件组合模式（复合组件 / render props / 插槽）
- 选型并落地 CSS-in-JS 方案
- 构建无障碍、响应式的 UI 组件
- 在整个代码库中统一组件 API 约定
- 将遗留组件重构为现代模式

不该用（负边界）：
- 仅做单个页面的一次性 UI 或局部样式微调，不涉及复用
- 纯视觉/CSS 调整且无组件抽象需求
- 后端业务逻辑或数据层问题

## 步骤

1. 明确复用边界：判断是「一次性 UI」还是「需沉淀到组件库」，只有后者才走本流程。
2. 选组合模式：
   - 复合组件（Compound Components）：一组协同工作的关联组件，通过 Context 共享状态。
   - Render Props：把渲染权委托给父级。
   - 插槽 Slots（Vue/Svelte）：具名内容注入点。
3. 选样式方案（见下表），与团队既有技术栈对齐。
4. 设计组件 API：语义化 prop 名、合理默认值、用 `children` 支持组合、用 `className`/`style` 允许样式覆盖。
5. 补齐无障碍与质量：ARIA 属性、键盘支持、forwardRef、必要的 memo。
6. 重构既有组件时，先识别 prop 爆炸/重渲染级联等坏味道再下手。

### CSS-in-JS 方案选型

| 方案 | 思路 | 最适合 |
| --- | --- | --- |
| Tailwind CSS | 原子类 | 快速原型、设计系统 |
| CSS Modules | 局部作用域 CSS 文件 | 既有 CSS、渐进采用 |
| styled-components | 模板字符串 | React、动态样式 |
| Emotion | 对象/模板样式 | 灵活、SSR 友好 |
| Vanilla Extract | 零运行时 | 性能敏感型应用 |

## 指令

组件 API 设计原则：
- 用语义化 prop 名（`isLoading` 优于 `loading`）。
- 提供合理默认值（defaultVariants）。
- 通过 `children` 支持组合，避免大量配置型 prop。
- 通过 `className` / `style` 允许样式覆盖。

最佳实践：
1. 单一职责：每个组件把一件事做好。
2. 防止 prop 钻取：深层嵌套数据用 Context 传递。
3. 默认无障碍：内置 ARIA 属性与键盘支持。
4. 受控 vs 非受控：在合适场景同时支持两种模式。
5. 转发 ref：用 `forwardRef` 让父级访问 DOM 节点。
6. 记忆化：对昂贵渲染用 `React.memo` / `useMemo`。
7. 错误边界：包裹可能失败的组件。

## 示例

React + Tailwind 按钮（用 cva 管理变体 + forwardRef）：

```tsx
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

interface ButtonProps
  extends ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
```

React 复合组件（Context 驱动的 Accordion）：

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";

interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("Must be used within Accordion");
  return context;
}

export function Accordion({ children }: { children: ReactNode }) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className="divide-y">{children}</div>
    </AccordionContext.Provider>
  );
}

Accordion.Item = function AccordionItem({
  id, title, children,
}: { id: string; title: string; children: ReactNode }) {
  const { openItems, toggle } = useAccordion();
  const isOpen = openItems.has(id);
  return (
    <div>
      <button onClick={() => toggle(id)} className="w-full text-left py-3">
        {title}
      </button>
      {isOpen && <div className="pb-3">{children}</div>}
    </div>
  );
};
```

复合组件的使用形态：

```tsx
<Select value={value} onChange={setValue}>
  <Select.Trigger>Choose option</Select.Trigger>
  <Select.Options>
    <Select.Option value="a">Option A</Select.Option>
    <Select.Option value="b">Option B</Select.Option>
  </Select.Options>
</Select>
```

Vue 3 用 provide/inject 实现 Tabs 上下文：

```vue
<script setup lang="ts">
import { ref, computed, provide, inject, type InjectionKey, type Ref } from "vue";

interface TabsContext {
  activeTab: Ref<string>;
  setActive: (id: string) => void;
}
const TabsKey: InjectionKey<TabsContext> = Symbol("tabs");

// 父组件
const activeTab = ref("tab-1");
provide(TabsKey, {
  activeTab,
  setActive: (id: string) => { activeTab.value = id; },
});

// 子组件使用
const tabs = inject(TabsKey);
const isActive = computed(() => tabs?.activeTab.value === props.id);
</script>
```

Svelte 5 用 runes（`$props` / `$derived`）写按钮：

```svelte
<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    onclick?: () => void;
    children: import('svelte').Snippet;
  }
  let { variant = 'primary', size = 'md', onclick, children }: Props = $props();
  const classes = $derived(`btn btn-${variant} btn-${size}`);
</script>

<button class={classes} {onclick}>
  {@render children()}
</button>
```

## 注意事项

常见坑：
- Prop 爆炸：prop 太多时改用组合而非配置。
- 样式冲突：用局部作用域样式或 CSS Modules 隔离。
- 重渲染级联：用 React DevTools 定位，恰当地 memo。
- 无障碍缺口：用屏幕阅读器与键盘导航实测。
- 包体积：对未使用的组件变体做 tree-shaking。

## 互见

- 设计系统 token 与主题方案
- 前端无障碍（a11y）与 ARIA 实践
- 前端性能优化与渲染分析

---

采编自 wshobson/agents（MIT 许可）。
