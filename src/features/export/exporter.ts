import MarkdownIt from "markdown-it";
import type { Exercise } from "../lean/exercises";
import type { ProofCheckResult } from "../lean/leanRuntime";

export interface ExportBundle {
  markdown: string;
  html: string;
  engine: "pandoc-wasm" | "markdown-it-fallback";
  warnings: string[];
}

interface PandocResult {
  stdout: string;
  stderr?: string;
  warnings?: unknown[];
}

interface PandocModule {
  convert(
    options: Record<string, string | boolean>,
    stdin: string,
    files: Record<string, string | Blob>,
  ): Promise<PandocResult>;
}

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const pandocWasmUrl = "https://esm.sh/pandoc-wasm@1.0.1";

export function buildProofMarkdown(
  exercise: Exercise,
  code: string,
  result: ProofCheckResult | null,
): string {
  const status = result ? result.status : "not checked";
  const diagnostics =
    result?.diagnostics.map(
      (diagnostic) => `- ${diagnostic.severity}: ${diagnostic.message}`,
    ) ?? [];

  return [
    `# ${exercise.title}`,
    "",
    `Statement: ${exercise.statement}`,
    "",
    `Goal: \`${exercise.goal}\``,
    "",
    `Status: ${status}`,
    "",
    "```lean",
    code.trim(),
    "```",
    "",
    "## Intuition",
    "",
    exercise.intuition,
    "",
    "## Diagnostics",
    "",
    diagnostics.length > 0 ? diagnostics.join("\n") : "- No diagnostics yet.",
    "",
  ].join("\n");
}

export async function exportProof(
  exercise: Exercise,
  code: string,
  result: ProofCheckResult | null,
): Promise<ExportBundle> {
  const proofMarkdown = buildProofMarkdown(exercise, code, result);

  try {
    const pandocModule = (await import(
      /* @vite-ignore */ pandocWasmUrl
    )) as unknown as PandocModule;
    const converted = await pandocModule.convert(
      {
        from: "markdown",
        to: "html",
        standalone: true,
      },
      proofMarkdown,
      {},
    );

    return {
      markdown: proofMarkdown,
      html: converted.stdout,
      engine: "pandoc-wasm",
      warnings: [
        ...(converted.stderr ? [converted.stderr] : []),
        ...(converted.warnings?.map(String) ?? []),
      ],
    };
  } catch (error) {
    return {
      markdown: proofMarkdown,
      html: markdown.render(proofMarkdown),
      engine: "markdown-it-fallback",
      warnings: [
        error instanceof Error ? error.message : "Pandoc-WASM was unavailable.",
      ],
    };
  }
}

export function downloadText(
  filename: string,
  text: string,
  mime: string,
): void {
  const blob = new Blob([text], { type: mime });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}
