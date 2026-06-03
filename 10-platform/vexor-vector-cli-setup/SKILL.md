---
name: vexor-vector-cli-setup
title: Vexor 向量 CLI：语义文件搜索工具配置
description: 当需要按语义（而非关键词/正则）在文件与代码库中检索内容、或为 Claude/Codex 智能体接入语义文件搜索能力时使用；用 vexor CLI 安装、配置嵌入与重排提供方、建立可复用索引并执行语义搜索，产出带相似度分数的结果与 agent skill 集成；不适用于纯字面/正则匹配（用 grep/ripgrep）、无嵌入 API Key 或本地模型时；触发词：语义搜索文件、vexor、向量检索代码、embedding 文件搜索、自然语言找文件
domain: 平台/cli
triggers: [用自然语言语义搜索本地文件或代码, 给 Claude/Codex 接入语义文件搜索 skill, 配置 vexor 的嵌入提供方和 API Key, 为代码库建立可复用的向量索引, 按含义而非关键词查找文件, 用 OpenAI/Gemini/Voyage embedding 检索文件, 离线/本地模型做语义文件搜索, vexor index search config install]
tags: [vexor, semantic-search, vector-search, embedding, cli, rag, file-search, claude-code, codex, platform]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [vexor, pip, python]
requires: []
related: [vexor-semantic-file-search, exa-semantic-search, ai-native-cli-design, embedding-model-strategies]
combines_with: [vexor-semantic-file-search, codebase-structure-protocol, rag-pipeline-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Vexor 向量 CLI：语义文件搜索工具配置

采编自 sickn33/antigravity-awesome-skills（MIT）的 vexor 技能，结合上游 scarletkc/vexor（MIT）实际命令适配重写。

Vexor 是一个**向量驱动的语义文件搜索引擎 CLI**：对文件/代码计算嵌入、建立可复用索引，用自然语言按「含义」检索，并能把搜索能力作为 skill 装进 Claude Code / Codex。

## 何时使用

- 想用自然语言（而非精确关键词/正则）在一个目录或代码库里找「讲了某件事」的文件或代码片段。
- 要给 Claude Code 或 Codex 智能体接入语义文件发现能力（自主工作流里定位相关文件）。
- 需要为代码库建立**一次构建、多次复用**的向量索引，避免每次全量扫描。

不该用（负边界）：

- 纯字面/正则匹配——直接用 `grep` / `ripgrep`，无需嵌入开销。
- 没有可用的嵌入能力时：既没有远程提供方的 API Key，又没装本地模型。此时先完成配置或改用关键词搜索。
- 桌面 App：上游标注「experimental，未积极维护」，生产场景只用 CLI。

## 步骤 / 指令

1. **安装**：`pip install vexor`（亦支持 pipx / uv；或从 GitHub releases 下载独立二进制）。本地嵌入模型需 `pip install "vexor[local]"`（GPU 用 `vexor[local-cuda]`）。
2. **配置嵌入提供方与 Key**（远程任选其一，OpenAI 为默认）：
   - `vexor config --set-provider openai|gemini|voyageai|custom|local`
   - `vexor config --set-model text-embedding-3-small`
   - `vexor config --set-api-key "YOUR_KEY"`（或用环境变量 `OPENAI_API_KEY` / `GOOGLE_GENAI_API_KEY` / `VOYAGE_API_KEY`）
   - 或一步到位：`vexor init`（交互式向导）。配置存 `~/.vexor/config.json`，索引缓存在 `~/.vexor/`。
3. **建索引（可选，搜索会按需自动建）**：`vexor index --path PATH --mode MODE`。`--mode` 控制粒度：`auto`（默认，按文件类型智能路由：Py/JS/TS 走 AST 的 `code`、Markdown 走 `outline`、其余按大小）、或显式 `name|head|brief|full|code|outline`。
4. **语义搜索**：`vexor search "QUERY" --path PATH --top K`（简写 `vexor QUERY`）。首次搜索会自动建索引。结果含相似度分数与文件预览。
5. **（推荐）配置重排**提升精度：可选 `bm25` / `flashrank` / `remote` 重排器对 Top 结果重排序；FlashRank 需 `pip install "vexor[flashrank]"`。
6. **接入智能体**：`vexor install --skills claude`（Claude Code）或 `vexor install --skills codex`（Codex）。
7. **排障**：`vexor doctor` 自检；`vexor config --show` 查看配置；`vexor update [--upgrade]` 升级。

常用 flag：`--path`（目标目录，默认当前）、`--top K`/`-k`（结果数，默认 5）、`--ext .py,.md`（按扩展名过滤）、`--include-hidden`（含隐藏文件）、`--no-cache`（仅内存搜索不落盘）、`--format porcelain`（TSV 输出，便于脚本解析）。

## 示例

```bash
# 1. 一次性配置（OpenAI 默认提供方）
vexor config --set-provider openai
vexor config --set-api-key "sk-..."

# 2. 在 src 目录按语义找“处理用户登录鉴权的代码”，取前 8 条，只看 py/ts
vexor search "user login authentication flow" --path ./src --top 8 --ext .py,.ts

# 3. 手动用 code 模式给整个仓库建可复用索引
vexor index --path . --mode code

# 4. 脚本里消费结果（TSV）
vexor "where is rate limiting configured" --format porcelain

# 5. 离线：用本地多语言模型 + GPU
vexor local --setup --model intfloat/multilingual-e5-small
vexor local --cuda

# 6. 把语义搜索装进 Claude Code
vexor install --skills claude
```

## 注意事项

- **必须先有嵌入能力**：远程提供方需配 API Key，否则搜索失败；离线场景务必先 `vexor local --setup`。
- **索引缓存键**由 path + mode + 过滤 flag 共同决定：换 `--mode` 或 `--ext` 会触发重建；清理用 `vexor config --clear-index-all`，本地模型在 `~/.vexor/models`（`vexor local --clean-up` 清理）。
- **成本与隐私**：远程提供方会把文件内容片段发往第三方做 embedding；敏感代码库优先用本地模型（`local` provider）。
- **重排是可选但强烈建议**：上游建议预先配置 Reranker 以提升准确率，尤其结果噪声多时。
- 桌面 App 不稳定且未维护，自动化一律走 CLI。

## 互见

- related：`ai-native-cli-design` —— vexor 体现了 agent 友好 CLI（`--format porcelain` 机读输出）的设计取向。
- combines_with：知识检索 / RAG 类技能 —— 语义文件搜索可作为 RAG 流水线的本地检索层。
- combines_with：Claude Code / Codex skill 接入 —— `vexor install --skills` 让智能体在自主工作流中直接定位相关文件。
