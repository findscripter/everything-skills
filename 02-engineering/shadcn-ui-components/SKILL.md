---
name: shadcn-ui-components
title: shadcn/ui Component Library Practices
description: Use when adding, composing, or debugging shadcn/ui components, initializing a project, or switching design presets — runnable find/install/compose actions that produce React/TSX code obeying shadcn's critical rules. Not for non-shadcn UI libraries (Ant Design, MUI) or pure Tailwi
domain: 研发/frontend
triggers: [shadcn, shadcn/ui, component library, design system, registry, npx shadcn, add component, FieldGroup, switch preset, monorepo UI]
tags: [frontend, react, shadcn, design-system, tailwind, tsx, cli]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [tailwind-css-patterns, web-component-design, ui-design-system-builder, react-state-management]
combines_with: [frontend-design, sveltekit-fullstack, web-artifacts-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
A framework for building UI, components, and design systems. Components are added as source code to the user's project via the CLI, not installed as a runtime dependency.

> **IMPORTANT:** Run all CLI commands using the project's package runner — `npx shadcn@latest`, `pnpm dlx shadcn@latest`, or `bunx --bun shadcn@latest` — based on the project's `packageManager`. Examples below use `npx shadcn@latest`; substitute the correct runner for the project.

## When to use

- Adding new components from shadcn/ui or community registries.
- Styling, composing, or debugging existing shadcn/ui components.
- Initializing a new project or switching design system presets.
- Retrieving component documentation, examples, and API references.

Out of scope:

- Non-shadcn/ui UI libraries (Ant Design, MUI), or pure Tailwind/CSS debugging unrelated to the registry/CLI.
- When the task scope is unclear or required inputs are missing (registry, preset, target framework) — stop and ask, don't guess.
- This skill is not a substitute for environment-specific validation, testing, or expert review.

## Steps

1. **Get project context** — run `npx shadcn@latest info --json`. Read the key fields:
   - **`aliases`** → use the actual import prefix (e.g. `@/`, `~/`), never hardcode.
   - **`isRSC`** → when `true`, files using `useState`/`useEffect`/event handlers/browser APIs need `"use client"` at the top.
   - **`tailwindVersion`** → `"v4"` uses `@theme inline` blocks; `"v3"` uses `tailwind.config.js`.
   - **`tailwindCssFile`** → the global CSS file where custom CSS variables live. Edit this file, never create a new one.
   - **`style`** → component visual treatment (e.g. `nova`, `vega`).
   - **`base`** → primitive library (`radix` or `base`); affects available props (`asChild` vs `render`).
   - **`iconLibrary`** → drives icon imports (`lucide-react` for `lucide`, `@tabler/icons-react` for `tabler`, etc.). Never assume `lucide-react`.
   - **`resolvedPaths`** → exact filesystem destinations for components, utils, hooks.
   - **`framework`** / **`packageManager`** → routing conventions and which runner to use for non-shadcn deps.
2. **Check installed components first** — before running `add`, check the `components` list from project context or list the `resolvedPaths.ui` directory. Don't import components that haven't been added, and don't re-add ones already installed.
3. **Find components** — `npx shadcn@latest search`. Use existing components first; check community registries too.
4. **Get docs and examples** — run `npx shadcn@latest docs <component>` to get URLs, then fetch them. Use `npx shadcn@latest view` to browse registry items you haven't installed. **When creating, fixing, debugging, or using a component, always run `docs` and fetch the URLs first** so you work against the real API rather than guessing.
5. **Install or update** — `npx shadcn@latest add`. When updating existing components, preview with `--dry-run` and `--diff` first (see Notes → Updating Components).
6. **Fix imports in third-party components** — community registries (e.g. `@bundui`, `@magicui`) may ship non-UI files with hardcoded paths like `@/components/ui/...` that don't match the project's aliases. Use the real `ui` alias from `info` (e.g. `@workspace/ui/components`) and rewrite the imports.
7. **Review added components** — after adding from any registry, **read the added files and verify they are correct**: missing sub-components (e.g. `SelectItem` without `SelectGroup`), missing imports, incorrect composition, or rule violations. Replace icon imports with the project's `iconLibrary`. Fix all issues before moving on.
8. **Registry must be explicit** — when the user asks to add a block/component without specifying a registry (e.g. "add a login block"), ask which registry to use. Never default to a registry on the user's behalf.
9. **Switching presets** — ask the user first: reinstall, merge, or skip (see Example → CLI).

## Example

Four core principles: **use existing components first → compose, don't reinvent → built-in variants before custom styles → semantic colors.**

```tsx
// Form layout: FieldGroup + Field, not div + Label.
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" />
  </Field>
</FieldGroup>

// Validation: data-invalid on Field, aria-invalid on the control.
<Field data-invalid>
  <FieldLabel>Email</FieldLabel>
  <Input aria-invalid />
  <FieldDescription>Invalid email.</FieldDescription>
</Field>

// Icons in buttons: data-icon, no sizing classes.
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

// Spacing: gap-*, not space-y-*.
<div className="flex flex-col gap-4">  // correct
<div className="space-y-4">           // wrong

// Equal dimensions: size-*, not w-* h-*.
<Avatar className="size-10">   // correct
<Avatar className="w-10 h-10"> // wrong

// Status colors: Badge variants or semantic tokens, not raw colors.
<Badge variant="secondary">+20.1%</Badge>        // correct
<span className="text-emerald-600">+20.1%</span>  // wrong
```

**CLI quick reference** (pick the runner that matches `packageManager`):

```bash
# Create a new project.
npx shadcn@latest init --name my-app --preset base-nova
npx shadcn@latest init --name my-app --preset a2r6bw --template vite

# Create a monorepo project.
npx shadcn@latest init --name my-app --preset base-nova --monorepo

# Initialize existing project.
npx shadcn@latest init --preset base-nova
npx shadcn@latest init --defaults   # shortcut: --template=next --preset=base-nova

# Add components.
npx shadcn@latest add button card dialog
npx shadcn@latest add @magicui/shimmer-button
npx shadcn@latest add --all

# Preview changes before adding/updating.
npx shadcn@latest add button --dry-run
npx shadcn@latest add button --diff button.tsx

# Search / docs / view.
npx shadcn@latest search @shadcn -q "sidebar"
npx shadcn@latest docs button dialog select
npx shadcn@latest view @shadcn/button
```

**Named presets:** `base-nova`, `radix-nova`. **Templates:** `next`, `vite`, `start`, `react-router`, `astro` (all support `--monorepo`) and `laravel` (no monorepo). **Preset codes:** Base62 strings starting with `a` (e.g. `a2r6bw`) from ui.shadcn.com — pass them directly to `--preset`; never decode or fetch them manually.

**Switching presets** (ask the user which):
- **Reinstall** (overwrites all components): `init --preset <code> --force --reinstall`
- **Merge** (smart-merge each): `init --preset <code> --force --no-reinstall`, then for each installed component use `--dry-run` + `--diff`
- **Skip** (config/CSS only): `init --preset <code> --force --no-reinstall`

**Component selection cheat sheet:** form inputs `Input`/`Select`/`Combobox`/`Switch`/`Checkbox`/`RadioGroup`/`Textarea`/`InputOTP`/`Slider`; 2–5 options `ToggleGroup` + `ToggleGroupItem`; overlays `Dialog` (modal) / `Sheet` (side panel) / `Drawer` (bottom sheet) / `AlertDialog` (confirm); feedback `sonner` (toast) / `Alert` / `Progress` / `Skeleton` / `Spinner`; empty states `Empty`; charts `Chart` (wraps Recharts); command palette `Command` inside `Dialog`.

## Notes

The following critical rules are **always enforced**:

- **Styling (Tailwind):** `className` is for layout, never to override component colors/typography. No `space-x-*`/`space-y-*` — use `flex` + `gap-*`. Use `size-*` when width and height are equal. Use `truncate` shorthand. No manual `dark:` color overrides — use semantic tokens (`bg-background`, `text-muted-foreground`). Use `cn()` for conditional classes. No manual `z-index` on overlay components (Dialog/Sheet/Popover handle their own stacking).
- **Forms & inputs:** layout uses `FieldGroup` + `Field`. `InputGroup` uses `InputGroupInput`/`InputGroupTextarea`. Buttons inside inputs use `InputGroup` + `InputGroupAddon`. Option sets (2–7 choices) use `ToggleGroup`. Group related checkboxes/radios with `FieldSet` + `FieldLegend`. Validation: `data-invalid` on `Field`, `aria-invalid` on the control; disabled: `data-disabled` on `Field`, `disabled` on the control.
- **Component structure:** items always inside their Group (`SelectItem` → `SelectGroup`, `DropdownMenuItem` → `DropdownMenuGroup`, `CommandItem` → `CommandGroup`). Custom triggers use `asChild` (radix) or `render` (base) per the `base` field. Dialog/Sheet/Drawer always need a Title (accessibility; use `className="sr-only"` if visually hidden). Use full Card composition (Header/Title/Description/Content/Footer). Button has no `isPending`/`isLoading` — compose with `Spinner` + `data-icon` + `disabled`. `TabsTrigger` must be inside `TabsList`. `Avatar` always needs `AvatarFallback`.
- **Use components, not custom markup:** Callouts use `Alert`; empty states use `Empty`; toast via `sonner`'s `toast()`; use `Separator` instead of `<hr>` or `border-t` divs; use `Skeleton` for loading placeholders (no custom `animate-pulse` divs); use `Badge` instead of styled spans.
- **Icons:** icons in `Button` use `data-icon="inline-start"`/`"inline-end"`. No sizing classes on icons inside components (components size via CSS — no `size-4`/`w-4 h-4`). Pass icons as objects, not string keys (`icon={CheckIcon}`).
- **Updating components** (keep local changes): run `add <c> --dry-run` to see affected files → `add <c> --diff <file>` to see upstream-vs-local. No local changes → safe to overwrite; has local changes → read the file, analyze the diff, apply upstream while preserving local edits. **Never fetch raw files from GitHub manually — always use the CLI. Never use `--overwrite` without the user's explicit approval.**

## See also

- The source skill ships split rule files for edge cases: `rules/forms.md`, `rules/composition.md`, `rules/icons.md`, `rules/styling.md`, `rules/base-vs-radix.md` (`asChild` vs `render`), plus `cli.md` (full flag/field reference) and `customization.md` (theming, CSS variables, extending components). Consult the upstream repo for edge cases.
- Related frontend skills: `tailwind-css-patterns`, `web-component-design`, `ui-design-system-builder`, `react-state-management`. Combines with `frontend-design`, `sveltekit-fullstack`, `web-artifacts-builder`.
- Adapted from sickn33/antigravity-awesome-skills (MIT); upstream source: shadcn-ui/ui repo `skills/shadcn`.
