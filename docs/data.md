# Static Data

Mode: A, pure GitHub Pages.

There is no scheduled data pipeline in v1.

## Static Contracts

Exercises live in `src/features/lean/exercises.ts` and are validated with zod.

Lean runtime metadata lives at:

`public/lean/lean-runtime-manifest.json`

Published copy:

`docs/lean/lean-runtime-manifest.json`

## Freshness

The exercise index is versioned with the app. Runtime asset availability is detected at page load.

## Regeneration

`make data` is a no-op for Mode A.
