---
name: skill-creator
title: 技能创建与迭代（Skill Creator）
description: 当需要为 AI Agent 从零创建一条新技能、改写优化既有技能、用评测对比验证效果、或调优 description 触发率时使用；做技能起草+评测+迭代+打包的全流程产物；不适用于只想直接执行某任务而非沉淀可复用技能、或仅微调一句提示词；触发词：创建技能、写 skill、SKILL.md、技能评测、eval、benchmark、优化 description、触发率、打包 skill、skill creator、make a skill
domain: 智能/agents
triggers: [创建技能, 写 skill, SKILL.md, 技能评测, eval, benchmark, 优化 description, 触发率, 打包 skill, skill creator, make a skill]
tags: [skill, authoring, eval, benchmark, agents, meta]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, claude-cli]
requires: []
related: [skill-optimizer, agent-tool-builder, self-improving-memory-agent, prompt-template-designer]
combines_with: [llm-judge-evaluation, mcp-builder, ai-native-cli-design]
license: Apache-2.0
source: anthropics/skills
source_license: Apache-2.0
---
## 何时使用

把一段**会反复执行的工作流**沉淀成可被 Agent 自动发现并复用的技能（SKILL.md + 可选 scripts/references/assets），并以「起草 → 评测 → 评审 → 改进 → 重复」的闭环迭代到稳定时使用。也用于：改写/精简既有技能、用评测对比量化效果、调优 `description` 提升触发准确率、打包成 `.skill`。

先判断用户处在闭环的哪一步，再切入：可能只有想法（帮其澄清意图、起草、写测试、评测、迭代），也可能已有草稿（直接进评测/迭代环节）。用户若说「不用跑一堆评测，先随便弄弄」，就跳过量化评测走轻量路径。

**不该用**：
- 用户只想**直接完成某个任务**，而非沉淀技能（直接做，别建技能）。
- 仅改 1～2 个词的提示词微调（用 `prompt-template-designer`）。
- 要封装的是**接三方系统的 MCP server**（用 `mcp-builder`）。
- 技能意图含恶意（误导、未授权访问、数据外泄、植入 exploit）——一律拒绝；「扮演某角色」类无害需求可以做。

## 步骤 / 指令

```
A. 起草技能
  1. 捕获意图：先翻当前对话——若用户说「把这个流程变成技能」，从历史里抽取
     用到的工具、步骤顺序、用户的纠正、观察到的输入/输出格式，缺口让用户补齐后再继续。
  2. 问清四件事：技能让 Agent 做什么 / 何时触发(用户会怎么说) / 期望输出格式 /
     是否需要测试用例(有客观可验证产物的技能建议要；写作、美术等主观产物常不需要)。
  3. 写 SKILL.md：
     - name：唯一标识
     - description：触发的唯一机制。同时写「做什么」+「具体何时用」，所有「何时用」
       信息都放这里。Claude 倾向「欠触发」(该用没用)——所以描述要稍微"强势"一点，
       把用户可能的多种说法都写进去，必要时点明"即使没明说 X 也要用本技能"。
     - 正文：祈使句；解释每一步"为什么重要"，少用全大写的 ALWAYS/NEVER 和死板结构。

B. 跑评测（有客观产物时）
  4. 写 2~3 条真实用户口吻的测试 prompt，存到 evals/evals.json（先只写 prompt，断言后补）。
  5. 同一轮内同时发起 with_skill 和 baseline 两路运行(别先跑完一路再补另一路)：
     - 新建技能：baseline = 完全不带技能，同一 prompt。
     - 改进既有技能：先 cp -r 快照旧版本，baseline 指向快照。
     结果放 <skill-name>-workspace/iteration-<N>/eval-<id>/{with_skill,without_skill}/outputs/。
  6. 等待期间补「断言」：客观可验证、命名清晰；主观技能别硬塞断言。任务完成回调里
     立刻把 total_tokens / duration_ms 存进 timing.json(只有这一次机会，别处不留存)。
  7. 评分 + 汇总 + 起查看器：
     - 评分写 grading.json，字段严格用 text / passed / evidence（查看器依赖这三个名字）。
     - python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>
     - python eval-viewer/generate_review.py <workspace>/iteration-N --skill-name "<name>" \
         --benchmark <...>/benchmark.json   (第 2 轮起加 --previous-workspace 指上一轮)
       无显示环境(Cowork/headless)：加 --static <out.html> 产出独立 HTML，别手写 HTML。
  8. 用户在浏览器评审 → 读 feedback.json → 只针对有具体抱怨的用例改。改完进 iteration-<N+1> 重跑。
     直到用户满意 / 反馈全空 / 不再有实质进展。

C. 优化 description 触发率（可选，技能稳定后再做，依赖 claude CLI）
  9. 造 20 条评测 query：8~10 条 should_trigger + 8~10 条 should-NOT-trigger。负例要"近似难例"
     (共享关键词但实际需要别的技能)，别用一眼无关的(那测不出东西)。query 要具体带细节(文件名、列名、
     公司名、口语/typo)。注意：过于简单的一步任务(如"读这个PDF")本就不触发技能，不是好测试。
  10. python -m scripts.run_loop --eval-set <trigger-eval.json> --skill-path <skill> \
        --model <当前会话的模型ID> --max-iterations 5 --verbose
      它按 60/40 切训练/留出集，每 query 跑 3 次取触发率，迭代提案改进，按"留出集"分挑最优(防过拟合)，
      输出 best_description → 写回 frontmatter，给用户看 before/after 和分数。

D. 打包（仅当有 present_files 工具时）
  11. python -m scripts.package_skill <path/to/skill-folder> → 把生成的 .skill 路径给用户安装。
```

**技能结构与渐进式加载（核心约束）**：

```
skill-name/
├── SKILL.md            必需：YAML frontmatter(name+description 必填) + Markdown 指令
└── 可选 bundled 资源：
    ├── scripts/        确定性/重复任务的可执行脚本(无需载入上下文即可运行)
    ├── references/     按需读入上下文的文档
    └── assets/         产出用到的模板/图标/字体
```

三级加载：1) 元数据(name+description，恒在上下文，约100词) 2) SKILL.md 正文(触发时载入，<500行为宜) 3) bundled 资源(按需，脚本可不载入直接执行)。SKILL.md 接近 500 行时，拆出一层 references 并在正文清晰指明"何时去读哪个文件"；多框架/多领域时按变体拆 `references/<variant>.md`，让模型只读相关那份。

## 示例

`description` 写法对比（"欠触发"是默认失败模式，描述要稍强势、覆盖多种说法）：

```
弱：How to build a simple fast dashboard to display internal data.
强：How to build a simple fast dashboard to display internal data. Make sure to use
   this skill whenever the user mentions dashboards, data visualization, internal
   metrics, or wants to display any kind of company data, even if they don't
   explicitly ask for a 'dashboard.'
```

正文里定义固定输出格式与示例的写法：

```markdown
## Report structure
ALWAYS use this exact template:
# [Title]
## Executive summary
## Key findings

## Commit message format
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication
```

evals.json 最小骨架（断言后补）：

```json
{ "skill_name": "example-skill",
  "evals": [ { "id": 1, "prompt": "用户的任务 prompt", "expected_output": "期望结果描述", "files": [] } ] }
```

## 注意事项

- **description 是触发的唯一机制**：必含负边界(降误召)+触发词(提召回)；Claude 只为"自己不易一步搞定"的复杂任务才查阅技能，简单一步任务(读个文件)不触发属正常，别拿它当测试用例。
- **从反馈泛化，别过拟合**：你和用户只在少数例子上反复迭代是为了快，但技能要被用千万次。遇到顽固问题，宁可换隐喻/换工作模式，也别堆死板的 MUST 或只对这几个例子有效的补丁。
- **解释"为什么"**：今天的模型很聪明，给清楚理由比堆 ALLCAPS 的 ALWAYS/NEVER 更有效；写出全大写硬约束时就该警觉，改成解释动机。
- **读 transcript 不只读产物**：若多个测试用例的子 agent 都各自写了相似的 create_docx.py / build_chart.py，强信号——把脚本写一次放 scripts/ 让技能调用，省掉每次重造轮子；技能让模型空跑的部分要删。
- **timing 数据只此一次**：total_tokens / duration_ms 仅在任务完成回调里出现，当场存 timing.json，错过不可恢复。
- **字段名严格**：grading.json 用 text/passed/evidence；benchmark 的 configuration 必须是 "with_skill"/"without_skill"、result 嵌套放 pass_rate(别放顶层)——查看器按精确字段名读，写错就显示空/零。
- **改既有技能保持原名**：目录名与 frontmatter `name` 不变(research-helper 仍输出 research-helper.skill，不是 -v2)；安装路径可能只读，先 cp 到可写位置再改再打包。
- **Claude.ai / Cowork 适配**：Claude.ai 无子 agent——逐个读 SKILL.md 自己执行、跳过 baseline 与量化 benchmark、跳过 description 优化(需 claude CLI)；Cowork 有子 agent 但无浏览器，查看器用 `--static`，且务必在自评前先生成查看器把样例摆到人面前。
- **本条来源 anthropics/skills（Apache-2.0）**，已按本仓库 SCHEMA 适配重写而非逐字翻译。

## 互见

- related：`mcp-builder` —— 若要封装的是「接三方系统的 MCP 工具/server」而非通用技能，用它；`prompt-template-designer` —— 技能正文里的提示词段落，可用它打磨成稳定模板。
- combines_with：`fact-checking` —— 写 description、断言或 reference 文档时，对引入的硬事实/外部声明先核验再写入，避免技能固化错误信息。
