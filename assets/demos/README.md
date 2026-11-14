# Recorded demonstrations

## Nix repair result page

[Animated walkthrough](nix-discovery-walkthrough.gif) · [Static result graphic](nix-discovery-result.svg) · [Actual repair and replay guide](../../examples/nix-discovery/README.md)

Captured on 2026-11-15 (Asia/Shanghai) from the actual local `_site` build at 1280×800. Four captured page states show the 0 → 1,116 result, evidence links, expanded replay limits and a `systematic-debugger` search. They are encoded as a 640×400, 16.5-second GIF with reading pauses. This is a result-page walkthrough, not a recording of agent, scanner or Nix execution. The separate case records those checks and their limits. No account screens or private inputs appear. The static graphic is a result illustration, not a terminal screenshot.

## Catalog walkthrough

Recorded from the actual static site on 2026-11-02 in an isolated browser viewport. The recording shows the Chinese interface, a task search, volume filtering, install instructions, paper discovery, external repository search, and the worked-example links.

- [Video: catalog-walkthrough.webm](catalog-walkthrough.webm)
- [Animated preview: catalog-walkthrough.gif](catalog-walkthrough.gif)
- [Poster image](catalog-poster.png)

The site was served locally from the same `_site` build used by Pages. No account screens, browser chrome, private files, or notifications appear. This is an interface demonstration; the three [worked examples](../../examples/README.md) separately document actual inputs, inspected outputs, fixture checks, and limitations. The video does not show or claim a Claude Code marketplace installation or automatic execution of the full skill library.

To record an updated walkthrough, run `npm run build:site`, serve `_site/`, and capture the public page at 1280×800. Follow the sequence above with enough pause to read each screen. Export the GIF preview at 640 pixels wide; retain the video for a sharper view. The [marketing storyboards](../../marketing/video-storyboards.md) contain the longer narrated versions for review.
