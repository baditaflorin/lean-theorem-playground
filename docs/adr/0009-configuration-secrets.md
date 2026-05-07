# 0009 Configuration And Secrets

## Status

Accepted

## Context

The frontend is public static code and must never contain secrets.

## Decision

Use build-time public constants for version, commit, repository URL, PayPal URL, and Pages URL. Keep `.env.example` placeholder-only. Do not support secret runtime configuration.

## Consequences

No API keys or private tokens are needed. Gitleaks runs in the pre-commit hook.

## Alternatives Considered

Runtime configuration fetched from a server was rejected because it would create a backend dependency.
