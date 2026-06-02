---
name: competitive-matrix-builder
title: 竞争分析矩阵构建
description: 当需要对自家产品与 2-4 个竞品做加权打分、量化排名时使用；做加权竞争矩阵+差距分析+市场定位（脚本输出 text/json），产出可对外的竞品测评结论；不适用于无结构化打分数据的纯定性调研或单一产品评估；触发词：竞品分析、竞争矩阵、加权打分、差距分析、市场定位、battle card
domain: 商业/marketing
triggers: [竞品分析, 竞争分析矩阵, 竞争矩阵, 加权打分, 竞品打分, 差距分析, gap analysis, 市场定位, 竞品测评, battle card, 竞争对手对比, 竞品排名]
tags: [marketing, 商业, 竞品分析, 竞争情报, 产品策略, 市场定位, 加权打分]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [competitive_matrix_builder.py, Python, JSON]
requires: []
related: [competitive-analysis, competitive-intel-tracker, product-marketing-gtm-strategy, market-sizing-analyst]
combines_with: [competitive-analysis, product-marketing-gtm-strategy, sales-enablement]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 产品策略 / 路线图评审前，需要量化「我们 vs 竞品」的相对位置。
- 竞争对手发布重大功能或调价后，做快速对标。
- 季度竞争复盘、进入新细分市场前、为销售准备 battle card（对标话术卡）。
- 已经有（或能整理出）各竞品在若干维度上的 1-10 打分，希望加权汇总、排名、找差距与定位。

不该用的边界：
- 只有零散定性印象、拿不出按维度的结构化打分时，先走数据采集与打分，再回到本技能（脚本要求 `scores` 为数值）。
- 只评估单一产品、不做横向对比时（本技能核心是矩阵化对比与排名）。
- 需要实时抓取竞品数据时——本技能只做「打分→矩阵」的计算与呈现，数据采集另行完成。

## 步骤

1. 定义竞品：列出 2-4 个竞品，确认主攻对象；同时确定参与对比的维度（dimensions）。
2. 采集与打分：每个竞品至少覆盖 3 类来源（官网/定价页、应用商店评论、招聘信息、SEO、社媒），按维度给出 1-10 分，并为每个分值附一条证据。建议覆盖维度参考 12 维评分卡：features、pricing、ux、performance、docs、support、integrations、security、scalability、brand、community、innovation。
3. 整理为 JSON：填入 `your_product`、`competitors`、`dimensions`，可选 `weights`、`pricing`、`strengths`、`weaknesses`。
4. 运行脚本生成矩阵：加权打分、排名、tier 分级、差距分析与定位分布。
5. 解读输出：关注 BIGGEST OPPORTUNITIES（落后项，按 high/medium/low 优先级）与 COMPETITIVE ADVANTAGES（领先项），并据此形成行动项（快赢/中期/战略）。

## 指令

```bash
# 文本报告（默认）
python competitive_matrix_builder.py competitors.json --format text

# JSON 输出（便于下游消费）
python competitive_matrix_builder.py competitors.json --format json --output matrix.json

# 自定义维度权重（例：定价权重 2、UX 权重 1.5）
python competitive_matrix_builder.py competitors.json --format text --weights pricing=2,ux=1.5
```

输入 JSON 格式（`dimensions` 缺省时自动从第一个竞品的 scores 推断）：

```json
{
  "your_product": { "name": "MyApp", "scores": {"ux": 8, "pricing": 7, "features": 9} },
  "competitors": [
    { "name": "Competitor A", "scores": {"ux": 7, "pricing": 9, "features": 6} }
  ],
  "dimensions": ["ux", "pricing", "features"]
}
```

关键计算约束（与脚本一致，勿擅改）：
- 归一化：原始分按 1-10 线性映射到 0-100（`normalize_score`），缺失维度按 0 计。
- 综合分 = 加权归一化分之和 / 权重之和；权重缺省为 1.0。
- Tier 分级（按综合分 0-100）：≥80 Leader、≥60 Strong Competitor、≥40 Viable Alternative、≥20 Niche Player，其余 Weak。
- 差距分析（仅当提供 `your_product` 时输出）：对每个维度算 `gap_to_avg`、`gap_to_best`；状态 ahead/behind/parity 阈值为 ±0.5；优先级 high（落后最优 > 2 分）/medium（> 1 分）/low。
- 排名按综合分降序；`your_product` 自动标记并参与排名（输出中以「← YOU」标识）。

## 示例

`competitors.json`：

```json
{
  "your_product": { "name": "MyApp", "scores": {"ux": 8, "pricing": 7, "features": 9, "support": 6} },
  "competitors": [
    { "name": "Acme", "scores": {"ux": 5, "pricing": 9, "features": 7, "support": 8} },
    { "name": "Beta",  "scores": {"ux": 7, "pricing": 6, "features": 8, "support": 5} }
  ],
  "dimensions": ["ux", "pricing", "features", "support"]
}
```

运行 `python competitive_matrix_builder.py competitors.json --format text --weights pricing=2` 后，文本报告依次给出：竞争排名表（含 tier 与「← YOU」）、维度明细表、BIGGEST OPPORTUNITIES（你落后的维度及优先级）、COMPETITIVE ADVANTAGES（你领先的维度）、MARKET POSITIONING（领导者、你的排名、分值区间/均值/标准差）。

12 维评分卡可用作打分锚点，例（UX 维度）：1=混乱高摩擦，3=可用，5=极致顺畅、几乎无摩擦。每个打分务必附证据，例：「Acme UX=2：应用商店评论 38 次提及『导航混乱』；激活前需 7 步；注册即要绑卡」。

## 注意事项

- 打分尺度统一用 1-10（脚本归一化基于该区间）；混用 1-5 与 1-10 会让结果失真。
- 每个分值都要有证据支撑，避免主观拍脑袋；差距优先级直接驱动行动项排序。
- `weights` 既可写进 JSON，也可用 `--weights` 覆盖（命令行优先级更高），用于体现不同维度对你战略的重要性。
- 竞品数量建议 2-4 个，过多会稀释对主攻对象的洞察。
- 标准差只在竞品数 > 1 时才计算，单竞品场景定位分布参考意义有限。

## 互见

- 竞品调研全流程（数据采集 / 12 维评分卡 / SWOT / 定位图 / UX 审计 / 行动项 / 汇报模板）见源技能 competitive-teardown。
- 输出可反哺：产品策略与 OKR 规划、落地页定位文案、销售 battle card。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
