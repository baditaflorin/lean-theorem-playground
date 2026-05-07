# 0017 Dependency Policy

## Status

Accepted

## Context

The app depends on browser-heavy libraries and should avoid novelty risk.

## Decision

Use production-ready packages with active ecosystems: React, Vite, Tailwind, TanStack Query, zod, idb-keyval, WebLLM, Markdown-It, Vitest, Playwright, ESLint, and Prettier.

## Consequences

The dependency graph is understandable and testable. `npm audit --audit-level=high` must remain clean.

## Alternatives Considered

Custom storage, custom Markdown, and custom LLM runtimes were rejected.
