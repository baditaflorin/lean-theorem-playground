import { del, get, set } from "idb-keyval";

export interface SavedProgress {
  exerciseId: string;
  codeByExercise: Record<string, string>;
  solvedExerciseIds: string[];
  updatedAt: string;
}

const key = "lean-theorem-playground.progress.v1";

export async function loadProgress(): Promise<SavedProgress | null> {
  return (await get<SavedProgress>(key)) ?? null;
}

export async function saveProgress(progress: SavedProgress): Promise<void> {
  await set(key, progress);
}

export async function clearProgress(): Promise<void> {
  await del(key);
}
