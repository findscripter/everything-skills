---
name: nih-grant-finder
title: NIH 科研基金匹配与申报
description: 当临床/科研人员要为一个明确的研究想法匹配 NIH 资助、定位科研立项策略并产出可编辑申报概览时使用；做 6 问拷问式收集→5 维 Consensus 定位→RePORTER 检索研究所/study section/NOSI→按职业阶段×范围×预实验数据匹配机制→生成 9 节 .docx；不适用于非 NIH 资助方（PCORI、DOD CDMRP、VA、基金会）。触发词：nih grant、find grants for my research、为研究找基金、NIH 资助匹配、科研基金申报、grant finder、研究所匹配
domain: 领域/science
triggers: [nih grant, find grants for my research, 为研究找基金, NIH 资助匹配, 科研基金申报, grant finder, 研究所匹配, what grants match my research, NOSI 检索, 机制匹配 R01 K F]
tags: [nih, grants, research-funding, reporter, consensus, docx, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bash_tool, curl, python, node, docx, Consensus MCP, NIH RePORTER API]
requires: []
related: [advisor-fit-analyzer, research-experiment-designer, scientific-database-lookup, academic-paper-writer]
combines_with: [research-experiment-designer, scientific-database-lookup]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 临床/科研人员有一个**具体**研究想法，需要把它定位到正确的 NIH 研究所与 study section，并产出可编辑、可分享给导师的申报策略概览（.docx）。
- 需要发现匹配的资助机会（NOSI）、查找已资助的重叠项目、并根据职业阶段给出可申报的机制建议（F/K/R/U 系列）与提交时间线。

**不该用的边界：**
- 仅限 NIH。非 NIH 资助方（PCORI、DOD CDMRP、VA、基金会）超出范围，须在收集阶段直接标注并退出。
- 想法过于笼统（如"AI for healthcare""biomarkers for disease X"）时不要直接跑检索，先要求细化。
- 不要用训练知识填充工具未返回的内容；不要把"找到/展示/引用"三类计数混为一谈。

## 步骤

1. **拷问式收集（Phase 1，6 问，一次一问）**：Q1 研究想法（2-3 句，含问题/新颖性/临床意义，拒绝含糊）→ Q2 职业阶段（预博/博后/早期/独立 PI/资深 PI）→ Q3 预实验数据（无/试点/强/已验证）→ Q4 研究环境（R01 资格/中等/资源受限/产学协作）→ Q5 提交姿态（新申/重申 A1/探索中）→ Q6 已考虑的研究所（或"无偏好—帮我找"）。Q6 后锁定，不再重开收集。
2. **研究定位（Phase 2A，5 次 Consensus 检索）**：顺序执行、每次间隔 ≥1 秒，对应 5 个维度——established（已知）/stakes（重要性，mortality OR burden OR cost OR prevalence）/current approaches（现状）/adjacent methods（邻接方法）/gaps（局限与空白）。每维提取 2-3 条可引用发现，用"the field has established X (refs), but Y remains unanswered (refs)"句式起草 Significance/Innovation。
3. **研究所映射与机会发现（Phase 2B，RePORTER POST）**：先用 `fiscal_year_calculator.py` 算财年窗口（当前 FY + 前 3 年），再跑窄检索（AND，找直接重叠）和宽检索（OR，找邻接工作）。对 `agency_ic_admin` 计数取 Top-3 研究所，对 `study_section` 计数取 Top-2。解析响应中的 `NOT-*` 编号发现 NOSI。
4. **机制匹配（范围感知）**：用职业阶段 **+** 项目范围 **+** 预实验数据三者共同决定，而非仅凭职业阶段。
5. **生成 DOCX（Phase 3）**：Node.js + `docx` 库产出 9 节文档。
6. **交付（Phase 4）**：保存→给出文件路径、审计计数、plan tier、研究所判断→校验。

## 指令

RePORTER 仅支持 **POST**，必须用 `bash_tool` + `curl`，**禁用 web_fetch**（web_fetch 是 GET）。

财年窗口（绝不硬编码）：
```bash
python ../scripts/fiscal_year_calculator.py --output json
# 返回: {"current_fy": 2026, "window": [2023, 2024, 2025, 2026]}
```

窄检索（AND，找直接重叠）：
```bash
curl -X POST 'https://api.reporter.nih.gov/v2/projects/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "criteria": {
      "fiscal_years": [2023, 2024, 2025, 2026],
      "include_active_projects": true,
      "advanced_text_search": {
        "operator": "AND",
        "search_field": "all",
        "search_text": "<key term 1> <key term 2>"
      }
    },
    "limit": 50,
    "include_fields": ["project_num", "project_title", "agency_ic_admin", "study_section", "fiscal_year", "principal_investigators", "abstract_text"]
  }'
```
宽检索把 `operator` 改为 `OR`、`search_text` 填同义词/相关概念。

NOSI 位于可预测 URL，逐个抓取；失败则记 `[NOSI {number} — fetch failed, not included]` 并继续：
```
https://grants.nih.gov/grants/guide/notice-files/NOT-<INSTITUTE>-<YEAR>-<NUMBER>.html
```

机制匹配：
```bash
python ../scripts/mechanism_matcher.py \
  --career-stage "early_career" --prelim-data "pilot" \
  --environment "r01_eligible" --scope "single_site" --output json
```

三计数审计：`scripts/citation_tracker.py`（Consensus 发送/展示/引用 + RePORTER 项目/引用，落盘 `~/.grants_sessions/<session>.json`）。

DOCX 校验：`python scripts/office/validate.py <docx>`，输出名 `grants_<topic-slug>_<YYYY-MM-DD>.docx`。

## 示例

- 输入："find grants for my research idea：用单细胞转录组识别儿童哮喘的内型标志物" → 走 6 问收集（若用户只说"biomarkers for asthma"则要求细化）→ 5 维 Consensus 定位 → RePORTER 窄/宽检索得 Top-3 研究所（如 NHLBI/NIAID/NICHD）与 Top-2 study section → 解析 NOSI → 按"早期+试点数据+单中心"匹配 R21/R01 → 产出 9 节 .docx。
- 输入：含"NIH funding for my K-award"且 Q2=早期、Q5=重申 → 机制偏 K 系列，DOCX 第 7 节补充 reviewer-response 指引。

## 注意事项

- **执行纪律**：一步未确认收到结果即未完成。Consensus 顺序调用、间隔 ≥1 秒；并行会触发限流。
- **数据来源**：只统计本次会话工具返回的内容；训练知识须标 `[Not from Consensus/RePORTER — reference information]` 且不计入计数。
- **计数与归属**：发送数/展示数/引用数是三个独立数字，绝不混淆；每条引用论文都要有本会话可检索的 URL。
- **错误处理**：失败 → 等 3 秒 → 重试一次 → 记录；连续 3 次跨工具失败则停止并告知缺失项，绝不静默跳过。DOCX 生成失败时把原始数据存为 JSON 兜底。
- **强制项**：DOCX 第 7 节必须含**联系项目官（program officer）建议**（附 NIH 研究所列表页路径、准备 1 页 specific aims + CV + 3 个针对性问题、邮件主题"Pre-application inquiry: <topic>"）；必须含 Audit Log 节。两者都不可省。
- **机制时间线**（嵌入 DOCX 第 7 节）：R01/R21/R03 → Feb 5 / Jun 5 / Oct 5；K（K01/K08/K23/K99）→ Feb 12 / Jun 12 / Oct 12；R34、R61/R33 → Feb 16 / Jun 16 / Oct 16；F31/F32 → Apr 8 / Aug 8 / Dec 8。
- **样式**：正文 Arial 12pt、深蓝标题 #1a3a5c、浅蓝表头 #e8f0f8、琥珀色 NOSI 提示；超链接分别指向 consensus.app/papers、grants.nih.gov/grants/guide、reporter.nih.gov/project-details。
- **须拒绝的反模式**：并行 Consensus 调用、用 web_fetch 抓 RePORTER、硬编码财年、仅凭职业阶段定机制、用训练知识填薄结果、跳过审计日志或项目官建议、混淆"找到/展示/引用"、抓取失败时编造 NOSI 详情。

## 互见

- fact-checking：在引用 Consensus 论文与 RePORTER 项目时核验来源与可检索性，呼应本条"每条引用须有会话内 URL"的约束。
- pdf-form-filler：若后续需要填写 NIH 申报表单（如 PHS 398/SF424 衍生表）可衔接使用。
- markdown-to-docx：当不依赖 Node `docx` 库、改从 Markdown 草稿生成 .docx 时的替代产出路径。

---

本条采编自 alirezarezvani/claude-skills（MIT）。
