---
name: ui-design-system-builder
title: UI Design System Builder
description: Generate a complete design token system from a brand color (colors, type, 8pt spacing, breakpoints), build a component architecture, and prepare developer handoff. Triggers: design token, design system, color palette, WCAG contrast, developer handoff.
domain: 创意/design
triggers: [generate design tokens, create color palette, build typography scale, calculate spacing system, create design system, generate CSS variables, export SCSS tokens, set up component architecture, document component library, calculate responsive breakpoints, prepare developer handoff, convert brand color to palette, check WCAG contrast, build 8pt grid system, design token]
tags: [design, design-system, design-token, component-library, responsive, accessibility, wcag, developer-handoff]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [theme-factory, brand-guidelines, apple-hig-advisor, web-component-design]
combines_with: [theme-factory, tailwind-css-patterns, frontend-design]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use this skill when you need to build or maintain a design system rather than create a one-off visual.

Good fit:

- You have a brand primary color and need to derive a **complete design token system** in one pass (palettes, typography scale, spacing, borders, shadows, animation, breakpoints, z-index).
- You need to **export** tokens as CSS custom properties / SCSS variables / JSON so Figma (Tokens Studio) and frontend frameworks can consume them.
- You need to structure a **component library** on top of the tokens (atomic-design layers, size/color/state variants).
- You need **responsive breakpoints, fluid typography (`clamp`), or responsive spacing**.
- You need to run a **developer handoff**: export tokens + framework integration examples + handoff checklist + accessibility validation.

Negative boundaries (do not use for):

- A single visual comp, poster, or brand logo / VI work — that is bespoke visual creation, not a token system.
- Frontend business logic, state management, or API integration — this skill produces design tokens and a style contract, not application code.
- Just checking one color's contrast ratio when no full system is needed.

## Steps

### Workflow 1: Generate design tokens

1. **Identify brand color and style.** Brand primary color in hex; style preference `modern` | `classic` | `playful`.
2. **Generate tokens with the script:**
   ```bash
   python scripts/design_token_generator.py "#0066CC" modern json
   ```
3. **Review the generated categories:** colors (primary, secondary, neutral, semantic, surface), typography (fontFamily, fontSize, fontWeight, lineHeight), spacing (8pt grid scale 0–64), borders (radius, width), shadows (none through 2xl), animation (duration, easing), breakpoints (xs–2xl), z-index.
4. **Export in the target format:**
   ```bash
   # CSS custom properties
   python scripts/design_token_generator.py "#0066CC" modern css > design-tokens.css
   # SCSS variables
   python scripts/design_token_generator.py "#0066CC" modern scss > _design-tokens.scss
   # JSON for Figma / tooling
   python scripts/design_token_generator.py "#0066CC" modern json > design-tokens.json
   ```
   Arguments: `brand_color` (default `#0066CC`), `style` (`modern`/`classic`/`playful`, default `modern`), `format` (`json`/`css`/`scss`/`summary`, default `json`).
5. **Validate accessibility.** Check color contrast meets WCAG AA (4.5:1 normal text, 3:1 large text); verify semantic colors have contrast colors defined.

### Workflow 2: Create component system

1. **Define the component hierarchy** (atomic design):
   - Atoms: Button, Input, Icon, Label, Badge
   - Molecules: FormField, SearchBar, Card, ListItem
   - Organisms: Header, Footer, DataTable, Modal
   - Templates: DashboardLayout, AuthLayout
2. **Map tokens to components:**

   | Component | Tokens Used |
   |-----------|-------------|
   | Button | colors, sizing, borders, shadows, typography |
   | Input | colors, sizing, borders, spacing |
   | Card | colors, borders, shadows, spacing |
   | Modal | colors, shadows, spacing, z-index, animation |
3. **Define variant patterns.**

   Size variants:
   ```
   sm: height 32px, paddingX 12px, fontSize 14px
   md: height 40px, paddingX 16px, fontSize 16px
   lg: height 48px, paddingX 20px, fontSize 18px
   ```
   Color variants:
   ```
   primary:   background primary-500, text white
   secondary: background neutral-100, text neutral-900
   ghost:     background transparent, text neutral-700
   ```
4. **Document each component API:** props interface with types, variant options, state handling (hover, active, focus, disabled), accessibility requirements. Components **reference tokens only — no hardcoded values**.

### Workflow 3: Responsive design

1. **Define breakpoints:**

   | Name | Width | Target |
   |------|-------|--------|
   | xs | 0 | Small phones |
   | sm | 480px | Large phones |
   | md | 640px | Tablets |
   | lg | 768px | Small laptops |
   | xl | 1024px | Desktops |
   | 2xl | 1280px | Large screens |
2. **Calculate fluid typography** with `clamp(min, preferred, max)`:
   ```css
   /* 16px to 24px between 320px and 1200px viewport */
   font-size: clamp(1rem, 0.5rem + 2vw, 1.5rem);

   --fluid-h1:   clamp(2rem,    1rem + 3.6vw, 4rem);
   --fluid-h2:   clamp(1.75rem, 1rem + 2.3vw, 3rem);
   --fluid-h3:   clamp(1.5rem,  1rem + 1.4vw, 2.25rem);
   --fluid-body: clamp(1rem, 0.95rem + 0.2vw, 1.125rem);
   ```
3. **Set up responsive spacing** that scales from mobile to desktop:

   | Token | Mobile | Tablet | Desktop |
   |-------|--------|--------|---------|
   | --space-md | 12px | 16px | 16px |
   | --space-lg | 16px | 24px | 32px |
   | --space-xl | 24px | 32px | 48px |
   | --space-section | 48px | 80px | 120px |

### Workflow 4: Developer handoff

1. **Export tokens in the required formats** (CSS for CSS projects, SCSS for SCSS, JSON for JS/TS).
2. **Prepare framework integration.**

   React + CSS variables:
   ```tsx
   import './design-tokens.css';

   <button className="btn btn-primary">Click</button>
   ```
   Tailwind config:
   ```javascript
   const tokens = require('./design-tokens.json');
   module.exports = {
     theme: {
       colors: tokens.colors,
       fontFamily: tokens.typography.fontFamily
     }
   };
   ```
   styled-components:
   ```typescript
   import tokens from './design-tokens.json';
   const Button = styled.button`
     background: ${tokens.colors.primary['500']};
     padding: ${tokens.spacing['2']} ${tokens.spacing['4']};
   `;
   ```
3. **Sync with Figma:** install the Tokens Studio plugin, import `design-tokens.json`, and tokens sync automatically with Figma styles.
4. **Handoff checklist:**
   - [ ] Token files added to project
   - [ ] Build pipeline configured
   - [ ] Theme / CSS variables imported
   - [ ] Component library aligned
   - [ ] Documentation generated

## Example

Input: "I have brand color `#8B4513` and want classic-style CSS tokens."

```bash
python scripts/design_token_generator.py "#8B4513" classic css > design-tokens.css
```

Then report the color-scale and type-scale overview, note that semantic colors carry `contrast` values, and give a React import: `import './design-tokens.css';` paired with `<button class="btn btn-primary">`. Finish with the handoff checklist and WCAG validation results.

For a quick preview use the `summary` format:

```bash
python scripts/design_token_generator.py "#FF6B6B" playful summary
```

## Notes

Rules the generator follows:

- Always provide the brand color in hex. Style preset decides font, default radius, and shadow depth: **modern** = Inter + 8px, **classic** = Helvetica + 4px, **playful** = Poppins + 16px.
- **Color scale rule:** steps 50–400 keep brightness fixed at 95% and only adjust saturation; 500 is the base color; 600–900 progressively reduce brightness (×0.8 / 0.6 / 0.4 / 0.2) and raise saturation — used for backgrounds, borders, hover, text, headings.
- **Type scale** uses a 1.25 ratio: xs 10 / sm 13 / base 16 / lg 20 / xl 25 / 2xl 31 / 3xl 39 / 4xl 49 / 5xl 61 (px).
- Touch targets ≥ 44×44px; focus indicators must be visible; prefer semantic HTML.
- Large text is defined as ≥18pt regular or ≥14pt bold (mapping to AA 3:1 / AAA 4.5:1).

Operational notes:

- The script `scripts/design_token_generator.py` and the `references/` docs (`token-generation`, `component-architecture`, `responsive-calculations`, `developer-handoff`) must be migrated alongside the skill.
- Tokens are the single source of truth: components and code reference tokens only, avoiding scattered magic numbers that cause drift.
- Always run accessibility validation after export. A semantic color missing `contrast`, or contrast below AA, should block delivery.
- JSON serves both tooling and code; CSS/SCSS are for direct consumption — pick one or export all, depending on the downstream.

## See also

- Reference docs (source `references/`): color algorithms / HSV / contrast (`token-generation`), atomic design and naming (`component-architecture`), breakpoints and fluid typography (`responsive-calculations`), export and Figma sync (`developer-handoff`).
- Related skills: theme-factory, brand-guidelines, apple-hig-advisor, web-component-design.
- Combines with: theme-factory, tailwind-css-patterns, frontend-design. This skill owns tokens and the style contract; downstream skills handle the concrete visuals and frontend implementation.

---

Adapted from alirezarezvani/claude-skills (MIT License).
