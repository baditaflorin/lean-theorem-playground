import { z } from "zod";

const exerciseSchema = z.object({
  id: z.string(),
  title: z.string(),
  difficulty: z.enum(["warmup", "logic", "algebra", "analysis"]),
  statement: z.string(),
  intuition: z.string(),
  starterCode: z.string(),
  goal: z.string(),
  imports: z.array(z.string()),
  acceptedTactics: z.array(z.string()),
  lemmas: z.array(z.string()),
  proofPatterns: z.array(z.string()),
});

export type Exercise = z.infer<typeof exerciseSchema>;

const rawExercises = [
  {
    id: "two-plus-two",
    title: "Two plus two",
    difficulty: "warmup",
    statement: "Prove that 2 + 2 = 4.",
    intuition: "Natural-number arithmetic can be normalized automatically.",
    starterCode: `import Mathlib

example : 2 + 2 = 4 := by
  norm_num
`,
    goal: "2 + 2 = 4",
    imports: ["Mathlib"],
    acceptedTactics: ["norm_num", "rfl", "omega"],
    lemmas: ["Nat.add_assoc", "Nat.succ_eq_add_one"],
    proofPatterns: ["\\bnorm_num\\b", "\\brfl\\b", "\\bomega\\b"],
  },
  {
    id: "and-comm",
    title: "Conjunction commutes",
    difficulty: "logic",
    statement: "From p and q, prove q and p.",
    intuition:
      "Break the hypothesis into its two parts, then rebuild the pair in the other order.",
    starterCode: `import Mathlib

example (p q : Prop) : p ∧ q → q ∧ p := by
  intro h
  exact And.intro h.right h.left
`,
    goal: "p ∧ q → q ∧ p",
    imports: ["Mathlib"],
    acceptedTactics: ["intro", "constructor", "exact", "cases"],
    lemmas: ["And.left", "And.right", "And.intro"],
    proofPatterns: [
      "\\bintro\\b[\\s\\S]*\\bAnd\\.intro\\b",
      "\\bcases\\b[\\s\\S]*\\bconstructor\\b",
    ],
  },
  {
    id: "zero-add",
    title: "Zero addition",
    difficulty: "warmup",
    statement: "For every natural number n, prove 0 + n = n.",
    intuition: "This is a simplification theorem for Nat addition.",
    starterCode: `import Mathlib

example (n : Nat) : 0 + n = n := by
  simp
`,
    goal: "0 + n = n",
    imports: ["Mathlib"],
    acceptedTactics: ["simp", "rfl"],
    lemmas: ["Nat.zero_add"],
    proofPatterns: ["\\bsimp\\b", "\\brfl\\b", "Nat\\.zero_add"],
  },
  {
    id: "ring-square",
    title: "Square expansion",
    difficulty: "algebra",
    statement: "Expand (x + y)^2 over integers.",
    intuition:
      "Ring-normalization rearranges polynomial expressions into a canonical form.",
    starterCode: `import Mathlib

example (x y : Int) : (x + y)^2 = x^2 + 2*x*y + y^2 := by
  ring
`,
    goal: "(x + y)^2 = x^2 + 2*x*y + y^2",
    imports: ["Mathlib"],
    acceptedTactics: ["ring"],
    lemmas: ["sq", "mul_add", "add_mul"],
    proofPatterns: ["\\bring\\b"],
  },
  {
    id: "square-nonneg",
    title: "Square is nonnegative",
    difficulty: "analysis",
    statement: "For every real x, prove 0 <= x^2.",
    intuition:
      "Mathlib has `sq_nonneg`; linear arithmetic can finish once that fact is present.",
    starterCode: `import Mathlib

example (x : ℝ) : 0 ≤ x^2 := by
  nlinarith [sq_nonneg x]
`,
    goal: "0 ≤ x^2",
    imports: ["Mathlib"],
    acceptedTactics: ["nlinarith", "positivity", "exact sq_nonneg"],
    lemmas: ["sq_nonneg", "pow_two_nonneg"],
    proofPatterns: [
      "\\bnlinarith\\b[\\s\\S]*sq_nonneg",
      "\\bpositivity\\b",
      "\\bexact\\b[\\s\\S]*sq_nonneg",
    ],
  },
] satisfies Exercise[];

export const exercises = rawExercises.map((exercise) =>
  exerciseSchema.parse(exercise),
);

export function findExercise(id: string): Exercise {
  return exercises.find((exercise) => exercise.id === id) ?? exercises[0];
}
