---
name: app-store-optimization
title: 应用商店优化ASO
description: "App Store Optimization (ASO) toolkit for researching keywords, analyzing competitor rankings, generating metadata suggestions, and improving app visibility on Apple App Store and Google Play Store. Use when the user asks about ASO, app store rankings, app metadata, app titles and descriptions, app store listings, app visibility, or mobile app marketing on iOS or Android. Supports keyword research and scoring, competitor keyword analysis, metadata optimization, A/B test planning, launch checklists, and tracking ranking changes."
domain: 商业/growth
triggers:
  - ASO
  - app store optimization
  - app store ranking
  - app keywords
  - app metadata
  - play store optimization
  - app store listing
  - improve app rankings
  - app visibility
  - app store SEO
  - mobile app marketing
  - app conversion rate
tags: [aso, 商业, growth, 增长, 应用商店, 关键词研究, 元数据优化, 竞品分析, a/b测试, 移动营销, ios, android]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [keyword_analyzer.py, metadata_optimizer.py, competitor_analyzer.py, aso_scorer.py, ab_test_planner.py, review_analyzer.py, launch_checklist.py, localization_helper.py]
requires: []
related: [seo-audit, seo-content-writer, conversion-rate-optimizer, product-launch-strategy]
combines_with: [product-launch-strategy, conversion-rate-optimizer, paid-ads-strategist]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 随包资源与运行前提

本目录的脚本、参考文档和模板已随技能分发；固定来源、SHA-256 与许可见 [RESOURCES.md](RESOURCES.md) 及 [UPSTREAM-LICENSE.txt](UPSTREAM-LICENSE.txt)。新增资源取自核验时的固定上游快照，不表示这是原正文采编时的版本。

- 文档中的资源相对路径指**本技能目录**；执行时保持目标项目所需的工作目录，用资源的绝对路径调用。项目输入/输出也使用绝对路径，不能把技能库误当成被操作的项目。
- 环境依赖：Python 3 (standard library)。本技能不自动安装这些依赖；缺失时先报告具体缺项，使用正文可行的人工流程，不能声称已完成脚本验证。
- 上游脚本在本仓仅做静态核对；使用前审查实际参数、输出位置及外部调用，按用户已授权范围运行。

# App Store Optimization (ASO)

---

## Keyword Research Workflow

Discover and evaluate keywords that drive app store visibility.

### Workflow: Conduct Keyword Research

1. Define target audience and core app functions:
   - Primary use case (what problem does the app solve)
   - Target user demographics
   - Competitive category
2. Generate seed keywords from:
   - App features and benefits
   - User language (not developer terminology)
   - App store autocomplete suggestions
3. Expand keyword list using:
   - Modifiers (free, best, simple)
   - Actions (create, track, organize)
   - Audiences (for students, for teams, for business)
4. Evaluate each keyword:
   - Search volume (estimated monthly searches)
   - Competition (number and quality of ranking apps)
   - Relevance (alignment with app function)
5. Score and prioritize keywords:
   - Primary: Title and keyword field (iOS)
   - Secondary: Subtitle and short description
   - Tertiary: Full description only
6. Map keywords to metadata locations
7. Document keyword strategy for tracking
8. **Validation:** Keywords scored; placement mapped; no competitor brand names included; no plurals in iOS keyword field

### Keyword Evaluation Criteria

| Factor | Weight | High Score Indicators |
|--------|--------|----------------------|
| Relevance | 35% | Describes core app function |
| Volume | 25% | 10,000+ monthly searches |
| Competition | 25% | Top 10 apps have <4.5 avg rating |
| Conversion | 15% | Transactional intent ("best X app") |

### Keyword Placement Priority

| Location | Search Weight |
|----------|---------------|
| App Title | Highest |
| Subtitle (iOS) | High |
| Keyword Field (iOS) | High |
| Short Description (Android) | High |
| Full Description | Medium |

See: [references/keyword-research-guide.md](references/keyword-research-guide.md)

---

## Metadata Optimization Workflow

Optimize app store listing elements for search ranking and conversion.

### Workflow: Optimize App Metadata

1. Audit current metadata against platform limits:
   - Title character count and keyword presence
   - Subtitle/short description usage
   - Keyword field efficiency (iOS)
   - Description keyword density
2. Optimize title following formula:
   ```
   [Brand Name] - [Primary Keyword] [Secondary Keyword]
   ```
3. Write subtitle (iOS) or short description (Android):
   - Focus on primary benefit
   - Include secondary keyword
   - Use action verbs
4. Optimize keyword field (iOS only):
   - Remove duplicates from title
   - Remove plurals (Apple indexes both forms)
   - No spaces after commas
   - Prioritize by score
5. Rewrite full description:
   - Hook paragraph with value proposition
   - Feature bullets with keywords
   - Social proof section
   - Call to action
6. Validate character counts for each field
7. Calculate keyword density (target 2-3% primary)
8. **Validation:** All fields within character limits; primary keyword in title; no keyword stuffing (>5%); natural language preserved

### Platform Character Limits

| Field | Apple App Store | Google Play Store |
|-------|-----------------|-------------------|
| Title | 30 characters | 50 characters |
| Subtitle | 30 characters | N/A |
| Short Description | N/A | 80 characters |
| Keywords | 100 characters | N/A |
| Promotional Text | 170 characters | N/A |
| Full Description | 4,000 characters | 4,000 characters |
| What's New | 4,000 characters | 500 characters |

### Description Structure

```
PARAGRAPH 1: Hook (50-100 words)
├── Address user pain point
├── State main value proposition
└── Include primary keyword

PARAGRAPH 2-3: Features (100-150 words)
├── Top 5 features with benefits
├── Bullet points for scanability
└── Secondary keywords naturally integrated

PARAGRAPH 4: Social Proof (50-75 words)
├── Download count or rating
├── Press mentions or awards
└── Summary of user testimonials

PARAGRAPH 5: Call to Action (25-50 words)
├── Clear next step
└── Reassurance (free trial, no signup)
```

See: [references/platform-requirements.md](references/platform-requirements.md)

---

## Competitor Analysis Workflow

Analyze top competitors to identify keyword gaps and positioning opportunities.

### Workflow: Analyze Competitor ASO Strategy

1. Identify top 10 competitors:
   - Direct competitors (same core function)
   - Indirect competitors (overlapping audience)
   - Category leaders (top downloads)
2. Extract competitor keywords from:
   - App titles and subtitles
   - First 100 words of descriptions
   - Visible metadata patterns
3. Build competitor keyword matrix:
   - Map which keywords each competitor targets
   - Calculate coverage percentage per keyword
4. Identify keyword gaps:
   - Keywords with <40% competitor coverage
   - High volume terms competitors miss
   - Long-tail opportunities
5. Analyze competitor visual assets:
   - Icon design patterns
   - Screenshot messaging and style
   - Video presence and quality
6. Compare ratings and review patterns:
   - Average rating by competitor
   - Common praise themes
   - Common complaint themes
7. Document positioning opportunities
8. **Validation:** 10+ competitors analyzed; keyword matrix complete; gaps identified with volume estimates; visual audit documented

### Competitor Analysis Matrix

| Analysis Area | Data Points |
|---------------|-------------|
| Keywords | Title keywords, description frequency |
| Metadata | Character utilization, keyword density |
| Visuals | Icon style, screenshot count/style |
| Ratings | Average rating, total count, velocity |
| Reviews | Top praise, top complaints |

### Gap Analysis Template

| Opportunity Type | Example | Action |
|------------------|---------|--------|
| Keyword gap | "habit tracker" (40% coverage) | Add to keyword field |
| Feature gap | Competitor lacks widget | Highlight in screenshots |
| Visual gap | No videos in top 5 | Create app preview |
| Messaging gap | None mention "free" | Test free positioning |

---

## App Launch Workflow

Execute a structured launch for maximum initial visibility.

### Workflow: Launch App to Stores

1. Complete pre-launch preparation (4 weeks before):
   - Finalize keywords and metadata
   - Prepare all visual assets
   - Set up analytics (Firebase, Mixpanel)
   - Build press kit and media list
2. Submit for review (2 weeks before):
   - Complete all store requirements
   - Verify compliance with guidelines
   - Prepare launch communications
3. Configure post-launch systems:
   - Set up review monitoring
   - Prepare response templates
   - Configure rating prompt timing
4. Execute launch day:
   - Verify app is live in both stores
   - Announce across all channels
   - Begin review response cycle
5. Monitor initial performance (days 1-7):
   - Track download velocity hourly
   - Monitor reviews and respond within 24 hours
   - Document any issues for quick fixes
6. Conduct 7-day retrospective:
   - Compare performance to projections
   - Identify quick optimization wins
   - Plan first metadata update
7. Schedule first update (2 weeks post-launch)
8. **Validation:** App live in stores; analytics tracking; review responses within 24h; download velocity documented; first update scheduled

### Pre-Launch Checklist

| Category | Items |
|----------|-------|
| Metadata | Title, subtitle, description, keywords |
| Visual Assets | Icon, screenshots (all sizes), video |
| Compliance | Age rating, privacy policy, content rights |
| Technical | App binary, signing certificates |
| Analytics | SDK integration, event tracking |
| Marketing | Press kit, social content, email ready |

### Launch Timing Considerations

| Factor | Recommendation |
|--------|----------------|
| Day of week | Tuesday-Wednesday (avoid weekends) |
| Time of day | Morning in target market timezone |
| Seasonal | Align with relevant category seasons |
| Competition | Avoid major competitor launch dates |

See: [references/aso-best-practices.md](references/aso-best-practices.md)

---

## A/B Testing Workflow

Test metadata and visual elements to improve conversion rates.

### Workflow: Run A/B Test

1. Select test element (prioritize by impact):
   - Icon (highest impact)
   - Screenshot 1 (high impact)
   - Title (high impact)
   - Short description (medium impact)
2. Form hypothesis:
   ```
   If we [change], then [metric] will [improve/increase] by [amount]
   because [rationale].
   ```
3. Create variants:
   - Control: Current version
   - Treatment: Single variable change
4. Calculate required sample size:
   - Baseline conversion rate
   - Minimum detectable effect (usually 5%)
   - Statistical significance (95%)
5. Launch test:
   - Apple: Use Product Page Optimization
   - Android: Use Store Listing Experiments
6. Run test for minimum duration:
   - At least 7 days
   - Until statistical significance reached
7. Analyze results:
   - Compare conversion rates
   - Check statistical significance
   - Document learnings
8. **Validation:** Single variable tested; sample size sufficient; significance reached (95%); results documented; winner implemented

### A/B Test Prioritization

| Element | Conversion Impact | Test Complexity |
|---------|-------------------|-----------------|
| App Icon | 10-25% lift possible | Medium (design needed) |
| Screenshot 1 | 15-35% lift possible | Medium |
| Title | 5-15% lift possible | Low |
| Short Description | 5-10% lift possible | Low |
| Video | 10-20% lift possible | High |

### Sample Size Quick Reference

| Baseline CVR | Impressions Needed (per variant) |
|--------------|----------------------------------|
| 1% | 31,000 |
| 2% | 15,500 |
| 5% | 6,200 |
| 10% | 3,100 |

### Test Documentation Template

```
TEST ID: ASO-2025-001
ELEMENT: App Icon
HYPOTHESIS: A bolder color icon will increase conversion by 10%
START DATE: [Date]
END DATE: [Date]

RESULTS:
├── Control CVR: 4.2%
├── Treatment CVR: 4.8%
├── Lift: +14.3%
├── Significance: 97%
└── Decision: Implement treatment

LEARNINGS:
- Bold colors outperform muted tones in this category
- Apply to screenshot backgrounds for next test
```

---

## Before/After Examples

### Title Optimization

**Productivity App:**

| Version | Title | Analysis |
|---------|-------|----------|
| Before | "MyTasks" | No keywords, brand only (8 chars) |
| After | "MyTasks - Todo List & Planner" | Primary + secondary keywords (29 chars) |

**Fitness App:**

| Version | Title | Analysis |
|---------|-------|----------|
| Before | "FitTrack Pro" | Generic modifier (12 chars) |
| After | "FitTrack: Workout Log & Gym" | Category keywords (27 chars) |

### Subtitle Optimization (iOS)

| Version | Subtitle | Analysis |
|---------|----------|----------|
| Before | "Get Things Done" | Vague, no keywords |
| After | "Daily Task Manager & Planner" | Two keywords, benefit clear |

### Keyword Field Optimization (iOS)

**Before (Inefficient - 89 chars, 8 keywords):**
```
task manager, todo list, productivity app, daily planner, reminder app
```

**After (Optimized - 97 chars, 14 keywords):**
```
task,todo,checklist,reminder,organize,daily,planner,schedule,deadline,goals,habit,widget,sync,team
```

**Improvements:**
- Removed spaces after commas (+8 chars)
- Removed duplicates (task manager → task)
- Removed plurals (reminders → reminder)
- Removed words in title
- Added more relevant keywords

### Description Opening

**Before:**
```
MyTasks is a comprehensive task management solution designed
to help busy professionals organize their daily activities
and boost productivity.
```

**After:**
```
Forget missed deadlines. MyTasks keeps every task, reminder,
and project in one place—so you focus on doing, not remembering.
Trusted by 500,000+ professionals.
```

**Improvements:**
- Leads with user pain point
- Specific benefit (not generic "boost productivity")
- Social proof included
- Keywords natural, not stuffed

### Screenshot Caption Evolution

| Version | Caption | Issue |
|---------|---------|-------|
| Before | "Task List Feature" | Feature-focused, passive |
| Better | "Create Task Lists" | Action verb, but still feature |
| Best | "Never Miss a Deadline" | Benefit-focused, emotional |

---

## Tools and References

### Python modules and real interfaces

这 8 个文件是可导入的 Python 分析模块，**没有命令行入口、参数解析或自动抓取数据的实现**。不要使用 `python module.py --app-id ...`、`--keywords`、`--platform` 等原示例；直接运行文件可能正常退出却不产出分析，退出码 0 不能视为完成。

把本技能目录加入分析进程的 `PYTHONPATH`，从下表模块导入相应类。所有输入来自用户提供或在当前任务内获授权取得的数据；记录来源、采样时间和覆盖范围。未取得的搜索量、竞争数、排名、评分或转化指标应标记缺失，不能用模块默认 0 或内置基准冒充真实观测。

| Module / import | Actual call | Required input |
|---|---|---|
| [scripts.keyword_analyzer](scripts/keyword_analyzer.py): `KeywordAnalyzer` | `KeywordAnalyzer().compare_keywords(keywords_data)` | 用户关键词记录列表：`keyword`、`search_volume`、`competing_apps`、`relevance_score`；模块只按输入估算分数，不查询商店 |
| [scripts.metadata_optimizer](scripts/metadata_optimizer.py): `MetadataOptimizer` | `MetadataOptimizer(platform="apple").validate_character_limits(metadata)` | 用户现有标题、描述等字段字典；平台取 `apple` 或 `google`，不是 `ios` |
| [scripts.competitor_analyzer](scripts/competitor_analyzer.py): `CompetitorAnalyzer` | `CompetitorAnalyzer(category=category, platform="apple").compare_competitors(competitors_data)` | 用户提供的类别及竞品字典列表（`app_name`、`title`、`description`、`rating`、`ratings_count`、`keywords`） |
| [scripts.aso_scorer](scripts/aso_scorer.py): `ASOScorer` | `ASOScorer().calculate_overall_score(metadata, ratings, keyword_performance, conversion)` | 四组已核实的指标字典；先阅读各 `score_*` 的字段/单位要求，缺指标则不生成声称完整的总分 |
| [scripts.ab_test_planner](scripts/ab_test_planner.py): `ABTestPlanner` | `ABTestPlanner().calculate_sample_size(baseline_conversion, relative_mde)` | 当前转化率 0–1、相对最小可检测提升；例如 0.10 表示相对提升 10%，不是 10 个百分点 |
| [scripts.review_analyzer](scripts/review_analyzer.py): `ReviewAnalyzer` | `ReviewAnalyzer(app_name).analyze_sentiment(reviews)` | 用户导出的评论列表，每项含 `text`、`rating`、`date`；无按 App ID 下载评论的功能 |
| [scripts.launch_checklist](scripts/launch_checklist.py): `LaunchChecklistGenerator` | `LaunchChecklistGenerator(platform="apple").generate_prelaunch_checklist(app_info, launch_date)` | 用户应用信息与目标发布日期；平台取 `apple`、`google` 或 `both` |
| [scripts.localization_helper](scripts/localization_helper.py): `LocalizationHelper` | `LocalizationHelper().validate_translations(translated_metadata, target_language, platform="apple")` | 用户提供的目标语言文案；`translate_metadata()` 仅估算长度与给出提示，不执行真实翻译 |

例如，在 `PYTHONPATH` 已包含本技能目录的独立分析进程中，对**用户已有的评论导出**调用真实接口：

```python
import json
import sys
from pathlib import Path
from scripts.review_analyzer import ReviewAnalyzer

# 第一个参数是用户数据文件绝对路径，第二个是已确认的应用名称。
reviews = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
if not isinstance(reviews, list) or not reviews:
    raise ValueError("需要用户提供的非空评论列表")
for review in reviews:
    if not isinstance(review, dict) or not {"text", "rating", "date"} <= review.keys():
        raise ValueError("每条评论需要 text、rating、date")
result = ReviewAnalyzer(sys.argv[2]).analyze_sentiment(reviews)
print(json.dumps(result, ensure_ascii=False, indent=2))
```

模块的情绪词典、评分阈值、平台长度常量与市场建议都是固定快照中的启发式规则。输出必须说明这一点；发布前另行核实当前平台要求，不把静态提示当成商店实时数据、真实翻译或排名保证。

### References

| Document | Content |
|----------|---------|
| [platform-requirements.md](references/platform-requirements.md) | iOS and Android metadata specs, visual asset requirements |
| [aso-best-practices.md](references/aso-best-practices.md) | Optimization strategies, rating management, launch tactics |
| [keyword-research-guide.md](references/keyword-research-guide.md) | Research methodology, evaluation framework, tracking |

### Assets

| Template | Purpose |
|----------|---------|
| [aso-audit-template.md](assets/aso-audit-template.md) | Structured audit checklist for app store listings |

---

## Platform Notes

| Platform / Constraint | Behavior / Impact |
|-----------------------|-------------------|
| iOS keyword changes | Require app submission |
| iOS promotional text | Editable without an app update |
| Android metadata changes | Index in 1-2 hours |
| Android keyword field | None — use description instead |
| Keyword volume data | Estimates only; no official source |
| Competitor data | Public listings only |

**When not to use this skill:** web apps (use web SEO), enterprise/internal apps, TestFlight-only betas, or paid advertising strategy.

---

## Related Skills

| Skill | Integration Point |
|-------|-------------------|
| [conversion-copywriter](../conversion-copywriter/) | App description copywriting |
| [product-launch-strategy](../product-launch-strategy/) | Launch promotion campaigns |
| [product-marketing-gtm-strategy](../product-marketing-gtm-strategy/) | Go-to-market planning |

## Proactive Triggers

- **No keyword optimization in title** → App title is the #1 ranking factor. Include top keyword.
- **Screenshots don't show value** → Screenshots should tell a story, not show UI.
- **No ratings strategy** → Below 4.0 stars kills conversion. Implement in-app rating prompts.
- **Description keyword-stuffed** → Natural language with keywords beats keyword stuffing.

## Output Artifacts

| When you ask for... | You get... |
|---------------------|------------|
| "ASO audit" | Full app store listing audit with prioritized fixes |
| "Keyword research" | Keyword list with search volume and difficulty scores |
| "Optimize my listing" | Rewritten title, subtitle, description, keyword field |

## Communication

All output passes quality verification:
- Self-verify: source attribution, assumption audit, confidence scoring
- Output format: Bottom Line → What (with confidence) → Why → How to Act
- Results only. Every finding tagged: 🟢 verified, 🟡 medium, 🔴 assumed.
