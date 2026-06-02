---
name: data-scraper-agent-builder
title: 自动化数据采集 Agent 构建（定时抓取 + LLM 结构化）
description: 当需要为公开数据源（招聘/价格/新闻/GitHub/赛事等）搭一个定时抓取、用免费 LLM 打分结构化、写入 Notion/Sheets/Supabase 并从反馈学习的自动化 Agent 时使用；做"采集→丰富→存储"三层流水线脚手架与可跑代码，免费跑在 GitHub Actions；不适用于需登录/付费墙/违反 robots.txt 的私有数据、一次性手动抓取、纯入库后查询。触发词：定时抓取、监控网站、数据采集机器人、Gemini 结构化、GitHub Actions 爬虫、价格/职位监控
domain: 数据/wrangling
triggers: [定时抓取, 监控网站, 数据采集, 采集机器人, 爬虫 Agent, Gemini, LLM 打分, GitHub Actions 定时, cron 抓取, 价格监控, 职位监控, 新闻监控, Notion 同步, BeautifulSoup, Playwright 抓取, RSS 采集]
tags: [data, wrangling, scraping, automation, llm-enrichment, gemini, github-actions, notion, cron, feedback-loop]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, requests, beautifulsoup4, lxml, playwright, gemini-flash, github-actions, notion-client, pyyaml]
requires: []
related: [browser-automation-builder, firecrawl-web-scraper, apify-ecommerce-scraper, data-pipeline-engineer]
combines_with: [regex-vs-llm-structured-text, cost-aware-llm-pipeline, csv-data-cleaner]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# 自动化数据采集 Agent 构建（定时抓取 + LLM 结构化）

为任意公开数据源（招聘、价格、新闻、GitHub、赛事、房源等）搭一个生产可用的自动化采集 Agent：按计划抓取 → 用免费 LLM 打分/结构化 → 写入数据库 → 从用户反馈持续改进。技术栈全免费：**Python · Gemini Flash · GitHub Actions · Notion / Sheets / Supabase**。

核心心智模型是三层流水线：

```
采集 COLLECT → 丰富 ENRICH → 存储 STORE
  抓取器          LLM 打分/        Notion /
  按 cron 跑      摘要/分类        Sheets / Supabase
```

## 何时使用

适用：
- 要抓取/监控任意公开网站或 API，并**周期性**自动跑（每小时/每天/每周）。
- 用户说"做个机器人盯着 X""帮我监控…""定时从…采集数据"。
- 跟踪职位、价格、新闻、仓库、比分、活动、房源等公开列表，且希望 LLM 对结果打分/摘要/分类。
- 想要零托管成本（跑在 GitHub Actions 免费额度内）、并能随用户决策越用越准的 Agent。

不该用（命中任一应转其他技能或先澄清）：
- 数据在**登录态/付费墙/私有 API** 后，或抓取会违反目标站 `robots.txt`/服务条款 —— 不要硬抓，优先找官方公开 API 或停下来确认合规。
- 只需**一次性手动**抓一份数据，不需要调度与流水线 —— 直接用抓取脚本即可。
- 数据已入库，只是要查询/连接/聚合 —— 转 `sql-query-builder`。
- 拿到 CSV 只做清洗去重 —— 转 `csv-data-cleaner`。

## 步骤

1. **明确目标**（先问清，别替用户假设）：采集哪个源（URL/API/RSS）？提取哪些字段（标题/价格/URL/日期/分数）？存哪里（Notion/Sheets/Supabase/本地）？要 LLM 做什么（打分/摘要/分类/匹配）？多久跑一次？
2. **生成项目骨架**（见下方目录结构）：`config.yaml` 装所有用户可调项，`profile/context.md` 装喂给 LLM 的用户上下文，源/AI/存储分层。
3. **写抓取器**（`scraper/sources/*.py`，一源一文件）：每条 item 至少含 `name/url/date_found` 的统一 schema；先过规则预筛 `filters.py` 再交给 LLM。
4. **写 Gemini 客户端**（`ai/client.py`）：带 429 自动回退的 4 模型 fallback 链 + 全局节流。
5. **写 AI 批处理管道**（`ai/pipeline.py`）：**绝不逐条调 LLM**，按 `batch_size`（≤5）批量打分，输出结构化 JSON。
6. **写反馈学习**（`ai/memory.py`）：把用户"已采纳/已拒绝"沉淀进 `data/feedback.json`，作为下次打分的偏好提示。
7. **写存储同步**（`storage/notion_sync.py` 等）：**入库前按 URL 去重**。
8. **编排** `scraper/main.py`：采集→去重→（有 key 才）LLM 丰富→同步。
9. **配 GitHub Actions**（`.github/workflows/scraper.yml`）：cron 调度 + 手动触发 + 跑后提交 `feedback.json`。
10. **过质量清单**（见末尾）后交付，附 README（<5 分钟上手、所需 secrets、如何自定义）。

### 目录结构

```
my-agent/
├── config.yaml              # 用户自定义（关键词/过滤/偏好），改这里不改代码
├── profile/context.md       # 喂给 AI 的用户上下文（简历/兴趣/标准）
├── scraper/
│   ├── main.py              # 协调器：抓取 → 丰富 → 存储
│   ├── filters.py           # 规则预筛（快，在 AI 之前）
│   └── sources/*.py         # 每个数据源一个文件
├── ai/
│   ├── client.py            # Gemini REST 客户端 + 模型回退
│   ├── pipeline.py          # 批量 AI 分析
│   └── memory.py            # 从反馈学习
├── storage/notion_sync.py   # 或 sheets_sync.py / supabase_sync.py
├── data/feedback.json       # 决策历史（自动更新）
├── setup.py / enrich_existing.py / requirements.txt / .env.example
└── .github/workflows/scraper.yml
```

### 免费技术栈选型

| 层 | 工具 | 选它的原因 |
|---|---|---|
| 抓取 | `requests` + `BeautifulSoup` | 零成本，覆盖约 80% 公开站 |
| JS 渲染站 | `playwright` | HTML 抓不到时再上 |
| AI 丰富 | Gemini Flash（REST） | 免费额度高、快 |
| 存储 | Notion API | 免费层 + 适合人工复核的 UI |
| 调度 | GitHub Actions cron | 公开仓库免费 |
| 学习 | 仓库内 JSON 反馈文件 | 零基础设施，随 git 持久化 |

## 指令

**Gemini 模型回退链**（配额耗尽自动降级）：`gemini-2.0-flash-lite (30 RPM) → gemini-2.0-flash (15 RPM) → gemini-2.5-flash (10 RPM) → gemini-flash-lite-latest`。

**批量调用而非逐条**（保命要点，否则秒触限流）：
```python
# 坏：33 条 → 33 次调用，立刻限流
for item in items: call_ai(item)
# 好：33 条 → 7 次调用（batch_size=5），稳在免费额度内
for batch in chunks(items, size=5): call_ai(batch)
```

**Gemini 客户端要点**（`ai/client.py`）：全局 `_last_call` 节流到 `rate_limit` 秒；遇 429/404 `sleep(1)` 后切下一个模型；`generationConfig` 必须 `responseMimeType=application/json`、`maxOutputTokens≥2048`（批量响应否则 JSON 被截断解析失败）；返回文本若被 ```` ``` ```` 包裹要剥壳再 `json.loads`。

**批处理打分提示词骨架**（`pipeline.py` → `_build_prompt`）：拼入 items（剔除下划线开头的内部字段）+ 用户 context（截 800 字）+ priorities + 反馈偏好段，要求返回 `{"analyses": [{"score": <0-100>, "summary": "<两句>", "notes": "<为何匹配>"}, ...]}`，并约定 `90+=极佳 / 70-89=好 / 50-69=一般 / <50=弱`。

**反馈学习**（`memory.py`）：`build_preference_prompt()` 把 `feedback.json` 的 positive/negative 历史（各取最近 15 条）转成"用户喜欢/拒绝过这些"的提示偏置段，注入下次打分。每次跑完由独立的 feedback 同步脚本查存储里带正/负状态的条目，调 `save_feedback()` 回写。

**GitHub Actions**：
```yaml
on:
  schedule: [{ cron: "0 */3 * * *" }]   # 每 3 小时，按需调
  workflow_dispatch:                     # 允许手动触发
permissions: { contents: write }         # 提交 feedback.json 需要
# 步骤：checkout → setup-python(3.11,cache:pip) → pip install -r requirements.txt
#   →（启用 Playwright 时）python -m playwright install chromium --with-deps
#   → 用 secrets(NOTION_TOKEN/NOTION_DATABASE_ID/GEMINI_API_KEY) 跑 python -m scraper.main
#   → git add data/feedback.json && 有变更则 commit && push
```

**config.yaml**（用户只改这里）：`filters.required_keywords/blocked_keywords`、`priorities`、`storage.provider`（notion|sheets|supabase|sqlite）、`feedback.positive_statuses/negative_statuses`、`ai.{model,min_score,rate_limit_seconds:7,batch_size:5}`。

## 示例

抓取器模板（REST/HTML/RSS 三选一，输出统一 schema）：
```python
# scraper/sources/my_source.py
import requests
from datetime import datetime, timezone
from scraper.filters import is_relevant

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; research-bot/1.0)"}

def fetch() -> list[dict]:
    results = []
    resp = requests.get("https://api.example.com/items", headers=HEADERS, timeout=15)
    if resp.status_code == 200:
        for item in resp.json().get("results", []):
            if is_relevant(item.get("title", "")):
                results.append(_normalise(item))
    return results

def _normalise(raw: dict) -> dict:
    return {
        "name": raw.get("title", ""),
        "url": raw.get("link", ""),
        "source": "MySource",
        "date_found": datetime.now(timezone.utc).date().isoformat(),
    }
```

常见抓取模式：
```python
# HTML：soup = BeautifulSoup(resp.text, "lxml"); soup.select("[class*='listing']")
# RSS：ET.fromstring(resp.text); root.findall(".//item") → findtext("title"/"link")
# 分页：while True: get(params={"page":page,"limit":50}); 无结果/无 has_more 则 break
# JS 渲染：playwright 起 chromium → goto → wait_for_selector → page.content() 再喂 BeautifulSoup
```

存储去重（Notion）：`get_existing_urls(db_id)` 翻页拉全部已存 URL；`sync()` 遍历 items，URL 已存在则 skip，否则 `push_item()` 写入 Name/URL/Source/Date Found/Status 及 AI Score/Summary/Notes（rich_text 截 2000 字）。

委托提示词（给 Agent 调用本技能时）：
> 为我做一个监控 Hacker News 上"AI 初创融资"新闻的采集 Agent：每 3 小时跑一次（GitHub Actions），抓标题+链接+时间，用 Gemini Flash 按"是否融资相关"0-100 打分并两句摘要，分数≥60 的写入 Notion，去重按 URL，配置走 config.yaml，密钥走 GitHub Secrets。

真实用例：监控 3 家电商价格降价提醒；追踪打 `llm`/`agents` 标签的新 GitHub 仓库并逐个摘要；把 LinkedIn 职位收进 Notion 并按简历评分；每日抓 arXiv 指定主题新论文；体育赛果同步进 Google Sheets。

## 注意事项

- **合规优先**：尊重 `robots.txt` 与服务条款，能用官方公开 API 就别硬抓 HTML；登录态/付费墙数据不在本技能范围。
- **限流自保**：请求间 `time.sleep(1)` 防 IP 封禁；LLM 调用全局节流到 `rate_limit` 秒；逐条调 LLM 是头号反模式，务必批量（batch ≤ 5）。
- **去重必做**：每次入库前按 URL 去重，否则重复行堆积。
- **密钥安全**：绝不写进代码，一律走 `.env` + GitHub Secrets，`.env` 进 `.gitignore`，提供 `.env.example`。
- **JSON 截断**：`maxOutputTokens` 给 2048+，否则批量响应被截、解析失败。
- **JS 渲染坑**：用 `requests` 抓到空响应时，改用 Playwright 或找底层 API，别死磕。
- **配置外置**：关键词/过滤/偏好全进 `config.yaml`，硬编码进代码就不可复用。
- 免费额度参考：Gemini Flash-Lite 30 RPM/1500 RPD、2.5 Flash 10 RPM/500 RPD（省着用）；GitHub Actions 公开仓库无限（约 20 分钟/天）；Notion API 约 200 写/天足够；Supabase 500MB DB。
- 交付前过**质量清单**：config 控所有可调项无硬编码 / 入库前 URL 去重 / Gemini 4 模型回退链 / batch≤5 / maxOutputTokens≥2048 / `.env` 已忽略且有 example / `setup.py` 首跑建 schema / `enrich_existing.py` 回填旧行分数 / Actions 跑后提交 feedback.json / README 覆盖上手与自定义。

## 互见

- requires：无。
- related：`csv-data-cleaner`（抓回的脏数据落地前清洗）、`sql-query-builder`（数据入库后改用它查询/聚合）、`jq-json-processing`（处理抓回的 JSON）、`regex-vs-llm-structured-text`（抉择用正则还是 LLM 做结构化抽取）。
- combines_with：`ci-cd-pipeline-builder`（GitHub Actions 定时调度落地）、`playwright-e2e-testing`（JS 渲染站的浏览器抓取）、`prompt-template-designer`（设计 LLM 打分/分类提示词）、`data-pipeline-engineer`（规模化后升级为正式数据管道）。

---

采编自 affaan-m/everything-claude-code（MIT 许可证）。
