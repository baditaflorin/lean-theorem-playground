# 0004 Static Data Contract

## Status

Accepted

## Context

Mode A has no generated backend data, but it does ship static exercise and runtime metadata.

## Decision

Keep small educational data in typed source modules and static runtime metadata in `public/lean/lean-runtime-manifest.json`.

The manifest schema is:

```json
{
  "schemaVersion": 1,
  "leanVersion": "string",
  "mathlibSnapshot": "string",
  "assets": {
    "leanJs": "optional string",
    "leanWasm": "optional string",
    "libraryZip": "optional string"
  }
}
```

## Consequences

The frontend can detect whether full Lean WASM assets exist without a server. Breaking manifest changes must bump `schemaVersion`.

## Alternatives Considered

JSON exercise files were considered, but colocated typed modules give better test coverage and validation through zod.
