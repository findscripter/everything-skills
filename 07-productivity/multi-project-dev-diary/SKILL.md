---
name: multi-project-dev-diary
title: 开发日记系统：多项目上下文自动记录器
description: 当想总结进度、写每日开发日志、做日终复盘并把多项目日记隔离归档再融合同步到 Notion/Obsidian 时使用；做先在各项目本地按日归档、再用脚本抽取全局/本项目素材、AI 融合写入全局日记并同步，全程不污染、不跨项目串台；不适用于实时事件监听、单文件随手记或正式对外报告；触发词：开发日记、dev log、每日复盘、进度总结、多项目日记、同步 Notion Obsidian
domain: 协作/knowledge
triggers: [开发日记, dev log, devlog, 每日复盘, 日终复盘, 进度总结, 多项目日记, diary, 全局日记, 同步 Notion, 同步 Obsidian, 经验沉淀]
tags: [diary, dev-log, multi-project, context-firewall, notion, obsidian, daily-review]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, git, notion, obsidian]
requires: []
related: [decision-log-recorder, activity-digest-generator, obsidian-bases-builder, technical-change-tracker]
combines_with: [obsidian-clipper-templates, status-report-generator]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 开发日记系统：多项目上下文自动记录器

## 何时使用

当你在某个项目目录里完成一段工作，想**总结进度 / 写每日开发日志 / 做日终复盘**，并且要把**多个项目的日记彼此隔离**、再融合成一份全局日记同步到 Notion/Obsidian 时使用。

核心价值是「上下文防火墙」：每个项目的本地日记只记本项目，互不串台；全局日记再按项目分区融合，便于跨项目回顾与经验沉淀。

**不该用的边界**：

- **实时事件监听**（等推送、长驻订阅）——那是事件流消费，不是周期性日记。
- **单文件随手记 / 临时便签**——本系统是结构化、按日按项目归档的流程，杀鸡用牛刀。
- **正式对外报告 / 复盘文档**——本系统产出的是开发流水与经验沉淀，不是带根因分析的对外口径。
- **缺少配套脚本**（`prepare_context.py` / `fetch_diaries.py` / `master_diary_sync.py`）或未配 Notion/Obsidian 时——只能退化为「仅写本地日记」。

## 步骤

> **原子工作流（最高优先级）**：步骤 1-4 是**不可分割的一气呵成流程**。Agent 必须用**连续工具调用**完成，**严禁**在第 1/2/3 步后输出闲聊文字并停下来等用户。只有遇到技术错误卡住时才显式告知用户。
>
> 执行配套 python 脚本（步骤 1.5、2、4-Action1）时，把工具设为 **`SafeToAutoRun: true`**，避免卡在授权等待。下文 `{diary_system_path}` 指日记系统根目录。

**步骤 1 · 本地项目归档（AI 生成）**

- **Action 0（识别项目名，铁律）**：先用终端确认当前文件夹名作为项目标识，**绝不臆测项目名**。
  - Windows：`(Get-Item .).Name`
  - Linux/Mac：`pwd`
- **Action 1（写入）**：把本次对话的成果（Git 提交、文件改动、任务进度）总结后，写入**当前项目目录**的 `diary/YYYY/MM/YYYY-MM-DD-项目名.md`。
- **隔离与命名铁律**：
  - 文件名**必须**带刚识别到的项目名，**禁止**在本地用全局级文件名（如 `2026-02-23.md`）。
  - 内容只记当前项目，**绝不混入其他项目**（铁律 1：本地日记永不被全局数据污染）。
  - 已存在则**追加**更新，**绝不覆盖**原有内容。
  - 按年月自动创建子目录 `diary/YYYY/MM/`。
  - 写完**立即**调终端进入步骤 2，不要打断对话。

**步骤 1.5 · 刷新项目上下文（脚本）**

用 Action 0 拿到的项目根路径，执行脚本扫描项目状态并生成/更新 `AGENT_CONTEXT.md`：

```powershell
python {diary_system_path}/scripts/prepare_context.py "<项目根路径>"
```

`SafeToAutoRun: true`（纯读写本地文件）。完成后强制续到步骤 2，不等确认。

**步骤 2 · 抽取全局 + 本项目素材（脚本）**

传入步骤 1 刚写的**项目日记绝对路径**，脚本会并排打印「今日全局进度」与「本项目进度」：

```powershell
python {diary_system_path}/scripts/fetch_diaries.py "<步骤1项目日记的绝对路径>"
```

Agent 直接读取终端输出，准备做心智融合。

**步骤 3 · AI 智能融合 + 全局归档（AI 执行）**

基于步骤 2 打印的两份素材做**无缝融合**，写入全局日记 `{diary_system_path}/diary/YYYY/MM/YYYY-MM-DD.md`。

- **上下文防火墙（核心机制）**：
  1. **禁止串台**：读「全局进度素材」时会看到其他项目的进度，**严禁**把今天对话的成果归到属于别人项目的标题下。
  2. **主角优先**：步骤 2 中标记 `📁[本项目最新进度]` 的内容才是今天日记的主角。
- **改写规则**：
  1. **安全第一**：全局日记若**已存在**，保留原内容并追加/融合新进度，**不覆盖**。
  2. **精准分区**：确保本项目有专属的 `### 📁 项目名` 区块，不混入别的项目区。
  3. **经验去重**：经验类条目合并去重，每条都挂上行动项。
  4. **清理临时文件**：写完后**必须**强制删除为规避编码问题而建的临时文件（如 `temp_diary.txt`、`fetched_diary.txt`），保持工作区干净。

**步骤 4 · 云同步 + 经验提取（脚本 + 人工确认）**

- **Action 1（同步）**：调主脚本把全局日记推送到 Notion 与 Obsidian：
  ```powershell
  python {diary_system_path}/scripts/master_diary_sync.py --sync-only
  ```
- **Action 2（提取 + 强制暂停）**：
  1. 从全局日记里提取「改进与学习」。
  2. 判断是否含过去缺失的全新要点（📌 新规则）或更优做法（🔄 进化规则）。
  3. 列出结果并**等待用户确认**（用户说「执行 / 同意」）。
  4. 确认后再更新 `{知识库路径}/` 下的 `.md`，并执行 `qmd embed`（若适用）。

## 指令

写作准则（给 AI）：

- **动态替换**：模板里的 `{项目名}` 严格用步骤 1 抓到的文件夹名。
- **精简去重**：步骤 3 写全局日记时，把本地「🛠️ 执行细节」浓缩——全局日记只关注「总体方向与产出结果」。
- **强制复选框**：所有「下一步 / 行动项」用 `- [ ]` 格式，便于在 Obsidian/Notion 勾选。

验收标准：① 本地项目日记已生成（无污染）；② `fetch_diaries.py` 用绝对路径调用并成功打印素材；③ AI 完成高质量改写并精准写入全局日记（已存在则追加成功）；④ `--sync-only` 成功推送到 Notion + Obsidian；⑤ 经验提取已呈现给用户并获授权。

## 示例

**模板 1 · 项目本地日记（步骤 1 专用）**

```markdown
# Project DevLog: {项目名}
* **📅 日期**: YYYY-MM-DD
* **🏷️ 标签**: `#Project` `#DevLog`

---

> 🎯 **进度摘要**
> （一句话核心任务，如「完成 auto-video-editor 的 Colab 环境测试」）

### 🛠️ 执行细节与改动
* **Git Commits**:（如有则列出）
* **核心文件改动**:
  * 📄 `path/filename`: 改动说明
* **技术实现**:
  *（关键逻辑或架构结构变化）

### 🚨 排障
> 🐛 **遇到的问题**:（如 API 报错、包冲突）
> 💡 **解决方案**:（最终修复，留下关键命令）

### ⏭️ 下一步
- [ ] （具体任务 1）
- [ ] （具体任务 2）
```

**模板 2 · 全局日记（步骤 3 专用）**

```markdown
# 📔 YYYY-MM-DD 全局进度总览

> 🌟 **当日亮点**
> （1-2 句由 AI 综合的当日全项目进度）

---

## 📁 项目追踪
（⚠️ 规则：文件已存在则找到对应项目标题后追加；绝不覆盖，保持整洁。）

### 🔵 {项目 A}
* **今日进度**:（把步骤 2 本地素材浓缩为要点）
* **行动项**:（提取下一步）

---

## 🧠 改进与学习
📌 **新规则 / 新发现**（如发现隐藏 API 限制、更高效语法）
🔄 **优化与反思**（相较过往方法的改进）

---

## ✅ 全局行动项
- [ ] （与具体项目无关的任务）
- [ ] （系统环境维护等）
```

## 注意事项

- **三条铁律不可破**：① 本地日记永不被全局数据污染（只记本项目）；② 跑预定脚本时设 `SafeToAutoRun: true`，避免卡授权；③ 动手前先用终端确认目录名作项目标识，**绝不臆测项目名**。
- **一气呵成**：步骤 1-4 是原子流程，中途禁止停下闲聊或问「要继续吗」——只有技术错误卡住才告知用户。
- **安全第一**：本地与全局日记都用**追加/融合**，绝不覆盖既有内容。
- **防串台**：全局融合时严禁把今日成果误归到他人项目标题下；以 `📁[本项目最新进度]` 标记的内容为主角。
- **清理临时文件**：融合后强制删除 `temp_diary.txt` / `fetched_diary.txt` 等临时件，规避编码问题、保持工作区干净。
- **依赖前提**：需配套 `prepare_context.py` / `fetch_diaries.py` / `master_diary_sync.py` 脚本，以及 Notion/Obsidian 接入；缺失时退化为仅写本地日记。
- 本条采编自 sickn33/antigravity-awesome-skills（MIT），保留其三条铁律、四步原子工作流、上下文防火墙机制、两套 Markdown 模板与三处脚本命令等关键约束。

## 互见

- **requires**：配套脚本（`prepare_context.py`/`fetch_diaries.py`/`master_diary_sync.py`）与 Notion/Obsidian 接入——否则只能写本地日记。
- **related**：`decision-log-recorder`（两层记忆的决策日志，与本系统本地/全局双层归档同构）、`codebase-onboarding-doc`（生成项目上手文档，可作为 `AGENT_CONTEXT.md` 的内容来源）。
- **combines_with**：`technical-change-tracker` —— 把会话交接/技术变更喂给本系统作为日记素材；`changelog-generator` —— 从日记沉淀的 Git 改动自动生成对外变更日志。
