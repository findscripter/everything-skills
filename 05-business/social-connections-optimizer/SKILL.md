---
name: social-connections-optimizer
title: 社交人脉优化（X/LinkedIn 网络重整与外联）
description: 当需要整理 X/LinkedIn 关注与人脉、围绕当前优先事项重整社交图谱、并按渠道起草用户本人口吻的暖外联时使用；做评审优先的整理队列、关注/添加推荐、暖路径识别与多渠道草稿，产出可审阅后再执行的人脉优化报告；不适用于纯冷名单线索挖掘（见 sales-prospecting）、自动群发或无脑批量取关。触发词：整理关注、该取关谁、该关注谁、重新连接、人脉重整、social graph、暖外联、warm intro、X DM、LinkedIn 外联。
domain: 商业/growth
triggers: [整理关注, 该取关谁, 该关注谁, 重新连接, 人脉重整, social graph, 暖外联, warm intro, X DM, LinkedIn 外联, connections optimizer, 网络整理]
tags: [商业, growth, 社交网络, 外联, 人脉, x, linkedin, 暖路径]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [x-api, LinkedIn API, Browser, Exa, Apple Mail]
requires: []
related: [sales-prospecting, cold-email-writer, social-media-multi-publisher, x-twitter-automation]
combines_with: [apollo-lead-enrichment, signal-based-call-prep]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

把出站当成**网络结构重整**，而非一份单向的潜客名单：围绕用户当前的优先事项，把 X 和 LinkedIn 的关注/人脉重新排布——整理掉低价值的一向关注，识别值得加深或新接触的高价值节点，并按合适渠道起草用户本人口吻的暖外联。

适用：
- 想整理 X 关注、问「该取关谁 / 该关注谁 / 该重新连接谁」
- 想围绕优先事项重新平衡关注与人脉
- 外联质量取决于网络结构本身，而不只是冷名单生成

不该用（负边界）：
- 只要从零冷启动一份**已验证、已打分的可触达线索清单** → 用 `sales-prospecting`（那是建表筛选，不是图谱重整）。
- 要**自动群发** DM/邀请/邮件 → 本技能默认不发，只产草稿。
- 想**无脑批量取关** → 本技能默认评审优先，拒绝盲目自动整理。

## 步骤

先收集输入，再按固定工作流产出「审阅包」，**审阅通过后才执行**。

**必需输入**（缺则收集或推断）：
- 当前优先事项与在做的事
- 目标角色、行业、地域或生态
- 平台选择：X、LinkedIn 或两者
- 「不要动」清单（do-not-touch）
- 模式：`light-pass` | `default` | `aggressive`（未指定用 `default`）

**工作流**：
1. 收集优先事项、不要动约束、所选平台。
2. 拉取当前关注/人脉清单做盘点。
3. 给**整理候选**打分，每条附明确理由。
4. 给**保留候选**打分，每条附明确理由。
5. 用线索情报与调研面（如 Exa/深研）对**扩展候选**排序。
6. 匹配渠道：暖而轻的社交触点用 X DM；专业图谱邻接用 LinkedIn 消息；高背景的引荐/外联用 Apple Mail 草稿。
7. 起草消息前先跑品牌口吻校准（brand-voice），让草稿像用户本人。
8. 执行前返回审阅包。

## 指令

**安全默认（硬约束）**：
- 默认评审优先，**不做盲目自动整理**。
- X：只整理「用户关注的账号」，**不动粉丝**。
- LinkedIn：已通过的一度人脉**默认走人工评审**，不自动删除。
- **不自动发送** DM、邀请或邮件。
- 执行步骤前必须先输出**已排序的行动计划 + 草稿**。

**平台规则**：
- X：互关比单向关注更具粘性；无回关账号可更积极整理；不活跃/消失账号应快速浮现；互动、信号质量、桥接价值比粉丝数更重要。
- LinkedIn：有 API 则 API 优先，无则浏览器工作流须可用；区分「出站关注」与「已通过一度人脉」——前者可更自由整理，后者默认评审不自动删。

**模式**：
- `light-pass`：仅高置信地整理低价值单向关注，其余仅展示供评审，生成小规模添加/关注清单。
- `default`：均衡的整理队列 + 保留清单 + 已排序的添加/关注队列 + 必要处的暖引荐或直接外联草稿。
- `aggressive`：更大整理队列，对陈旧无回关容忍度更低；执行前仍有评审闸门。

**打分模型**：
- 正信号：互惠、近期活跃、与当前优先事项契合、网络桥接价值、角色相关性、真实互动史、近期存在感与响应度。
- 负信号：消失/废弃账号、陈旧单向关注、优先级外的话题簇、低价值噪声、反复无响应、在有大量更优替代时仍无回关。
- 约束：互关与真实暖路径桥接**不应比单向关注受更重惩罚**。

## 示例

**审阅包格式**（执行前返回，须人工过目）：

```text
CONNECTIONS OPTIMIZER REPORT
============================

Mode:
Platforms:
Priority Set:

Prune Queue        # 整理队列
- handle / profile
  reason:
  confidence:
  action:

Review Queue       # 评审队列（含风险）
- handle / profile
  reason:
  risk:

Keep / Protect     # 保留/保护（标桥接价值）
- handle / profile
  bridge value:

Add / Follow Targets   # 添加/关注目标
- person
  why now:
  warm path:
  preferred channel:

Drafts             # 草稿（不自动发）
- X DM:
- LinkedIn:
- Apple Mail:
```

典型一轮：用户说「帮我围绕 AI Infra 创业整理 X 关注、找该重连的人」→ 取 `default` 模式 → 盘点关注 → 整理掉陈旧无回关的优先级外账号（进 Prune，标 confidence/action）→ 高桥接价值互关进 Keep → 用调研面排出 5~8 个新关注/重连目标，每条标 why now + warm path + 渠道 → 为暖目标起草 X DM / LinkedIn / Apple Mail 草稿 → 返回审阅包，待用户确认后再执行。

## 注意事项

**出站规则**：
- 默认邮件路径是 Apple Mail / Mail.app **起草**，不自动发送。
- 按温度、相关性、背景深度选渠道；该走邮件就别硬塞 DM，该沉默就别强行外联。
- 草稿要像用户本人，**不要写成自动化销售话术**。

易错点：跳过「不要动」清单导致误整理重要关系；把粉丝当关注去整理（X 只动关注侧）；自动删 LinkedIn 一度人脉（应评审）；让互关/暖桥接被错误重罚；草稿口吻像群发模板。任何取关/删人/发送动作都在审阅包确认之后。

## 互见

- related：`sales-prospecting` —— 需要从零建可触达冷线索表（建表筛选）时改用它，与本条的「已有网络重整」互补。
- related：`customer-research-synthesizer` —— 对目标人物/公司做富化与画像调研可借力。
- related：`content-engine-strategist` —— 若网络移动还需配套公开发布内容。
- combines_with：`cold-email-writer` —— 把暖外联升级为成体系的冷邮/序列文案。
- combines_with：`social-media-multi-publisher` —— 把人脉重整后的内容多平台分发。
- combines_with：`sales-prospecting` —— 图谱重整识别暖路径后，接线索挖掘补足冷增量。

---

采编自 affaan-m/everything-claude-code（MIT 许可证）。
