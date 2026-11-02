# Public task catalog

The buildless website reads the repository's generated skill index and shared external-repository loader. It needs no API key, application server, or third-party JavaScript dependencies.

```sh
# Node.js >=22, from the repository root
npm run build:site
# Optional local preview with Python 3
python -m http.server 8765 --bind 127.0.0.1 --directory _site
```

Open `http://127.0.0.1:8765/`. `_site/` is ignored build output. Edit `site/` and rebuild; generated counts follow the source indexes. `npm run build` regenerates those indexes after skill/source changes. `npm test` includes the public search regressions.

The site provides English/Chinese interface controls, skill/repository search, volume/category filters, install commands, and shareable query URLs. Skill bodies keep their original language. Archived skills and historical-only/unavailable upstream repositories stay out of default discovery; the complete Markdown indexes preserve the historical records. An archived upstream can still be listed with its state shown. Review status is metadata, not a runtime or security certification.

`.github/workflows/pages.yml` builds and verifies PRs, then deploys only pushes to `main` through GitHub Pages Actions. Repository Settings → Pages must select **GitHub Actions**. The `zh` branch shares the same site source; the published site switches interface language in the browser.

`social-card.svg` is the editable, original source of `social-card.png` (1200×630). It intentionally contains no changing catalog counts. When updating it, render the SVG in a browser and export a PNG at its native size, then inspect the result. The page's Open Graph and Twitter metadata use the PNG.

Three worked examples are linked directly to their maintained files under [`examples/`](../examples/README.md). The short [recording](../assets/demos/README.md) demonstrates catalog interactions, not an agent executing every skill.
