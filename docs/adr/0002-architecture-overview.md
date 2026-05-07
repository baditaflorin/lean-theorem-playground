# 0002 Architecture Overview

## Status

Accepted

## Context

The app must teach Lean proof construction while staying deployable as static GitHub Pages.

## Decision

Use a feature-oriented frontend:

- `features/lean`: exercises, Mathlib index, runtime adapter, proof diagnostics.
- `features/tutor`: deterministic tutor plus optional WebLLM local model.
- `features/export`: Markdown export plus Pandoc-WASM attempt.
- `features/storage`: IndexedDB progress persistence.

## Consequences

Each feature can evolve independently. The Lean adapter boundary allows official Lean WASM assets to replace the structured checker without changing the UI.

## Alternatives Considered

A monolithic app component was rejected because the Lean, tutor, export, and storage concerns have different failure modes.
