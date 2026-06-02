---
name: codebase-onboarding-doc
title: 代码库上手文档生成
description: 当需要为新工程师/技术负责人/外包快速摸清陌生代码库并产出标准化上手（onboarding）文档时使用；做的是先扫描仓库收集架构与栈事实、再按受众填模板生成可执行上手手册；不适用于深度代码审查或安全审计；触发词：上手文档、onboarding、代码库导览、新人入职文档、架构概览、codebase walkthrough、仓库交接、技术负责人简报
domain: 协作/knowledge
triggers: [上手文档, onboarding, 代码库导览, 新人入职文档, 架构概览, codebase walkthrough, 仓库交接, 技术负责人简报]
tags: [onboarding, documentation, codebase-analysis, architecture, developer-experience, knowledge]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, os.walk, argparse, git, Notion API, Confluence REST API]
requires: []
related: [docs-architect, readme-doc-writer, adr-writer, developer-experience-optimizer]
combines_with: [docs-architect, developer-experience-optimizer, codetour-walkthrough-builder]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 新工程师、外包或技术负责人接手一个陌生仓库，需要一份标准化上手文档（架构、栈、关键文件、本地启动、常见任务）。
- 大规模重构后旧文档已失效，需重建；或准备内部交接 / 服务上手手册。

不该用：
- 需要逐行找 bug、做代码质量评审 → 用 code-reviewer。
- 需要核查依赖漏洞 / 许可证 → 用 dependency-auditor。
- 给外包写文档时，不要塞入深度架构剖析；给受众错配只会增加噪音。

## 步骤

1. **扫事实**：对目标仓库跑分析脚本，拿到文件数、语言分布、关键配置文件、目录结构、最大文件等机器可读信号，避免靠记忆臆测。
2. **抓关键信号**：语言占比定主栈；关键配置（package.json / pyproject.toml / go.mod / Cargo.toml / docker-compose.yml / .github/workflows 等）定构建与 CI；目录结构定模块边界。
3. **按受众填模板**，控制深度：
   - 初级：本地 setup + 护栏（先读核心 auth/data 模块，以测试为可执行示例）。
   - 资深：架构 + 运维关注点（先读 ADR/扩展性笔记，尽早验证性能/安全假设）。
   - 外包：限定职责边界 + 集成边界（外部集成走 wrapper，别越界）。
4. **在干净环境验证 setup 命令**真能跑通，再把每个安装阶段后的验证勾选项写进文档。
5. 需要时导出到 Notion / Confluence 供团队消费。

## 指令

收集代码库事实（脚本仅依赖 Python 标准库，可直接跑）：

```bash
# 文本摘要：语言分布 / 关键配置 / 最大文件 / 目录结构
python3 scripts/codebase_analyzer.py /path/to/repo

# 机器可读 JSON（便于 Agent 二次加工）
python3 scripts/codebase_analyzer.py /path/to/repo --json

# 控制目录树深度（默认 2）
python3 scripts/codebase_analyzer.py /path/to/repo --max-depth 3
```

脚本约束（采编自源技能，照搬其行为）：
- 默认忽略 `.git node_modules .next dist build coverage venv .venv __pycache__`。
- 按扩展名识别语言（.py→Python，.ts/.tsx→TypeScript，.go→Go，.rs→Rust，.java→Java 等）。
- 关键配置清单含 monorepo 信号（pnpm-workspace.yaml / turbo.json / nx.json / lerna.json）。
- JSON 含 file_count、languages、key_config_files、top_extensions、largest_files、directory_structure。

## 示例

把脚本输出填入上手文档模板（关键骨架）：

```markdown
# [项目名]
> 一句话：做什么、给谁用、当前状态。

## 快速开始
### 前置依赖（表格：工具 | 版本 | 安装方式）
### 5 分钟 setup
git clone ...; cd repo; <安装>; docker compose up -d; cp .env.example .env; <迁移/seed>; <dev>; <test>
### 验证可用
- [ ] 应用在 localhost 加载
- [ ] 健康检查返回 ok
- [ ] 测试通过

## 架构（系统总览图 + 技术栈表：层 | 技术 | 为什么选它）
## 关键文件（路径 | 用途）
## 常见开发任务（新增 API / 跑 DB 迁移 / 加后台任务）
## 调试指南（常见错误 / 实用 SQL / 日志位置）
## 贡献规范（分支策略 / PR 要求 / 提交约定 feat|fix|docs）
## 分受众说明（初级 / 资深 / 外包）
```

导出到 Notion（用官方 SDK，把 Markdown 转 blocks）：

```javascript
const { Client } = require('@notionhq/client')
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const blocks = markdownToNotionBlocks(onboardingMarkdown) // 用 notion-to-md
await notion.pages.create({
  parent: { page_id: ONBOARDING_PARENT_PAGE_ID },
  properties: { title: { title: [{ text: { content: 'Engineer Onboarding — MyApp' } }] } },
  children: blocks,
})
```

## 注意事项

- setup 尽量控制在 10 分钟内，每个安装阶段后给可执行的验证检查。
- 文档要记录关键架构决策的「为什么」，并在改行为的同一个 PR 里更新文档，防止漂移。
- 不在干净环境验证就写下的命令几乎一定有坑；遗漏排错/验证步骤是最常见缺陷。
- 把上手文档当成持续运营资产，而非一次性交付物。
- 别把架构深挖混进面向外包的文档；受众分层是质量关键。

## 互见

- code-reviewer：上手后做代码质量与正确性评审。
- dependency-auditor：核查依赖与许可证风险。

---
本条采编自 alirezarezvani/claude-skills（MIT）。
