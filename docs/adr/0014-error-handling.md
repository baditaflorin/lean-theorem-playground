# 0014 Error Handling

## Status

Accepted

## Context

Learners need clear feedback when proofs, model loading, export, or storage fail.

## Decision

Represent proof failures as structured diagnostics. Catch optional WebLLM and Pandoc failures and fall back to deterministic hints or Markdown rendering.

## Consequences

The app degrades gracefully instead of blanking the workbench.

## Alternatives Considered

Throwing raw errors into the UI was rejected because it makes Lean onboarding worse.
