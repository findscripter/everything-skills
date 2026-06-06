---
name: defuddle-web-extract
title: Defuddle Web Content Extraction to Markdown
description: Use the Defuddle CLI to extract clean, clutter-free article content from a web page URL as Markdown (with metadata), saving tokens versus fetching the full page; not for login/paywall/heavy-JS pages. Triggers: Defuddle, URL to Markdown, extract web page body, summarize this link.
domain: 平台/browser
triggers: [read web page URL, extract web page content, convert web page to Markdown, summarize this link, Defuddle, token-efficient content scraping]
tags: [web-extraction, markdown, cli, content-cleaning, token-optimization, defuddle]
level: beginner
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [firecrawl-web-scraper, exa-semantic-search, browser-automation-builder, youtube-transcript-ingest]
combines_with: [exa-semantic-search, rag-implementation-workflow]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use the Defuddle CLI to extract clean, readable content from web pages. Prefer it over WebFetch for standard web pages — it removes navigation, ads, and clutter, reducing token usage.

- Use when the user provides a normal webpage URL to read, summarize, or analyze.
- Prefer it over noisy page-fetch approaches when token efficiency matters.
- Use for docs, articles, blog posts, and similar public web content.

Do not use when:
- The page requires login, sits behind a paywall, relies on heavy JavaScript rendering, or has anti-scraping — Defuddle may fail to retrieve the content.
- You need to scrape specific page structure precisely, interact with forms, click through pagination, or take screenshots — use a browser-automation tool instead.
- Required inputs (URL, permissions, success criteria) are missing — stop and ask for clarification rather than scraping blindly.

## Steps

1. Confirm Defuddle is installed; if not, install it globally: `npm install -g defuddle`.
2. Extract the body with `defuddle parse <url> --md` — always pass `--md` for Markdown output.
3. For long content, write to disk with `-o`, then read and process it in chunks.
4. When you only need metadata (title/description/domain), fetch it individually with `-p <name>` instead of pulling the full text.

```bash
# Install (first time only)
npm install -g defuddle

# Extract content as Markdown (default and recommended)
defuddle parse <url> --md

# Save to a file
defuddle parse <url> --md -o content.md

# Extract a single metadata property
defuddle parse <url> -p title
defuddle parse <url> -p description
defuddle parse <url> -p domain
```

Output formats:

| Flag | Format |
|------|--------|
| `--md` | Markdown (default choice) |
| `--json` | JSON with both HTML and markdown |
| (none) | HTML |
| `-p <name>` | Specific metadata property |

## Example

Summarize a blog post:

```bash
defuddle parse https://example.com/blog/post --md -o post.md
```

Then read `post.md` and summarize from the clean body, rather than feeding the full page HTML to the model.

## Notes

- Always prefer `--md`; use `--json` only when you need structured processing, and raw HTML only when you need the original structure.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review; confirm important conclusions manually.
- Use this skill only when the task clearly matches the scope above. On a login wall or a dynamic-page failure, fall back to WebFetch or a browser tool.

## See also

- WebFetch: the fallback when Defuddle cannot retrieve content (login / dynamic rendering).
- Browser automation (chrome-devtools tools): use when you need interaction, clicks, screenshots, or scraping specific DOM.
- firecrawl-web-scraper, exa-semantic-search, browser-automation-builder, youtube-transcript-ingest (related); combines with exa-semantic-search and rag-implementation-workflow.
