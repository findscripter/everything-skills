---
name: wiki-to-vitepress-site
title: Wiki 转 VitePress：Markdown 转静态文档站点
description: 当已有一批 Markdown wiki/文档页、需打包成可浏览的 VitePress 静态站点（暗色主题 + 可交互 Mermaid 图）时使用；脚手架 wiki-site/、写 config.mts/custom.css/theme，做暗色 Mermaid 三层修复与点击放大，npm run docs:build 产出 dist/；不适用于撰写文档内容本身、单文件转换或 MkDocs/Docusaurus 等其他生成器。触发词：build a site、打包成 VitePress、静态文档站、Mermaid 暗色、/deep-wiki:build
domain: 文书/markdown
triggers: [把 wiki 打包成 VitePress 站点, build a site, Markdown 转静态文档站, VitePress 暗色主题配置, 修复 Mermaid 暗色显示, Mermaid 图点击放大, 生成可浏览 HTML 文档站]
tags: [VitePress, 静态站点, Mermaid, 文档工程, 暗色主题, 前端构建]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Write, Edit, Bash, npm]
requires: []
related: [docs-architect, technical-reference-builder, readme-doc-writer, markdown-to-docx]
combines_with: [mermaid-diagram-expert, docs-architect, codebase-onboarding-doc]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

已经**有一批生成好的 Markdown 页面**（如 deep-wiki 产出、知识库导出），想把它们打包成一个可浏览、带导航与暗色主题、内嵌可交互 Mermaid 图的 **VitePress 静态站点**时使用。典型触发：

- 用户说「build a site」「打包成 VitePress」「我要一个能点开看的 HTML 文档站」。
- 用户跑 `/deep-wiki:build` 之类命令。

**不该用的边界：**

- 任务是**撰写/翻译文档内容本身**——那属于 `docs-architect`、`readme-doc-writer` 等写作技能，本技能只负责「已有 Markdown → 站点」的打包封装。
- 只需把单个文件转成 DOCX/PDF——用 `markdown-to-docx` 等点对点转换技能。
- 目标生成器是 MkDocs / Docusaurus / Hugo 等——本技能只覆盖 VitePress。
- 缺少源 Markdown、目录结构或构建环境（Node/npm）时，先停下澄清，别凭空造内容。

## 步骤

1. **建脚手架**：在 `wiki-site/` 下生成标准结构：

   ```
   wiki-site/
   ├── .vitepress/
   │   ├── config.mts
   │   └── theme/
   │       ├── index.ts
   │       └── custom.css
   ├── public/
   ├── [拷入的 .md 页面]
   ├── package.json
   └── index.md
   ```

2. **写 `config.mts`**：用 `vitepress-plugin-mermaid` 的 `withMermaid` 包裹配置；设 `appearance: 'dark'`（纯暗色）；据目录结构填 `themeConfig.nav` 与 `themeConfig.sidebar`；并配置 Mermaid 暗色主题变量（见示例）。
3. **做暗色 Mermaid 三层修复**（关键，缺一层就显示异常，见下）。
4. **加 Mermaid 图点击放大**（可选增强）。
5. **构建前后处理**：扫描所有 `.md`，把 `<br/>` 改成 `<br>`（Vue 模板编译器兼容）；代码块外裸露的泛型参数 `<T>` 用反引号包起来；确保每页都有含 `title`、`description` 的 YAML frontmatter。
6. **构建**：

   ```bash
   cd wiki-site && npm install && npm run docs:build
   ```

   产物在 `wiki-site/.vitepress/dist/`。

## 指令

**暗色 Mermaid 三层修复**——内联 `style` 优先级最高，只靠 CSS 治不住，必须三层叠加：

- **第 1 层｜主题变量（`config.mts`）**：

  ```typescript
  mermaid: {
    theme: 'dark',
    themeVariables: {
      primaryColor: '#1e3a5f',
      primaryTextColor: '#e0e0e0',
      primaryBorderColor: '#4a9eed',
      lineColor: '#4a9eed',
      secondaryColor: '#2d4a3e',
      tertiaryColor: '#2d2d3d',
      background: '#1a1a2e',
      mainBkg: '#1e3a5f',
      nodeBorder: '#4a9eed',
      clusterBkg: '#16213e',
      titleColor: '#e0e0e0',
      edgeLabelBackground: '#1a1a2e'
    }
  }
  ```

- **第 2 层｜CSS 覆盖（`custom.css`）**，用 `!important` 命中 SVG：

  ```css
  .mermaid .node rect,
  .mermaid .node circle,
  .mermaid .node polygon { fill: #1e3a5f !important; stroke: #4a9eed !important; }
  .mermaid .edgeLabel { background-color: #1a1a2e !important; color: #e0e0e0 !important; }
  .mermaid text { fill: #e0e0e0 !important; }
  .mermaid .label { color: #e0e0e0 !important; }
  ```

- **第 3 层｜内联样式替换（`theme/index.ts`）**：Mermaid 异步渲染，`onMounted` 触发时 SVG 还没生成，须**轮询**改写内联 `style`。必须用 `setup()` + `onMounted`，**不能**用 `enhanceApp()`（SSR 阶段无 `document`）：

  ```typescript
  import { onMounted } from 'vue'

  // 在 setup() 内
  onMounted(() => {
    let attempts = 0
    const fix = setInterval(() => {
      document.querySelectorAll('.mermaid svg [style]').forEach(el => {
        const s = (el as HTMLElement).style
        if (s.fill && !s.fill.includes('#1e3a5f')) s.fill = '#1e3a5f'
        if (s.stroke && !s.stroke.includes('#4a9eed')) s.stroke = '#4a9eed'
        if (s.color) s.color = '#e0e0e0'
      })
      if (++attempts >= 20) clearInterval(fix)
    }, 500)
  })
  ```

## 示例

**Mermaid 图点击放大**：给每个 `.mermaid` 容器套可点击壳，点开全屏模态：

```typescript
document.querySelectorAll('.mermaid').forEach(el => {
  el.style.cursor = 'zoom-in'
  el.addEventListener('click', () => {
    const modal = document.createElement('div')
    modal.className = 'mermaid-zoom-modal'
    modal.innerHTML = el.outerHTML
    modal.addEventListener('click', () => modal.remove())
    document.body.appendChild(modal)
  })
})
```

配套模态 CSS：

```css
.mermaid-zoom-modal {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.9);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; cursor: zoom-out;
}
.mermaid-zoom-modal .mermaid { transform: scale(1.5); }
```

## 注意事项

- **Mermaid 异步渲染**：`onMounted` 触发时 SVG 尚不存在，必须轮询（示例中 20 次 × 500ms），不能一次性查找。
- **别用 `isCustomElement`**：为裸 `<T>` 设这个编译选项会引发更严重的崩溃；正确做法是把 `<T>` 用反引号包起来。
- **节点文字用最高优先级的内联 `style`**：单靠 CSS 改不动，必须有第 3 层内联替换。
- **`enhanceApp()` 跑在 SSR**：那里没有 `document`，只能用 `setup()`。
- 仅在任务确实落入「已有 Markdown → VitePress 站点」范围时使用；产出需经实际 `npm run docs:build` 验证，不要把脚手架当成已验证结果。
- 缺源页面、目录结构或构建环境时先澄清，不要臆造内容。

## 互见

- related：`docs-architect`、`readme-doc-writer` —— 先写好/整理 Markdown 内容，再用本技能打包成站点。
- related：`mermaid-diagram-expert` —— 站内 Mermaid 图的语法与建模问题在此解决。
- combines_with：`markdown-to-docx` —— 同一批 Markdown，既能打包成在线站点，也能离线导出为 DOCX 分发。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
