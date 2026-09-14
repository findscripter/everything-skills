# Security

## What this repository is

**Everything Skills** is a curated encyclopedia of Agent Skills: mostly `SKILL.md` **instruction text** for AI coding agents (Claude Code / Codex / Cursor / Gemini CLI, etc.), plus generated indexes.

- Skills tell agents *how* to work. They are not a binary distribution channel.
- Scripts / network calls that skills mention are documented for agents to run in the **user's** environment under the user's control.
- Third-party skill **libraries** listed under `data/skill-repos*.jsonl` / README are **README-only indexes** — we do not vendor their source or `SKILL.md` bodies.

See also [NOTICE](NOTICE), [LICENSE](LICENSE), and [INDEX/sources.md](INDEX/sources.md) for provenance and licenses of adapted content.

## How to read automated skill scanners

Tools such as “AI Skill Shield” treat shell, SQL, and download snippets inside Markdown as if they were live payloads. At encyclopedia scale that produces **very high false-positive rates**, for example:

| Pattern in `SKILL.md` | Typical scanner label | Usual meaning here |
| --- | --- | --- |
| Official `curl \| bash` / `irm \| iex` installers | “pipe-to-shell / download-exec” | Documented **vendor** install for Bun, uv, etc. Prefer the vendor URL; verify host before running. |
| `DROP TABLE` / `rm -rf` in a **warning** block | “destructive command” | Anti-pattern / cautionary example, not a recommended one-liner. |
| Dockerfile `rm -rf /var/lib/apt/lists/*` | “delete root” | Standard image hygiene; path is under `/var/lib/...`, not `/`. |

Automated findings are **evidence for review**, not a guarantee of malware and not an automatic merge blocker. Prefer human review of concrete paths over bulk auto-rewrites of thousands of instructional snippets.

## Trust & usage guidelines

1. **Prefer official installers** — when a skill quotes `curl\|sh`, confirm the URL is the upstream vendor (or pin a release artifact) before executing.
2. **Destructive examples** — treat `DROP`, recursive deletes, and privilege escalation snippets as hazardous; require backups / confirmations as the skill's own warnings say.
3. **Attack / dual-use content** — this catalog's external index policy excludes offensive / recon packs; report leftovers via a new issue with `full_name` or skill path.
4. **Plugins** — installing via `/plugin marketplace add findscripter/everything-skills` loads instruction plugins; still review skills that touch production data or secrets.

## Reporting a real issue

Please open a **new** GitHub issue (do not reopen scanner mega-threads) with:

- skill path or indexed `owner/repo`
- why it is unsafe beyond “scanner said critical”
- suggested fix (safer command, stronger warning, or removal)

Maintainer contact: GitHub [@findscripter](https://github.com/findscripter).
