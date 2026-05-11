import { describe, expect, it } from "vitest";
import { exercises, findExercise } from "./exercises";
import { checkProof, stripLeanComments } from "./leanRuntime";

describe("checkProof", () => {
  it("accepts bundled starter proofs", async () => {
    for (const exercise of exercises) {
      const result = await checkProof(exercise.starterCode, exercise);
      expect(result.status, exercise.id).toBe("success");
    }
  });

  it("rejects placeholders", async () => {
    const exercise = findExercise("two-plus-two");
    const result = await checkProof(
      "import Mathlib\n\nexample : 2 + 2 = 4 := by\n  sorry",
      exercise,
    );
    expect(result.status).toBe("error");
    expect(
      result.diagnostics.some((diagnostic) =>
        diagnostic.message.includes("sorry"),
      ),
    ).toBe(true);
  });

  it("does not reject a proof that only mentions sorry inside a comment", async () => {
    // Regression: the previous checker did toLowerCase().includes("sorry"),
    // which flagged the comment "-- sorry, I tried this first" even when
    // the actual proof was clean.
    const exercise = findExercise("two-plus-two");
    const result = await checkProof(
      [
        "import Mathlib",
        "-- sorry, I tried this approach first but found a cleaner one.",
        "example : 2 + 2 = 4 := by norm_num",
      ].join("\n"),
      exercise,
    );
    expect(result.status).toBe("success");
  });

  it("strips nested block comments", () => {
    const stripped = stripLeanComments(
      "import Mathlib\n/- outer /- inner -/ still outer -/example : True := by trivial",
    );
    expect(stripped).toContain("import Mathlib");
    expect(stripped).toContain("example : True := by trivial");
    expect(stripped).not.toContain("outer");
    expect(stripped).not.toContain("inner");
  });

  it("returns a remaining goal for unrecognized proof attempts", async () => {
    const exercise = findExercise("ring-square");
    const result = await checkProof(
      "import Mathlib\n\nexample (x y : Int) : (x + y)^2 = x^2 + 2*x*y + y^2 := by\n  simp",
      exercise,
    );
    expect(result.status).toBe("needs-work");
    expect(result.goals).toContain(exercise.goal);
  });
});
