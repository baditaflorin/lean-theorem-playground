# Contributing

Thanks for helping make rigorous mathematics more approachable.

## Local Setup

```bash
npm install
make install-hooks
make dev
```

## Standards

- Use Conventional Commits.
- Keep the app static-first and preserve GitHub Pages compatibility.
- Do not commit secrets, `.env` files with real values, model credentials, private keys, or local hostnames.
- Add or update ADRs before significant architecture changes.
- Run `make lint`, `make test`, `make build`, and `make smoke` before pushing.
