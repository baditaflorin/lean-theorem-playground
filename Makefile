.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push

help:
	@printf '%s\n' \
		'make install-hooks     wire local git hooks' \
		'make dev               run the Vite dev server' \
		'make build             build the static GitHub Pages site into docs/' \
		'make data              no-op for Mode A' \
		'make test              run unit tests' \
		'make test-integration  no-op for Mode A' \
		'make smoke             build and run Playwright smoke tests' \
		'make lint              run eslint, prettier check, and typecheck' \
		'make fmt               format source files' \
		'make pages-preview     serve docs/ like GitHub Pages' \
		'make release           tag the current commit as v$$(node -p "require(\"./package.json\").version")' \
		'make clean             remove local build/test artifacts'

install-hooks:
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev:
	npm run dev

build:
	VITE_APP_VERSION=$$(node -p "require('./package.json').version") npm run build
	test -f docs/index.html

data:
	@printf '%s\n' 'Mode A has no offline data-generation pipeline.'

test:
	npm run test

test-integration:
	@printf '%s\n' 'Mode A has no separate integration suite yet.'

smoke:
	npm run smoke

lint:
	npm run lint
	npm run format:check
	npm run typecheck

fmt:
	npm run format

pages-preview:
	npm run pages-preview

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	@printf '%s\n' 'Usage: .githooks/commit-msg .git/COMMIT_EDITMSG'

hooks-pre-push:
	.githooks/pre-push

release:
	git tag v$$(node -p "require('./package.json').version")
	git push origin v$$(node -p "require('./package.json').version")

clean:
	rm -rf coverage playwright-report test-results docs/assets
