export interface MathlibEntry {
  name: string;
  area: string;
  signature: string;
  hint: string;
}

export const mathlibEntries: MathlibEntry[] = [
  {
    name: "Nat.zero_add",
    area: "Nat",
    signature: "0 + n = n",
    hint: "`simp` usually applies this automatically.",
  },
  {
    name: "And.intro",
    area: "Logic",
    signature: "p -> q -> p ∧ q",
    hint: "Use it when the goal is a conjunction.",
  },
  {
    name: "And.left / And.right",
    area: "Logic",
    signature: "p ∧ q -> p, p ∧ q -> q",
    hint: "Extract facts from a conjunction hypothesis.",
  },
  {
    name: "ring",
    area: "Algebra",
    signature: "normalizes semiring/ring expressions",
    hint: "Good for polynomial identities.",
  },
  {
    name: "sq_nonneg",
    area: "Analysis",
    signature: "0 <= x ^ 2",
    hint: "Pair with `nlinarith` for nonnegativity goals.",
  },
  {
    name: "norm_num",
    area: "Arithmetic",
    signature: "normalizes concrete numerals",
    hint: "Good for goals made only of numbers.",
  },
];
