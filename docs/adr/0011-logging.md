# 0011 Logging

## Status

Accepted

## Context

Mode A has no server logs.

## Decision

Avoid production console logging. User-visible states are surfaced through panels, diagnostics, and toasts.

## Consequences

Failures remain understandable without collecting logs. Browser devtools can still inspect uncaught errors during development.

## Alternatives Considered

Remote logging was rejected because it would collect user behavior and require an endpoint.
