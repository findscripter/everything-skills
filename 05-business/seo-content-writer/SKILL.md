---
name: seo-content-writer
title: SEO Content Writer
description: Use when writing or optimizing on-page content around a keyword that must rank in search engines, be quotable by generative engines (AI Overviews / ChatGPT), and stay genuinely useful for humans; covers title, structure, E-E-A-T, internal links, and metadata. Triggers: write SEO 
domain: 商业/seo
triggers: [write SEO content, create blog post, SEO copywriting, write me a blog post about, help me write about this keyword, optimize this article for search, make this content GEO friendly, write SEO-friendly content, target keyword, content optimization]
tags: [seo, content, marketing, writing]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: [fact-checking]
related: [content-strategy-planner, ai-search-seo, content-engine-strategist, seo-audit]
combines_with: [content-strategy-planner, schema-markup-builder, ai-search-seo]
license: CC-BY-SA-4.0
source: 
source_license: 
---
SEO Content Writer creates on-page content that aligns with search intent, integrates keywords naturally, earns featured-snippet and AI-citation slots, and stays usable for real readers.

## When to use

- You need to produce content around one keyword (or a keyword cluster) that can be indexed by search engines, cited by generative engines (Google AI Overviews, ChatGPT, Perplexity), and is genuinely worth reading for a human.
- You have existing content that needs SEO/GEO optimization: rewrite the title, restructure headings, add E-E-A-T signals, and lay out internal links.
- Triggers: write SEO content, create blog post, target keyword, search ranking, GEO, content optimization.

Boundaries (do NOT use this skill for):

- Keyword difficulty / search-volume scraping or off-page link building — this skill only covers on-page content writing.
- Technical SEO (sitemaps, robots.txt, Core Web Vitals, deploying structured schema).
- Fact-checking — hand any statistic, price, ranking, or "studies show" claim to the `fact-checking` skill; this skill does not vouch for facts itself.
- Pure brand copy, ad slogans, or content not aimed at organic search.

## Steps

Inputs: `primary_keyword`, optional `secondary_keywords[]`, `search_intent` (informational / navigational / commercial / transactional), `audience`, `existing_url` (optimization case).

When a user requests SEO content, run these nine steps:

1. **Gather requirements** — confirm primary and secondary keywords, word count, content type, target audience, search intent, tone, CTA goal, and competitor URLs. If `search_intent` is not given, infer it from keyword semantics and label it at the top of the output.

2. **Load CORE-EEAT constraints** — apply these high-weight items while writing:

| ID | Standard | How to apply |
|----|----------|--------------|
| C01 | Intent alignment | Title promise matches the delivery |
| C02 | Direct answer | Core answer appears in the first 150 words |
| C03 | Query coverage | Cover at least 3 query variants or follow-up questions |
| C06 | Audience targeting | State who the content is for in the intro |
| C10 | Semantic closure | Conclusion resolves the opening question and gives a next step |
| O01 | Heading hierarchy | Clean H1 -> H2 -> H3 structure |
| O02 | Summary box | Include a TL;DR / key-takeaways block near the top |
| O06 | Section chunking | 3-5 sentence paragraphs, one topic per section |
| O08 | Anchor navigation | Add a TOC when the draft has 3+ H2 sections |
| O09 | Information density | Remove filler |
| R01 | Data precision | Include precise numbers with units when the topic supports it |
| R02 | Citation density | At least 1 external citation per 500 words |
| R04 | Evidence-claim mapping | Every material claim has evidence, an example, or a citation |
| R07 | Entity precision | Use full names for people and organizations |
| E07 | Practical tools | Add at least 1 template, checklist, calculator, or worksheet when relevant |

3. **Research and plan** — map SERP format and average depth; map primary / secondary / related / question keywords; choose a unique angle that solves one specific problem instead of a generic overview.

4. **Create an optimized title** — provide 2-3 options, each with length, keyword position, and why it works. Keyword-led, intent-matched, target 50-60 characters (50-55 on mobile-heavy pages).

5. **Write the meta description** — one recommended description with the primary keyword, value proposition, and CTA, 150-160 characters.

6. **Structure and write** — H1 with the primary keyword (<=60 chars, inverted-pyramid; lead with the most important info) > intro (hook + promise + keyword in the first 100 words, with an answer-first sentence of 40-60 words) > H2 sections matching intent (question or task-style phrasing, one sub-topic each) > H3 sub-topics > FAQ for snippet opportunities > conclusion with recap + CTA. Add quotable atomic units: definition sentences, bullet lists, comparison tables, step lists, FAQ; give a TL;DR box for complex topics.

7. **Apply on-page best practices** — primary keyword in title, H1, intro, at least one H2, and conclusion; secondary keywords distributed naturally across H2/H3 and body (single-keyword density <= 2-3%, never stuff); 3-5 sentence paragraphs; bullets/tables/bold for scannability; FAQ answers in 40-60 words when snippet-friendly.

8. **Add internal and external links** — 3-8 internal links following pillar/cluster relationships with descriptive anchor text (never "click here"); never reuse the same anchor text for different pages (avoids internal cannibalization); add 2-3 authoritative external links to support claims.

9. **Run a final SEO + CORE-EEAT review** — score the draft across 10 SEO factors (title, meta, H1, keyword placement, H2 coverage, internal links, external links, FAQ, readability, word-count fit), then verify the CORE-EEAT items as Pass / Warn / Fail. Auto-fix small issues (overlong title/meta, missing alt text, duplicate H2s, keyword over-repetition, missing TOC, paragraphs to split) and document them in a `### Changes Made` block. Ask the user before changing H1 wording, tone, major length, strong claims, or unverifiable links/stats. Hand every `[needs-verification]` claim to `fact-checking`.

## Example

Minimal prompt to feed a generation model:

```
Role: SEO content writer.
Task: write a {search_intent}-intent article around the primary keyword "{primary_keyword}" for {audience}.
Constraints:
- H1 contains the primary keyword, <=60 chars; the intro's first 40-60 words give the answer.
- H2/H3 use question or task-style phrasing; include >=1 comparison table, >=1 step-by-step list, >=1 FAQ (3 questions).
- Weave in secondary keywords {secondary_keywords} naturally, density <=3%, no stuffing.
- Mark E-E-A-T: give concrete examples and numbers; append [needs-verification] after any uncertain fact/data.
- Insert 3-5 internal-link placeholders [internal-link: topic].
End the output with: title tag, meta description, URL slug.
```

Title formula matrix (pick by intent):

| Intent | Pattern | Example shape |
|--------|---------|---------------|
| List | `[N] [Adjective] [Topic] [Benefit]` | `7 Proven SEO Tests for Faster Indexing` |
| How-to | `How to [Goal] in [Timeframe]` | `How to Build Topic Clusters in 30 Days` |
| Definition | `What Is [Topic]? [Benefit/Hook]` | `What Is Technical SEO? A Practical Guide` |
| Comparison | `[A] vs [B]: Which Is Better for [Use Case]?` | `WordPress vs Webflow: Which Is Better for SEO?` |
| Alternatives | `[N] Best [Product] Alternatives in [Year]` | `7 Best Ahrefs Alternatives in 2026` |
| Guide | `The Complete Guide to [Topic]` | `The Complete Guide to Technical SEO` |

Snippet patterns:

| Snippet type | Pattern |
|--------------|---------|
| Definition | `[Term] is [clear definition]. It matters because [outcome].` 40-60 words. |
| List | Introduce under an H2, then numbered/bulleted items with parallel phrasing. |
| Table | Simple headers, one idea per cell; avoid over-wide tables on mobile. |
| How-to | Label each action `Step 1`, `Step 2`; include prerequisites first. |
| FAQ | Answer directly first, then add nuance or caveats in the next sentence. |

Sample output metadata:

```
Title: How to Choose Remote Team Collaboration Tools (2026 Tested Comparison)
Meta: Compare 8 remote collaboration tools on price, integrations, and onboarding cost. Includes a selection checklist to decide in 10 minutes.
Slug: remote-team-collaboration-tools
```

## Notes

- **Answer-first wins citations**: lead the intro and every H2 with a self-contained, extractable conclusion — this is what gets pulled into AI engines and featured snippets.
- **Anti keyword-stuffing**: reader readability comes first; density is a ceiling, not a target.
- **Evidence boundary**: any statistic, price, ranking, or "research shows" claim must be marked `[needs-verification]` and handed to `fact-checking`. Never ship stale benchmark numbers without a date.
- **Metadata limits**: title/meta that exceed length get truncated; slug must be lowercase, hyphenated, keyword-led, and stripped of stop words (and any non-ASCII characters).
- **Do not fabricate E-E-A-T**: never invent author credentials or first-hand experience — leave a placeholder for the user to fill with real information.
- **Single responsibility**: produces on-page content and metadata only; no schema markup, no technical-SEO configuration.
- **Pre-ship self-check**: intent labeled / H1 has the primary keyword / intro gives the answer / keyword placement correct / >=3 internal links / E-E-A-T signals present / metadata trio (title, meta, slug) / all `[needs-verification]` marks applied / headings form a useful outline when read alone / conclusion gives one clear next action.

## See also

- requires: `fact-checking` — every factual claim, statistic, and citation in the draft must be verified by it.
- related: `content-strategy-planner`, `ai-search-seo`, `content-engine-strategist`, `seo-audit`; `markdown-to-docx` to turn the produced Markdown article into a deliverable Word document.
- combines_with: `content-strategy-planner`, `schema-markup-builder` (for structured data), `ai-search-seo`.
- Next best skill: a content-quality auditor to gate the draft before publishing.
