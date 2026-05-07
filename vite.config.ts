import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { defineConfig } from "vite";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as {
  version: string;
};

function gitCommit(): string {
  try {
    return execSync("git rev-parse --short=12 HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return process.env.VITE_COMMIT_SHA ?? "dev";
  }
}

const repositoryName = "lean-theorem-playground";
const base = process.env.VITE_APP_BASE ?? `/${repositoryName}/`;

export default defineConfig({
  base,
  plugins: [
    {
      name: "clean-generated-pages-assets",
      buildStart() {
        rmSync(new URL("./docs/assets", import.meta.url), {
          recursive: true,
          force: true,
        });
      },
    },
    react(),
  ],
  build: {
    outDir: "docs",
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "@tanstack/react-query"],
          markdown: ["markdown-it"],
        },
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(
      process.env.VITE_APP_VERSION ?? pkg.version,
    ),
    __COMMIT_SHA__: JSON.stringify(gitCommit()),
    __REPO_URL__: JSON.stringify(
      "https://github.com/baditaflorin/lean-theorem-playground",
    ),
    __PAYPAL_URL__: JSON.stringify(
      "https://www.paypal.com/paypalme/florinbadita",
    ),
    __PAGES_URL__: JSON.stringify(
      `https://baditaflorin.github.io/${repositoryName}/`,
    ),
  },
});
