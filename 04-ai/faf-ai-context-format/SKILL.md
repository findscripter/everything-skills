---
name: faf-ai-context-format
title: .faf AI 上下文格式专家
description: 当需要把代码库的项目上下文沉淀为可跨 AI 工具/会话持久复用的 .faf 文件、配置 faf 的 MCP 服务、做 AI 就绪度评分或与 CLAUDE.md/.cursorrules/GEMINI.md 双向同步时使用；用 faf-cli 初始化、评分、校验、增强并打通各平台上下文产物；不适用于一次性问答、纯代码生成、或非 .faf 体系的私有上下文方案；触发词：.faf、faf-cli、AI 上下文格式、faf score、MCP 上下文、双向同步。
domain: 智能/prompting
triggers: [.faf, faf-cli, faf init, faf score, AI 上下文格式, AI-context format, MCP 上下文同步, bi-directional sync, CLAUDE.md 同步, AI 就绪度评分]
tags: [faf, ai-context, mcp, project-context, iana, yaml, bi-sync]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [faf-cli, node, npx]
requires: []
related: [agents-md-maintainer, context-window-management, context-compression, codebase-structure-protocol]
combines_with: [mcp-builder, agent-readiness-aeo-check, codebase-onboarding-doc]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你要把一个项目的「上下文 DNA」（身份、目标、技术栈、人类背景、架构、部署）固化成机器可读的 **.faf**（Foundational AI-context Format）文件，让上下文在**会话、工具、AI 平台之间持久存活**时使用。.faf 是 IANA 注册格式（媒体类型 `application/vnd.faf+yaml`），可作为 Claude/Cursor/Gemini/Windsurf 等通用上下文层。

**该用**：
- 为复杂/遗留项目搭建标准化 AI 上下文，做**AI 就绪度评分**（追求 85%+ 生产级、95%+ 金牌级）。
- 配置 faf 的 **MCP 服务**（如 `claude-faf-mcp`），让 Agent 原生消费 .faf。
- 在多套 AI 工具间**双向同步**：`.faf` ↔ `CLAUDE.md` / `.cursorrules` / `GEMINI.md` / `AGENTS.md`，保持单一真相源。
- 校验 .faf 是否符合格式规范、对特定模型做上下文增强。

**不该用（边界）**：
- **一次性问答 / 纯代码生成**：用不上持久上下文层，直接对话即可，别为此引入 .faf。
- **非 .faf 体系的私有上下文方案**：本技能只覆盖 faf 工具链与格式，不替你设计自研格式。
- 把它当**环境特定校验的替代品**：评分高 ≠ 代码正确，仍需测试与人工评审。

## 步骤 / 指令

```bash
# 1. 安装 CLI（需要 Node/npm）
npm install -g faf-cli

# 2. 在项目根初始化 .faf（自动探测技术栈）
faf init

# 3. 评 AI 就绪度，看明细短板
faf score --details
faf score --championship --verbose   # 带评分项拆解的进阶评分

# 4. 校验格式合规（严格模式）
faf validate --strict

# 5. 针对目标模型做上下文增强（按完整度补全）
faf enhance --model claude --focus completeness

# 6. 多平台双向同步（一次打通所有目标产物）
faf bi-sync --target all
```

配置 MCP 服务（写入 Agent 的 MCP 配置，使 .faf 可被原生消费）：

```json
{
  "mcpServers": {
    "faf": {
      "command": "npx",
      "args": ["-y", "claude-faf-mcp@latest"]
    }
  }
}
```

**评分分层（championship 标准）**：
- 金牌 Gold ≥ 95%：生产就绪的 AI 上下文。
- 银牌 Silver ≥ 85%：专业开发标准。
- 铜牌 Bronze ≥ 70%：可用的 AI 协助基础。

**编写要点**：先填 `project`（name/goal）、`stack`（技术栈，可自动探测）、`human_context`（who/what/why/where/when/how），再迭代评分补全短板，直到达标。

## 示例

现代 React 仪表盘的最小 .faf（目标金牌级）：

```yaml
project:
  name: analytics-dashboard
  goal: Real-time analytics for SaaS platform
stack:
  frontend: react-18
  css_framework: tailwind
  state: zustand
  build: vite
  testing: vitest
  deployment: vercel
```

遗留企业 Java 系统加上人类背景（让 AI 理解「为什么这样」）：

```yaml
project:
  name: enterprise-payment-api
  goal: Mission-critical payment processing system
stack:
  backend: java-spring
  database: oracle
  runtime: java-11
  deployment: kubernetes
human_context:
  where: AWS EKS production cluster
  when: Legacy system from 2018, modernizing 2026
  how: Spring Boot 2.7, Oracle 19c, Docker containerization
```

## 注意事项

- **先评分后扩写**：用 `faf score --details` 驱动，缺什么补什么，别一上来堆满字段。`human_context` 的 where/when/how 往往是拉高分数的关键——它们补的是「为什么」，AI 最缺的就是这层。
- **单一真相源**：开启 `bi-sync` 后，把 `.faf` 当源、`CLAUDE.md/.cursorrules/GEMINI.md` 当派生产物，避免在多处手改导致漂移。
- **MCP 服务按宿主选型**：`claude-faf-mcp`（Claude，33 工具）、`grok-faf-mcp`（xAI/Grok）、`gemini-faf-mcp`（Gemini）、`rust-faf-mcp`（原生性能）。
- **commit 务必纳管**：把 `.faf` 提交进版本库，它是团队共享的上下文契约，不是本地缓存。
- 评分/同步结果**不替代环境特定的测试与专家评审**；输入、权限、安全边界或成功判据缺失时，先停下问清再继续。
- 想要「一键生成、零配置、新手友好」的快速建档，用更轻量的向导式流程；本技能面向精细配置、评分优化、多平台同步与 MCP 进阶。

## 互见

- related：`agents-md-maintainer` —— 同属「为 Agent 沉淀可发现/可复用上下文」家族；.faf 是结构化的上下文 DNA，AGENTS.md 是最小化的指令文档，二者互为派生（可 bi-sync）。
- related：`agent-tool-design` —— .faf 字段与工具描述都是被载入上下文、引导 Agent 行为的「契约文本」，精简、无歧义、机读友好的原则相通。
- combines_with：`skill-creator` —— 给项目建好 .faf 上下文后，可据其技术栈与约定派生针对性的项目级技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
