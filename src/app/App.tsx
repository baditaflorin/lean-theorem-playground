import {
  Bot,
  CheckCircle2,
  CircleDollarSign,
  Code2,
  Download,
  Eraser,
  ExternalLink,
  Github,
  Loader2,
  Play,
  RefreshCcw,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  downloadText,
  exportProof,
  type ExportBundle,
} from "../features/export/exporter";
import {
  exercises,
  findExercise,
  type Exercise,
} from "../features/lean/exercises";
import {
  checkProof,
  initializeLeanRuntime,
  type LeanRuntimeStatus,
  type ProofCheckResult,
} from "../features/lean/leanRuntime";
import { mathlibEntries } from "../features/lean/mathlibIndex";
import {
  clearProgress,
  loadProgress,
  saveProgress,
} from "../features/storage/progressStore";
import {
  askLocalTutor,
  createRuleBasedHint,
  startLocalTutor,
  type TutorMessage,
  type TutorStatus,
} from "../features/tutor/tutorEngine";

const repositoryUrl = __REPO_URL__;
const paypalUrl = __PAYPAL_URL__;
const pagesUrl = __PAGES_URL__;

const initialTutorStatus: TutorStatus = {
  available: true,
  running: false,
  model: "deterministic tutor",
  detail: "Curated hints are ready. Start WebLLM for local model hints.",
  progress: "idle",
};

export function App(): JSX.Element {
  const [selectedExerciseId, setSelectedExerciseId] = useState(exercises[0].id);
  const selectedExercise = useMemo(
    () => findExercise(selectedExerciseId),
    [selectedExerciseId],
  );
  const [codeByExercise, setCodeByExercise] = useState<Record<string, string>>(
    Object.fromEntries(
      exercises.map((exercise) => [exercise.id, exercise.starterCode]),
    ),
  );
  const [solvedExerciseIds, setSolvedExerciseIds] = useState<string[]>([]);
  const [result, setResult] = useState<ProofCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([
    {
      role: "assistant",
      text: createRuleBasedHint(exercises[0], exercises[0].starterCode, null)
        .text,
    },
  ]);
  const [tutorStatus, setTutorStatus] =
    useState<TutorStatus>(initialTutorStatus);
  const [tutorBusy, setTutorBusy] = useState(false);
  const [exportBundle, setExportBundle] = useState<ExportBundle | null>(null);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const runtime = useQuery<LeanRuntimeStatus>({
    queryKey: ["lean-runtime"],
    queryFn: initializeLeanRuntime,
  });

  const code =
    codeByExercise[selectedExercise.id] ?? selectedExercise.starterCode;
  const solvedCount = solvedExerciseIds.length;

  useEffect(() => {
    void loadProgress().then((progress) => {
      if (!progress) {
        return;
      }
      setSelectedExerciseId(progress.exerciseId);
      setCodeByExercise((current) => ({
        ...current,
        ...progress.codeByExercise,
      }));
      setSolvedExerciseIds(progress.solvedExerciseIds);
    });
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void saveProgress({
        exerciseId: selectedExercise.id,
        codeByExercise,
        solvedExerciseIds,
        updatedAt: new Date().toISOString(),
      });
    }, 250);
    return () => {
      window.clearTimeout(handle);
    };
  }, [codeByExercise, selectedExercise.id, solvedExerciseIds]);

  const filteredMathlib = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) {
      return mathlibEntries;
    }
    return mathlibEntries.filter((entry) =>
      [entry.name, entry.area, entry.signature, entry.hint].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [searchTerm]);

  function selectExercise(exerciseId: string): void {
    const nextExercise = findExercise(exerciseId);
    const nextCode = codeByExercise[exerciseId] ?? nextExercise.starterCode;
    setSelectedExerciseId(exerciseId);
    setResult(null);
    setExportBundle(null);
    setTutorMessages([
      {
        role: "assistant",
        text: createRuleBasedHint(nextExercise, nextCode, null).text,
      },
    ]);
  }

  async function runCheck(): Promise<void> {
    setChecking(true);
    setExportBundle(null);
    try {
      const nextResult = await checkProof(code, selectedExercise);
      setResult(nextResult);
      if (nextResult.status === "success") {
        setSolvedExerciseIds((current) =>
          current.includes(selectedExercise.id)
            ? current
            : [...current, selectedExercise.id],
        );
      }
      setToast(nextResult.title);
    } finally {
      setChecking(false);
    }
  }

  async function runTutor(): Promise<void> {
    setTutorBusy(true);
    try {
      const hint = await askLocalTutor(selectedExercise, code, result);
      setTutorMessages((messages) => [
        ...messages,
        { role: "user", text: "Give me a next hint." },
        hint,
      ]);
    } finally {
      setTutorBusy(false);
    }
  }

  async function bootLocalTutor(): Promise<void> {
    setTutorBusy(true);
    try {
      const status = await startLocalTutor(setTutorStatus);
      setTutorMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          text: status.running
            ? `Local model loaded: ${status.model}. Hints now run in this browser.`
            : status.detail,
        },
      ]);
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "Local tutor failed to start.";
      setTutorStatus({
        available: false,
        running: false,
        model: "deterministic tutor",
        detail,
        progress: "fallback",
      });
      setTutorMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          text: "The local model could not start, so I will keep using curated Lean hints.",
        },
      ]);
    } finally {
      setTutorBusy(false);
    }
  }

  async function buildExport(): Promise<void> {
    setExporting(true);
    try {
      const bundle = await exportProof(selectedExercise, code, result);
      setExportBundle(bundle);
      setToast(
        bundle.engine === "pandoc-wasm"
          ? "Export rendered with Pandoc-WASM"
          : "Export rendered with fallback",
      );
    } finally {
      setExporting(false);
    }
  }

  function updateCode(nextCode: string): void {
    setCodeByExercise((current) => ({
      ...current,
      [selectedExercise.id]: nextCode,
    }));
    setExportBundle(null);
  }

  function resetExercise(): void {
    updateCode(selectedExercise.starterCode);
    setResult(null);
    setExportBundle(null);
  }

  async function resetProgress(): Promise<void> {
    await clearProgress();
    setCodeByExercise(
      Object.fromEntries(
        exercises.map((exercise) => [exercise.id, exercise.starterCode]),
      ),
    );
    setSolvedExerciseIds([]);
    setResult(null);
    setExportBundle(null);
    setToast("Progress cleared");
  }

  return (
    <div className="app-shell">
      <Header solvedCount={solvedCount} runtime={runtime.data} />

      {toast ? (
        <div
          className="toast"
          role="status"
          onAnimationEnd={() => setToast(null)}
        >
          {toast}
        </div>
      ) : null}

      <main className="workspace">
        <aside className="sidebar" aria-label="Exercises">
          <div className="section-title">
            <span>Exercise Path</span>
            <strong>
              {solvedCount}/{exercises.length}
            </strong>
          </div>
          <div className="exercise-list">
            {exercises.map((exercise) => (
              <ExerciseButton
                key={exercise.id}
                exercise={exercise}
                selected={exercise.id === selectedExercise.id}
                solved={solvedExerciseIds.includes(exercise.id)}
                onSelect={() => selectExercise(exercise.id)}
              />
            ))}
          </div>

          <div className="runtime-panel">
            <div
              className="runtime-dot"
              data-mode={runtime.data?.mode ?? "loading"}
            />
            <div>
              <strong>
                {runtime.data?.wasmAvailable ? "WASM ready" : "Checking WASM"}
              </strong>
              <p>{runtime.data?.message ?? "Loading runtime adapter..."}</p>
              <small>
                Lean {runtime.data?.leanVersion ?? "..."} ·{" "}
                {runtime.data?.mathlibSnapshot ?? "..."}
              </small>
            </div>
          </div>
        </aside>

        <section className="editor-zone" aria-label="Lean workbench">
          <div className="proof-header">
            <div>
              <p className="eyebrow">{selectedExercise.difficulty}</p>
              <h1>{selectedExercise.title}</h1>
              <p>{selectedExercise.statement}</p>
            </div>
            <div className="proof-actions">
              <button
                className="icon-button ghost"
                type="button"
                onClick={resetExercise}
                title="Reset exercise"
              >
                <RefreshCcw aria-hidden="true" />
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={() => void runCheck()}
                disabled={checking}
              >
                {checking ? (
                  <Loader2 className="spin" aria-hidden="true" />
                ) : (
                  <Play aria-hidden="true" />
                )}
                Check
              </button>
            </div>
          </div>

          <label className="editor-label" htmlFor="lean-code">
            <Code2 aria-hidden="true" />
            Lean source
          </label>
          <textarea
            id="lean-code"
            className="code-editor"
            spellCheck={false}
            value={code}
            onChange={(event) => updateCode(event.target.value)}
          />

          <ResultPanel result={result} exercise={selectedExercise} />
        </section>

        <aside className="assistant-zone" aria-label="Tutor and export">
          <section className="assistant-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Local tutor</p>
                <h2>Bridge intuition to tactics</h2>
              </div>
              <Bot aria-hidden="true" />
            </div>

            <div className="tutor-status">
              <strong>{tutorStatus.model}</strong>
              <span>{tutorStatus.progress}</span>
              <p>{tutorStatus.detail}</p>
            </div>

            <div className="tutor-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => void bootLocalTutor()}
                disabled={tutorBusy}
              >
                {tutorBusy ? (
                  <Loader2 className="spin" aria-hidden="true" />
                ) : (
                  <Sparkles aria-hidden="true" />
                )}
                Start WebLLM
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => void runTutor()}
                disabled={tutorBusy}
              >
                <Bot aria-hidden="true" />
                Hint
              </button>
            </div>

            <div className="message-list" aria-live="polite">
              {tutorMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`message ${message.role}`}
                >
                  {message.text}
                </div>
              ))}
            </div>
          </section>

          <section className="assistant-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Export</p>
                <h2>Proof notes</h2>
              </div>
              <Download aria-hidden="true" />
            </div>
            <button
              className="secondary-button wide"
              type="button"
              onClick={() => void buildExport()}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="spin" aria-hidden="true" />
              ) : (
                <Download aria-hidden="true" />
              )}
              Render Markdown / HTML
            </button>
            {exportBundle ? (
              <div className="export-actions">
                <span>{exportBundle.engine}</span>
                <button
                  type="button"
                  onClick={() =>
                    downloadText(
                      `${selectedExercise.id}.md`,
                      exportBundle.markdown,
                      "text/markdown",
                    )
                  }
                >
                  Markdown
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadText(
                      `${selectedExercise.id}.html`,
                      exportBundle.html,
                      "text/html",
                    )
                  }
                >
                  HTML
                </button>
              </div>
            ) : null}
          </section>

          <section className="assistant-panel">
            <div className="panel-heading compact">
              <div>
                <p className="eyebrow">Mathlib</p>
                <h2>Quick lookup</h2>
              </div>
              <Search aria-hidden="true" />
            </div>
            <input
              className="search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search tactics or lemmas"
              aria-label="Search Mathlib entries"
            />
            <div className="lemma-list">
              {filteredMathlib.map((entry) => (
                <div key={entry.name} className="lemma-row">
                  <strong>{entry.name}</strong>
                  <code>{entry.signature}</code>
                  <p>{entry.hint}</p>
                </div>
              ))}
            </div>
          </section>

          <button
            className="danger-button"
            type="button"
            onClick={() => void resetProgress()}
          >
            <Eraser aria-hidden="true" />
            Clear local progress
          </button>
        </aside>
      </main>
    </div>
  );
}

function Header({
  solvedCount,
  runtime,
}: {
  solvedCount: number;
  runtime: LeanRuntimeStatus | undefined;
}): JSX.Element {
  return (
    <header className="topbar">
      <a
        className="brand"
        href={pagesUrl}
        aria-label="Lean Theorem Playground home"
      >
        <img src={`${import.meta.env.BASE_URL}icons/proof-mark.svg`} alt="" />
        <span>
          <strong>Lean Theorem Playground</strong>
          <small>rigorous mathematics for everyone</small>
        </span>
      </a>
      <nav className="top-links" aria-label="Project links">
        <span className="version-pill">v{__APP_VERSION__}</span>
        <span className="version-pill">commit {__COMMIT_SHA__}</span>
        <span className="version-pill">{runtime?.mode ?? "loading"}</span>
        <span className="version-pill">{solvedCount} solved</span>
        <a href={repositoryUrl} target="_blank" rel="noreferrer">
          <Github aria-hidden="true" />
          Star on GitHub
          <ExternalLink aria-hidden="true" />
        </a>
        <a href={paypalUrl} target="_blank" rel="noreferrer">
          <CircleDollarSign aria-hidden="true" />
          Support
          <ExternalLink aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}

function ExerciseButton({
  exercise,
  selected,
  solved,
  onSelect,
}: {
  exercise: Exercise;
  selected: boolean;
  solved: boolean;
  onSelect: () => void;
}): JSX.Element {
  return (
    <button
      className="exercise-button"
      data-selected={selected}
      type="button"
      onClick={onSelect}
    >
      <span className="exercise-status">
        {solved ? (
          <CheckCircle2 aria-label="Solved" />
        ) : (
          <Code2 aria-hidden="true" />
        )}
      </span>
      <span>
        <strong>{exercise.title}</strong>
        <small>{exercise.goal}</small>
      </span>
    </button>
  );
}

function ResultPanel({
  result,
  exercise,
}: {
  result: ProofCheckResult | null;
  exercise: Exercise;
}): JSX.Element {
  if (!result) {
    return (
      <section className="result-panel neutral" aria-label="Proof state">
        <h2>Proof state</h2>
        <p>{exercise.intuition}</p>
        <div className="goal-chip">{exercise.goal}</div>
      </section>
    );
  }

  const Icon =
    result.status === "success"
      ? CheckCircle2
      : result.status === "error"
        ? XCircle
        : Sparkles;

  return (
    <section
      className={`result-panel ${result.status}`}
      aria-label="Proof result"
    >
      <div className="result-heading">
        <Icon aria-hidden="true" />
        <div>
          <h2>{result.title}</h2>
          <p>
            {result.summary} · {result.elapsedMs}ms · {result.usedRuntime}
          </p>
        </div>
      </div>

      {result.goals.length > 0 ? (
        <div className="goal-stack">
          {result.goals.map((goal) => (
            <div className="goal-chip" key={goal}>
              {goal}
            </div>
          ))}
        </div>
      ) : null}

      <div className="diagnostics">
        {result.diagnostics.map((diagnostic, index) => (
          <div
            key={`${diagnostic.message}-${index}`}
            className={`diagnostic ${diagnostic.severity}`}
          >
            <strong>
              {diagnostic.severity} L{diagnostic.line}:C{diagnostic.column}
            </strong>
            <span>{diagnostic.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
