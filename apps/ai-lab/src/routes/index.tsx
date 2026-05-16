import { component$ } from '@builder.io/qwik';

export default component$(() => {
  const stats = [
    { label: 'Available Models', value: 12, color: 'text-primary' },
    { label: 'Active Experiments', value: 8, color: 'text-success' },
    { label: 'Evaluations', value: 24, color: 'text-warning' },
    { label: 'Tokens Used', value: '1.2M', color: 'text-error' },
  ];

  return (
    <div>
      <header class="mb-8">
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="text-text-muted mt-2">ML/LLM Engineering Research Dashboard</p>
      </header>
      
      <div class="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} class="bg-surface rounded-xl p-6 border border-surface-light">
            <p class="text-text-muted text-sm">{stat.label}</p>
            <p class={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div class="grid grid-cols-2 gap-6">
        <div class="bg-surface rounded-xl p-6 border border-surface-light">
          <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <button class="bg-primary text-white px-4 py-2 rounded-lg w-full hover:bg-primary-dark transition-colors">
              Scan Models
            </button>
            <button class="bg-surface-light text-text px-4 py-2 rounded-lg w-full hover:bg-surface transition-colors">
              New Experiment
            </button>
          </div>
        </div>
        
        <div class="bg-surface rounded-xl p-6 border border-surface-light">
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
          </div>
        </div>
      </div>
    </div>
  );
});
