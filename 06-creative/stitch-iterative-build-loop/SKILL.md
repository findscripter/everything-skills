---
name: stitch-iterative-build-loop
title: Stitch 迭代构建循环：自主接力式网站搭建
description: 当用 Stitch 跨多轮/多 Agent 自主接力搭建整站、每轮读任务→生成页→集成→交棒时使用；做基于 .stitch/next-prompt.md「接力棒」的闭环：读棒→查 SITE/DESIGN→Stitch 生成页→并入 site/public→更新文档→写下一棒；不适用于一次性单页生成、无 Stitch MCP 或无设计系统的场景；触发词：Stitch、迭代构建循环、接力棒、自主搭站
domain: 创意/design
triggers: [Stitch, stitch-loop, 迭代构建循环, 接力棒, baton, next-prompt, 自主搭站, 整站生成, 网站迭代构建, Stitch MCP]
tags: [前端, 网站生成, Stitch, MCP, 自动化, 迭代循环, 设计系统, 创意]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [stitch-mcp, chrome-devtools-mcp, Read, Write, Bash]
requires: []
related: [stitch-design-system-taste, google-stitch-ui-prompting, high-end-visual-design]
combines_with: [theme-factory, parallel-agent-hub]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
你是一名**自主前端构建者**，参与一个迭代式整站搭建循环。每一轮的目标恒定：用 Stitch 生成一个页面、把它集成进站点、再为下一轮写好任务说明（交棒）。本技能与编排层无关——CI/CD、人审、Agent 链、手动重跑都行，关注的是「接力棒」模式本身。

## 何时使用

- 你在用 **Stitch** 跨多轮运行或多个 Agent **接力式**搭建一个网站，每轮读下一条提示、生成或集成一页、再交棒给下一轮。
- 你需要一套有纪律的自主循环来做多步骤的前端整站建设。

**不该用的边界：**
- 只想一次性生成**单个页面**、没有跨轮交接需求——直接调 Stitch 生成即可，别套循环。
- 环境里**没有 Stitch MCP Server**，或没有 `.stitch/DESIGN.md` 设计系统——先补齐前置（用 `design-md` 类技能从已有 Stitch 截图生成 DESIGN.md），否则生成的页面风格不一致、循环空转。
- 把它当作环境特定的测试/校验或专家评审的替代品——产出仍需人工走查。

## 前置条件

**必需：** Stitch MCP Server 访问权；一个 Stitch 项目（已有或将创建）；`.stitch/DESIGN.md`（设计系统，缺失则先生成）；`.stitch/SITE.md`（站点愿景与路线图）。
**可选：** Chrome DevTools MCP Server——用于对生成页做视觉校验。

## 接力棒系统

`.stitch/next-prompt.md` 是各轮之间的交接棒。**三条铁律：**

1. YAML frontmatter 里的 `page` 字段决定输出文件名。
2. 提示正文**必须**内联 `.stitch/DESIGN.md` 的设计系统块（保证风格一致）。
3. 完成工作前**必须**改写这个文件，否则循环断裂。

棒文件形如：

```markdown
---
page: about
---
一个介绍 jules.top 追踪机制如何运作的页面。

**DESIGN SYSTEM (REQUIRED):**
[从 .stitch/DESIGN.md 第 6 节整段复制]

**Page Structure:**
1. 带导航的页头
2. 追踪方法论说明
3. 带链接的页脚
```

## 步骤

### 1. 读棒
解析 `.stitch/next-prompt.md`，取出 frontmatter 的 **page 名**与正文的**提示内容**。

### 2. 查上下文
生成前先读两份文件：
- `.stitch/SITE.md`：站点愿景、**Stitch Project ID**、已有页面（站点地图）、路线图。
- `.stitch/DESIGN.md`：Stitch 提示所需的视觉风格。

关键检查：第 4 节站点地图——**不要重复创建已存在的页面**；第 5 节路线图——有待办就从这里挑；第 6 节创意自由——路线图空了就从这里取灵感。

### 3. 用 Stitch 生成
1. **发现命名空间**：跑 `list_tools` 找到 Stitch MCP 前缀。
2. **取/建项目**：若 `.stitch/metadata.json` 存在，用其中 `projectId`；否则 `[prefix]:create_project` → `[prefix]:get_project` 取全量详情 → 写入 `.stitch/metadata.json`。每生成一屏后再次 `get_project`，把该屏的完整元数据（id、sourceScreen、尺寸、画布坐标）更新进 `screens` 映射。
3. **生成屏**：`[prefix]:generate_screen_from_text`，参数 `projectId`、`prompt`（含设计系统块的完整棒内容）、`deviceType: DESKTOP`（或按指定）。
4. **取资产**：下载前先查 `.stitch/designs/{page}.html` 与 `{page}.png` 是否已存在。
   - **已存在**：询问用户是从 Stitch 项目刷新还是复用本地文件，仅在确认后才重新下载。
   - **不存在**：下载 `htmlCode.downloadUrl` → `.stitch/designs/{page}.html`；`screenshot.downloadUrl` 末尾**追加 `=w{width}`**（width 取该屏元数据，否则 Google CDN 默认只给低清缩略图）→ `.stitch/designs/{page}.png`。

### 4. 集成进站点
1. 把 `.stitch/designs/{page}.html` 移到 `site/public/{page}.html`。
2. 修正资产路径为相对 public 目录。
3. 接线导航：把占位链接（如 `href="#"`）指向新页；合适则加入全局导航。
4. 确保各页页头/页脚一致。

### 4.5 视觉校验（可选）
若有 Chrome DevTools MCP（`list_tools` 见 `chrome*`）：Bash 起本地服务器（如 `npx serve site/public`）→ `[chrome_prefix]:navigate` 打开 `http://localhost:3000/{page}.html` → `[chrome_prefix]:screenshot` 截图 → 与 `.stitch/designs/{page}.png` 比对保真度 → 终止服务器。无此 MCP 则跳过。

### 5. 更新站点文档
改 `.stitch/SITE.md`：第 4 节站点地图加新页并标 `[x]`；从第 6 节移除已消费的创意；完成待办则更新第 5 节路线图。

### 6. 写下一棒（关键）
**完成前必须更新 `.stitch/next-prompt.md`**，否则循环死掉。
1. **定下一页**：先看路线图（第 5 节）待办；空则从创意自由（第 6 节）挑；再不行就构思一个契合愿景的新页。
2. **写棒**：带正确 YAML frontmatter，正文内联设计系统块 + 页面结构清单（见上方棒文件示例）。

## 文件结构

```
project/
├── .stitch/
│   ├── metadata.json   # Stitch 项目与屏 ID（务必持久化！）
│   ├── DESIGN.md       # 视觉设计系统（来自 design-md 技能）
│   ├── SITE.md         # 站点愿景、地图、路线图
│   ├── next-prompt.md  # 接力棒——当前任务
│   └── designs/        # Stitch 产物暂存区
│       ├── {page}.html
│       └── {page}.png
└── site/public/        # 生产页面
    ├── index.html
    └── {page}.html
```

## 示例：metadata.json 结构

调用 `[prefix]:get_project` 后填充，持久化所有 Stitch 标识供后续轮次编辑/做变体引用：

```json
{
  "name": "projects/6139132077804554844",
  "projectId": "6139132077804554844",
  "title": "My App",
  "deviceType": "MOBILE",
  "designTheme": {
    "colorMode": "DARK", "font": "INTER",
    "roundness": "ROUND_EIGHT", "customColor": "#40baf7", "saturation": 3
  },
  "screens": {
    "index": {
      "id": "d7237c7d78f44befa4f60afb17c818c1",
      "sourceScreen": "projects/6139132077804554844/screens/d7237c7d78f44befa4f60afb17c818c1",
      "x": 0, "y": 0, "width": 390, "height": 1249
    }
  },
  "metadata": { "userRole": "OWNER" }
}
```

`screens` 是「页名 → 屏对象」映射，每屏含 `id`、`sourceScreen`（MCP 调用用的资源路径）、画布坐标（`x`/`y`）与尺寸（`width`/`height`）。`designTheme` 持有色彩模式/字体/圆角/自定义色/饱和度等设计令牌。

## 注意事项

**五个高频坑（对照自检）：**
- 忘记更新 `.stitch/next-prompt.md` —— 循环直接断裂。
- 重复创建站点地图里已有的页面。
- 提示里漏了 `.stitch/DESIGN.md` 的设计系统块 —— 风格漂移。
- 留着 `href="#"` 占位链接没接真实导航。
- 新建项目后忘了持久化 `.stitch/metadata.json`。

**排障：** 生成失败→查提示是否含设计系统块；风格不一致→确认 DESIGN.md 最新且被正确复制；循环停滞→核 next-prompt.md 是否写了合法 frontmatter；导航坏掉→检查所有内链是否用了正确相对路径。

**编排选项：** CI/CD（GitHub Actions 监听 next-prompt.md 变更触发）、人审（开发者逐轮审查）、Agent 链（一个 Agent 派发给另一个，如 Jules API）、手动（开发者对同一仓库反复运行）。本技能编排无关，套哪种触发都行。

**边界提醒：** 仅在任务清晰落在上述范围时使用；产出不能替代环境特定的校验、测试或专家评审；若必需输入、权限、安全边界或成功标准缺失，停下来询问澄清。

## 互见

- requires：本技能依赖一份 `.stitch/DESIGN.md` 设计系统作为每轮提示的风格基准；建议先用「design-md」类技能从已有 Stitch 截图生成它（该配套技能尚未收入本典，可直接取源仓库）。
- related：`ui-design-system-builder`（沉淀可复用设计系统/令牌）、`frontend-design`（前端视觉与实现品味）、`high-end-visual-design`（高质感视觉打磨）、`design-dev-handoff`（设计稿转开发交付规格）。
- combines_with：`ui-design-system-builder` —— 先建统一设计系统，再驱动本循环逐页落地，保证整站风格一致；`frontend-design` —— 集成阶段用它收口前端实现质量。

---

采编自 sickn33/antigravity-awesome-skills（MIT），在其 `stitch-loop` 基础上适配重写为中文可执行流程，保留接力棒铁律、Stitch MCP 调用序列、metadata.json 结构与高频坑/排障表等关键约束。
