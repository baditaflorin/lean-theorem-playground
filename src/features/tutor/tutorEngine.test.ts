import { describe, expect, it } from "vitest";
import { findExercise } from "../lean/exercises";
import { createRuleBasedHint } from "./tutorEngine";

describe("createRuleBasedHint", () => {
  it("gives a logic-specific hint for conjunction commutativity", () => {
    const hint = createRuleBasedHint(findExercise("and-comm"), "", null);
    expect(hint.text).toContain("And.intro");
  });

  it("points users away from placeholders", () => {
    const hint = createRuleBasedHint(
      findExercise("two-plus-two"),
      "sorry",
      null,
    );
    expect(hint.text).toContain("placeholder");
  });
});
