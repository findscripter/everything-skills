---
name: minimalist-editorial-ui
title: Minimalist Editorial UI
description: Use when building refined, ultra-minimalist "document-style" interfaces like Notion/Linear/Vercel — warm monochrome palette, 1px borders, bento grids, restrained motion; not for brand-color-heavy or vivid-gradient marketing UIs. Triggers: minimalist ui, editorial style, warm mono
domain: 创意/design
triggers: [minimalist ui, editorial ui, warm monochrome, bento grid, notion-style ui, linear-style ui, document-style ui]
tags: [design, ui, frontend, minimalism, typography]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [high-end-visual-design, glassmorphism-ui-design, industrial-brutalist-ui, ui-design-system-builder]
combines_with: [tailwind-css-patterns, theme-factory, web-artifacts-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

- When the user wants a refined minimalist UI inspired by tools like Notion, Linear, or Vercel and other editorial workspace products.
- When designing warm monochrome interfaces with crisp borders, generous whitespace, muted pastel accents, and quiet motion — a "document-style" feel.
- When the task should deliberately avoid generic SaaS visuals: gradients, heavy shadows, saturated color blocks, pill-heavy components, and glassmorphism.

**Limitations / when NOT to use:**
- Minimalism can flatten hierarchy when content is dense; validate scannability, contrast, and navigation clarity with *real* content, not placeholder text.
- Assumes the product can support restrained palettes and typography-led layouts; do not override an established brand color/font system without cause.
- Subtle motion and flat surfaces still need responsive, keyboard, and screen-reader verification in the target project.

## Steps

Execution protocol when writing frontend code (HTML, React, Tailwind, Vue) or designing a layout:

1. **Establish macro-whitespace first.** Use massive vertical padding between sections (e.g. `py-24` or `py-32` in Tailwind).
2. **Constrain the main typography content width** to `max-w-4xl` or `max-w-5xl`.
3. **Apply the custom typographic hierarchy and monochromatic color variables immediately** so fonts, text colors, and border colors are systematized up front.
4. **Enforce one border rule:** every card, divider, and border adheres strictly to `1px solid #EAEAEA`.
5. **Add scroll-entry animations** to all major content blocks via `IntersectionObserver`.
6. **Give sections visual depth** through low-opacity imagery, ambient gradients, or subtle textures — no empty flat backgrounds, without breaking the clean aesthetic.
7. Provide code that reflects this high-end, uncluttered, editorial aesthetic natively, without requiring manual adjustments.

### Absolute negative constraints (banned elements)

Strictly avoid generic web-development defaults:
- DO NOT use the `Inter`, `Roboto`, or `Open Sans` typefaces.
- DO NOT use generic thin-line icon libraries like `Lucide`, `Feather`, or standard `Heroicons`.
- DO NOT use Tailwind's default heavy drop shadows (`shadow-md`, `shadow-lg`, `shadow-xl`). Shadows must be practically non-existent or heavily customized to be ultra-diffuse and low opacity (< 0.05).
- DO NOT use primary colored backgrounds for large elements or sections (no bright blue/green/red hero blocks).
- DO NOT use gradients, neon colors, or 3D glassmorphism (beyond subtle navbar blurs).
- DO NOT use `rounded-full` (pill shapes) for large containers, cards, or primary buttons.
- DO NOT use emojis anywhere in code, markup, text content, headings, or alt text. Replace with proper icons or clean SVG primitives.
- DO NOT use generic placeholder names like "John Doe", "Acme Corp", or "Lorem Ipsum". Use realistic, contextual content.
- DO NOT use AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Game-changer", "Delve". Write plain, specific language.

### Typographic architecture

Rely on extreme typographic contrast and premium font selection for an editorial feel.
- **Primary Sans-Serif (Body, UI, Buttons):** `font-family: 'SF Pro Display', 'Geist Sans', 'Helvetica Neue', 'Switzer', sans-serif`.
- **Editorial Serif (Hero Headings & Quotes):** `font-family: 'Lyon Text', 'Newsreader', 'Playfair Display', 'Instrument Serif', serif`. Apply tight tracking (`letter-spacing: -0.02em` to `-0.04em`) and tight line-height (`1.1`).
- **Monospace (Code, Keystrokes, Meta-data):** `font-family: 'Geist Mono', 'SF Mono', 'JetBrains Mono', monospace`.
- **Text colors:** Body text must never be absolute black (`#000000`). Use off-black/charcoal (`#111111` or `#2F3437`) with a generous `line-height` of `1.6`. Secondary text uses muted gray (`#787774`).

### Color palette (warm monochrome + spot pastels)

Color is a scarce resource, used only for semantic meaning or subtle accents.
- **Canvas / Background:** Pure White `#FFFFFF` or warm bone/off-white `#F7F6F3` / `#FBFBFA`.
- **Primary Surface (Cards):** `#FFFFFF` or `#F9F9F8`.
- **Structural Borders / Dividers:** Ultra-light gray `#EAEAEA` or `rgba(0,0,0,0.06)`.
- **Accent colors** (exclusively highly desaturated, washed-out pastels for tags, inline code backgrounds, subtle icon backgrounds):
  - Pale Red `#FDEBEC` (Text `#9F2F2D`)
  - Pale Blue `#E1F3FE` (Text `#1F6C9F`)
  - Pale Green `#EDF3EC` (Text `#346538`)
  - Pale Yellow `#FBF3DB` (Text `#956400`)

### Component specifications

- **Bento box feature grids:** Asymmetrical CSS Grid layouts; cards have exactly `border: 1px solid #EAEAEA`; crisp border-radius (`8px` or `12px` maximum); generous internal padding (`24px` to `40px`).
- **Primary CTA buttons:** Solid background `#111111`, text `#FFFFFF`; slight border-radius (`4px` to `6px`); no box-shadow; hover shifts to `#333333` or micro-scale `transform: scale(0.98)`.
- **Tags & status badges:** Pill-shaped (`border-radius: 9999px`), very small typography (`text-xs`), uppercase with wide tracking (`letter-spacing: 0.05em`); background uses the muted pastels.
- **Accordions (FAQ):** Strip all container boxes — separate items only with `border-bottom: 1px solid #EAEAEA`; use a clean, sharp `+` / `-` icon for the toggle state.
- **Keystroke micro-UIs:** Render shortcuts as physical keys via `<kbd>`: `border: 1px solid #EAEAEA`, `border-radius: 4px`, `background: #F7F6F3`, monospace font.
- **Faux-OS window chrome:** When mocking up software, wrap it in a minimalist container with a white top bar containing three small, light gray circles (replicating macOS window controls).

### Iconography & imagery

- **System icons:** Phosphor Icons (Bold or Fill weights) or Radix UI Icons for a technical, slightly thicker-stroke aesthetic; standardize stroke width across all icons.
- **Illustrations:** Monochromatic, rough continuous-line ink sketches on white, featuring a single offset geometric shape filled with a muted pastel.
- **Photography:** High-quality, desaturated, warm-toned images; apply subtle overlays (`opacity: 0.04` warm grain) to blend photos into the monochrome palette. Never use oversaturated stock photos. Use placeholders like `https://picsum.photos/seed/{context}/1200/800` when real assets are unavailable.
- **Hero & section backgrounds:** Avoid empty flat sections — use subtle full-width imagery at very low opacity, soft radial light spots (`radial-gradient` with warm tones at `opacity: 0.03`), or minimal geometric line patterns to add depth.

## Example

**Scroll entry (core motion pattern)** — elements fade in via `translateY(12px)` + `opacity: 0` resolving over `600ms`; always use `IntersectionObserver`, never `window.addEventListener('scroll')`:

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      io.unobserve(e.target);
    }
  });
});
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
```

```css
.reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity .6s cubic-bezier(0.16, 1, 0.3, 1),
              transform .6s cubic-bezier(0.16, 1, 0.3, 1);
}
/* Staggered cascade for lists / grids */
.reveal-item { animation-delay: calc(var(--index) * 80ms); }
```

**Card hover (ultra-subtle shadow shift):**

```css
.card {
  border: 1px solid #EAEAEA;
  border-radius: 12px;
  box-shadow: 0 0 0 rgba(0,0,0,0);
  transition: box-shadow .2s ease;
}
.card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
```

**Physical key badge:**

```html
<kbd style="border:1px solid #EAEAEA;border-radius:4px;background:#F7F6F3;
            font-family:'Geist Mono',monospace;padding:2px 6px;">⌘K</kbd>
```

## Notes

- **Performance:** Animate exclusively via `transform` and `opacity`. No layout-triggering properties (`top`, `left`, `width`, `height`). Use `will-change: transform` sparingly and only on actively animating elements.
- **Ambient motion (optional):** A single, very slow radial gradient blob (`animation-duration: 20s+`, `opacity: 0.02-0.04`) drifting behind hero sections, on a `position: fixed; pointer-events: none` layer. Never on scrolling containers.
- Motion should feel invisible — present but never distracting. The goal is quiet sophistication, not spectacle; never mount everything at once, use staggered delays.
- The biggest minimalism trap is a flattened hierarchy — before shipping, verify scannability and contrast against real content.

## See also

- Pairs with typography, color, and component-library skills in the same creative/design domain (`high-end-visual-design`, `glassmorphism-ui-design`, `industrial-brutalist-ui`, `ui-design-system-builder`).
- Combines with `tailwind-css-patterns`, `theme-factory`, and `web-artifacts-builder`.
- For accessibility checks, combine with responsive / keyboard / screen-reader verification skills.

---
Adapted from sickn33/antigravity-awesome-skills (original author Leonxlnx, taste-skill), MIT license.
