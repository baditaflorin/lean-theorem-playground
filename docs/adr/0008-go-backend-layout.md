# 0008 Go Backend Layout

## Status

Accepted

## Context

This ADR is mandatory only for Mode B or Mode C projects.

## Decision

No Go backend is included in v1.

## Consequences

There is no `cmd/`, `internal/`, Dockerfile, compose stack, runtime API, or server-side configuration.

## Alternatives Considered

A Go API was rejected because all v1 behavior can run in the browser.
