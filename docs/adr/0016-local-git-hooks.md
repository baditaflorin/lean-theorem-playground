# 0016 Local Git Hooks

## Status

Accepted

## Context

The project must use local hooks instead of GitHub Actions.

## Decision

Use plain `.githooks/` wired by `make install-hooks`.

## Consequences

Pre-commit runs lint, format check, typecheck, and gitleaks. Commit messages are Conventional Commits. Pre-push runs tests, build, and smoke.

## Alternatives Considered

Lefthook was considered, but plain hooks reduce dependencies.
