---
name: app-store-release-notes
title: App Store Release Notes from Git
description: Use when turning git history since the last tag into user-facing App Store "What's New" / release notes; collect commits, triage for user impact, and draft 5-10 benefit-focused bullets. Not for developer CHANGELOGs, version bumps, or release orchestration (use release-manager). T
domain: 研发/devops
triggers: [generate App Store release notes, What's New copy, App Store release notes, turn commits into user-visible bullets, release update text, distill app update highlights]
tags: [app store, release-notes, git, engineering, release, copywriting]
level: beginner
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: [git-advanced-workflows]
related: [release-manager, ios-swiftui-developer]
combines_with: [conversion-copywriter]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use this skill when:

- The user asks for App Store "What's New" text or release notes, and the changes come from git history.
- You need to turn raw commits into concise, user-facing release bullets.

Do NOT use (negative boundary):

- Developer-facing technical changelogs (Conventional-Commits-grouped CHANGELOG), semantic version determination, or release branch / rollback / deploy orchestration -> use `release-manager`.
- There is no git history and the update points come purely from spoken requirements (this skill anchors facts to a commit range).

## Steps

### 1) Collect changes
- Run `scripts/collect_release_changes.sh` from the repo root to gather commits and touched files.
- If needed, pass a specific tag or ref: `scripts/collect_release_changes.sh v1.2.3 HEAD`.
- If no tags exist, the script falls back to full history.

### 2) Triage for user impact
- Scan commits and files to identify user-visible changes.
- Group changes by theme (New, Improved, Fixed) and deduplicate overlaps.
- Drop internal-only work (build scripts, refactors, dependency bumps, CI).

### 3) Draft App Store notes
- Write short, benefit-focused bullets for each user-facing change.
- Use clear verbs and plain language; avoid internal jargon.
- Prefer 5 to 10 bullets unless the user requests a different length.

### 4) Validate
- Ensure every bullet maps back to a real change in the range.
- Check for duplicates and overly technical wording.
- Ask for clarification if any change is ambiguous or possibly internal-only.

### Collect script (reproduce at the repo root)

```bash
since_ref="${1:-}"
until_ref="${2:-HEAD}"

# When no since_ref is passed, pick the most recent tag; fall back to full history.
if [[ -z "${since_ref}" ]]; then
  if git describe --tags --abbrev=0 >/dev/null 2>&1; then
    since_ref="$(git describe --tags --abbrev=0)"
  fi
fi

range="${since_ref:+${since_ref}..}${until_ref}"

git rev-parse --show-toplevel                                       # repo root
git log --reverse --date=short --pretty=format:'%h|%ad|%s' ${range}     # commits
git log --reverse --name-only --pretty=format:'--- %h %s' ${range}      # files touched
```

### Filtering & language rules (from references/release-notes-guidelines.md)

- **Include**: new features, UI changes, behavior changes, bug fixes users would notice, performance improvements with visible impact.
- **Exclude**: refactors, dependency bumps, CI changes, developer tooling, internal logging; analytics changes unless they affect user privacy or behavior.
- **Language**: translate technical terms into user-facing descriptions; avoid "API", "refactor", "nil", "crash log", "dependency", internal codenames, ticket IDs, or file paths.
- **Verbs**: prefer "Added", "Improved", "Fixed", "Updated" or action verbs like "Search", "Upload", "Sync"; keep tense present or past.
- **Shape**: one sentence per bullet, starting with a verb; 5 to 10 bullets total; respect any storefront character limit the user provides.

## Example

Commit -> App Store bullet:

| Raw commit message | App Store bullet |
|---|---|
| `fix(auth): resolve token refresh race condition on iOS 17` | Fixed a login issue that could leave some users unexpectedly signed out. |
| `feat(search): add voice input to search bar` | Search your library hands-free with the new voice input option. |
| `perf(timeline): lazy-load images to reduce scroll jank` | Scrolling through your timeline is now smoother and faster. |

Internal-only commits that are **dropped** (no user impact):
- `chore: upgrade fastlane to 2.219`
- `refactor(network): extract URLSession wrapper into module`
- `ci: add nightly build job`

Example output:

```
What's New in Version 3.4

• Search your library hands-free with the new voice input option.
• Scrolling through your timeline is now smoother and faster.
• Fixed a login issue that could leave some users unexpectedly signed out.
• Added dark-mode support to the settings screen.
• Improved load times when opening large photo albums.
```

Output format: Title optional ("What's New" or product name + version); bullet list only, one sentence per bullet; stick to storefront limits if the user provides one.

## Notes

- The range is everything: every bullet must trace back to a real commit in `since..HEAD`, otherwise drop it. With no tags the script uses full history, which can be too long; converge it or confirm the start ref with the user.
- Do not force ambiguous changes: when unsure whether something is user-visible, ask, or only soften it to "a small improvement" when it is genuinely user-facing.
- Use this skill only when the task clearly matches the scope above. Do not treat the output as a substitute for environment-specific validation, testing, or expert review. Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
- Distinguish from a technical CHANGELOG: this skill produces marketing / user-toned copy, not a structured changelog for developers.

## See also

- requires: `git-advanced-workflows` -- needed to use `git log` / `git describe` to get the commit range and most recent tag.
- related: `release-manager` (technical changelog, version determination, release orchestration), `ios-swiftui-developer` (iOS / App Store context).
- combines_with: `conversion-copywriter` -- polish the benefit-focused, verb-first bullets for stronger conversion.

---

Adapted from sickn33/antigravity-awesome-skills (MIT); originally Dimillian/Skills (MIT).
