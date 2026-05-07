# 0015 Deployment Topology

## Status

Accepted

## Context

Mode C deployment artifacts are not needed.

## Decision

Deploy only through GitHub Pages from `main` `/docs`.

## Consequences

There is no Docker Compose, nginx, Prometheus, GHCR image, or public server port.

## Alternatives Considered

A Pages frontend plus Docker backend was rejected by ADR 0001.
