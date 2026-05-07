# Postmortem

## What Was Built

A public Mode A GitHub Pages app with a Lean-style proof workbench, five Mathlib-oriented exercises, structured proof diagnostics, optional local WebLLM tutoring, IndexedDB progress, Markdown/HTML export, PWA assets, ADRs, local hooks, unit tests, and Playwright smoke tests.

Live URL: https://baditaflorin.github.io/lean-theorem-playground/

Repository: https://github.com/baditaflorin/lean-theorem-playground

## Was Mode A Correct?

Yes for v1. The UI, local progress, tutor fallback, and export loop do not require a server. A backend would mostly add operational surface area. The main caveat is full Lean 4 + Mathlib execution: the app has a static adapter boundary, but the published build does not bundle the full official Lean/Mathlib WASM artifacts.

## What Worked

- GitHub Pages from `docs/` worked cleanly with Vite base path.
- WebLLM can be kept behind a user action as a lazy chunk.
- Unit tests cover the proof diagnostic core.
- Smoke tests verify the Pages-style route, repo link, PayPal link, version, commit, and proof check.

## What Did Not

- Bundling `pandoc-wasm` directly through Vite failed because the package exposes a WASI import. The app now lazy-loads it from `https://esm.sh` and falls back to Markdown-It.
- Full Lean 4 + Mathlib in-browser checking remains dependent on official static artifacts that are not bundled in this repository.

## Surprises

The WebLLM lazy chunk is large, but it is not preloaded and therefore does not break the initial payload target.

## Accepted Tech Debt

- The structured proof checker recognizes curated proof shapes rather than executing the Lean kernel.
- The editor is a polished textarea instead of CodeMirror/Monaco.
- Pandoc-WASM is optional and CDN-loaded.

## Next Improvements

1. Package official Lean 4 WASM and a small Mathlib archive under `public/lean/`.
2. Replace the textarea with CodeMirror plus Lean syntax highlighting and keyboard commands.
3. Add a generated Mathlib lemma search artifact once the index size justifies Mode B.

## Time

Estimated: one focused implementation session.

Actual: one focused implementation session, with extra time spent on Vite/WASM packaging and Pages smoke tests.
