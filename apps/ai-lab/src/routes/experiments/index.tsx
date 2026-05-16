import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useExperiments = routeLoader$(async () => {
  return [
    { id: 1, name: 'Prompt Engineering v1', model: 'Llama 3.1 8B', status: 'completed', score: 0.92 },
    { id: 2, name: 'RAG Pipeline Test', model: 'Qwen 2.5 72B', status: 'running', score: null },
    { id: 3, name: 'Code Generation Benchmark', model: 'DeepSeek R1', status: 'pending', score: null },
    { id: 4, name: 'Reasoning Chain Test', model: 'Llama 3.1 70B', status: 'completed', score: 0.87 },
  ];
});

export default component$(() => {
  const experiments = useExperiments();
  
  const statusColors: Record<string, string> = {
    completed: 'bg-success/20 text-success',
    running: 'bg-warning/20 text-warning',
    pending: 'bg-surface-light text-text-muted',
  };

  return (
    <div>
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold">Experiments</h1>
          <p class="text-text-muted mt-2">Track and manage ML experiments</p>
        </div>
        <button class="btn btn-primary">New Experiment</button>
      </header>
      
      <div class="grid gap-4">
        {experiments.value.map((exp) => (
          <div key={exp.id} class="card flex justify-between items-center">
            <div>
              <h3 class="font-semibold">{exp.name}</h3>
              <p class="text-sm text-text-muted">{exp.model}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class={`px-2 py-1 rounded text-xs ${statusColors[exp.status]}`}>
                {exp.status}
              </span>
              {exp.score !== null && (
                <span class="text-sm font-medium">Score: {exp.score}</span>
              )}
              <button class="btn btn-secondary text-sm">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
