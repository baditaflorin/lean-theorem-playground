# 0007 Data Generation Pipeline

## Status

Accepted

## Context

This ADR is mandatory only for Mode B projects.

## Decision

No data-generation pipeline exists in v1 because the project uses Mode A.

## Consequences

`make data` is a documented no-op.

## Alternatives Considered

A Mathlib search index generator may become useful later, but v1 only needs a tiny hand-curated lemma index.
