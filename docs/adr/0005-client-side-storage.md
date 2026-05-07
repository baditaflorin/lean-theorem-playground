# 0005 Client-Side Storage

## Status

Accepted

## Context

Learners need local progress persistence without auth or cross-device sync.

## Decision

Use IndexedDB via `idb-keyval` for exercise code, solved exercise IDs, and update timestamps.

## Consequences

Progress stays private to the browser and works offline. Clearing browser storage removes progress.

## Alternatives Considered

`localStorage` was simpler, but IndexedDB is better for future proof histories and larger local exports.
