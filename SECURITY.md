# Security Policy

Please report security issues through GitHub private vulnerability reporting:

https://github.com/baditaflorin/lean-theorem-playground/security/advisories/new

Do not open public issues for suspected vulnerabilities.

## Baseline

- No runtime backend.
- No frontend secrets.
- No analytics by default.
- Local state stays in the browser through IndexedDB/localStorage.
- Local LLM model downloads are user-initiated and run in the browser.

