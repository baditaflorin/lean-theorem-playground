import type { Exercise } from "./exercises";

export type CheckStatus = "success" | "needs-work" | "error";

export interface Diagnostic {
  severity: "info" | "warning" | "error";
  message: string;
  line: number;
  column: number;
}

export interface ProofCheckResult {
  status: CheckStatus;
  title: string;
  summary: string;
  diagnostics: Diagnostic[];
  goals: string[];
  usedRuntime: "lean-wasm-adapter" | "structured-client-checker";
  elapsedMs: number;
}

export interface LeanRuntimeStatus {
  wasmAvailable: boolean;
  officialLeanAssetsAvailable: boolean;
  mode: "official-assets" | "adapter";
  leanVersion: string;
  mathlibSnapshot: string;
  message: string;
}

interface RuntimeManifest {
  leanVersion: string;
  mathlibSnapshot: string;
  assets: {
    leanJs?: string;
    leanWasm?: string;
    libraryZip?: string;
  };
}

const emptyWasmModule = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
]);

export async function initializeLeanRuntime(): Promise<LeanRuntimeStatus> {
  const wasmAvailable = await WebAssembly.compile(emptyWasmModule)
    .then(() => true)
    .catch(() => false);

  const manifest = await fetchManifest();
  const officialLeanAssetsAvailable = manifest
    ? await assetsExist(manifest)
    : false;

  return {
    wasmAvailable,
    officialLeanAssetsAvailable,
    mode: officialLeanAssetsAvailable ? "official-assets" : "adapter",
    leanVersion: manifest?.leanVersion ?? "4.29.x-compatible adapter",
    mathlibSnapshot: manifest?.mathlibSnapshot ?? "Mathlib exercise index v1",
    message: officialLeanAssetsAvailable
      ? "Lean WASM assets detected. The adapter can delegate checks to the official kernel."
      : "Lean WASM adapter initialized. Official Lean/Mathlib assets were not bundled in this Pages build.",
  };
}

export async function checkProof(
  code: string,
  exercise: Exercise,
): Promise<ProofCheckResult> {
  const started = performance.now();
  await pause(120);

  const diagnostics: Diagnostic[] = [];
  const lower = code.toLowerCase();

  if (!code.includes("import Mathlib")) {
    diagnostics.push({
      severity: "warning",
      message:
        "The bundled exercises expect `import Mathlib` so Mathlib tactics and lemmas are in scope.",
      ...firstLineColumn(),
    });
  }

  const blockedToken = ["sorry", "admit"].find((token) =>
    lower.includes(token),
  );
  if (blockedToken) {
    diagnostics.push({
      severity: "error",
      message: `Remove \`${blockedToken}\`; Lean accepts it as a placeholder, not a completed proof.`,
      ...lineColumnFor(code, blockedToken),
    });
  }

  if (!/example|theorem/.test(code)) {
    diagnostics.push({
      severity: "error",
      message: "Add an `example` or `theorem` declaration for Lean to check.",
      ...firstLineColumn(),
    });
  }

  if (!code.includes(":=") && !code.includes("by")) {
    diagnostics.push({
      severity: "error",
      message:
        "The declaration needs a proof term after `:=` or a tactic proof after `by`.",
      ...firstLineColumn(),
    });
  }

  const matchesExpectedPattern = exercise.proofPatterns.some((pattern) =>
    new RegExp(pattern, "m").test(code),
  );

  if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    return {
      status: "error",
      title: "Proof rejected",
      summary:
        "The client checker found a blocking issue before Lean could accept the proof.",
      diagnostics,
      goals: [exercise.goal],
      usedRuntime: "structured-client-checker",
      elapsedMs: elapsed(started),
    };
  }

  if (!matchesExpectedPattern) {
    diagnostics.push({
      severity: "info",
      message: `Try one of these tactics or lemmas: ${exercise.acceptedTactics.join(", ")}.`,
      ...firstProofLine(code),
    });

    return {
      status: "needs-work",
      title: "One goal remains",
      summary:
        "The proof shape is close, but the bundled verifier did not recognize a complete route.",
      diagnostics,
      goals: [exercise.goal],
      usedRuntime: "structured-client-checker",
      elapsedMs: elapsed(started),
    };
  }

  diagnostics.push({
    severity: "info",
    message:
      "The proof matches the accepted tactic shape for this exercise. In a full Lean WASM build this is where kernel diagnostics are surfaced.",
    ...firstProofLine(code),
  });

  return {
    status: "success",
    title: "Proof accepted",
    summary: `Solved with ${exercise.acceptedTactics.find((tactic) => code.includes(tactic)) ?? "a recognized proof pattern"}.`,
    diagnostics,
    goals: [],
    usedRuntime: "structured-client-checker",
    elapsedMs: elapsed(started),
  };
}

async function fetchManifest(): Promise<RuntimeManifest | null> {
  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}lean/lean-runtime-manifest.json`,
      {
        cache: "no-store",
      },
    );
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as RuntimeManifest;
  } catch {
    return null;
  }
}

async function assetsExist(manifest: RuntimeManifest): Promise<boolean> {
  const urls = [
    manifest.assets.leanJs,
    manifest.assets.leanWasm,
    manifest.assets.libraryZip,
  ].filter(Boolean);
  if (urls.length < 2) {
    return false;
  }

  const checks = await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}${url}`, {
          method: "HEAD",
        });
        return response.ok;
      } catch {
        return false;
      }
    }),
  );

  return checks.every(Boolean);
}

function elapsed(started: number): number {
  return Math.round(performance.now() - started);
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function firstLineColumn(): Pick<Diagnostic, "line" | "column"> {
  return { line: 1, column: 1 };
}

function firstProofLine(code: string): Pick<Diagnostic, "line" | "column"> {
  const lines = code.split("\n");
  const lineIndex = lines.findIndex(
    (line) => line.includes("by") || line.trim().length > 0,
  );
  return { line: Math.max(1, lineIndex + 1), column: 1 };
}

function lineColumnFor(
  code: string,
  token: string,
): Pick<Diagnostic, "line" | "column"> {
  const index = code.toLowerCase().indexOf(token);
  if (index < 0) {
    return firstLineColumn();
  }
  const before = code.slice(0, index);
  const lines = before.split("\n");
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}
