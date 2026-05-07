# 0001 Deployment Mode

## Status

Accepted

## Context

The product should be a rigorous-mathematics-for-everyone tool with Lean 4, Mathlib-oriented examples, a local tutor, and export. The default architectural bias is GitHub Pages first.

## Decision

Use Mode A: Pure GitHub Pages.

The v1 public surface is a static browser app. Lean execution is isolated behind a client-side adapter, local tutoring is optional through WebLLM/WebGPU, exports run in browser code, and user progress persists in IndexedDB.

## Consequences

- No backend, Docker, nginx, runtime database, auth, server metrics, or secrets.
- GitHub Pages can serve the whole app from the `docs/` directory.
- Full Lean 4 + Mathlib browser execution depends on static WASM/library artifacts being supplied under `public/lean/`.
- The app ships deterministic learning diagnostics for bundled exercises until the Lean WASM browser-library path is production-ready.

## Alternatives Considered

- Mode B: unnecessary because v1 has no external data pipeline.
- Mode C: rejected because there are no runtime secrets, writes, auth, or cross-device sync requirements.
