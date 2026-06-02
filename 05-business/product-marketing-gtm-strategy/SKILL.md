---
name: product-marketing-gtm-strategy
title: 产品营销定位与 GTM 策略
description: 当需要为产品做市场定位、ICP/买家画像、竞品情报与 GTM 上市规划时使用；产出定位陈述、价值主张、竞品 Battlecard、上市计划与销售赋能资料；不适用于绩效广告投放、品牌创意设计或纯增长黑客执行。触发词：定位、GTM、上市、竞品分析、ICP、Battlecard
domain: 商业/marketing
triggers: [产品营销, PMM, 定位, positioning, GTM, go-to-market, 上市策略, 竞品分析, battlecard, ICP, 买家画像, 销售赋能, win/loss 分析, 市场进入]
tags: [商业, marketing, 产品营销, 定位, GTM, 竞品情报, 销售赋能, 市场进入]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [product-launch-strategy, competitive-analysis, cmo-marketing-advisor, sales-enablement]
combines_with: [competitive-matrix-builder, sales-enablement, product-launch-strategy]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用于以下产品营销（PMM）场景：

- 给产品做**市场定位**（用 April Dunford 方法论），写定位陈述与价值主张。
- 定义 **ICP（理想客户画像）** 与 3-5 个买家画像，给潜客打分（A/B/C/D）。
- 建立**竞品情报**：分层、Battlecard、win/loss 分析、话术。
- 规划**产品上市（GTM）**：按 Tier 1/2/3 分级，做上市计划、节奏、指标。
- 准备**销售赋能**物料：销售 Deck、Demo 脚本、一页纸、ROI 计算器。
- 规划**国际/新市场进入**：本地化、市场优先级、预算分配。

**不该用的边界**：
- 不是绩效广告/SEM 投放优化、不做创意素材设计——那属于增长/品牌职能。
- 不替代真实的客户访谈与市场数据；本技能给的是结构与模板，输入数据需自备。
- 早期无任何付费客户、无法验证 ICP 时，先做客户发现，再回到此流程。

## 步骤

### 1. 定义 ICP（理想客户画像）
1. 分析现有客户（取 LTV 前 20%）。
2. 提取共性 firmographics（规模、行业、营收）、technographics（工具栈、成熟度、集成）、psychographics（痛点强度、动机、风险偏好）。
3. 定义 3-5 个买家画像：经济型买家 / 技术型买家 / 使用者-Champion。
4. 用销售周期与流失数据校验，给潜客打分 A/B/C/D。
5. **验证标准**：A 级客户流失最低、成交最快。

ICP 校验清单：≥5 个付费客户匹配该画像 / 销售周期短于中位数 / LTV 高于中位数 / 年流失 <5% / 产品使用活跃 / 愿做案例。

### 2. 制定定位（April Dunford 5 步 + 时机）
1. 列竞争替代方案（直接、相邻、现状/手工）。
2. 隔离独有属性（只有你有的能力）。
3. 把属性映射到客户价值（为什么重要）。
4. 定义最佳契合客户（谁最在乎）。
5. 选择市场品类（正面竞争 / 细分 / 开创新品类）。
6. 叠加相关趋势（论证时机）。
7. 用 ≥10 个客户访谈测试。
8. **验证标准**：≥7 个客户能在无提示下自述价值。

### 3. 搭建竞品情报
1. 分层：Tier 1 直接竞品 / Tier 2 相邻方案 / Tier 3 现状（表格、手工、自研）。
2. 注册试用竞品、监控官网/定价/信息、听销售录音、读 G2/Capterra 评价、追竞品招聘（路线图信号）。
3. 每月更新 Battlecard。
4. **验证标准**：80%+ 竞争性交易中销售实际用到 Battlecard。

### 4. 规划上市（按 Tier 分级）
| Tier | 范围 | 准备期 | 预算 |
|------|------|--------|------|
| 1 | 新产品/重大功能 | 6-8 周 | $50-100k |
| 2 | 重要功能/集成 | 3-4 周 | $10-25k |
| 3 | 小改进 | 1 周 | <$5k |

Tier 1 流程：跨职能 Kickoff（产品/市场/销售/CS）→ 定目标（pipeline $、MQL、媒体）→ 定位与信息 → 销售赋能（Deck/Demo/Battlecard）→ 战役物料（落地页/邮件/广告）→ 培训销售与 CS → 上市日执行 → 监控优化 30 天。**验证标准**：第 2 周 pipeline 进度达标。

### 5. 销售赋能 与 6. 国际扩张
赋能：销售 Deck（15-20 页，视觉优先）、一页纸、Demo 脚本（30-45 分含 discovery）、邮件模板、ROI 计算器、月度赋能会、季度培训。**验证标准**：80%+ 商机中销售用到这些物料。
扩张：验证需求（inbound/TAM）→ 本地化（官网/定价/法务）→ 建销售覆盖 → 文化适配信息 → 本地合作与案例 → 投放本地战役 → 按市场监控 CAC 与转化。**验证标准**：进入新市场前 90 天内 ≥3 个付费客户。

## 指令

定位陈述模板（保留原文结构，按需填中文）：
```
FOR [目标客户]
WHO [需求陈述]
THE [产品] IS A [品类]
THAT [核心收益]
UNLIKE [竞争替代方案]
OUR PRODUCT [主要差异化]
```

价值主张公式：`[产品] 帮助 [目标客户] [达成目标]，靠 [独特方式]`

Battlecard 模板（保留原文字段）：
```
COMPETITOR: [名称]
OVERVIEW: 成立[年份], 融资[阶段], 规模[人数]
POSITIONING:
- They say: "[对方主张]"
- Reality: [你的评估]
STRENGTHS: 1. ... 2. ...
WEAKNESSES: 1. ... 2. ...
OUR ADVANTAGES: 1. [优势+证据] 2. ...
WHEN WE WIN: [你赢的场景]
WHEN WE LOSE: [对方赢的场景]
TALK TRACK:
  Objection: "[常见异议]"
  Response: "[你的回应]"
```

信息层级（headline 5-7 词 → subhead 1 句 → 3-4 条收益 → 支撑功能 → social proof）；Demo 流程：Intro 2′ → Discovery 5′ → Demo 20′ → Q&A 10′ → Next steps 3′。

输出要求：每条结论标注置信度（🟢 已验证 / 🟡 中等 / 🔴 假设）；表达顺序 Bottom Line → What（含置信度）→ Why → How to Act。

## 示例

价值主张示例：「Acme 帮助中端市场 SaaS 团队把交付速度提升 2 倍，靠 AI 自动化项目流程。」

PMM 关键 KPI 目标：产品采用率 >40%（90 天内）、竞争性 win rate >30%、销售速度同比 -20%、客单价同比 +25%、上市 pipeline ROMI 3:1。

## 注意事项

- **没有书面定位** → 所有营销都是猜测，先补定位。
- **各渠道信息不一致** → 故事错位会让买家困惑，统一信息层级。
- **没定义 ICP** → 卖给所有人等于卖给没有人。
- **竞品重新定位** → 视为市场信号，重审自己的定位。
- 本地化要专业翻译而非机器翻译；遵守 GDPR/PIPEDA 等合规要求。
- 模板中的数字区间（人数、营收、预算、时间线）来自源文的 Series A 假设，需按自身阶段替换，勿照抄。

## 互见

- **marketing-context**：沉淀基础定位语境，本技能在其之上构建。
- **launch-strategy**：执行本技能规划的上市动作。
- **competitive-intel / cmo-advisor**：战略级竞品情报与营销预算/增长模型决策。

---
采编自 alirezarezvani/claude-skills（MIT 许可）。
