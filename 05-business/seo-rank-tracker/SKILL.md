---
name: seo-rank-tracker
title: 关键词排名与 SERP 变化追踪
description: 当用户要追踪关键词排名、对比排名快照或检测排名涨跌时使用；基于导出数据或连接的 SEO/搜索控制台工具，记录当前排名、分析变化与归因、追踪 SERP 特性与 AI 可见性、对比竞品并产出排名报告与下一步动作；不适用于一次性 SEO 体检、流量下滑深度归因或排名修复实施；触发词：排名追踪、查排名、关键词排名、SERP 位置监控、排名变了吗、我排第几、track rankings、ranking changes、position monitoring
domain: 商业/seo
triggers: [排名追踪, 查排名, 关键词排名, SERP位置监控, 排名变化, 排名变了吗, 我排第几, track rankings, check keyword positions, ranking changes, position monitoring]
tags: [seo, geo, rank-tracking, serp, keyword-rankings, position-monitoring, ai-visibility]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Google Search Console, Ahrefs/Semrush, Google Analytics, AI 可见性监测工具]
requires: []
related: [seo-performance-reporter, serp-feature-analysis, seo-traffic-drop-forensics, seo-keyword-research]
combines_with: [seo-performance-reporter, seo-content-refresher, seo-keyword-research]
license: Apache-2.0
source: aaron-he-zhu/seo-geo-claude-skills
source_license: Apache-2.0
---
## 何时使用

- 用户要"追踪/监控关键词排名""查排名""看看排名涨跌了没""我现在排第几"。
- 已有基线（baseline）后，定期对比快照、生成排名变化报告。
- 需要把排名、SERP 特性归属、AI Overview/引用可见性放在一起做趋势监控时。

不该用的边界：
- 一次性技术/页面 SEO 体检、上线前体检 → seo-audit。
- 流量/排名暴跌的根因深挖与恢复方案 → seo-traffic-drop-forensics。
- 排名背后的内容/架构修复实施（本技能只"监控+分析"，不"修复实施"）→ 各专门技能。
- 让排名监控变成自动化定时任务、阈值告警 → 交给告警/自动化机制（源仓库的 alert-manager 角色）。

## 步骤

1. 建立追踪范围：确认 domain、目标市场/语言、设备（桌面/移动）、更新频率、关键词优先级、竞品监控清单。
2. 取数（集成均可选）：有工具时从 SEO 工具拉排名、Search Console 拉展示量、Analytics 拉流量、AI 监测工具拉 AI 引用；无工具时直接向用户索取当前位置、搜索量、竞品数据、SERP 特性状态。
3. 记录当前排名：位置区间、逐词排名、排名 URL、SERP 特性归属、本期相对上期的位移。
4. 分析变化：列出最大涨幅、最大跌幅、稳定词、新增排名、丢失排名，给出可能原因与恢复思路。
5. 追踪 SERP 特性：对比精选摘要、PAA、图片/视频包、本地包等归属变化。
6. 追踪 GEO/AI 可见性：监控 AI Overview 是否出现、引用率、引用位置、趋势。
7. 对比竞品：声量份额（share of voice）、逐词对位、威胁等级。
8. 产出排名报告：整体趋势、关键胜势、隐忧、机会、SERP 特性变化、GEO 可见性、建议清单。

## 指令

排名变化响应协议（按跌幅决定动作）：

| 变化 | 时效 | 动作 |
|---|---|---|
| 下跌 1-3 位 | 观察 1-2 周 | 监控，可能是正常波动 |
| 下跌 3-5 位 | 1 周内排查 | 检查技术问题与竞品变化 |
| 下跌 5-10 位 | 立即排查 | 全面诊断：技术、内容、外链 |
| 跌出第一页 | 紧急响应 | 全站审计 + 恢复方案 |
| 排名上升 | 记录并复盘 | 找出有效做法并复制 |

判定原则：先把波动和真实下跌区分开，再按上表升级处置；上升项同样要复盘归因以便复制。

## 示例

触发提示词：

```
为 [domain] 设置排名追踪，目标关键词：[关键词列表]
```

```
分析 [domain] 过去 [时间段] 的排名变化
```

典型产出：平均位置从 15.3 升到 12.8，进入前 10 的关键词从 12 个增至 17 个；报告高亮最大赢家、最大跌幅与下一步动作。

落盘约定：分析完成后询问"是否保存结果？"。若是，写 `memory/monitoring/YYYY-MM-DD-<topic>.md`，记录头条发现、动作项与未决事项（open loops）。

## 注意事项

- 持续一致地追踪：固定市场/设备/语言/频率，否则快照不可比。
- 按搜索意图分段看排名，别只看平均位置这一个数。
- SERP 特性与 GEO/AI 可见性要纳入监控——只看蓝链排名会漏掉零点击与 AI 引用的影响。
- 关键词排名报告需含竞品对位，单看自己易误判趋势。
- 区分正常波动与真实下跌：小幅波动先观察，避免过度反应。

## 互见

- requires：`seo-audit` —— 排名异常需深查时，先有技术/页面体检能力做底。
- related：`seo-traffic-drop-forensics`、`ai-search-seo`、`ai-answer-engine-seo`、`competitive-intel-tracker`
- combines_with：`marketing-analytics-tracker` —— 把排名变化与流量/转化数据对齐，形成完整监控闭环。

本条采编自 aaron-he-zhu/seo-geo-claude-skills（Apache-2.0）。
