---
name: minimax-media-cli
title: MiniMax Multimodal Generation CLI (mmx)
description: Use to generate text, images, video, speech, and music, run web search, or do image understanding from the terminal via the MiniMax platform's `mmx` CLI with agent flags (--non-interactive/--quiet/--output json/--async); not for local fine editing (fall back to ffmpeg) or other p
domain: 创意/av
triggers: [mmx, MiniMax CLI, Hailuo text-to-video, text-to-image / text-to-video, text-to-speech / TTS, generate music / BGM, MiniMax web search, image understanding / vision describe, mmx auth login, batch media generation in the terminal]
tags: [creative, av, media-generation, minimax, mmx, cli, text-to-image, text-to-video, tts, music-generation, hailuo, web-search, vlm]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [fal-ai-media-generation, demo-video-generator, magic-motion-animator, videodb-perception-editing]
combines_with: [ai-native-cli-design, algorithmic-art]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
Use the `mmx` terminal CLI to drive the MiniMax AI platform: one command for text chat, image/video/speech/music generation, web search, and image understanding (VLM). All generation happens on MiniMax servers; locally you only send parameters and retrieve files or JSON. Designed for non-interactive (agent/CI) use: fixed flags yield clean data on stdout and deterministic exit codes.

## When to use

Use this skill when the user wants to generate or inspect text, images, video, speech, music, web-search results, or MiniMax API resources through the `mmx` terminal CLI.

Use when:
- Generating media in the terminal in a batch/orchestratable way: text-to-image, text/image-to-video (Hailuo), text-to-speech, music/BGM, web search, asking questions about an image (vision).
- The user says "use mmx…", "have MiniMax generate a video", "Hailuo text-to-video", "text-to-speech", "generate some background music", or "do a MiniMax web search".
- Wiring media generation into scripts/pipelines that need machine-readable JSON output and explicit exit codes.

Do NOT use when (negative boundaries):
- `mmx` is not installed or not authenticated (no API key / OAuth): any API-backed command will fail (exit code 3). Install and log in first; the key is supplied by the user — do not read or write credential files yourself.
- Fine-grained local editing is needed (transitions, retiming, cropping/color grading, multitrack mixing, timeline stitching): `mmx` only generates. Fall back to ffmpeg or `videodb-perception-editing`.
- Another provider is wanted (fal.ai / ElevenLabs / Veo): use `fal-ai-media-generation` or the corresponding direct API. This skill covers MiniMax only.

## Steps

1. Install and authenticate: `npm install -g mmx-cli`, then `mmx auth login --api-key sk-xxxxx` (OAuth persists to `~/.mmx/credentials.json`, API key persists to `~/.mmx/config.json`). Confirm with `mmx auth status`. You can also pass `--api-key` per call. Region is auto-detected; override with `--region global` or `--region cn`.
2. Pick the subcommand: text chat / image generate / video generate / speech synthesize / music generate / search query / vision describe.
3. In agent contexts always add the agent flags (see below) to get pure data and deterministic exit codes.
4. For async tasks like video: pass `--async` to get a `taskId` immediately, then poll `video task get` and finish with `video download`; or block with `--download` to wait for completion.
5. Retrieve the file/URL/JSON and branch on exit code (see table). On failure, do not wait indefinitely.

## Agent flags

Always use these flags in non-interactive (agent/CI) contexts:

| Flag | Purpose |
|---|---|
| `--non-interactive` | Fail fast on missing args instead of prompting |
| `--quiet` | Suppress spinners/progress; stdout is pure data |
| `--output json` | Machine-readable JSON output |
| `--async` | Return task ID immediately (video generation) |
| `--dry-run` | Preview the API request without executing |
| `--yes` | Skip confirmation prompts |

Commands and default models:
- `text chat --message <text>` (default `MiniMax-M2.7`; add `--system` for multi-turn; read from file/pipe with `--messages-file -`)
- `image generate --prompt <text>` (`image-01`; `--n` for multiple images, `--out-dir` to save to disk)
- `video generate --prompt <text>` (default `MiniMax-Hailuo-2.3`; async, polls until completion by default)
- `speech synthesize --text <text>` (default `speech-2.8-hd`, max 10k chars; `--out` to save, `--text-file -` to read from pipe)
- `music generate --prompt <text>` (`music-2.6-free`; `--instrumental` for instrumental, `--lyrics <text>` to set lyrics, `--lyrics-optimizer` to auto-write lyrics)
- `search query --q <text>` (MiniMax web search)
- `vision describe --image <file> --prompt <text>` (VLM image understanding)

## Example

Text chat (machine-readable):
```bash
mmx text chat --message "user:What is MiniMax?" --output json --quiet

# Multi-turn with system prompt
mmx text chat \
  --system "You are a coding assistant." \
  --message "user:Write fizzbuzz in Python" \
  --output json

# From file
cat conversation.json | mmx text chat --messages-file - --output json
```

Text-to-image (multiple images to disk):
```bash
mmx image generate --prompt "A cat in a spacesuit" --n 3 --out-dir ./gen/ --quiet
```

Text-to-video — non-blocking task ID / blocking download:
```bash
mmx video generate --prompt "A robot." --async --quiet
mmx video generate --prompt "Ocean waves." --download ocean.mp4 --quiet
```

Text-to-speech / music:
```bash
mmx speech synthesize --text "Hello world" --out hello.mp3 --quiet
echo "Breaking news." | mmx speech synthesize --text-file - --out news.mp3

mmx music generate --prompt "Cinematic orchestral, building tension" --instrumental --out bgm.mp3 --quiet
mmx music generate --prompt "Upbeat pop about summer" --lyrics-optimizer --out summer.mp3 --quiet
```

Piping patterns — generate then describe / full async video workflow:
```bash
# Chain: generate image → describe it
URL=$(mmx image generate --prompt "A sunset" --quiet)
mmx vision describe --image "$URL" --quiet

# Async video workflow
TASK=$(mmx video generate --prompt "A robot" --async --quiet | jq -r '.taskId')
mmx video task get --task-id "$TASK" --output json
mmx video download --task-id "$TASK" --out robot.mp4
```

## Notes

- Exit codes: `0` success / `1` general error / `2` usage error / `3` authentication error / `4` quota exceeded / `5` timeout / `10` content filter triggered.
- No auth, no go: run `mmx auth login` and confirm with `auth status` first. The key is supplied by the user — do not read or write credential files.
- In agent contexts always pass `--non-interactive --quiet --output json`, otherwise you get stuck on interactive prompts or receive dirty output with progress bars.
- Media tasks may be async, quota-limited, or region-constrained: use `--async` + polling for video and handle outcomes explicitly by exit code (3 auth / 4 quota / 5 timeout / 10 content filter). Do not wait indefinitely.
- Speech is capped at 10k chars; split long text first.
- This skill documents CLI usage only and does not replace provider policy review, content-safety checks, or downstream file validation.

## See also

- related: `fal-ai-media-generation` — another multimodal generation stack (fal.ai, including Veo/Kling/Seedance); compare when choosing a provider.
- related: `videodb-perception-editing` — takes mmx output into video perception indexing and server-side timeline editing.
- related: `demo-video-generator` — renders demo videos from scratch, complementary to pure AI generation.
- combines_with: `videodb-perception-editing` — mmx produces assets + VideoDB orchestrates the timeline for a complete media pipeline.
- combines_with: `ai-native-cli-design` — patterns for designing agent-friendly CLIs like mmx.
