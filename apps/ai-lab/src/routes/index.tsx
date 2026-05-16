import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useDashboardStats = routeLoader$(async () => {
  return {
    models: 12,
    experiments: 8,
    evaluations: 24,
    tokens: '1.2M',
  };
});

export default component$(() => {
  const stats = useDashboardStats();
  
  const cards = [
    { label: 'Available Models', value: stats.value.models, color: 'primary' },
    { label: 'Active Experiments', value: stats.value.experiments, color: 'success' },
    { label: 'Evaluations', value: stats.value.evaluations, color: 'warning' },
    { label: 'Tokens Used', value: stats.value.tokens, color: 'error' },
  ];

  return (
    <div>
      <header class="mb-8">
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="text-text-muted mt-2">ML/LLM Engineering Research Dashboard</p>
      </header>
      
      <div class="grid grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} class="card">
            <p class="text-text-muted text-sm">{card.label}</p>
            <p class={`text-3xl font-bold text-${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
      
      <div class="grid grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <button class="btn btn-primary w-full">Scan Models</button>
            <button class="btn btn-secondary w-full">New Experiment</button>
            <button class="btn btn-secondary w-full">Run Evaluation</button>
          </div>
        </div>
        
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span>Model scan completed</span>
              <span class="text-text-muted">2m ago</span>
            </div>
            <div class="flex justify-between">
              <span>Experiment #42 finished</span>
              <span class="text-text-muted">15m ago</span>
            </div>
            <div class="flex justify-between">
              <span>New model added</span>
              <span class="text-text-muted">1h ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
