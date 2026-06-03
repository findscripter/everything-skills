---
name: micro-saas-launcher
title: 微型 SaaS 快速上线
description: 当你以独立开发者/小团队身份要把一个聚焦的 SaaS 产品在数周内验证并上线赚钱时使用；做点子验证→MVP→定价→上线→止血留存的可执行打法与产物；不适用于追求融资/独角兽规模、需大规模网络效应或重前端设计的项目；触发词：micro saas、indie hacker、saas mvp、快速上线、定价、独立开发
domain: 商业/growth
triggers: [micro saas, indie hacker, small saas, side project, saas mvp, ship fast, 微型 saas, 独立开发, 快速上线, saas 定价, Product Hunt 上线, 止血留存]
tags: [商业, growth, saas, indie-hacker, mvp, 定价, 上线, 留存]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Stripe, Supabase, Next.js, Vercel, Clerk, Resend, PostHog, Product Hunt]
requires: []
related: [digital-product-monetization, pricing-strategy, product-launch-strategy, saas-marketing-ideas]
combines_with: [fullstack-project-scaffolder, user-onboarding-optimizer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你要把一个**聚焦、单一痛点**的 SaaS 产品在数周内（而非数年）验证、上线并跑到可持续收入时使用。典型场景：独立开发者/小团队的副业项目、SaaS MVP、想"先上线收钱再迭代"。核心立场：做能盈利的小生意，不是猎杀独角兽；分发优先于产品。

**不该用（负边界）：**
- 追求融资、独角兽规模、需要海量用户才成立的模式
- 依赖双边市场/网络效应才有价值的产品
- 重前端视觉打磨、需大设计团队的项目
- 目标客群没预算（学生、无融资创业公司、大众消费者、有免费替代品的市场）

## 步骤 / 指令

### 1. 点子验证（动手前先验证）
四问框架，每问都要有答案：
| 问题 | 怎么验证 |
|------|---------|
| 问题真实存在？ | 找 5+ 潜在用户聊 |
| 有人会付费？ | 预售，或找到正在付费的竞品 |
| 你能造出来？ | MVP 能否 2 周内上线 |
| 你能触达他们？ | 是否已有分发渠道 |

快速验证三法：**落地页测试**（建页→投流/社区导流→量注册）、**预售**（"加入候补名单享 5 折"，没人买就转向）、**查竞品**（有竞品=有市场，无竞品=可能没市场，找能填的缺口）。

- 红旗：「人人都需要」（太宽）、没有明确买单人、需要市场撮合、需巨量规模才成立。
- 绿旗：清晰具体的痛点、用户已在为替代方案付费、你有领域专长、有分发渠道。

### 2. MVP 两周冲刺（只做一个核心功能）
单人优化技术栈（**别自己造轮子**）：
| 组件 | 选型 | 理由 |
|------|------|------|
| 前端 | Next.js | 全栈、Vercel 部署 |
| 后端 | Next.js API / Supabase | 快、可扩展 |
| 数据库 | Supabase Postgres | 免费额度，自带 auth |
| 认证 | Supabase / Clerk | 别自己造 auth |
| 支付 | Stripe | 行业标准 |
| 邮件 | Resend / Loops | 事务+营销 |
| 托管 | Vercel | 免费额度够用 |

```
第 1 周（核心）
Day 1-2: 认证 + 基础 UI
Day 3-4: 核心功能（只做一件事）
Day 5-6: Stripe 接入
Day 7: 打磨 + 修 bug

第 2 周（可上线）
Day 1-2: 落地页
Day 3: 邮件流（欢迎等）
Day 4: 法务页（隐私、条款）
Day 5: 终测
Day 6-7: 软启动
```
MVP 要砍掉：完美设计、全部功能、扩展性优化、自建认证、多档定价。

### 3. 定价策略（早点用钱验证）
起价框架：`你的价格 = 替代成本的 20–50%`。例：手工每月 10 小时 × ¥350/时 = ¥3500 价值 → 定价 ¥350–700/月。

常见区间：简单工具 $9–29、Pro 工具 $29–99、B2B $49–299、买断 = 3–5 倍月费。
定价错误：太便宜（贬低价值、招来差客户）、太复杂（劝退买家）、既无免费档又无试用、收费太晚没用钱验证。

### 4. 上线打法（Launch Playbook）
- **预热（提前 2 周）**：用落地页攒邮件列表、在社区先给价值、备好演示/截图素材、约好内测用户。
- **上线日渠道**：Product Hunt（中等投入/高回报）、Email 列表（低/高）、Reddit、Twitter/X、Hacker News、Indie Hackers。
- **Product Hunt**：周二到周四 12:01 AM PST 发布；备好 maker 评论；动员人脉点赞评论；回复每条评论；**不要直接索要 upvote**。
- **上线后**：跟进每个注册者、持续要反馈、关键 bug 立即修、开始做 SEO/内容（长期）、上线后别停止营销。

## 示例

**周末速launch工作流**（micro-saas-launcher + Supabase + Next.js + Stripe）：
```
1. 验证点子（1 天）
2. 搭 Supabase + Next.js
3. 做核心功能
4. 接 Stripe
5. 做落地页
6. 向社区上线
```

**内容驱动型 SaaS**（+ SEO + 内容策略 + 落地页）：研究关键词 → 带 SEO 思维做 MVP → 围绕问题做内容 → 上线 → 自然增长。

## 注意事项

**上线前自检（HIGH 优先级缺一不可）：**
- 无支付集成 → 收不到钱，接 Stripe 或 Lemon Squeezy
- 无认证系统 → 用 Supabase Auth / Clerk / Auth0，别自建
- 无用户引导（MEDIUM）→ 加欢迎流、首动作提示、引导邮件
- 无产品分析（MEDIUM）→ 加 PostHog / Mixpanel 或简单埋点
- 缺法务页（MEDIUM）→ 收款必备隐私政策 + 服务条款（用模板）

**四类高频翻车（Sharp Edges）：**
1. **产品好却触达不到客户（HIGH）**——"建好就有人来"是假的。动手前先答：客户在哪出没？能否免费触达？是否已有受众？SEO 是否可行？把分发做进产品（"Powered by"角标、邀请/裂变、公开页做 SEO、可分享结果）。渠道见效：SEO 6–12 月、内容营销 3–6 月、社区 1–3 月、付费广告即时但贵、Product Hunt 一天。
2. **目标市场不愿/付不起钱（HIGH）**——优先 B2B（价格容忍 $50–500+/月、churn 更低、更适合单人）而非 B2C。好市场：小企业、自由职业/代理、开发者、有收入的创作者、专业人士。红旗市场：学生、无融资创业公司、大众消费者、有免费替代品。信号：高兴趣零付费 → 转向。
3. **新客来得快走得也快 / churn 高（HIGH）**——基准：<3% 月 churn 优秀，3–5% 良好，5–7% 需改进，>7% 危急。先搞清原因（亲自邮件流失用户、看最后活跃日、查引导完成度、退订时调研）。快修：改进引导（前 7 天最关键）、加"aha 时刻"触发邮件、确认是否对的客户、补必备功能、涨价过滤。引导清单：注册后清晰首动作 / 首会话交付价值 / 前 7 天邮件序列 / Day 3 不活跃则触达 / 定义并追踪成功指标。
4. **定价页把人劝退（MEDIUM）**——最多 3 档、清晰差异、高亮推荐档、年付折扣 20–30%；要素：清晰价格、功能清单、推荐角标、FAQ、退款保证。可 A/B 测价、尝试删一档、问客户哪里看不懂。

## 互见

- **landing-page-design**：落地页 / 转化 / 定价页设计
- **stripe**：支付与订阅集成
- **seo**：自然增长、内容、organic
- **backend / supabase-backend**：后端、API、数据库
- **email**：邮件营销、newsletter、drip
- **nextjs-app-router**：Next.js 前端

---
采编自 sickn33/antigravity-awesome-skills（MIT）。原始 SKILL.md 标注上游来源为 vibeship-spawner-skills（Apache 2.0）。
