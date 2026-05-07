# 0006 WASM Modules

## Status

Accepted

## Context

The concept calls for Lean 4 WASM, local LLM execution, and Pandoc.

## Decision

Use three browser-WASM paths:

- Lean: adapter detects optional official Lean 4 Emscripten artifacts under `public/lean/`.
- Tutor: WebLLM downloads model/runtime assets only after the user clicks Start WebLLM.
- Export: Pandoc-WASM is attempted through a lazy CDN import; Markdown rendering is the fallback.

## Consequences

Initial load stays small. GitHub Pages cannot set COOP/COEP headers, so v1 avoids threaded SharedArrayBuffer requirements.

## Alternatives Considered

Bundling Pandoc-WASM through Vite was attempted, but the current package exposes a WASI import that breaks the Pages build. A Docker backend was rejected by ADR 0001.
