# 0012 Metrics And Observability

## Status

Accepted

## Context

The default for Mode A/B is no analytics.

## Decision

Ship no analytics in v1.

## Consequences

There is no PII collection, no cookies for measurement, and no telemetry backend. Success is measured locally through tests and user-visible behavior.

## Alternatives Considered

Plausible or a Cloudflare Worker beacon may be revisited after an explicit privacy review.
