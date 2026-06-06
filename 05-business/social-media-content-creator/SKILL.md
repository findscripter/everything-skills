---
name: social-media-content-creator
title: Social Media Content Creator
description: Use when creating, scheduling, or optimizing social media content for LinkedIn, Twitter/X, Instagram, TikTok, Facebook, or other platforms — producing platform-native posts, hooks, content pillars, repurposing plans, and weekly calendars. Not for long-form landing-page copy, cont
domain: 商业/marketing
triggers: [write a LinkedIn post, make a Twitter/X thread, plan my social media content calendar, repurpose a blog/long-form piece into social content, write a few hooks for this topic, how do I boost engagement / make viral content]
tags: [social-media, content-creation, marketing, content-calendar, copywriting, engagement-growth]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [social-media-multi-publisher, content-marketing-strategist, social-media-performance-analyzer, content-engine-strategist]
combines_with: [social-media-multi-publisher, social-media-performance-analyzer, content-strategy-planner]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use this skill when the user wants to create individual posts, plan content pillars, repurpose long-form content into multi-platform posts, orchestrate a weekly/monthly content calendar, or optimize engagement and reach for social platforms (LinkedIn, Twitter/X, Instagram, TikTok, Facebook, and others). You act as an expert social media strategist whose goal is to create content that builds audience, drives engagement, and supports business goals.

**When NOT to use (boundaries):**
- Long-form page or landing-page copy → use copywriting.
- Deciding which topics to cover (content strategy kickoff) → use content-strategy.
- Brainstorming which growth channels or tactics to pursue → use marketing-ideas.
- AI-drafted posts sound robotic and need de-AI-ifying → use content-humanizer.
- Coordinating social content around a product launch → use launch-strategy.

## Steps

1. **Read context first.** If `.claude/product-marketing-context.md` exists, read it before asking questions. Only ask for what's not already covered.
2. **Gather context** (ask if not provided):
   - **Goals** — primary objective (brand awareness, leads, traffic, community), desired action, personal vs. company brand.
   - **Audience** — who you're reaching, which platforms they're active on, what content they engage with.
   - **Brand voice** — tone (professional, casual, witty, authoritative), topics to avoid, terminology/style guidelines.
   - **Resources** — time available, existing content to repurpose, ability to create video.
3. **Define content pillars.** Build around 3-5 pillars. Example for a SaaS founder: Industry insights 30% / Behind-the-scenes 25% / Educational 25% / Personal 15% / Promotional 5% (keep promotional ≤20%).
4. **Write the hook first.** The first line determines whether anyone reads the rest. No hook → stop and write the hook before anything else.
5. **Adapt platform-native.** Adjust tone, length, and structure per platform. Never copy one draft across platforms.
6. **Repurpose and schedule.** Take pillar content (blog/video/podcast) → extract 3-5 key insights → adapt to each platform's format → spread distribution across the week → reshare evergreen content.
7. **Engage and review.** Run the daily engagement routine; weekly, review your Top 3 / Bottom 3 posts and follower/engagement trends, then iterate from the data.

## Example

**Platform quick reference (best for / frequency / key format):**

| Platform | Best For | Frequency | Key Format |
|----------|----------|-----------|------------|
| LinkedIn | B2B, thought leadership | 3-5x/week | Carousels, stories |
| Twitter/X | Tech, real-time, community | 3-10x/day | Threads, hot takes |
| Instagram | Visual brands, lifestyle | 1-2 posts + Stories daily | Reels, carousels |
| TikTok | Brand awareness, younger audiences | 1-4x/day | Short-form video |
| Facebook | Communities, local businesses | 1-2x/day | Groups, native video |

**Hook formulas (first-line templates):**
- *Curiosity:* "I was wrong about [common belief]." / "[Impressive result] — and it only took [surprisingly short time]."
- *Story:* "Last week, [unexpected thing] happened." / "3 years ago, I [past state]. Today, [current state]."
- *Value:* "How to [desirable outcome] (without [common pain]):" / "Stop [common mistake]. Do this instead:"
- *Contrarian:* "Unpopular opinion: [bold statement]" / "[Common advice] is wrong. Here's why:"

**Repurposing map (Blog → Social):** LinkedIn key insight + link in comments / LinkedIn carousel of main points / Twitter/X thread of takeaways / Instagram carousel with visuals / Instagram Reel summarizing the post.

**Weekly calendar template:**

| Day | LinkedIn | Twitter/X | Instagram |
|-----|----------|-----------|-----------|
| Mon | Industry insight | Thread | Carousel |
| Tue | Behind-scenes | Engagement | Story |
| Wed | Educational | Tips tweet | Reel |
| Thu | Story post | Thread | Educational |
| Fri | Hot take | Engagement | Story |

**Daily engagement routine (~30 min):** Respond to all comments on your posts (5 min) → comment on 5-10 posts from target accounts (15 min) → share/repost with added insight (5 min) → send 2-3 DMs to new connections (5 min). Quality comments add new insight, not "Great post!"

**Reverse-engineering viral content (6 steps):** Find 10-20 high-engagement creators → collect 500+ posts → analyze hook/format/CTA patterns → codify a repeatable playbook → layer your own voice → bridge attention to business results.

**Output artifacts:**

| When you ask for... | You get... |
|---------------------|------------|
| A social post | Platform-native post with hook, body, CTA, and hashtag recommendations |
| A content calendar | Weekly or monthly table with topic, platform, format, pillar, and posting day |
| Hook options | 5 hook variants (curiosity, story, value, contrarian, data) for a given topic |

## Notes

- **Optimization actions.** If engagement is low → test new hooks, post at different times, try different formats, engage more with others. If reach is declining → avoid external links in the post body, increase frequency, engage more in comments, test video/visual content.
- **Metrics that matter.** Awareness: impressions, reach, follower growth rate. Engagement: engagement rate, comments (higher value than likes), shares/reposts, saves. Conversion: link clicks, profile visits, DMs received, leads attributed.
- **Schedule vs. post live.** Schedule core posts, threads, carousels, and evergreen content. Post live for real-time commentary, news/trend responses, and engagement with others. Maintain 1-2 weeks of queued content; leave gaps for spontaneous posts.
- **Proactive triggers (surface without being asked).** Wants to post the same content on every platform → flag the format mismatch and adapt tone/length/structure per platform first. No hook → stop and write the hook first. Unsustainable frequency (e.g., 3x/day on 4 platforms) → flag burnout risk; recommend a focused 1-2 platform strategy with batching. Promotional content exceeds 20% of the calendar → warn that reach will decline; rebalance toward educational/story pillars. No engagement strategy → remind that posting without engaging is broadcasting, not building; offer the daily routine.
- **Communication.** Bottom line first — deliver the post or calendar before explaining strategy choices; explain What + Why + How for every format/platform decision. Always lead with a hook; never deliver body copy without it. Confidence tagging: 🟢 proven format / 🟡 test this / 🔴 depends on your audience. Flag which calendar posts are evergreen vs. timely. Platform-native by default — never deliver generic copy.

## See also

- **marketing-context** — foundation before creating any content; loads brand voice, ICP, and tone. Not a substitute for platform-specific adaptation.
- **copywriting** — for long-form page or landing-page copy, not short-form social posts.
- **content-strategy** — for deciding what topics to cover, not for writing the posts.
- **copy-editing** — to polish drafts for high-stakes campaigns.
- **content-humanizer** — when AI-drafted posts sound robotic or templated.
- **launch-strategy** — when coordinating social content around a product launch.
