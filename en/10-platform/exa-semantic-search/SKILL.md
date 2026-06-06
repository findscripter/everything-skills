---
name: exa-semantic-search
title: exa-search
description: Semantic search, similar content discovery, and structured research using Exa API. Use when you need semantic/embeddings-based search, finding similar content, or searching by category (company, people, research papers, etc.).
domain: 平台/integration
triggers: [Exa]
tags: [misc, exa]
level: beginner
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [firecrawl-web-scraper, defuddle-web-extract, hybrid-search-retrieval, apify-ecommerce-scraper]
combines_with: [rag-implementation-workflow, defuddle-web-extract]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# exa-search

## Overview
Semantic search, similar content discovery, and structured research using Exa API

## When to Use
- When you need semantic/embeddings-based search
- When finding similar content
- When searching by category (company, people, research papers, etc.)

## Installation
```bash
npx skills add -g BenedictKing/exa-search
```

## Step-by-Step Guide
1. Install the skill using the command above
2. Configure Exa API key
3. Use naturally in Claude Code conversations

## Examples
See [GitHub Repository](https://github.com/BenedictKing/exa-search) for examples.

## Best Practices
- Configure API keys via environment variables

## Troubleshooting
See the GitHub repository for troubleshooting guides.

## Related Skills
- context7-auto-research, tavily-web, firecrawl-scraper, codex-review

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
