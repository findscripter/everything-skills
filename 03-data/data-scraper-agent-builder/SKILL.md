---
name: data-scraper-agent-builder
title: データスクレイパーエージェント
description: 任意のパブリックソース（ジョブボード、価格、ニュース、GitHub、スポーツなど）用の完全自動化されたAI搭載データ収集エージェントを構築します。スケジュールでスクレイプし、無料LLM（Gemini Flash）でデータを豊かにし、Notion/Sheets/Supabaseに結果を保存し、ユーザーフィードバックから学習します。GitHub Actions上で100％無料で実行。ユーザーがパブリックデータを自動的に監視、収集、または追跡したい場合に使用します。
domain: 数据/wrangling
triggers: [Gemini, BeautifulSoup]
tags: [data, wrangling, scraping, automation, llm-enrichment, gemini, github-actions, notion, cron, feedback-loop]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [browser-automation-builder, firecrawl-web-scraper, apify-ecommerce-scraper, data-pipeline-engineer]
combines_with: [regex-vs-llm-structured-text, cost-aware-llm-pipeline, csv-data-cleaner]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# Data Scraper Agent

Build a production-ready, AI-powered data collection agent for any public data source.
It runs on a schedule, enriches results with a free LLM, stores the data in a database, and improves over time.

**Stack: Python · Gemini Flash (free) · GitHub Actions (free) · Notion / Sheets / Supabase**

## When to Activate

- The user wants to scrape or monitor any public website or API
- The user says "build a bot to check," "monitor X," or "collect data"
- The user wants to track jobs, prices, news, repos, sports scores, events, or listings
- The user asks how to automate data collection without paying for hosting
- The user wants an agent that gets smarter over time based on decisions

## Core Concepts

### The Three Layers

Every data scraper agent has three layers:

```
COLLECT → ENRICH → STORE
  │           │        │
Scraper    AI (LLM)  Database
runs on    scores/   Notion /
schedule   summarises Sheets /
           & classifies Supabase
```

### The Free Stack

| Layer | Tool | Why |
|---|---|---|
| COLLECT | Playwright/BeautifulSoup | Free, open-source scraping |
| ENRICH | Gemini Flash | Free, fast LLM |
| STORE | Supabase / Sheets | Free database and spreadsheet |
| SCHEDULE | GitHub Actions | Free cron jobs |

## Workflow

1. **Define the source** — where to scrape from and what to extract
2. **Build the scraper** — a BeautifulSoup- or Playwright-based collector
3. **Configure the LLM** — score/summarize/classify text with Gemini Flash
4. **Set up storage** — Notion, Sheets, or Supabase
5. **Configure GitHub Actions** — a schedule that runs daily/weekly
6. **Add a feedback loop** — learn from the user's decisions

## Examples

- Job board monitoring: new postings
