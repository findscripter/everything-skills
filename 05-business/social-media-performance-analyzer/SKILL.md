---
name: social-media-performance-analyzer
title: 社媒投放绩效分析
description: 当需要分析社媒投放/活动表现、衡量互动率与广告 ROI、跨平台对标行业基准时使用；做投放数据校验→分平台计算互动率/CTR/ROAS→对标基准→排名优劣帖→产出优化建议报告；不适用于内容创作/排期或非社媒渠道分析；触发词：分析社媒、计算互动率、社媒 ROI、活动绩效、平台对标
domain: 商业/marketing
triggers: [分析社媒表现, 计算互动率, 社媒 ROI / ROAS, 投放活动绩效复盘, 跨平台数据对比, 对标行业基准, Instagram/Facebook/TikTok/LinkedIn 数据分析]
tags: [商业, marketing, 社媒分析, 互动率, ROI, 广告投放, 数据对标, 绩效复盘]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, calculate_metrics.py, analyze_performance.py]
requires: []
related: [social-media-content-creator, campaign-attribution-analytics, marketing-analytics-tracker, social-media-multi-publisher]
combines_with: [social-media-content-creator, data-storyteller, campaign-attribution-analytics]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当你拿到一批社媒帖子/广告数据，需要量化评估投放效果时使用，典型场景：

- 计算单帖与活动级互动率、CTR、触达率、ROI/ROAS。
- 把实际表现对标 Instagram、Facebook、Twitter/X、LinkedIn、TikTok 的行业基准。
- 找出表现最好与最差的内容，产出可执行的优化/扩量建议。
- 社媒审计、竞品社媒对比、回答「哪类内容在涨」。

**不该用边界：**
- 只做内容创作、文案或排期规划（用内容创作类技能）。
- 跨渠道（含邮件、搜索、官网等）综合归因分析，而非聚焦社媒。
- 缺少触达（reach）等必填数据、无法计算分母时，先补数据再分析。

## 步骤

1. **校验数据完整性**（见下方硬约束），任一不满足先停下补数。
2. 逐帖计算互动指标。
3. 汇总到活动级指标。
4. 若提供广告花费，计算 ROI/CPE/CPC/CPM。
5. 与对应平台基准对标，给出 excellent/good/average/poor 评级。
6. 排出 Top / Bottom 表现帖。
7. 输出优化建议。
8. **结果校验：** 互动率 < 100%；ROI 与花费数据自洽。

### 必填 / 选填字段

| 字段 | 必填 | 说明 |
|------|------|------|
| platform | 是 | instagram / facebook / twitter / linkedin / tiktok |
| posts[] | 是 | 帖子数组 |
| likes / comments / reach | 是 | 点赞、评论、唯一触达人数 |
| impressions / shares / saves / clicks | 否 | 曝光、转发、收藏、点击 |
| total_spend | 否 | 广告花费（算 ROI 时必需且 > 0） |

### 数据校验硬约束（分析前必查）

- 所有帖子 reach > 0（防止除零）。
- 互动计数非负。
- 日期区间有效（start < end）。
- 平台名在受支持列表内。
- 若需 ROI，则 spend > 0。

## 指令

### 核心公式

```
互动率 Engagement Rate = (Likes + Comments + Shares + Saves) / Reach × 100
CTR        = Clicks / Impressions × 100
触达率      = Reach / Followers × 100
传播率      = Shares / Impressions × 100
收藏率      = Saves / Reach × 100
```

### ROI 公式

| 指标 | 公式 |
|------|------|
| 单次互动成本 CPE | Total Spend / Total Engagements |
| 单次点击成本 CPC | Total Spend / Total Clicks |
| 千次曝光成本 CPM | (Spend / Impressions) × 1000 |
| 广告支出回报 ROAS | Revenue / Ad Spend |
| ROI% | (Value − Spend) / Spend × 100 |

互动估值（估算 Value 用）：Like $0.50（品牌曝光）、Comment $2.00（主动互动）、Share $5.00（放大）、Save $3.00（意向信号）、Click $1.50（流量价值）。

### 互动率评级与基准

表现分级：> 6% 优秀（扩量复制）、3–6% 良好（优化扩展）、1–3% 一般（测试改进）、< 1% 差（分析转向）。

平台互动率基准（均值 / 良好 / 优秀）：Instagram 1.22% / 3–6% / >6%；Facebook 0.07% / 0.5–1% / >1%；Twitter/X 0.05% / 0.1–0.5% / >0.5%；LinkedIn 2.0% / 3–5% / >5%；TikTok 5.96% / 8–15% / >15%。

CPC 基准（均值 / 良好）：Facebook $0.97 / <$0.50；Instagram $1.20 / <$0.70；LinkedIn $5.26 / <$3.00；TikTok $1.00 / <$0.50。

ROI 解读：>500% 优秀（大幅扩预算）、200–500% 良好（适度加预算）、100–200% 可接受（先优化再扩）、0–100% 保本（复盘定向与创意）、<0% 负回报（暂停重构）。

完整基准见 `references/platform-benchmarks.md`（含分行业基准、内容类型表现、最佳发布时段）。

### 计算脚本

```bash
# 逐帖 + 活动级互动率/CTR/触达率
python scripts/calculate_metrics.py assets/sample_input.json

# 完整绩效分析：ROI + 基准对标 + 建议
python scripts/analyze_performance.py assets/sample_input.json
```

## 示例

输入（`assets/sample_input.json`，Instagram，花费 $500，单帖示例）：

```json
{
  "platform": "instagram",
  "total_spend": 500,
  "posts": [
    { "post_id": "post_001", "content_type": "image",
      "likes": 342, "comments": 28, "shares": 15, "saves": 45,
      "reach": 5200, "impressions": 8500, "clicks": 120 }
  ]
}
```

输出要点：互动率 8.36%（基准 1.22%，约 6.8 倍）= 优秀；CTR 1.55%（基准 0.22%，约 7 倍）= 优秀；ROI 660%（$500 花费）= 出色。建议：扩量预算，复制成功要素。

## 注意事项

- **先校验后分析**：reach=0 会导致除零，平台不在列表会取错基准，必须前置拦截。
- **基准随平台切换**：同一互动率在 TikTok 是「差」、在 Twitter 却是「优秀」，务必用对应平台基准评级。
- 互动估值为经验估算值，用于粗算 ROI；有真实转化/营收数据时优先用实际 ROAS。
- 主动预警信号：互动率低于平台均值（内容不共鸣，复盘 Top 帖找规律）；粉丝增长停滞（审计发布频率）；高曝光低互动（内容质量问题）；竞品显著领先（拆解其爆款补内容缺口）。
- 输出建议遵循「结论先行 → 是什么（标注置信度）→ 为什么 → 怎么做」，每条发现标注 🟢已验证 / 🟡中等 / 🔴假设。

## 互见

- 内容创作类技能：负责生成社媒帖子（本技能只做分析复盘）。
- 跨渠道分析技能：含社媒在内的多渠道综合分析。
- 内容策略技能：规划社媒内容主题与节奏。

---

采编自 alirezarezvani/claude-skills（marketing-skill / social-media-analyzer，MIT 许可）。
