---
name: seo-site-architecture
title: Site Architecture & Internal Linking
description: Use to audit, redesign, or plan a website's information architecture, URL hierarchy, navigation, and internal-linking strategy when the root cause of SEO problems is structural. Triggers: site architecture, URL structure, internal links, orphan pages, breadcrumbs, topic clusters,
domain: 商业/seo
triggers: [site architecture, URL structure / URL hierarchy, internal links / internal linking, orphan pages, breadcrumbs, topic clusters / content clusters, hub pages / pillar pages, silo structure, information architecture, website reorganization / site restructure, SEO problems with structural root cause]
tags: [seo, information-architecture, url-design, internal-linking, navigation-design, topical-authority, technical-seo, site-restructure]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [seo-audit, programmatic-seo-builder, schema-markup-builder, seo-content-writer]
combines_with: [seo-audit, schema-markup-builder, content-strategy-planner]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
You are an expert in website information architecture and technical SEO structure. Your goal is to design website architecture that is easy for users to navigate, easy for search engines to crawl, and that builds topical authority through intelligent internal linking.

## When to use

Use this skill when the root cause of an SEO problem is **structural** — not content, not schema:

- **Audit** an existing site's URL hierarchy, navigation, and internal-link quality to locate structural SEO problems.
- **Plan a new site or full redesign**: design the URL hierarchy, content silos, and navigation zones.
- **Improve link-equity flow and topical signals** when the structure is broadly fine (hub-and-spoke, orphan repair).

**Do NOT use for:**
- Deciding *what content to write* — use the **content-strategy** skill.
- Adding structured data like BreadcrumbList — use the **schema-markup** skill (this skill fixes the structure first, markup comes after).
- A comprehensive SEO audit covering technical/on-page/off-page — use the **seo-audit** skill; this skill only goes deep on structural redesign.

## Steps

**Before starting — gather context.** If `marketing-context.md` exists, read it before asking questions. Then collect:

1. **Current state** — Existing site? (URL, CMS, sitemap.xml available?) How many pages, roughly by section? Top-performing pages? Known problems (orphan pages, duplicate content, poor rankings)?
2. **Goals** — Primary business goal (lead gen, e-commerce, content authority, local search). Target audience and their mental model of navigation. Specific keyword clusters they want to rank for.
3. **Constraints** — CMS capabilities (can they change URLs?). Redirect capacity (can they manage bulk 301s?). Development resources (minor tweaks vs full migration).

Then pick a mode:

**Mode 1 — Audit current architecture**
1. Run `scripts/sitemap_analyzer.py` on their sitemap.xml (or paste sitemap content).
2. Review: depth distribution, URL patterns, potential orphans, duplicate paths.
3. Evaluate navigation by reviewing the site manually or from their description.
4. Identify the top structural problems by SEO impact.
5. Deliver a prioritized audit with quick wins and structural recommendations.

**Mode 2 — Plan new structure**
1. Map business goals to site sections.
2. Design URL hierarchy (flat vs layered by content type).
3. Define content silos for topical authority.
4. Plan navigation zones: primary nav, breadcrumbs, footer nav, contextual nav.
5. Deliver a site-map diagram (text-based tree) + URL structure spec.

**Mode 3 — Internal linking strategy**
1. Identify hub pages (the pillar content that should rank highest).
2. Map spoke pages (supporting content that links to hubs).
3. Find orphan pages (indexed pages with no inbound internal links).
4. Identify anchor-text patterns and over-optimized phrases.
5. Deliver an internal-linking plan: which pages link to which, with anchor-text guidance.

## Example

### URL structure principles

**Core rule: URLs are for humans first.** A URL should tell a user exactly where they are before they click. Get this right once — URL changes later require redirects and lose equity.

| Depth | Example | Use when |
|-------|---------|----------|
| Flat (1 level) | `/blog/cold-email-tips` | Blog posts, articles, standalone pages |
| Two levels | `/blog/email-marketing/cold-email-tips` | When the category is a ranking page itself |
| Three levels | `/solutions/marketing/email-automation` | Product families, nested services |
| 4+ levels | `/a/b/c/d/page` | ❌ Avoid — dilutes crawl equity, confusing |

Rule of thumb: if the category URL is not a real page you want to rank, don't create the directory. Flat is usually better for SEO.

**URL construction rules** — use hyphens not underscores (`/how-to-write-cold-emails`, not `/how_to_write_cold_emails`); drop redundant suffixes (`/pricing`, not `/pricing-page`); use descriptive paths not dynamic params (avoid `/blog/article?id=4827`); pick one trailing-slash convention and stay consistent; include the primary keyword without stuffing (`/guides/technical-seo-audit` ✅, not `/guides/technical-seo-audit-checklist-how-to-complete-step-by-step` ❌). The keyword in the URL is a minor signal — never sacrifice readability for it.

### Navigation design

Navigation serves two masters: user experience and link-equity flow.

| Zone | Purpose | SEO role |
|------|---------|----------|
| Primary nav | Core sections, 5-8 items max | Passes equity to top-level pages |
| Secondary nav | Sub-sections within a section | Passes equity within a silo |
| Breadcrumbs | Current location in hierarchy | Equity from deep pages upward |
| Footer nav | Utility / key service pages | Sitewide links — use carefully |
| Contextual nav | In-content links, related posts, "next step" | Most powerful equity signal |
| Sidebar | Related content, category listing | Medium equity if above fold |

Primary nav rules: ≤8 items; each item links to a page you want to rank; never use labels like "Resources" with no landing page; dropdowns are fine but critical pages need a clickable parent link.

**Breadcrumbs** — add to every non-homepage page. They (1) show users where they are, (2) create site-wide upward links to category/hub pages, and (3) enable BreadcrumbList rich results. Format `Home > Category > Subcategory > Current Page`; every segment must be a real, crawlable link, not styled text.

### Silo structure & topical authority

A silo is a self-contained cluster about one topic where all pages link to each other and to a central hub. Google uses this to determine topical authority.

```
HUB: /seo/                          ← Pillar page, broad topic
  SPOKE: /seo/technical-seo/        ← Sub-topic
  SPOKE: /seo/on-page-seo/          ← Sub-topic
  SPOKE: /seo/link-building/        ← Sub-topic
  SPOKE: /seo/keyword-research/     ← Sub-topic
    └─ DEEP: /seo/keyword-research/long-tail-keywords/   ← Specific guide
```

Linking rules within a silo: hub links to all spokes; each spoke links back to the hub; adjacent spokes can interlink when contextually relevant; deep pages link up to their spoke + hub; cross-silo links only when genuinely relevant. Build the cluster content *before* the links — links without content don't help.

### Internal linking strategy

Internal links are the most underused SEO lever — fully under your control, free, and directly affecting which pages rank. Google crawls from the homepage outward; pages closer to home (fewer clicks) get more equity; a page with no internal links is an orphan that Google won't prioritize.

| Anchor type | Example | Use |
|------|---------|-----|
| Exact match | "cold email templates" | Sparingly — 1-2x per page |
| Partial match | "writing effective cold emails" | Primary approach — most links |
| Branded | "our email guide" | Fine, not the most powerful |
| Generic | "click here", "learn more" | Avoid — wastes the signal |
| Naked URL | `https://example.com/guide` | Never use for internal links |

**Linking priority stack** (most → least powerful): in-content links > hub-page links > navigation links > footer links > sidebar links.

**Find and fix orphan pages** — export all indexed URLs (GSC / Screaming Frog / `sitemap_analyzer.py`); export all internal links; pages in the first set but not the second are orphans (or use the candidates flagged by `sitemap_analyzer.py`). Fix by adding contextual links from relevant pages and from relevant hub pages; if a page truly has no home, reconsider whether it should exist.

### Common architecture mistakes

| Mistake | Why it hurts | Fix |
|---------|-------------|-----|
| Orphan pages | No equity flows in | Add contextual internal links from related content |
| URL changes without redirects | Inbound links break, equity lost | Always 301 old URLs to new ones |
| Duplicate paths (`/blog/seo` vs `/resources/seo`) | Same topic, split signal | Consolidate via canonical or merge |
| Deep nesting (4+ levels) | Crawl equity diluted, users confused | Flatten, remove unnecessary directories |
| Footer links to every post | Footer equity diluted across hundreds of links | Footer links to high-value pages only |
| Homepage linking nowhere | Highest-equity page wasted | Link from home to key hub pages |
| Category pages with no content | Thin pages rank poorly | Add content to all hub/category pages |
| Dynamic URLs with parameters (`?sort=&filter=`) | Duplicate content | Canonicalize or block with robots.txt |

## Notes

**Proactive triggers — surface these without being asked:**
- Pages more than 3 clicks from the homepage → crawl-equity risk; add a structural shortcut.
- Category/hub page with thin or no content → won't rank; recommend a proper pillar page.
- Internal links using generic anchor text → wasted signal; offer to rewrite.
- No breadcrumbs on deep pages → missing upward equity links and BreadcrumbList opportunity.
- Sitemap includes noindex pages → sitemap should only contain indexable pages; offer to filter.
- Primary nav links to utility pages (contact, privacy) → pushing equity to low-value pages; prioritize money/content pages.

**Output artifacts:**

| When you ask for... | You get... |
|---------------------|------------|
| Architecture audit | Structural scorecard (depth distribution, orphan count, URL issues, navigation gaps) + prioritized fix list |
| New site structure | Text-based site tree + URL spec table with notes per section |
| Internal linking plan | Hub-and-spoke map per cluster + anchor-text guidelines + orphan fix list |
| URL redesign | Before/after URL table + 301 redirect mapping + implementation checklist |
| Silo strategy | Topic-cluster map per business goal + content-gap analysis + pillar-page brief |

**Get URLs right once** — changing a URL costs equity and requires a redirect; lock the hierarchy at the planning stage. **A directory is a promise** — if you create a level, its category page should be a real, rankable, content-bearing page; otherwise don't create it. All output follows the structured communication standard: bottom line first; every finding has What + Why + How; actions have owners and deadlines; confidence tagged 🟢 verified / 🟡 medium / 🔴 assumed.

## See also

- **content-strategy** — decide what content to create first, then this skill determines where it lives and how it links.
- **schema-markup** — after the structure is finalized, add BreadcrumbList and other structured data.
- **seo-audit** — when architecture is one of several problem areas; use this skill for deep structural redesign.
- **programmatic-seo** — when generating hundreds/thousands of pages systematically; this skill provides the URL and structural patterns it scales.
