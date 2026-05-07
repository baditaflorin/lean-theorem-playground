# 0013 Testing

## Status

Accepted

## Context

The app needs fast local checks because there are no GitHub Actions.

## Decision

Use Vitest for logic unit tests and Playwright for a Pages-style smoke test. `make test`, `make build`, and `make smoke` are the local gate.

## Consequences

The pre-push hook can validate the core learning loop in under one minute on a normal machine.

## Alternatives Considered

Browser-only manual testing was rejected because it would not protect proof diagnostics and deployment routing.
