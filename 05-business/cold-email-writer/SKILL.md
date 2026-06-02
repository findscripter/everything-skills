---
name: cold-email-writer
title: B2B 冷启动邮件撰写
description: 当需要给陌生 B2B 客户写冷启动外联邮件或多触点跟进序列、且要提升回复率时使用；做的是产出主题行、开场、正文、CTA 与 3-5 封跟进邮件成品；不适用于已有关系的生命周期/培育邮件、纯品牌广告文案、群发垃圾邮件或抓取潜客名单；触发词：冷邮件、cold email、外联、prospecting、SDR、outbound、跟进序列、没人回我邮件。
domain: 商业/sales
triggers: [冷邮件, cold email, 外联, prospecting, SDR, outbound, 跟进序列, 没人回我邮件]
tags: [cold-email, sales, outbound, b2b, copywriting, marketing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [sales-prospecting, email-drip-sequence, lifecycle-email-sequence, sales-enablement]
combines_with: [sales-prospecting, email-drip-sequence, sales-enablement]
license: MIT
source: coreyhaines31/marketingskills
source_license: MIT
---
## 何时使用

- 给陌生 B2B 决策者写**冷启动外联邮件**：约会、回复、引荐、demo 等为目标的首封触达。
- 写**多触点跟进序列**（3-5 封），每封换角度、加新价值，含 breakup（道别）邮件。
- 优化主题行、开场白、正文、个性化与 CTA；或诊断「没人回我邮件」。
- 触发词：冷邮件、cold email、外联、prospecting、SDR、outbound、跟进序列、没人回我邮件。

不该用的边界：
- 已有关系的**生命周期/培育邮件**（lifecycle/nurture）不适用——那是触达过的客户。
- 不做潜客名单的抓取与资格审定（prospecting/list building）——本技能只写名单已就绪后的文案。
- 不写纯品牌广告语、落地页文案、社媒帖子。
- 不做群发垃圾邮件、不伪造数据；不替代事实核查，统计数字交 `fact-checking`。

## 步骤 / 指令

写作前先收集背景（缺则发问，但有强信号+清晰价值主张即可动笔，别卡在缺输入上）：

```
1. 收件人：角色、公司、为什么是 TA
2. 目标：想要的结果（约会/回复/引荐/demo）
3. 价值：你为这类人解决的具体问题
4. 证明：一个结果、案例或可信度信号
5. 调研信号：融资、招聘、LinkedIn 动态、公司新闻、技术栈变化
```

> 提示：若仓库存在 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`、旧版 `product-marketing-context.md`），先读它再发问，只问其中没覆盖的信息。

撰写主流程：

```
1. 选结构（按情境选框架，或顺畅时写自由体）
   - PAS：痛点→放大后果→方案+软 CTA（默认主力，适合问题已知/方案未知）
   - QVC：精准痛点提问→简短价值→直接下一步（适合 C-suite，越简越好）
   - BAB：现状之痛→理想未来→产品作桥（转型型卖点）
   - Mouse Trap：观察+二元价值提问，仅 1-2 句（极致简短，靠好奇心冲动回复）
   - 通用「观察→问题→可信度→方案→对话邀请」五段式
2. 写个性化开场（个性化必须连到你解决的问题）
   - Level1 合并标签（名字/公司）已是底线，不再加分
   - Level2 行业/细分痛点；Level3 角色级挑战；Level4 个人化、及时的观察（金标准）
   - 自检：删掉这句个性化后邮件仍成立 → 说明它没生效，重写
3. 写正文：以「你/你们」为主语，别开头自报家门或讲公司
   - 一个证明点胜过十个功能；每句不推动回复就删
4. 一个 CTA、低摩擦
   - 兴趣型 CTA（「值得一聊吗？」「这对你有用吗？」）优于约会请求
   - 首封别要 30 分钟通话；按职级调摩擦：高管「2 分钟？」，中层给具体价值
5. 写主题行：短、平淡、像内部邮件
   - 2-4 词、全小写、无标点花招、无产品推销、无收件人名字
   - 用 {{painPoint}}/{{competitor}}/{{commonGround}}，不用 {{firstName}}
6. 设计跟进序列（如需）
   - 共 3-5 封，间隔递增；每封独立成立、只加 1 个新价值
   - 节奏：Day0 初封 → Day3 跟进1 → Day7-8 跟进2(换角度) → Day14 跟进3(新价值) → Day21-28 breakup
   - breakup 四段：承认多次触达→体谅可能没兴趣→声明这是最后一封→留门
   - 一旦发出 breakup，就遵守它，不再联系
7. 出稿前过质量关（见「注意事项」清单）
```

## 示例

PAS 框架正文（约 60 词，软 CTA）：

```
和你们规模相仿公司的销售 VP，每周大概花 5+ 小时手动做 CRM 报表——一年 250+ 小时
没用在带教上，预测还常常失真。我们做了个工具能实时自动生成 CRM 报表，像 Datadog
这样的团队把报表时间砍了 80%。要不要看看是怎么做的？
```

Mouse Trap（极简，1-2 句）：

```
看到你们在招销售。想不想更细地看看他们在邮件上的爬坡情况？
```

breakup「1-2-3」格式（把摩擦降到近零）：

```
一直没收到回复，我就长话短说。回个数字就行：
1 — 有兴趣，聊聊
2 — 现在不合适，3 个月后再找我
3 — 不感兴趣，别再发了
```

主题行（好/坏对照）：

```
好：reply rates · hiring ops · Q2 forecast · 一个问题
坏：Re: 跟进  /  John，提升你 ROI 的方案！！！  /  快速问一下？
```

## 注意事项

- 像同行而非供应商写：用口语缩写，读出声；像营销文案就重写。冷邮件 25-75 词最佳，<75 词回复多 83%。
- 个性化必须连到你解决的问题；脱离问题的「酷，你去过 UCLA！」只是注意力把戏，会显得假。
- 一封一个 CTA、低摩擦；首封别要 30 分钟通话（等于「第一次见面就求婚」）。
- 主题行别推销产品（-57% 回复）、别放名字（-12% 回复）、别用数字百分号/感叹号/emoji/紧迫词。
- 跟进每封必须加新东西；「just checking in / 还没收到回复 / 把这条顶到收件箱」会拉低回复率（Gong：「我一直没收到回复」-12% 约会）。
- 杜绝 AI 套话与黑话：「I hope this email finds you well」「I came across your profile」「leverage」「synergy」「best-in-class」「circle back」；不发 HTML/图片/多链接；不伪造 Re:/Fwd: 主题。
- 别用只换 {{FirstName}} 的同一模板群发；同公司联系 1-2 人回复 7.8%，10+ 人降到 3.8%。
- 文中所有统计数字、回复率、案例结果均为行业基准，需落地到真实数据时标 [需核查] 并交 `fact-checking`，本技能不担保数字。
- 出稿前自检清单：读出声像真人写的吗？／换我会回吗？／每句都服务读者吗？／个性化连到问题了吗？／是否只有一个低摩擦 CTA？

## 互见

- related：`seo-content-writer` —— 同属商业内容写作，落地页/正文文案与冷邮件可共用语气与价值主张提炼。
- related：`fact-checking` —— 邮件中引用的统计、案例、行业基准需经其核验，避免「未经证实的断言」触发收件人怀疑。
- related：`prompt-template-designer` —— 把本技能的 3x3 触发模板与框架沉淀为可复用的提示词模板，实现 3 分钟个性化量产。

---

本条采编自 coreyhaines31/marketingskills（MIT），适配重写为面向 AI Agent 的中文条目，保留其框架体系、个性化分级、跟进节奏与基准数据等关键约束。
