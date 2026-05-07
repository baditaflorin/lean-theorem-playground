import { describe, expect, it } from "vitest";
import { findExercise } from "../lean/exercises";
import { buildProofMarkdown } from "./exporter";

describe("buildProofMarkdown", () => {
  it("includes Lean code and exercise context", () => {
    const exercise = findExercise("zero-add");
    const markdown = buildProofMarkdown(exercise, exercise.starterCode, null);
    expect(markdown).toContain("# Zero addition");
    expect(markdown).toContain("```lean");
    expect(markdown).toContain("import Mathlib");
  });
});
