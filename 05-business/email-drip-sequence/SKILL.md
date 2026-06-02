---
name: email-drip-sequence
title: 邮件序列与培育自动化设计
description: 当需要设计/优化邮件序列、滴灌（drip）活动、自动化生命周期邮件流时使用；产出含触发条件、节奏、退出条件的序列架构与逐封可发送草稿（主题/预览文案/正文/CTA），并用脚本给序列打分；不适用于未授权外发冷邮件、单封事务邮件或站内引导（in-app onboarding）；触发词：邮件序列、滴灌活动、培育序列、欢迎序列、唤醒/召回邮件、邮件自动化、生命周期邮件、drip campaign、nurture sequence、email automation
domain: 商业/marketing
triggers: [邮件序列, 滴灌活动, 培育序列, 欢迎序列, 唤醒邮件, 召回邮件, 邮件自动化, 生命周期邮件, onboarding邮件, drip campaign, nurture sequence, welcome sequence, re-engagement, email automation, lifecycle email]
tags: [marketing, email, drip-campaign, lifecycle, nurture, automation, copywriting, crm]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, sequence_analyzer.py, Customer.io, Mailchimp, Resend, SendGrid, Kit]
requires: []
related: [lifecycle-email-sequence, cold-email-writer, content-marketing-strategist, conversion-copywriter]
combines_with: [lifecycle-email-sequence, conversion-copywriter, analytics-tracking-setup]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 设计或优化**邮件序列 / 滴灌活动 / 自动化生命周期邮件流**：欢迎、培育（nurture）、唤醒/召回（re-engagement）、复购、活动触发、教育、销售等序列。
- 已有列表"变冷"、试用转付费低、打开高但点击低等需要诊断邮件流的场景。

**不该用（负边界）：**
- 未经选择加入（opt-in）的外发冷邮件 / 陌生开发 —— 属于 cold-email 范畴，规则与合规不同。
- 单封事务性邮件（验证码、收据），无序列编排需求。
- 站内引导（in-app onboarding）体验本身 —— 邮件只做配合，不替代。
- 邮件落地页文案优化（交给 seo-content-writer / 文案技能）。

## 步骤

1. **读上下文再问**：若存在 `.claude/product-marketing-context.md`（品牌语气、ICP、产品），先读，仅补问未覆盖的信息。
2. **定义序列档案**：确认 序列类型 / 受众与进入触发 / 主转化目标 / 成功定义。
3. **定架构**：触发条件、邮件数量、节奏（间隔）、退出条件、分支与抑制（suppression）逻辑。
4. **逐封撰写**：每封含 主题行、预览文案、完整正文、单一主 CTA、（必要时）分段/条件。
5. **质量自检**：用 `sequence_analyzer.py` 对序列 JSON 评分（主题、CTA、垃圾词、个性化、节奏、正文长度），按反馈迭代。
6. **交付**：序列概览表（5+ 封时置顶）+ 全部草稿 + 指标基准 + 每封 3 条主题 A/B 备选；并标注与受众其他序列的潜在冲突。

## 指令

**核心原则**：一封一职（单一目的+单一主 CTA）；先给价值再开口；相关性优先于频次；每封都把人推向明确下一步。

**序列长度与节奏（基准）：**
- 欢迎：5–7 封 / 12–14 天；首封立即发，早期 1–2 天一封。
- 培育：6–8 封 / 2–3 周；间隔 2–4 天。
- 唤醒/召回：3–4 封 / 约 2 周；触发=30–60 天不活跃；最后一封"留下或退订"。
- 引导（产品用户）：5–7 封 / 14 天；与站内引导协同，不重复。
- B2B 避开周末；B2C 可测周末；按用户本地时区发送。

**主题行**：清晰>聪明、具体>笼统，40–60 字符，善用问句/数字/How-to/直呼名字；emoji 有争议需测试。
**预览文案**：~90–140 字符，延展而非重复主题。
**正文结构**：钩子→背景→价值→CTA→人性化落款；段落 1–3 句、移动端优先。正文长度：事务 50–125 词 / 教育 150–300 词 / 故事型 300–500 词。

**质量分析脚本（保留原命令）：**
```
python3 sequence_analyzer.py --file sequence.json   # 分析指定序列
python3 sequence_analyzer.py --json                 # 输出 JSON
python3 sequence_analyzer.py                        # demo 模式
```
输入 JSON 为数组，每项 `{"subject": "...", "body": "...", "delay_days": 0}`。
评分维度与权重：垃圾词安全 25%、主题质量 20%、CTA 存在 20%、个性化 15%、节奏 10%、正文长度 10%；总分 0–100 对应 A/B/C/D/F。脚本会标记：主题非 30–60 字符、缺 CTA、命中垃圾词（如 free、guarantee、act now、buy now、!!! 等）、节奏问题（间隔 ≤1 天偏激进、>14 天掉势）。

## 示例

5 封培育序列（ROAS 审计引流）节选，`delay_days` 体现节奏：
```json
[
  {"subject": "{{first_name}}, your free marketing audit is ready", "body": "Hi {{first_name}},\n\n…→ Click here to see your results: [LINK]\n\nBest,\nSarah", "delay_days": 0},
  {"subject": "Did you see this, {{first_name}}?", "body": "Quick follow-up…→ [Review your audit]", "delay_days": 3},
  {"subject": "The $50,000 mistake (and how to avoid it)", "body": "True story…→ [Open your free audit]\n\nP.S. This offer expires Friday.", "delay_days": 5},
  {"subject": "Last call — your audit expires tonight", "body": "…→ [Claim your audit before it expires]", "delay_days": 7},
  {"subject": "New case study: {{company}}-style win", "body": "…→ [Read the case study]", "delay_days": 14}
]
```
每封单一主 CTA、个性化 token `{{first_name}}/{{company}}`、节奏 0→3→5→7→14 天；运行 `python3 sequence_analyzer.py --file sequence.json` 复核评分。

## 注意事项

- 交付即"可直接发送"的完整草稿：主题 + 预览 + 正文 + CTA 一封不少，并明确触发条件与发送时机。
- 主题超出 40–60 字符、正文缺单一 CTA、命中垃圾词都会拉低送达与转化 —— 发前先跑脚本。
- 长序列（5+ 封）先给概览表再列单封。
- 检查与受众正在接收的其它序列是否冲突/重复，必要时设抑制名单。
- 工具落地参考：Customer.io（行为自动化）、Mailchimp、Resend、SendGrid、Kit；按场景选型。

## 互见

- **seo-content-writer**：邮件外链落地页/长文内容的撰写与优化。
- **prompt-template-designer**：将主题行/正文模板化、批量生成与个性化变量管理。

---
本条采编自 alirezarezvani/claude-skills（email-sequence，MIT 许可）。
