# 0003 Frontend Framework

## Status

Accepted

## Context

The app needs a rich editor-like interface, strict TypeScript, fast local builds, and a Pages-ready output.

## Decision

Use React 18, TypeScript strict mode, Vite, Tailwind CSS, TanStack Query, zod, and focused utility libraries.

## Consequences

Vite handles the GitHub Pages base path and hashed assets. React keeps the workbench interactive without introducing a server dependency.

## Alternatives Considered

Svelte and vanilla TypeScript were viable, but React has broader ecosystem support for WebLLM, testing, and future editor integrations.
