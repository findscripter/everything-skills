# Public task catalog

The buildless website reads the repository's generated skill index and shared external-repository loader. It needs no API key, application server, or third-party JavaScript dependencies.

```sh
# Node.js >=22, from the repository root
npm run build:site
# Optional local preview with Python 3
python -m http.server 8765 --bind 127.0.0.1 --directory _site
```

Open `http://127.0.0.1:8765/`. `_site/` is ignored build output. Edit `site/` and rebuild; generated counts follow the source indexes. `npm run build` regenerates those indexes after skill/source changes. `npm test` includes the public search regressions.

The homepage opens with skill and repository search. Visitors can filter by volume or category, switch between English and Chinese, copy an install command, or share a URL that restores the query, filters, language and sort order. Skill bodies keep their original language. The complete Markdown indexes retain archived skills and unavailable or historical-only repository entries. Search labels archived upstream repositories when they are still discoverable.

The **Compare skills** view collects the [reviewed skill comparisons](../docs/skill-ranking.md) from the published skill index. Search by task title, alias, or skill ID, and open or share any task directly. Comparisons show the full ordered list with reasons, including groups spanning multiple volumes. In the separate skill search, the site and CLI share `scripts/skill-ranking.mjs`. Exact task aliases activate a group order, exact skill IDs stay first, and volume filters still apply.

The skill install leaderboard uses a dated [Skills.sh snapshot](https://skills.sh/findscripter/everything-skills) for this repository. It includes current skills with a positive install count returned by the public search feed and displays how much of the catalog that sample covers. Equal counts share a rank. Do not read missing skills as zero installs. To refresh the snapshot for the next publish, run `npm run build:site -- --refresh-installs`, review and commit `site/skill-installs.json`. Routine builds use the committed snapshot without network access.

The GitHub leaderboard shows five active external repositories ordered by cataloged Stars. Each number has its own collection date from the same upstream snapshot. The repository sort applies across the searchable directory and places missing counts last. Task recommendations continue to use the existing comparisons.

`.github/workflows/pages.yml` builds and verifies PRs, then deploys only pushes to `main` through GitHub Pages Actions. Repository Settings → Pages must select **GitHub Actions**. The `zh` branch shares the same site source; the published site switches interface language in the browser.

The REST API review guide is served as static HTML at `guides/rest-api-review/` and `zh/guides/rest-api-review/`. The build lists both URLs in the sitemap. The Google verification file must remain at the root of the published project path to maintain Search Console ownership.

`social-card.svg` is the editable, original source of `social-card.png` (1200×630). It intentionally contains no changing catalog counts. When updating it, render the SVG in a browser and export a PNG at its native size, then inspect the result. The page's Open Graph and Twitter metadata use the PNG.

The page links to a real Nix distribution repair with fixed inputs, measured results, a patch, static review and reproduction steps. Three smaller teaching cases remain under [`examples/`](../examples/README.md). The [recordings](../assets/demos/README.md) capture an earlier interface and its evidence links. Build output fingerprints the scripts, styles and catalog URLs to prevent stale cached dependencies from mixing across deployments.
