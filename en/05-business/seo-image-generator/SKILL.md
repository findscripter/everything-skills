---
name: seo-image-generator
title: SEO Image Generator: OG Cards, Infographics & Product Visuals
description: Generate production-ready SEO assets (OG cards, hero images, schema visuals, product photos, infographics) by mapping use case to aspect ratio/resolution/domain mode and running a Creative Director pipeline with a post-generation SEO checklist; use inside an SEO or content-publis
domain: 商业/seo
triggers: [OG image, infographic, product photo, hero image, social preview, SEO visual, schema image, image generation]
tags: [seo, image-generation, og, infographic, content-publishing]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [seo-meta-tags-optimizer, unsplash-photo-integration, social-share-card-hardener, seo-content-writer]
combines_with: [seo-meta-tags-optimizer, seo-content-writer, social-share-card-hardener]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
Generate production-ready images for SEO use cases using Gemini's image generation via the banana Creative Director pipeline. Maps SEO needs to optimized domain modes, aspect ratios, and resolution defaults.

## When to use

- When generating OG images, hero images, schema visuals, infographics, or similar SEO assets as part of a broader SEO or content-publishing workflow: OG/social preview cards, blog heroes, product shots, infographics, schema images, social squares, Pinterest pins, favicons, etc.
- When an upstream audit (e.g. `seo-images`) has identified missing or low-quality images and you need to drive generation from those findings.

**Do NOT use when:**
- The required image-generation extension (banana MCP) is not installed or not connected — install it first.
- You only need to **analyze/audit/score** images rather than generate them (that is the job of `seo-images` or the audit agent; this skill never auto-generates from an audit).
- The request is a casual, non-SEO, non-publishing image task.

### Architecture note

This skill has two components with distinct roles:
- **SKILL.md** (this file): handles interactive `/seo image-gen` commands for generating images.
- **Agent** (`agents/seo-image-gen.md`): an audit-only analyst spawned during `/seo audit` to assess existing OG/social images and produce a generation plan — it never auto-generates.

## Steps

### Prerequisites

This skill requires the banana extension. Before using any image-generation tool, verify the MCP server is connected by checking that `gemini_generate_image` or `set_aspect_ratio` tools are available. If they are not, inform the user and provide install instructions:

```bash
./extensions/banana/install.sh
```

### Generation pipeline

For every generation request:

1. **Identify use case** from the command or context (og, hero, product, infographic, custom, batch).
2. **Apply SEO defaults** from the use-case table below (aspect ratio, resolution, domain mode).
3. **Set aspect ratio** via the `set_aspect_ratio` MCP tool.
4. **Construct a Reasoning Brief** using the banana Creative Director pipeline:
   - Load `references/prompt-engineering.md` for the 6-component system.
   - Apply domain-mode emphasis (Subject 30%, Style 25%, Context 15%, etc.).
   - Be SPECIFIC and VISCERAL: describe what the camera sees.
5. **Generate** via the `gemini_generate_image` MCP tool.
6. **Run the post-generation SEO checklist** (below).

### Quick reference (commands)

| Command | What it does |
|---------|-------------|
| `/seo image-gen og <description>` | Generate OG/social preview image (1200x630 feel) |
| `/seo image-gen hero <description>` | Blog hero image (widescreen, dramatic) |
| `/seo image-gen product <description>` | Product photography (clean, white BG) |
| `/seo image-gen infographic <description>` | Infographic visual (vertical, data-heavy) |
| `/seo image-gen custom <description>` | Custom image with full Creative Director pipeline |
| `/seo image-gen batch <description> [N]` | Generate N variations (default: 3) |

### Use case → parameter mapping

Each use case maps to pre-configured banana parameters:

| Use Case | Aspect Ratio | Resolution | Domain Mode | Notes |
|----------|-------------|------------|-------------|-------|
| **OG/Social Preview** | `16:9` | `1K` | Product or UI/Web | Clean, professional, text-friendly |
| **Blog Hero** | `16:9` | `2K` | Cinema or Editorial | Dramatic, atmospheric, editorial quality |
| **Schema Image** | `4:3` | `1K` | Product | Clean, descriptive, schema ImageObject |
| **Social Square** | `1:1` | `1K` | UI/Web | Platform-optimized square |
| **Product Photo** | `4:3` | `2K` | Product | White background, studio lighting |
| **Infographic** | `2:3` | `4K` | Infographic | Data-heavy, vertical layout |
| **Favicon/Icon** | `1:1` | `512` | Logo | Minimal, scalable, recognizable |
| **Pinterest Pin** | `2:3` | `2K` | Editorial | Tall vertical card |

### Model routing

| Scenario | Model | Why |
|----------|-------|-----|
| OG images, social previews | `gemini-3.1-flash-image-preview` @ 1K | Fast, cost-effective |
| Hero images, product photos | `gemini-3.1-flash-image-preview` @ 2K | Quality + detail |
| Infographics with text | `gemini-3.1-flash-image-preview` @ 2K, thinking: high | Better text rendering |
| Quick drafts | `gemini-2.5-flash-image` @ 512 | Rapid iteration |

### Check for presets

If the user mentions a brand or has SEO presets configured, list and apply matching presets as defaults:

```bash
python3 ~/.claude/skills/seo-image-gen/scripts/presets.py list
```

Also check `references/seo-image-presets.md` for SEO-specific preset templates.

### Post-generation SEO checklist

After every successful generation, guide the user on:

1. **Alt text**: write descriptive, keyword-rich alt text for the generated image.
2. **File naming**: rename to SEO-friendly format `keyword-description-widthxheight.webp`.
3. **WebP conversion** (page speed):
   ```bash
   magick output.png -quality 85 output.webp
   ```
4. **File size**: target under 200KB for hero images, under 100KB for thumbnails.
5. **Schema markup** (`ImageObject`):
   ```json
   {
     "@type": "ImageObject",
     "url": "https://example.com/images/keyword-description.webp",
     "width": 1200,
     "height": 630,
     "caption": "Descriptive caption with target keyword"
   }
   ```
6. **OG meta tags** (for social preview images):
   ```html
   <meta property="og:image" content="https://example.com/images/og-image.webp" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   <meta property="og:image:alt" content="Descriptive alt text" />
   ```

### Response format

After generating, always provide:
1. **Image path**: where it was saved.
2. **Crafted prompt**: show what was sent to the API (educational).
3. **Settings**: model, aspect ratio, resolution.
4. **SEO checklist**: alt-text suggestion, file naming, WebP conversion.
5. **Schema snippet**: `ImageObject` or `og:image` markup if applicable.

## Example

```text
/seo image-gen og  "SaaS dashboard launch announcement, dark tech style, left negative space for headline overlay"
/seo image-gen hero "AI data center at night, cool blue light, cinematic atmosphere"
/seo image-gen infographic "2026 content marketing trends, vertical, 5 data sections, brand primary color"
/seo image-gen batch "minimal coffee brand product shot" 3   # 3 variations (default: 3)
```

## Notes

### Cost awareness

Image generation costs money. Be transparent: show an estimated cost before generating (especially for batch), and log every generation.

```bash
python3 ~/.claude/skills/seo-image-gen/scripts/cost_tracker.py log --model MODEL --resolution RES --prompt "brief"
python3 ~/.claude/skills/seo-image-gen/scripts/cost_tracker.py summary
```

Approximate costs (gemini-3.1-flash): 512 ≈ $0.02 · 1K ≈ $0.04 · 2K ≈ $0.08 · 4K ≈ $0.16 per image.

### Error handling

| Error | Resolution |
|-------|-----------|
| MCP not configured / extension not installed | Run `./extensions/banana/install.sh` |
| API key invalid | New key at https://aistudio.google.com/apikey |
| Rate limited (429) | Wait 60s, retry. Free tier: ~10 RPM / ~500 RPD |
| `IMAGE_SAFETY` | Rephrase the prompt — see `references/prompt-engineering.md` Safety section |
| MCP unavailable | Fall back: `python3 ~/.claude/skills/seo-image-gen/scripts/generate.py --prompt "..." --aspect-ratio "16:9"` |

### Reference documentation (load on demand)

Do NOT load all references at startup:
- `references/prompt-engineering.md`: 6-component system, domain modes, templates.
- `references/gemini-models.md`: model specs, rate limits, capabilities.
- `references/mcp-tools.md`: MCP tool parameters and responses.
- `references/post-processing.md`: ImageMagick/FFmpeg pipeline recipes.
- `references/cost-tracking.md`: pricing, usage tracking.
- `references/presets.md` and `references/seo-image-presets.md`: preset management and SEO templates.

### Limitations

- Use this skill only when the task clearly matches the scope above.
- The output is not a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.

## See also

- **seo-images** (related): image analysis/audit that identifies missing or low-quality images; its findings drive generation here.
- **seo-schema** (combines_with): after generation, produce `ImageObject` schema markup pointing to the new assets.
- **seo-audit** (related): a site audit spawns the audit-only seo-image-gen agent to produce a prioritized generation plan (the agent plans, this skill generates).
- **seo-meta-tags-optimizer**, **seo-content-writer**, **social-share-card-hardener**: combine for an end-to-end SEO publishing workflow.
