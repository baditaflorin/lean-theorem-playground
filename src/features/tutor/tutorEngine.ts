import type { Exercise } from "../lean/exercises";
import type { ProofCheckResult } from "../lean/leanRuntime";

export interface TutorMessage {
  role: "system" | "assistant" | "user";
  text: string;
}

export interface TutorStatus {
  available: boolean;
  running: boolean;
  model: string;
  detail: string;
  progress: string;
}

type ProgressCallback = (status: TutorStatus) => void;

interface ChatCompletionEngine {
  chat: {
    completions: {
      create(input: {
        messages: Array<{
          role: "system" | "user" | "assistant";
          content: string;
        }>;
        temperature?: number;
        max_tokens?: number;
      }): Promise<{ choices: Array<{ message: { content: string } }> }>;
    };
  };
}

let engine: ChatCompletionEngine | null = null;

export function createRuleBasedHint(
  exercise: Exercise,
  code: string,
  result: ProofCheckResult | null,
): TutorMessage {
  if (result?.status === "success") {
    return {
      role: "assistant",
      text: `Nice. The proof is complete for "${exercise.title}". Try deleting one tactic and asking what changed; that is a quick way to learn which step carried the proof.`,
    };
  }

  if (code.includes("sorry") || code.includes("admit")) {
    return {
      role: "assistant",
      text:
        "Replace the placeholder with the smallest tactic that changes the goal. For this exercise, the useful moves are: " +
        exercise.acceptedTactics.join(", ") +
        ".",
    };
  }

  if (exercise.id === "and-comm") {
    return {
      role: "assistant",
      text: "Think of `p ∧ q` as a pair. Use `intro h`, then rebuild the target pair with `And.intro h.right h.left` or use `constructor` and solve each subgoal.",
    };
  }

  if (exercise.id === "ring-square") {
    return {
      role: "assistant",
      text: "This is a polynomial identity. The human proof is expansion and collection; in Lean, `ring` performs exactly that normalization.",
    };
  }

  if (exercise.id === "square-nonneg") {
    return {
      role: "assistant",
      text: "Ask Mathlib for the fact that squares are nonnegative: `sq_nonneg x`. Then `nlinarith [sq_nonneg x]` can close the arithmetic goal.",
    };
  }

  return {
    role: "assistant",
    text: `The key idea is: ${exercise.intuition} A compact Lean route is usually one of: ${exercise.acceptedTactics.join(", ")}.`,
  };
}

export async function startLocalTutor(
  onProgress: ProgressCallback,
): Promise<TutorStatus> {
  if (engine) {
    const status = {
      available: true,
      running: true,
      model: "cached WebLLM model",
      detail: "Local tutor is already loaded.",
      progress: "ready",
    };
    onProgress(status);
    return status;
  }

  if (!("gpu" in navigator)) {
    const status = {
      available: false,
      running: false,
      model: "none",
      detail:
        "This browser does not expose WebGPU, so the app will use the deterministic tutor.",
      progress: "not available",
    };
    onProgress(status);
    return status;
  }

  const webllm = await import("@mlc-ai/web-llm");
  const model =
    webllm.prebuiltAppConfig.model_list.find((entry) =>
      entry.model_id.includes("SmolLM2-360M"),
    )?.model_id ??
    webllm.prebuiltAppConfig.model_list.find((entry) =>
      entry.model_id.includes("Llama-3.2-1B"),
    )?.model_id ??
    webllm.prebuiltAppConfig.model_list[0]?.model_id;

  if (!model) {
    const status = {
      available: false,
      running: false,
      model: "none",
      detail:
        "WebLLM loaded, but no prebuilt browser model list was available.",
      progress: "not available",
    };
    onProgress(status);
    return status;
  }

  onProgress({
    available: true,
    running: false,
    model,
    detail: "Downloading and initializing a local browser model.",
    progress: "starting",
  });

  engine = (await webllm.CreateMLCEngine(model, {
    initProgressCallback: (progress) => {
      onProgress({
        available: true,
        running: false,
        model,
        detail: progress.text,
        progress: `${Math.round(progress.progress * 100)}%`,
      });
    },
  })) as ChatCompletionEngine;

  const status = {
    available: true,
    running: true,
    model,
    detail: "Local WebLLM tutor is ready.",
    progress: "ready",
  };
  onProgress(status);
  return status;
}

export async function askLocalTutor(
  exercise: Exercise,
  code: string,
  result: ProofCheckResult | null,
): Promise<TutorMessage> {
  if (!engine) {
    return createRuleBasedHint(exercise, code, result);
  }

  const completion = await engine.chat.completions.create({
    temperature: 0.2,
    max_tokens: 220,
    messages: [
      {
        role: "system",
        content:
          "You are a concise Lean 4 tutor. Give one helpful hint, not a full proof unless the learner already solved it. Avoid false certainty about unavailable Mathlib names.",
      },
      {
        role: "user",
        content: [
          `Exercise: ${exercise.title}`,
          `Goal: ${exercise.goal}`,
          `Intuition: ${exercise.intuition}`,
          `Known result: ${result?.status ?? "not checked"}`,
          "Lean code:",
          code,
        ].join("\n"),
      },
    ],
  });

  return {
    role: "assistant",
    text:
      completion.choices[0]?.message.content ??
      createRuleBasedHint(exercise, code, result).text,
  };
}
