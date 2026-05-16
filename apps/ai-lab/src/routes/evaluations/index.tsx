import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const evaluations = [
    { id: 1, name: "MMLU Benchmark", type: "benchmark", passed: 85, total: 100 },
    { id: 2, name: "HumanEval", type: "code", passed: 42, total: 50 },
    { id: 3, name: "TruthfulQA", type: "safety", passed: 78, total: 100 },
    { id: 4, name: "GSM8K", type: "math", passed: 92, total: 100 },
  ];

  const typeColors: Record<string, string> = {
    benchmark: "bg-primary/20 text-primary",
    code: "bg-success/20 text-success",
    safety: "bg-warning/20 text-warning",
    math: "bg-error/20 text-error",
  };

  return (
    <div>
      <header class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Evaluations</h1>
          <p class="mt-2 text-text-muted">Model evaluation results and benchmarks</p>
        </div>
        <button class="rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark">
          Run Evaluation
        </button>
      </header>

      <div class="grid grid-cols-2 gap-6">
        {evaluations.map((eval_) => (
          <div
            key={eval_.id}
            class="rounded-xl border border-surface-light bg-surface p-6"
          >
            <div class="mb-4 flex items-start justify-between">
              <div>
                <h3 class="font-semibold">{eval_.name}</h3>
                <span
                  class={`mt-1 inline-block rounded px-2 py-1 text-xs ${typeColors[eval_.type]}`}
                >
                  {eval_.type}
                </span>
              </div>
              <span class="text-2xl font-bold">
                {Math.round((eval_.passed / eval_.total) * 100)}%
              </span>
            </div>
            <div class="h-2 w-full rounded-full bg-surface-light">
              <div
                class="h-2 rounded-full bg-primary"
                style={`width: ${(eval_.passed / eval_.total) * 100}%`}
              />
            </div>
            <p class="mt-2 text-sm text-text-muted">
              {eval_.passed} / {eval_.total} passed
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Evaluations",
};
