# Everything Skills on Omarchy

Everything Skills provides local search, relationship lookup, fixed workflow recipes and skill-file reading. Omarchy can expose the same commands to its coding agents through a small optional adapter. The CLI does not launch a model, execute a workflow, install a skill's tools or download external skill bodies.

## Commands from any project directory

After installing the system package, the entry point uses its own installed catalog root:

```sh
everything-skills search "API review" --limit 3 --json
everything-skills compose api-review --json
everything-skills show api-design-reviewer --json
everything-skills why api-design-reviewer --json
everything-skills repo anthropics/skills --json
everything-skills eval --json
```

From a checkout, the same entry is `node /path/to/everything-skills/bin/everything-skills.mjs`. The older `node scripts/everything-skills.mjs` invocation still defaults to the current working directory; use `--root` when calling that file from elsewhere.

`show` returns the exact content, absolute path and `skill_dir`. Resolve packaged scripts, references and templates relative to that directory. Keep the task's working directory and outputs in the user's project.

## Composition contract

`compose` is **plan-only**:

- `kind: workflow` returns a registered recipe with ordered steps, inputs, outputs, checks, a source document and explicit limits. The first recipes are `repository-onboarding`, `paper-reading` and `api-review`, derived from the bounded teaching examples.
- `kind: suggestions` returns a main skill, all direct prerequisite declarations and a limited set of deduplicated, non-archived combination candidates. It has no inferred execution order. The agent must read the candidate descriptions and bodies before choosing a plan.

`requires` describes prerequisite skills, not operating-system packages. `combines_with` is an unordered recommendation. `related` is navigation. None of these edges certify that the tools are installed, that outputs are compatible, or that a workflow has run successfully. `--limit` limits combination suggestions, not prerequisite declarations or recipe steps.

The recipes preserve the example limitations: their original reproduction scripts are bounded, independently written checks, not a generic engine or replacements for missing skill helpers in arbitrary projects. Every new task needs its own inputs, permissions and validation.

## Agent entry

The bundled `everything-skills-catalog` skill explains search, composition and staged loading. An Omarchy adapter can publish a small system skill under `$OMARCHY_PATH/default/agents/skills/` and use Omarchy's existing per-user symlinks for supported harnesses. It should direct agents to this installed catalog entry with `show` and preserve user-owned skills and instructions.

An agent with no native skill mechanism can read the path returned by `show` directly. Installing files does not guarantee automatic discovery by every client. Test each supported client separately. Avoid appending the entire catalog to global agent instructions.

## Arch package

The recipe in `packaging/arch/PKGBUILD` builds an architecture-independent data/Node package. Run `makepkg` as a regular user on Arch. It installs the entry under `/usr/bin/everything-skills`, and the runtime, catalog, complete skill/resource directories and bounded examples under `/usr/share/everything-skills`. It declares Node.js 22 or later as a runtime dependency. An installed agent's mise configuration is not a substitute for that package dependency.

The Arch-installed entry selects `/usr/bin/node` explicitly, so a project's older mise Node cannot shadow the runtime declared by the package. The checkout entry remains portable through `node` on PATH.

The initial recipe pins a reviewed source commit instead of following a moving branch. A maintainer must update that pin when publishing the next version. For an integration review, the feature PR and pin are usable as an unreleased snapshot; they are not an official Omarchy package or an upstream endorsement.

Check out the reviewed feature/release containing the recipe, inspect it, then build and install as your regular user on Arch:

```sh
cd packaging/arch
makepkg -si
```

`makepkg` obtains the pinned source and runs the focused CLI checks. Installation and missing package dependencies may request system authorization. The recipe uses a custom collective-work license reference with the bundled texts, following [Arch's license metadata convention](https://wiki.archlinux.org/title/PKGBUILD#license); it does not replace individual source/resource grants.

The package is optional and is not yet available from Omarchy's configured repositories. Do not advertise `pacman -S everything-skills` until a repository actually provides it. The Omarchy adapter is submitted separately and may depend on this feature being merged and packaged.

Package upgrades and removals are handled by pacman. Keep user-level agent links/configuration outside package post-install scripts; the adapter's user setup should link only its own entry and keep conflicting user files. Existing Omarchy users need that setup or an appropriate migration because first-user provisioning runs once.

## Scope and licenses

All CLI catalog queries are local and read-only. External repository entries are discovery metadata, not installed skills; `repo` does not fetch or execute their bodies. Unknown or unreviewed quality fields remain unknown or unreviewed. The `stable` label is not a Linux runtime or security certification.

The distribution retains `LICENSE`, `NOTICE`, per-skill source fields and resource notices. Original repository work uses CC BY 4.0, while adapted content keeps its stated upstream license. Omarchy's MIT license does not replace those grants. Each skill's runtime tools, services, credentials and user inputs remain separate prerequisites.

## Verification

Run `node --test tests/skill-cli.test.mjs` for the CLI contract and the normal full repository checks before publishing. Verify a staged package from an unrelated working directory, including `show` and recipe lookup, and confirm referenced resources and example sources are present. Linux package creation and real Claude/Codex/OpenCode sessions require their own evidence; a Windows CLI test is not that evidence.
