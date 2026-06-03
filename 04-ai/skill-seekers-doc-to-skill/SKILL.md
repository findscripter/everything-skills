---
name: skill-seekers-doc-to-skill
title: 文档转技能：从网站/仓库/PDF 快速生成 AI 技能
description: 当需要把文档网站、GitHub 仓库、PDF 或视频批量转成可用的 AI 技能（SKILL.md + references）时使用；用 skill-seekers 完成抓取→增强→打包→上传/安装到 Claude 或各 Agent 全流程；不适用于手写单条精炼技能、或源缺乏结构化文档时。触发词：文档转技能、爬文档建技能、skill-seekers、批量生成技能
domain: 智能/agents
triggers: [把文档/官网/仓库转成技能, 从 PDF 或视频生成 AI 技能, skill-seekers / Skill Seekers, 批量爬取文档建知识库技能, 给某框架快速做一个 Claude skill, 把 SKILL 打包上传到 Claude]
tags: [技能工程, 文档抓取, 知识库, 自动化, Claude, 智能/misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [skill-seekers CLI, Python 3.10+, ANTHROPIC_API_KEY, GITHUB_TOKEN]
requires: []
related: [skill-creator, skill-optimizer, cross-tool-skill-manager, ai-model-knowledge-distill]
combines_with: [agent-skill-security-scanner, skill-ecosystem-auditor]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
> 适配自第三方工具 Skill Seekers（CLI 名 `skill-seekers`）。源 SKILL.md 仅为占位骨架，实质能力来自上游仓库，本条已补全真实命令与流程。

## 何时使用

适用：
- 某框架/SDK/产品有**成体系的在线文档、GitHub 仓库、PDF 手册或教学视频**，你想一次性把它变成可被 Agent 检索的技能（SKILL.md + 分类 references）。
- 需要把同一份知识**打包上传到 Claude**，或安装进 Cursor/Windsurf 等编码 Agent。
- 想用预设配置或 AI 扫描，对一个代码仓库**自动识别框架**并生成技能。

不该用（负边界）：
- 你只想**手写一条短小、精炼、强观点的技能**——直接写，本工具产出的是文档化大块知识，不是精炼操作手册。
- 源**没有结构化文档**（散落聊天记录、零散截图），抓取价值低。
- 需要**逐字翻译/合规改写**版权文档——本工具只做结构化抽取，不解决授权问题。

## 步骤

1. **安装**（Python 3.10+）：
   ```bash
   pip install skill-seekers          # 基础
   pip install skill-seekers[all]     # 全功能（含视频/多 LLM）
   skill-seekers-setup                # 可选：交互式初始化
   skill-seekers doctor               # 自检环境
   ```
2. **抓取生成**（按源类型四选一/多）：
   ```bash
   skill-seekers create https://docs.react.dev/ --name react   # 文档网站
   skill-seekers create facebook/react --include-issues        # GitHub 仓库
   skill-seekers create --pdf manual.pdf --name myskill --ocr  # PDF（扫描件加 --ocr）
   skill-seekers create --video-url <youtube> --name tut       # 视频
   skill-seekers scan ./my-app --out ./configs/ --enhance      # AI 扫描仓库识别框架
   ```
3. **增强**（可选但推荐，补示例/工作流）：
   ```bash
   skill-seekers enhance output/react/
   skill-seekers enhance output/react/ --workflow security-focus
   ```
4. **打包**为目标平台（默认 Claude）：
   ```bash
   skill-seekers package output/react/ --target claude
   # 其他：--target gemini|openai|langchain|llama-index|markdown
   skill-seekers package output/react/ --chunk-for-rag --chunk-tokens 512  # RAG 切块
   ```
5. **上传 / 安装**：
   ```bash
   export ANTHROPIC_API_KEY=sk-ant-...
   skill-seekers upload output/react.zip          # API 自动上传
   # 或手动：访问 https://claude.ai/skills 选择 zip
   skill-seekers install-agent output/react/ --agent cursor   # 装进编码 Agent
   ```

## 指令

- **一键全流程**（取配置→抓取→增强→打包→上传）：
  ```bash
  skill-seekers install --config react
  skill-seekers install --config django --no-upload
  skill-seekers install --config react --dry-run   # 先空跑看计划
  ```
- **生命周期/续跑**（大型抓取必备）：
  ```bash
  skill-seekers create <src> --resume     # 断点续抓
  skill-seekers create <src> --fresh       # 忽略缓存重抓
  skill-seekers create <src> --skip-scrape # 复用已抓数据只重建
  skill-seekers create <src> --preset quick|comprehensive
  skill-seekers resume --list              # 查看可续跑会话
  ```
- **质量/维护**：`skill-seekers quality output/react/`、`skill-seekers update output/react/`、`skill-seekers enhance-status output/react/ --watch`。
- **提速**：`--async --workers 8`（约快 2–3 倍）。

## 示例

把 Django 文档做成技能并装进 Windsurf，不上传 Claude：
```bash
skill-seekers create https://docs.django.com/ --name django --async --workers 8
skill-seekers enhance output/django/
skill-seekers package output/django/ --target claude
skill-seekers install-agent output/django/ --agent windsurf
```

产出结构：
```
output/
├── django_data/        # 原始抓取（pages/*.json + summary.json）
└── django/
    ├── SKILL.md        # 已增强，含示例
    ├── references/     # 分类文档（index.md, getting_started.md, ...）
    ├── scripts/        # 留空，供你补充
    └── assets/         # 留空
```
打包后：`output/django-claude.zip`。

## 注意事项

- **凭证**：上传 Claude 需 `ANTHROPIC_API_KEY`；抓 GitHub 强烈建议设 `GITHUB_TOKEN`——匿名仅 60 次/小时，认证后 5000 次/小时。其他平台对应 `GOOGLE_API_KEY` / `OPENAI_API_KEY`；自建端点用 `ANTHROPIC_BASE_URL`。
- **SPA 文档**走三层发现（sitemap → llms.txt → 无头渲染），动态站点也能抓但更慢。
- **视频**需 `pip install skill-seekers[video]`；扫描版 PDF 必须加 `--ocr`。
- 配置/工作流/设置分别在 `./configs/`、`~/.config/skill-seekers/workflows/`、`~/.config/skill-seekers/config.json`。
- **生成的 SKILL.md 是「文档化」而非「精炼操作化」**：自动产物偏全、偏长，入库前建议人工删冗、补强观点边界，再纳入本大典。
- 大型站点先 `--dry-run` 估算规模，必要时 `--preset quick` 试跑。

## 互见

- 手写精炼技能、定义本大典 SCHEMA：见仓库 ROADMAP 与「技能编写规范」。
- 把成品技能纳入飞书侧封装：见 `lark-skill-maker`。

---
采编自 sickn33/antigravity-awesome-skills（MIT），上游工具 Skill Seekers（yusufkaraaslan/Skill_Seekers）。
