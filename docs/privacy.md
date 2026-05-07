# Privacy

Lean Theorem Playground collects no analytics in v1.

## What Stays Local

- Lean drafts.
- Solved exercise progress.
- Tutor prompts and responses.
- Exported proof notes.

Progress is stored in browser IndexedDB. Local WebLLM model assets are downloaded only after the user starts the local tutor.

## Network Requests

- GitHub Pages serves the static app.
- Starting WebLLM may download model/runtime assets from WebLLM model hosts.
- Rendering with Pandoc may request the `pandoc-wasm` browser package from `https://esm.sh`.

No secrets are sent by the app because the app has no secrets.
