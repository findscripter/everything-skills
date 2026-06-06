---
name: google-stitch-ui-prompting
title: Google Stitch UI Prompting
description: Use when generating web or mobile UI from text/sketches with Google Stitch (Gemini-powered Labs UI generator); covers prompt engineering for specific, visually-directed, actionable prompts plus iteration and export — not for hand-writing production code or replacing human review.
domain: 创意/design
triggers: [generate UI with Google Stitch, write a UI/interface prompt, turn text or a sketch into an interface design, export a Stitch design to Figma or HTML, prototype a multi-screen app flow, AI interface prompt engineering]
tags: [google-stitch, ui-design, prompt-engineering, ai-ui-generation, prototyping, figma, frontend, creative]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [stitch-design-system-taste, stitch-iterative-build-loop, magic-ui-component-generator, high-end-visual-design]
combines_with: [design-dev-handoff, web-artifacts-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use this skill for expert prompt engineering with **Google Stitch** — the experimental, Gemini 2.5 Flash-powered AI UI generator by Google Labs that turns text prompts and visual references into functional UI designs. Reach for it when you need to:

- Convert natural-language descriptions or sketches/wireframes/screenshots into web or mobile interfaces.
- Plan multi-screen app flows and responsive layouts, then export to HTML/CSS, Figma, or code.
- Run targeted iteration on an existing design (annotate-to-edit, variant generation, progressive refinement).

What Stitch supports:

- Text-to-UI generation from natural language prompts
- Image-to-UI conversion from sketches, wireframes, or screenshots
- Multi-screen app flows and responsive layouts
- Export to HTML/CSS, Figma, and code
- Iterative refinement with variants and annotations

**Out of scope / boundaries:**

- Do not treat Stitch output as a production-ready product — it is a starting point, not a final product. It needs human refactoring, accessibility attributes, and asset optimization before shipping.
- This skill does not hand-write or implement interaction/animation logic or framework code, and it does not substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing — do not hard-code around them.

## Steps

1. **Set context.** State in one line who and what screen/component the design is for (e.g., "Dashboard for SaaS analytics platform").
2. **List key features.** Use bullet points naming components with specific details (metric cards, line chart, activity feed, quick-action buttons).
3. **Define visual style.** Color palette (primary + accent), design aesthetic (minimalist / modern / glassmorphic / playful), typography, spacing and density (compact / spacious / balanced).
4. **Specify platform and responsive behavior.** Mobile / tablet / desktop / responsive; give breakpoints when relevant (e.g., 320px → 1440px).
5. **Add functional requirements.** Button actions and CTAs, form fields and validation, navigation patterns, loading states, empty states, error handling.
6. **Generate and confirm.** For multi-screen flows, Stitch asks for confirmation before generating — review it to ensure alignment with your vision.
7. **Iterate.** Annotate to edit → generate variants (as needed) → progressively refine.
8. **Export and finish.** Verify breakpoints, color contrast, interactive states, and naming, then export and refactor to production standards.

### Core prompting principles

1. **Be specific and detailed** — generic prompts yield generic results; specific prompts with clear requirements produce tailored, professional designs.
2. **Always define visual style and theme** — color palette + aesthetic + layout, to avoid generic "AI-flavored" outputs.
3. **Structure multi-screen flows clearly** — list each screen as bullet points before generation.
4. **Use design terminology** — terms like "hero section," "card layout," "glassmorphic," "bento grid," "kanban" help Stitch understand your intent.
5. **Specify interactions** — describe hover states, click actions, and transitions for more complete designs.
6. **Think in components** — break complex screens into reusable components (header, card, form, etc.).
7. **Iterate incrementally** — make small, focused changes rather than complete redesigns.
8. **Test responsiveness** — verify at multiple breakpoints (mobile, tablet, desktop).
9. **Consider accessibility** — mention color contrast, font sizes, and touch-target sizes in prompts.

## Example

**Prompt structure template:**

```
[Screen/Component Type] for [User/Context]

Key Features:
- [Feature 1 with specific details]
- [Feature 2 with specific details]
- [Feature 3 with specific details]

Visual Style:
- [Color scheme]
- [Design aesthetic]
- [Layout approach]

Platform: [Mobile/Web/Responsive]
```

**Filled-in example:**

```
Dashboard for SaaS analytics platform

Key Features:
- Top metrics cards showing MRR, active users, churn rate
- Line chart for revenue trends (last 30 days)
- Recent activity feed with user actions
- Quick action buttons for reports and exports

Visual Style:
- Dark mode with blue/purple gradient accents
- Modern glassmorphic cards with subtle shadows
- Clean data visualization with accessible colors

Platform: Responsive web (desktop-first)
```

**Specific vs. vague (the key contrast):**

```
✗ Create a dashboard
✓ Member dashboard with course modules grid, progress tracking bar,
  and community feed sidebar using purple theme and card-based layout
```

Why it works: it specifies components (modules, progress, feed), layout structure (grid, sidebar), visual style (purple theme, cards), and context (member dashboard).

**Multi-screen flow** (Stitch will ask for confirmation before generating multiple screens):

```
Fitness tracking app with:
- Onboarding screen with goal selection
- Home dashboard with daily stats and activity rings
- Workout library with category filters
- Profile screen with achievements and settings
```

**Functional flow with states:**

```
Checkout flow with:
- Cart summary with quantity adjusters
- Shipping address form with validation
- Payment method selection (cards, PayPal, Apple Pay)
- Order confirmation with tracking number
```

**Three iteration strategies:**

- *Annotate to edit* — make targeted changes without rewriting the whole prompt: "Make this button larger and use primary color", "Add more spacing between these cards", "Change this to a horizontal layout". Stitch updates only the annotated areas.
- *Generate variants* — explore directions: `Generate 3 variants of this hero section: 1. Image-focused with minimal text 2. Text-heavy with supporting graphics 3. Video background with overlay content`.
- *Progressive refinement* — start broad, then add specificity: `E-commerce homepage` → `Add featured products section with 4-column grid and hover effects` → `Update color scheme to earth tones (terracotta, sage, cream) and add promotional banner at top`.

**Anti-patterns → fixes:**

```
✗ Make a nice website
✓ Portfolio website for photographer with full-screen image gallery,
  project case studies, and contact form. Minimalist black and white
  aesthetic with serif typography.

✗ Create a login page
✓ Login page for healthcare portal with email/password fields,
  "Remember me" checkbox, "Forgot password" link, and SSO options
  (Google, Microsoft). Professional, trustworthy design with blue medical theme.

✗ Design an app for task management
✓ Task management app with kanban board layout, drag-and-drop cards,
  priority labels, and due date indicators. Modern, productivity-focused
  design with purple/teal gradient accents and dark mode support.
```

## Notes

- **Before exporting:** verify responsive breakpoints, check color contrast for accessibility, ensure interactive states are defined, and review component naming and structure.
- **After exporting:** refactor generated code for production standards, add proper semantic HTML tags, implement accessibility attributes (ARIA labels, alt text), optimize images and assets, and add animations and micro-interactions.
- **Export formats:** HTML/CSS (clean, semantic markup), Figma ("Paste to Figma" for design-system integration), and component-level code snippets for frameworks.
- **Typical workflows:** Stitch → Figma → Code (design-system handoff); Stitch → HTML/CSS → React/Vue/Svelte components; rapid prototyping (create variations → test with users/stakeholders → iterate → finalize).
- Always validate across multiple breakpoints (mobile/tablet/desktop), and bake accessibility requirements (contrast, font sizes, touch-target sizes) into the prompt itself.
- **Remember:** Stitch accelerates exploration and establishes visual direction, but the final result still depends on human judgment and production standards.

## See also

- Related Stitch and visual/prototyping skills: stitch-design-system-taste, stitch-iterative-build-loop, magic-ui-component-generator, high-end-visual-design.
- Combines with: design-dev-handoff, web-artifacts-builder.
- Figma and frontend-framework (React/Vue/Svelte) component-implementation skills.
