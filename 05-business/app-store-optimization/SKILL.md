---
name: app-store-optimization
title: App Store Optimization (ASO)
description: Use when improving an iOS/Android app's store search ranking and download conversion: keyword research and scoring, metadata optimization, competitor gap analysis, A/B testing, and launch checklists — producing actionable title/subtitle/description/keyword-field rewrites and test
domain: 商业/growth
triggers: [ASO, app store optimization, app store ranking, app keywords, app metadata, play store optimization, app store listing, improve app rankings, app visibility, app store SEO, mobile app marketing, app conversion rate]
tags: [aso, growth, ios, android, keyword-research, metadata, competitor-analysis, a/b-testing, mobile-marketing, business]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [seo-audit, seo-content-writer, conversion-rate-optimizer, product-launch-strategy]
combines_with: [product-launch-strategy, conversion-rate-optimizer, paid-ads-strategist]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use this skill to improve **search visibility** and **download conversion** for a mobile app on the Apple App Store or Google Play. Typical jobs: research and score keywords, optimize store-listing metadata, analyze competitor ASO strategy, plan a launch, run A/B tests to lift conversion, and track ranking changes.

When **not** to use:
- **Web apps** -> use web SEO, not ASO.
- **Enterprise / internal-distribution apps, TestFlight-only betas** -> they do not surface in public store search, so ASO has minimal return.
- **Pure paid acquisition** (ASA / UAC ad-bidding strategy) -> that is media buying, out of scope here.

## Steps

ASO comprises five workflows that can each run independently. Pull in whichever you need.

### 1. Keyword Research

1. Define target audience and core app functions: primary use case (what problem the app solves), target demographics, competitive category.
2. Generate seed keywords from: app features and benefits, user language (not developer terminology), app store autocomplete suggestions.
3. Expand the list with modifiers (free, best, simple), actions (create, track, organize), and audiences (for students, for teams, for business).
4. Evaluate each keyword: search volume (estimated monthly searches), competition (number and quality of ranking apps), relevance (alignment with app function).
5. Score and prioritize placement — Primary: title and keyword field (iOS); Secondary: subtitle and short description; Tertiary: full description only.
6. Map keywords to metadata locations and document the strategy for tracking.
7. **Validation:** keywords scored; placement mapped; no competitor brand names included; no plurals in the iOS keyword field.

**Evaluation criteria (weights):**

| Factor | Weight | High Score Indicators |
|--------|--------|----------------------|
| Relevance | 35% | Describes core app function |
| Volume | 25% | 10,000+ monthly searches |
| Competition | 25% | Top 10 apps have <4.5 avg rating |
| Conversion | 15% | Transactional intent ("best X app") |

**Placement priority:** App Title (highest) > Subtitle (iOS) / Keyword Field (iOS) / Short Description (Android) (high) > Full Description (medium).

### 2. Metadata Optimization

1. Audit current metadata against platform limits: title character count and keyword presence, subtitle/short-description usage, keyword-field efficiency (iOS), description keyword density.
2. Optimize the title with the formula: `[Brand Name] - [Primary Keyword] [Secondary Keyword]`.
3. Write the subtitle (iOS) or short description (Android): focus on primary benefit, include a secondary keyword, use action verbs.
4. Optimize the keyword field (iOS only): remove duplicates already in the title, remove plurals (Apple indexes both forms), no spaces after commas, prioritize by score.
5. Rewrite the full description: hook paragraph (value proposition) -> feature bullets with keywords -> social proof -> call to action.
6. Validate character counts per field; target 2-3% primary keyword density.
7. **Validation:** all fields within character limits; primary keyword in title; no keyword stuffing (>5%); natural language preserved.

**Description structure:**
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

### 3. Competitor Analysis

1. Identify the top 10 competitors: direct (same core function), indirect (overlapping audience), category leaders (top downloads).
2. Extract competitor keywords from titles/subtitles and the first 100 words of descriptions.
3. Build a competitor keyword matrix and calculate coverage percentage per keyword.
4. Identify gaps: keywords with <40% competitor coverage, high-volume terms competitors miss, long-tail opportunities.
5. Audit visual assets (icon, screenshots, video) and compare ratings plus common praise/complaint themes.
6. Document positioning opportunities.
7. **Validation:** 10+ competitors analyzed; keyword matrix complete; gaps identified with volume estimates; visual audit documented.

**Gap analysis template:**

| Opportunity Type | Example | Action |
|------------------|---------|--------|
| Keyword gap | "habit tracker" (40% coverage) | Add to keyword field |
| Feature gap | Competitor lacks widget | Highlight in screenshots |
| Visual gap | No videos in top 5 | Create app preview |
| Messaging gap | None mention "free" | Test free positioning |

### 4. App Launch

Finalize metadata and visual assets, set up analytics (Firebase/Mixpanel), and build the press kit **4 weeks before**. Submit for review and run a compliance check **2 weeks before**. Configure review monitoring and response templates. On launch day, verify the app is live in both stores and announce across all channels. **Days 1-7:** track download velocity hourly, respond to reviews within 24h. Run a **7-day retrospective** and schedule the first metadata update for 2 weeks post-launch.

**Launch timing:** ship Tuesday-Wednesday (avoid weekends), in the morning of the target-market timezone, aligned with relevant seasons, and away from major competitor launch dates.

### 5. A/B Testing

1. Select the test element by impact: Icon (highest) > Screenshot 1 > Title > Short Description.
2. Form a hypothesis: `If we [change], then [metric] will [improve] by [amount] because [rationale].`
3. Create variants: Control (current) vs. Treatment (single-variable change).
4. Calculate required sample size from baseline conversion rate, minimum detectable effect (usually 5%), and 95% significance.
5. Launch: Apple -> Product Page Optimization; Android -> Store Listing Experiments.
6. Run at least 7 days until statistical significance is reached.
7. **Validation:** single variable tested; sample size sufficient; significance reached (95%); results documented; winner implemented.

## Example

**iOS keyword field (core rewrite technique):**

Before (inefficient — 89 chars, 8 keywords):
```
task manager, todo list, productivity app, daily planner, reminder app
```
After (optimized — 97 chars, 14 keywords):
```
task,todo,checklist,reminder,organize,daily,planner,schedule,deadline,goals,habit,widget,sync,team
```
Improvements: removed spaces after commas (+8 chars), removed duplicates (task manager -> task), removed plurals (reminders -> reminder), removed words already in the title, added more relevant keywords.

**Title:** `MyTasks` (brand only, 8 chars) -> `MyTasks - Todo List & Planner` (primary + secondary keywords, 29 chars).

**Description opening:**

Before:
```
MyTasks is a comprehensive task management solution designed
to help busy professionals organize their daily activities
and boost productivity.
```
After:
```
Forget missed deadlines. MyTasks keeps every task, reminder,
and project in one place—so you focus on doing, not remembering.
Trusted by 500,000+ professionals.
```
Improvements: leads with the user pain point, gives a specific benefit (not generic "boost productivity"), includes social proof, keeps keywords natural rather than stuffed.

**Screenshot caption evolution:** `Task List Feature` (feature-focused, passive) -> `Create Task Lists` (action verb) -> `Never Miss a Deadline` (benefit-focused, emotional = best).

## Notes

**Helper scripts** (all Python, invoke as needed):

| Script | Purpose | Usage |
|--------|---------|-------|
| keyword_analyzer.py | Analyze keywords for volume and competition | `python keyword_analyzer.py --keywords "todo,task,planner"` |
| metadata_optimizer.py | Validate character limits and density | `python metadata_optimizer.py --platform ios --title "App Title"` |
| competitor_analyzer.py | Extract and compare competitor keywords | `python competitor_analyzer.py --competitors "App1,App2,App3"` |
| aso_scorer.py | Calculate overall ASO health score | `python aso_scorer.py --app-id com.example.app` |
| ab_test_planner.py | Plan tests and calculate sample sizes | `python ab_test_planner.py --cvr 0.05 --lift 0.10` |
| review_analyzer.py | Analyze review sentiment and themes | `python review_analyzer.py --app-id com.example.app` |
| launch_checklist.py | Generate platform-specific launch checklists | `python launch_checklist.py --platform ios` |
| localization_helper.py | Manage multi-language metadata | `python localization_helper.py --locales "en,es,de,ja"` |

**Platform character limits (hard constraints — always respect):**

| Field | Apple App Store | Google Play |
|-------|-----------------|-------------|
| Title | 30 | 50 |
| Subtitle | 30 | N/A |
| Short Description | N/A | 80 |
| Keywords | 100 | N/A |
| Promotional Text | 170 | N/A |
| Full Description | 4,000 | 4,000 |
| What's New | 4,000 | 500 |

**A/B sample-size quick reference** (impressions needed per variant): 1% baseline CVR -> 31,000; 2% -> 15,500; 5% -> 6,200; 10% -> 3,100.

**Platform behavior differences:**
- iOS keyword changes require an app re-submission; iOS promotional text can be edited without an app update.
- Android metadata changes re-index within 1-2 hours; Android has no separate keyword field, so the description carries keywords.
- Search-volume data is estimated only (no official source); competitor data comes from public listings only.

**Proactive triggers (fix on sight):**
- No keyword in the title -> the title is the #1 ranking factor; place the top keyword there.
- Screenshots only show UI -> screenshots should tell a value story, not stack interfaces.
- No ratings strategy -> below 4.0 stars severely suppresses conversion; add in-app rating prompts.
- Keyword-stuffed description -> natural language with keywords beats stuffing (keep density under 5%).

**Output requirement:** tag every finding with a confidence level (🟢 verified / 🟡 medium / 🔴 assumed) and organize as Bottom Line -> What (with confidence) -> Why -> How to Act.

## See also

- **content-creator** — app description copywriting.
- **marketing-demand-acquisition** — launch promotion and media-buying campaigns.
- **marketing-strategy-pmm** — go-to-market / GTM planning.
- Related: seo-audit, seo-content-writer, conversion-rate-optimizer, product-launch-strategy. Combines with: product-launch-strategy, conversion-rate-optimizer, paid-ads-strategist.

---
Adapted from alirezarezvani/claude-skills (MIT License).
