# 0010 GitHub Pages Publishing

## Status

Accepted

## Context

The live Pages URL is a first-class deliverable. The project also needs `docs/adr/` and other documentation.

## Decision

Publish GitHub Pages from the `main` branch `/docs` directory. Vite builds into `docs/` with `emptyOutDir: false` so ADRs and static documentation remain committed beside generated app assets. The app uses base path `/lean-theorem-playground/`.

## Consequences

- `docs/` is not gitignored.
- `dist/` stays gitignored because it is not the Pages publish directory.
- `docs/index.html`, hashed assets, `404.html`, manifest, and docs are committed.
- SPA fallback uses `404.html`; GitHub Pages does not support `_redirects`.

## Alternatives Considered

- `gh-pages` branch: keeps generated assets separate, but makes the first commit live-site requirement and documentation discovery more awkward.
- Root publishing: would expose source/build files as the site root.
