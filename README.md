# Leo Suzuki Signal

English portfolio/CV built with HTML, CSS and JavaScript. Read [SITE_PLAN.md](SITE_PLAN.md)
first when continuing development. The source content and media come from Leo’s existing
CV site. The original `MyCVSite` directory is not modified.

## Local preview

Node.js 22 or newer; no package installation is needed.

```sh
npm start
```

Open http://localhost:4173. To validate and preview the deployment artifact:

```sh
npm test
npm run build
npm run preview
```

Stop the first server before starting the preview, or use `PORT=4174 npm run preview`.
The preview server supports byte ranges for seeking in project videos.

## Maintenance

- `index.html`: content, links, native project disclosures and terminal summaries.
  Each main section has `data-label`, `data-message`, `data-graphic` and `data-caption`.
- `style.css`: theme tokens in `:root`, layout, responsive behaviour and motion.
- `script.js`: active section, progress, contextual SVG and mobile companion controls.
- `assets/`: supplied CV, photographs and project media.
- `scripts/build.mjs`: copies only the referenced public files into `dist/`.
- `css/` and `js/`: preserved legacy source, not loaded or published by this version.

The companion is a curated reading guide, not a live chatbot. Its text and illustrative
graphics follow the current section. Project content and navigation also work without
JavaScript. Reduced-motion preferences disable continuous motion and entrance effects.
Videos load on demand and pause when their project is closed.

An optional browser check is available in `tests/browser.mjs`. With Playwright
and its Chromium browser already installed, start the preview and run
`node tests/browser.mjs`. For an installation outside this directory, set
`PLAYWRIGHT_MODULE` to its absolute `playwright/index.mjs` path. Screenshots are
saved to the ignored `test-results/` directory.

## GitHub Pages

This directory is prepared to become a separate repository. Nothing has been published.
Put its contents at the root of the new repository, use the `main` branch and select
**Settings → Pages → Source → GitHub Actions**. The included workflow validates,
builds and deploys `dist/` on pushes to `main` or manual runs.

All local links are relative, so a project URL such as
`https://<username>.github.io/LeoSuzukiSignal/` works without changing asset paths.
No secrets, environment configuration or paid services are required.

The build preserves existing files in `dist/`; for a fresh deployment artifact use a
fresh checkout, as the GitHub workflow does. When removing old public assets locally,
remove the corresponding generated files from `dist/` as well.
