# Paper project website template

A one-page Vue template for a research-paper project. Its visual direction is a dark, cinematic layout with an editorial type scale, restrained neon details, and spacious paper-demo sections.

## Start the site

```bash
npm install
npm run dev
```

Build a production version with:

```bash
npm run build
```

The scripts call the local Vite binaries directly so they also work when this project is inside a Windows path containing `&`.

## What to replace

Most text intended for replacement is visibly wrapped in `[ square brackets ]` in `src/App.vue`.

- Hero: project name, title, introduction, authors, affiliation, and resource URLs.
- Overview and feature cards: abstract and four headline contributions.
- Abstract: replace the headline, paragraph, and keyword pills in `src/App.vue`.
- Demos: every `.mp4` in `docs/videos` is included automatically. Update each matching prompt in the `demos` array in `src/App.vue`.
- Paper and code: `Paper` opens `docs/论文.pdf`; replace the placeholder GitHub URL in the top navigation before release.
- BibTeX: update the citation card before release.

The global style system lives in `src/style.css`; its top-level variables are the fastest way to adjust the accent colour or the overall dark palette.
