---
name: notebooklm-source-grounded-qa
title: NotebookLM 源锚定问答
description: 当需要从你已上传到 Google NotebookLM 的文档中拿「只基于这些源、不靠模型常识」的可溯源答案时使用；做的是驱动浏览器自动化登录并按笔记本提问、解析答案并按需追问直至信息齐全；不适用于开放网络检索、未上传到 NotebookLM 的资料、或拒绝可见浏览器手动登录的场景。触发词：NotebookLM、问我的笔记本、查我的文档、source-grounded、notebooklm.google.com
domain: 通用/research
triggers: [NotebookLM, 问我的笔记本, 查我的文档, ask my NotebookLM, 查询笔记本, source-grounded 问答, notebooklm.google.com/notebook, 把文档加进 NotebookLM]
tags: [NotebookLM, 源锚定, RAG, 文档问答, 浏览器自动化, Gemini, 研究, 可溯源]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, patchright, chromium, Bash]
requires: []
related: [fact-checking, citation-management, entity-research-dossier]
combines_with: [fact-checking, citation-management]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你需要从**已上传到 Google NotebookLM 的文档**里拿到「只基于这些源、Gemini 不掺自己常识」的可溯源答案时使用。典型触发：

- 用户提到 NotebookLM，或贴出 `https://notebooklm.google.com/notebook/...` 链接。
- 用户说「问我的笔记本 / 查我的文档 / 在我那个 notebook 里查一下」。
- 用户想把某份文档登记进笔记本库以便后续问答。

核心特点：每次提问 = 开一个全新浏览器会话 → 仅从指定笔记本检索 → 取答案 → 关闭。无会话持久化，每个问题相互独立，因此**每问都要自带上下文**。

**不该用于：**
- 开放网络检索、需要模型常识或最新外部信息的问题 —— 用联网搜索类技能，NotebookLM 只读你给它的源。
- 资料尚未上传到 NotebookLM —— 上传是手动前置动作，本技能不替你把任意文件灌进去。
- 无法弹出可见浏览器手动完成 Google 登录的环境（纯 headless 服务器无人值守首次鉴权会卡住）。
- 免费账号已触及 50 次/天 限额时，应等待或换号，而非反复重试。

## 步骤

所有脚本**必须经 `run.py` 包装器调用**，它会自动建 `.venv`、装依赖、装 Chromium、激活环境再执行。直接调脚本会因缺 venv 报 `ModuleNotFoundError`。

```
1. 查鉴权状态
   python scripts/run.py auth_manager.py status
   未鉴权 → 进 2；已鉴权 → 进 3。

2. 一次性鉴权（浏览器可见，用户手动登录 Google）
   python scripts/run.py auth_manager.py setup
   先告知用户：「会弹出一个浏览器窗口，请手动登录 Google」。窗口可见是硬要求。

3. 管理笔记本库
   列出：   python scripts/run.py notebook_manager.py list
   设激活： python scripts/run.py notebook_manager.py activate --id <ID>
   登记新笔记本见下方「智能登记」。

4. 提问（不带 id 用激活笔记本）
   python scripts/run.py ask_question.py --question "带完整上下文的问题"
   指定笔记本：--notebook-id <ID> 或 --notebook-url "https://..."
   调试看过程：--show-browser

5. 处理追问信号（关键）
   每条答案结尾会出现 "Is that ALL you need to know?"。
   STOP → 比对答案与原始诉求 → 若有缺口，立刻再发一次带上下文的 ask_question
   → 重复直至信息齐全 → 综合所有答案再回复用户。不要停在第一条答案。
```

**智能登记笔记本（缺细节时首选，禁止瞎猜描述）：**

```bash
# 先问笔记本「你装了什么」，再据答案登记
python scripts/run.py ask_question.py --question "What is the content of this notebook? What topics are covered? Provide a complete overview briefly and concisely" --notebook-url "[URL]"

python scripts/run.py notebook_manager.py add --url "[URL]" --name "[据内容]" --description "[据内容]" --topics "[据内容]"
```

`add` 的 `--description` 与 `--topics` **必填**；细节不全时用上面的智能登记去发现，绝不用通用占位描述。

## 指令

脚本速查（一律前缀 `python scripts/run.py`）：

| 脚本 | 用途 |
|---|---|
| `auth_manager.py status\|setup\|reauth\|clear` | 鉴权：查状态 / 首次设置 / 重新鉴权 / 清除（setup、reauth 浏览器可见）|
| `notebook_manager.py list\|add\|search\|activate\|remove\|stats` | 笔记本库管理 |
| `ask_question.py --question "..."` | 提问；可选 `--notebook-id` / `--notebook-url` / `--show-browser` |
| `cleanup_manager.py` | 数据清理；`--confirm` 执行、`--preserve-library` 保留笔记本 |

数据落盘在 `~/.claude/skills/notebooklm/data/`：`library.json`（笔记本元数据）、`auth_info.json`（鉴权状态）、`browser_state/`（cookie/会话），已被 `.gitignore` 保护，**严禁提交 git**。

可选 `.env`：`HEADLESS` / `SHOW_BROWSER`（浏览器可见性）、`STEALTH_ENABLED`（拟人行为）、`TYPING_WPM_MIN/MAX`（打字速度）、`DEFAULT_NOTEBOOK_ID`。

自动建环境失败时的手动兜底：

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m patchright install chromium
```

## 示例

最小问答流程：

```bash
# 1. 确认已登录
python scripts/run.py auth_manager.py status
# 2. 选好笔记本
python scripts/run.py notebook_manager.py list
python scripts/run.py notebook_manager.py activate --id my-arch-docs
# 3. 带上下文提问
python scripts/run.py ask_question.py --question "在我们的架构文档里，订单服务用的是哪种数据库？为什么这样选？"
# 4. 看到 "Is that ALL you need to know?" → 发现没覆盖「分库分表策略」→ 追问
python scripts/run.py ask_question.py --question "承上：架构文档对订单库的分库分表/扩容策略是怎么写的？"
# 5. 综合两段答案再回复用户
```

排障：

| 现象 | 处理 |
|---|---|
| `ModuleNotFoundError` | 改用 `run.py` 包装器 |
| 鉴权失败 | setup 时浏览器必须可见；问答可加 `--show-browser` |
| 触及限额（50/天）| 等待或换 Google 账号 |
| 浏览器崩溃 | `python scripts/run.py cleanup_manager.py --preserve-library` |
| 找不到笔记本 | 先 `notebook_manager.py list` 核对 ID |

## 注意事项

- **每问自带上下文**：无会话记忆，追问要把前情写进问题里，否则 NotebookLM 不知道「承上」。
- **不要停在第一条答案**：把结尾的 "Is that ALL you need to know?" 当作强制自检信号，逐项比对原始诉求，有缺口就继续追问，最后综合再回复。
- **登记描述必须真实**：`--description` / `--topics` 缺失时走智能登记去发现，禁止用「文档集合」之类通用占位。
- **首次鉴权要人在场**：浏览器必须可见、用户手动登录 Google；无人值守环境会卡住。
- **限额与开销**：免费账号 50 次/天；每问要起一个浏览器，单问有数秒级开销，别做高频循环。
- **答案边界**：结果只来自该笔记本的源，源里没有就答不出，别让模型用常识补全后当成文档结论。
- **隐私**：`data/` 含 cookie 与会话态，绝不入库、不外传。

## 互见

- related：`fact-checking` —— 对源锚定答案做二次查证，区分「文档原文」与可能的解读偏差。
- combines_with：`entity-research-dossier` —— 把笔记本里的内部资料作为调研档案的一类一手信源接入。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证），原技能 `notebooklm`。本条为适配中文「技能大典」的重写版，保留其 `run.py` 强制包装、可见浏览器鉴权、智能登记、追问机制（"Is that ALL you need to know?"）、50/天限额与每问独立等关键约束。
