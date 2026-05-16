import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useEvaluations = routeLoader$(async () => {
  return [
    { id: 1, name: 'MMLU Benchmark', type: 'benchmark', passed: 85, total: 100 },
    { id: 2, name: 'HumanEval', type: 'code', passed: 42, total: 50 },
    { id: 3, name: 'TruthfulQA', type: 'safety', passed: 78, total: 100 },
    { id: 4, name: 'GSM8K', type: 'math', passed: 92, total: 100 },
  ];
});

export default component$(() => {
  const evaluations = useEvaluations();
  
  const typeColors: Record<string, string> = {
    benchmark: 'bg-primary/20 text-primary',
    code: 'bg-success/20 text-success',
    safety: 'bg-warning/20 text-warning',
    math: 'bg-error/20 text-error',
  };

  return (
    <div>
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold">Evaluations</h1>
          <p class="text-text-muted mt-2">Model evaluation results and benchmarks</p>
        </div>
        <button class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          Run Evaluation
        </button>
      </header>
      
      <div class="grid grid-cols-2 gap-6">
        {evaluations.value.map((eval_) => (
          <div key={eval_.id} class="bg-surface rounded-xl p-6 border border-surface-light">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-semibold">{eval_.name}</h3>
                <span class={`inline-block px-2 py-1 rounded text-xs mt-1 ${typeColors[eval_.type]}`}>
                  {eval_.type}
                </span>
              </div>
              <span class="text-2xl font-bold">
                {Math.round((eval_.passed / eval_.total) * 100)}%
              </span>
            </div>
            <div class="w-full bg-surface-light rounded-full h-2">
              <div 
                class="bg-primary h-2 rounded-full" 
                style={`width: ${(eval_.passed / eval_.total) * 100}%`}
              />
            </div>
            <p class="text-sm text-text-muted mt-2">
              {eval_.passed} / {eval_.total} passed
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});
