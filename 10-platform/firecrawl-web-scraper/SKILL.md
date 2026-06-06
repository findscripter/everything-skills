---
name: firecrawl-web-scraper
title: firecrawl-scraper
description: Deep web scraping, screenshots, PDF parsing, and website crawling using Firecrawl API. Use when you need deep content extraction from web pages, page interaction is required (clicking, scrolling, etc.), or you want screenshots or PDF parsing.
domain: 平台/browser
triggers: [Firecrawl]
tags: [web-scraping, firecrawl, crawl, screenshot, pdf-parsing]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [browser-automation-builder, apify-ecommerce-scraper, defuddle-web-extract, exa-semantic-search]
combines_with: [rag-implementation-workflow, csv-data-cleaner]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# firecrawl-scraper

## Overview
Deep web scraping, screenshots, PDF parsing, and website crawling using Firecrawl API

## When to Use
- When you need deep content extraction from web pages
- When page interaction is required (clicking, scrolling, etc.)
- When you want screenshots or PDF parsing
- When batch scraping multiple URLs

## Installation
```bash
npx skills add -g BenedictKing/firecrawl-scraper
```

## Step-by-Step Guide
1. Install the skill using the command above
2. Configure Firecrawl API key
3. Use naturally in Claude Code conversations

## Examples
See [GitHub Repository](https://github.com/BenedictKing/firecrawl-scraper) for examples.

## Best Practices
- Configure API keys via environment variables

## Troubleshooting
See the GitHub repository for troubleshooting guides.

## Related Skills
- context7-auto-research, tavily-web, exa-search, codex-review

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
