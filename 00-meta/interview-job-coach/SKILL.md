---
name: interview-job-coach
title: 求职面试全流程辅导
description: 当用户启动求职、备战某场面试、复盘面试录音或谈薪/处理薪资问题时使用；做 JD 拆解、简历与 LinkedIn 优化、模拟面试、面试逐字稿打分与谈薪话术的一体化产出，并以持久状态文件跨会话续接；不适用于一次性问答题库、岗位投递/简历自动生成（用 resume-builder）或真实代笔回答。触发词：求职辅导、模拟面试、面试复盘、谈薪、JD 拆解、storybank
domain: 通用/learning
triggers: [求职辅导, 模拟面试, 面试复盘, 谈薪, 薪资期望, JD 拆解, 面试逐字稿分析, storybank, STAR 故事, kickoff 启动求职]
tags: [interview, job-search, coaching, career, storybank, negotiation]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude]
requires: []
related: [advisor-fit-analyzer]
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
一套覆盖求职全周期的持久化、自适应辅导系统。它不是题库，而是一套有主张的系统：跟踪你的作答模式、给答案打分，并随使用次数增多而愈发精准。状态写入 `coaching_state.md`，跨会话保存，保证每次都能从上次中断处续接。

## 何时使用

- 启动一次求职，需要一套结构化的推进系统
- 备战某场具体面试（公司调研、模拟面试、临场打气）
- 想复盘一份过往面试逐字稿（来自 Otter/Zoom/Grain 等）
- 在谈 offer 或招聘官初筛中应对薪资类问题
- 构建与维护一个可直接用于面试的故事库（storybank）

不该用的边界：
- 只想要一次性问答、静态面试题库时——本系统是有状态、会迭代的辅导，过于重
- 需要从头自动生成/排版一份简历时，改用 `resume-builder`
- 需要替你「代笔」真实回答以蒙混面试官时——本系统只辅导，不造假

## 步骤

1. 安装并启动：执行 `npx skills add dbhat93/job-search-os`，然后 `/coach` → `kickoff`，提供简历、目标岗位与时间线，生成画像与优先级行动计划。
2. 针对性备战：`/coach` → `prep <公司> <岗位>`（如 `prep Stripe Senior PM`），产出公司调研、岗位定制 prep brief 与定制化模拟题。
3. 模拟面试：支持行为面、系统设计、案例面、群面、技术面等格式，按五个维度给答案打分。
4. 逐字稿复盘：`/coach` → `analyze`，粘贴 Otter/Zoom 等原始逐字稿，自动识别格式、逐题五维打分，给出针对薄弱点的专项训练计划（drill plan）。
5. 薪资与谈判：`/coach` → `salary`，演练「你的薪资期望是多少？」等时刻，给出可辩护的区间与精确话术；offer 阶段做 offer 分析与谈判脚本。
6. 故事库：沉淀 STAR 故事并提炼「赢得的洞见」，做检索演练与组合优化。

全周期共 23 条命令。状态持久化在 `coaching_state.md`。

## 指令

- `npx skills add dbhat93/job-search-os` — 安装
- `/coach` → `kickoff` — 启动求职，建画像与行动计划
- `/coach` → `prep <公司> <岗位>` — 针对某公司岗位备战
- `/coach` → `analyze` — 粘贴逐字稿，自动识别格式并打分
- `/coach` → `salary` — 薪资问题与谈判辅导

## 示例

示例 1（启动求职）：

```
/coach
kickoff
```

辅导系统索要简历、目标岗位与时间线，随后建立画像并给出优先级行动计划。

示例 2（针对某公司备战）：

```
/coach
prep Stripe Senior PM
```

跑公司调研、生成岗位定制 prep brief，并按 Stripe 流程排好定制化模拟题。

示例 3（复盘逐字稿）：

```
/coach
analyze
```

粘贴来自 Otter、Zoom 或任意工具的原始逐字稿；系统自动识别格式、对每道题做五维打分，并给出针对你具体短板的训练计划。

示例 4（应对薪资问题）：

```
/coach
salary
```

带你演练招聘官初筛「你的薪资期望是多少？」这一刻，给出可辩护区间与精确话术。

## 注意事项

- 仅在任务明确落在上述范围内时使用本系统。
- 输出不能替代针对具体环境的验证、测试或专家评审；所有调研结论与谈薪区间需自行核实。
- 若关键输入、权限、安全边界或成功标准缺失，应停下来澄清后再继续。
- 状态文件 `coaching_state.md` 是续接关键，跨会话请勿随意删除。

## 互见

- `resume-builder`：从背景材料一次性生成专业中文简历（HTML + DOCX），偏「产出物」，与本系统的「辅导/复盘」互补。

---

采编自 sickn33/antigravity-awesome-skills（源项目 dbhat93/job-search-os，MIT 许可）。
