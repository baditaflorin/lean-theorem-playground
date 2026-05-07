# Deploy

Live URL: https://baditaflorin.github.io/lean-theorem-playground/

Repository: https://github.com/baditaflorin/lean-theorem-playground

## Publishing

GitHub Pages serves the `docs/` directory from the `main` branch.

```bash
npm install
make build
git add docs package.json package-lock.json src public
git commit -m "feat: update pages build"
git push origin main
```

## Rollback

Revert the publishing commit and push `main`.

```bash
git revert <commit>
git push origin main
```

## Custom Domain

If a custom domain is added later, create `docs/CNAME` with the domain and configure DNS with a `CNAME` record to `baditaflorin.github.io`.

