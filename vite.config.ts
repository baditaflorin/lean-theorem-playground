import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8')) as {
  version: string;
};

function gitCommit(): string {
  try {
    return execSync('git rev-parse --short=12 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return process.env.VITE_COMMIT_SHA ?? 'dev';
  }
}

const repositoryName = 'lean-theorem-playground';
const base = process.env.VITE_APP_BASE ?? `/${repositoryName}/`;

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@tanstack/react-query'],
          markdown: ['markdown-it'],
        },
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION ?? pkg.version),
    __COMMIT_SHA__: JSON.stringify(gitCommit()),
    __REPO_URL__: JSON.stringify('https://github.com/baditaflorin/lean-theorem-playground'),
    __PAYPAL_URL__: JSON.stringify('https://www.paypal.com/paypalme/florinbadita'),
    __PAGES_URL__: JSON.stringify(`https://baditaflorin.github.io/${repositoryName}/`),
  },
});

