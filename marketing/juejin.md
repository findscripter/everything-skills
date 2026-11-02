# 掘金实操文章

编辑说明：待审稿。站点和案例页需先通过[发布检查](README.md#发布前检查)。本文展示的检索结果在 2026-11-02 本地运行过；没有把它写成技能执行效果或安装成功证据。

## 标题

用 Claude Code / Codex 接手陌生仓库：从任务检索到选择 Skill

## 正文

接手一个陌生仓库时，首先需要弄清入口、模块边界、运行方式和测试位置。要选择帮助完成这件事的 Skill，可以从“代码库导览”这个任务词开始。

[Everything Skills](https://github.com/findscripter/everything-skills) 把技能正文、关系图和外部仓库目录放在同一个项目中。下面走一遍“找候选 → 看关系 → 选择使用方式”的路径。

### 1. 从任务词得到候选

可以打开[检索站](https://findscripter.github.io/everything-skills/)，或克隆项目后用本地 CLI。CLI 需要 Node.js 22 或以上：

```bash
git clone https://github.com/findscripter/everything-skills.git
cd everything-skills
npm run skill -- search "代码库导览" --limit 3
```

2026-11-02 快照下，前三个候选是：

```text
codebase-onboarding-doc    代码库上手文档生成
codetour-authoring         CodeTour 代码导览编写
docs-architect            代码库综合技术文档生成
```

这三个结果解决的问题不同：上手手册、逐文件讲解、综合文档。先看候选的 `description`，把它的适用范围与手头任务对齐，再读完整 `SKILL.md`。

### 2. 沿关系补充需要的能力

查看上手文档技能的邻居：

```bash
npm run skill -- why codebase-onboarding-doc
```

输出区分关系方向和类型。例如，当前条目声明了与 `docs-architect`、`readme-doc-writer`、`adr-writer` 的关联，也声明了可与 `docs-architect`、`developer-experience-optimizer` 组合。

- `requires`：声明的技能依赖。
- `related`：值得继续查阅的相关技能。
- `combines_with`：声明的可组合技能。

这些边帮助选择下一步，没有证明每种组合都经过端到端执行。普通仓库交接可以先产出上手文档；如果还需记录架构决策，再判断是否补充 ADR。

### 3. 在工具里按需使用

Claude Code 可以按卷安装。先添加 marketplace，再选择所需卷：

```text
/plugin marketplace add findscripter/everything-skills
/plugin install 07-productivity@everything-skills
```

`codebase-onboarding-doc` 位于协作卷 `07-productivity`。需要研发卷时再安装 `02-engineering`，无需为了本次任务把 11 卷全部装上。

Codex 用户可以把克隆的技能库放在可读取的工作区，让它先阅读技能库的 `AGENTS.md`，再打开选中的技能文件。初次演示可以限定为项目提供的原创小型仓库：

```text
先读 Everything Skills 的 AGENTS.md，以及 codebase-onboarding-doc、
monorepo-navigator 的 SKILL.md。
本次只演示 examples/repository-onboarding/input/mini-repo 原创 fixture，
参考技能中相关的方法，不声称完整执行技能的全部 helper。
不要调用未随包提供的 codebase_analyzer.py 或 monorepo_analyzer.py。
检查本例自有的 examples/repository-onboarding/reproduce.mjs，
从技能库根目录运行它，核对固定 fixture 的事实、测试和 CLI 结果。
据此整理新人上手文档：入口、模块、依赖关系、运行和测试命令；
每条事实给出输入文件依据，缺少的信息标为待确认。
本例约定之外若仍缺必需工具或输入，停止并报告，不自行绕过。
```

换成真实项目时，先核对技能明确要求的工具和 helper；缺少必需依赖应停止并报告。本例的 Node checker 只检查固定 fixture，不能直接充当真实项目的通用分析器。这条路径使用仓库文件和 Agent 的读取能力；Claude Code 的 marketplace 命令不应直接当作 Codex 安装命令。

### 4. 用可检查的产物判断是否有用

预期交付是一份带文件依据的上手文档。检查时至少核对入口是否存在、运行命令是否来自项目、未知信息是否明确列出。单看 Agent 生成的文字长度，无法判断结果是否可靠。

项目的 [examples](https://github.com/findscripter/everything-skills/blob/main/examples/README.md) 提供可跟随的示例说明。仓库上手案例用原创小型项目作为输入，并把上手文档、依赖关系和检查脚本放在一起。克隆后可以运行：

```bash
node scripts/check-examples.mjs
```

这条命令复核案例中的具体事实和小型程序结果，不会通过 LLM 重新生成说明文档，也不验证 Claude Code / Codex 的安装。重跑时以示例写明的环境、输入和验收方式为准。

### 数量与边界

2026-11-02 的固定版本快照包含 1,114 份库内 `SKILL.md`（其中 21 份标为 deprecated）、11 个卷插件，以及 3,273 条外部仓库目录记录。外部目录记录与库内技能是两个口径，不能相加。详细来源见[统计快照](https://github.com/findscripter/everything-skills/blob/main/marketing/snapshot-2026-11-02.json)。

项目提供来源、许可声明、依赖及审阅状态等信息。未知或未审阅字段有明确含义；检索命中和结构检查不代表技能在你的环境中已经运行通过。

仓库：[findscripter/everything-skills](https://github.com/findscripter/everything-skills)。遇到搜索缺口时，提交“任务词、候选结果、预期技能”的 [Issue](https://github.com/findscripter/everything-skills/issues)，便于复现和改进。
