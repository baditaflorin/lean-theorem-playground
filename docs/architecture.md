# Architecture

Live URL: https://baditaflorin.github.io/lean-theorem-playground/

Repository: https://github.com/baditaflorin/lean-theorem-playground

## C4 Context

```mermaid
flowchart LR
  Learner["Learner"] --> App["Lean Theorem Playground on GitHub Pages"]
  App --> BrowserStorage["IndexedDB / Service Worker"]
  App --> WebLLM["WebLLM local browser model"]
  App --> Pandoc["Pandoc-WASM CDN attempt"]
  App -. optional .-> LeanAssets["Static Lean 4 WASM + Mathlib assets"]
```

## Container Diagram

```mermaid
flowchart TB
  subgraph Pages["GitHub Pages boundary"]
    Static["Vite React static app"]
    Docs["ADRs and docs"]
    Manifest["Lean runtime manifest"]
  end
  subgraph Browser["User browser"]
    Workbench["Proof workbench"]
    LeanAdapter["Lean adapter / structured checker"]
    Tutor["Rule tutor / WebLLM"]
    Exporter["Markdown / Pandoc exporter"]
    Store["IndexedDB progress"]
  end
  Static --> Workbench
  Workbench --> LeanAdapter
  Workbench --> Tutor
  Workbench --> Exporter
  Workbench --> Store
  Manifest --> LeanAdapter
```

## Boundaries

No runtime backend exists. All user code and proof drafts stay in the browser unless the user exports them manually.
