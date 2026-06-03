---
name: idea-darwin-evolution
title: 达尔文式创意进化
description: 当手头有大量零散点子、需要系统化评估筛选与跨域碰撞时使用；把每个点子当作进化岛上的物种，按回合做评分、深化、杂交、变异，产出带血缘谱系与六维打分的物种卡及进化简报；不适用于单次头脑风暴出一两个点子、或已有明确方案只待执行的场景；触发词：创意进化、点子筛选、跨域碰撞
domain: 通用/thinking
triggers: [创意进化, 点子筛选, 想法迭代, 跨域碰撞, 头脑风暴升级, idea darwin, 进化岛, 创意杂交]
tags: [思维, 创意, 迭代, 评分框架, 通用]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit]
requires: []
related: [design-brainstorming, research-idea-generator, first-principles-thinking, kaizen-continuous-improvement]
combines_with: [business-assumption-stress-test, structured-decision-framework, premortem-plan-challenger]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 手头有一大堆零散点子，想系统化评估、深化、排优先级，而非任其在收件箱里腐烂。
- 想让不同领域的点子互相碰撞，挖出意料之外的杂交方向。
- 需要的是「多回合结构化迭代」，而不是一次性头脑风暴。
- 想要一套打分框架来决定「哪个点子值得继续投入」。

不该用（负边界）：
- 只想快速产出一两个点子、不需要迭代时——直接发散即可，别套这套流程。
- 已有明确方案、只差落地执行时——这是执行问题，不是创意筛选问题。
- 输入材料、目标或成功标准缺失时——先问清再开工，不要硬跑。

## 核心模型：进化岛

把每个点子当作进化岛上活着的物种，遵循三条法则：

1. 进化（Evolution）——每回合对最有生命力的点子做结构化深化：补逻辑缺口、厘清路径、识别风险。
2. 杂交（Crossbreeding）——让不同点子授粉杂交，例如「工作里的某个技术手段」遇上「生活里的某个观察」，长出你没想过的方向。
3. 变异（Mutation）——用外部刺激（行业新闻、理论、对话）触发变异，孵化出全新物种。

每个点子对应一张物种卡，记录：核心问题、完整描述、血缘谱系（父/子 ID）、六维打分、变更历史。

### 六维打分

| 维度 | 权重 | 衡量什么 |
|---|---|---|
| 新颖度 Novelty | 10% | 真突破还是老调重弹？ |
| 可行性 Feasibility | 20% | 技术和资源上能否做到？ |
| 价值 Value | 20% | 成功后影响多大？ |
| 逻辑 Logic | 20% | 内部自洽、有无缺口？ |
| 杂交潜力 Cross Potential | 10% | 组合时能否激出新东西？ |
| 可验证性 Verifiability | 20% | 能否设计出验证路径？ |

### 生命周期

```
seed → exploring → refining → crossing → validated → dormant
（种子 → 探索 → 精炼 → 杂交 → 已验证 → 休眠）
```

关键约束：所有「生死决定」最终由用户拍板，系统只负责推荐，不替你杀点子。

## 步骤

1. 写下点子——建一个 `ideas.md`，点子写得多粗糙都行，系统负责结构化。
2. 初始化进化岛：`/idea-darwin init`
3. 开始进化：`/idea-darwin round`
4. 持续投喂——把新点子追加进 `ideas.md`，把环境变量（外部刺激）写进 `stimuli.md`。

## 指令

- `/idea-darwin init [--budget N] [--actions N]`：初始化进化岛，`--budget` 控制每回合算力预算，`--actions` 控制每回合动作数。
- `/idea-darwin round [N]`：跑 N 个进化回合（省略则跑 1 个）。
- `/idea-darwin dormant IDEA-XXXX`：让某点子休眠。
- `/idea-darwin wake IDEA-XXXX`：唤醒休眠的点子。

`ideas.md` 写法示例：

```markdown
## 会学我风格的个人知识库
想要一个系统，读完我写的一切，逐渐学会我怎么思考。

## 通勤转播客
通勤时录语音备忘，自动转成播客脚本。
```

## 示例

初始化并设定预算与动作数：

```
/idea-darwin init --budget 8 --actions 3
```

一次连跑三个回合：

```
/idea-darwin round 3
```

管理点子的死活：

```
/idea-darwin dormant IDEA-0005
/idea-darwin wake IDEA-0005
```

## 注意事项

- 初始点子越粗越好，别过度打磨——让进化去过滤，过度筛选反而扼杀杂交可能。
- 务必往 `stimuli.md` 加外部刺激，否则点子会趋同、岛上近亲繁殖。
- 认真对待每轮简报里的「待决策（Decisions Needed）」一节，别跳过。
- 定期跑「扰动回合」，把被忽视的点子翻出来。
- 系统只推荐，最终生死由你定。

## 互见

- 单次发散、不需迭代时，用普通头脑风暴即可，不必启动本流程。
- 需要多源事实核查、产出引用报告时，配合 deep-research 使用。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。原项目：https://github.com/warmskull/idea-darwin
