import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useTokenStats = routeLoader$(async () => {
  return {
    total: '1.2M',
    cost: '$24.50',
    byModel: [
      { model: 'Llama 3.1 8B', tokens: '450K', cost: '$8.50' },
      { model: 'Qwen 2.5 72B', tokens: '380K', cost: '$11.20' },
      { model: 'Llama 3.1 70B', tokens: '250K', cost: '$4.20' },
      { model: 'DeepSeek R1', tokens: '120K', cost: '$0.60' },
    ],
    daily: [
      { date: '2026-05-10', tokens: '180K' },
      { date: '2026-05-11', tokens: '220K' },
      { date: '2026-05-12', tokens: '150K' },
      { date: '2026-05-13', tokens: '280K' },
      { date: '2026-05-14', tokens: '190K' },
      { date: '2026-05-15', tokens: '180K' },
    ],
  };
});

export default component$(() => {
  const stats = useTokenStats();
  
  return (
    <div>
      <header class="mb-8">
        <h1 class="text-3xl font-bold">Token Usage</h1>
        <p class="text-text-muted mt-2">Track token consumption and costs</p>
      </header>
      
      <div class="grid grid-cols-2 gap-6 mb-8">
        <div class="card text-center">
          <p class="text-text-muted">Total Tokens</p>
          <p class="text-4xl font-bold text-primary">{stats.value.total}</p>
        </div>
        <div class="card text-center">
          <p class="text-text-muted">Total Cost</p>
          <p class="text-4xl font-bold text-success">{stats.value.cost}</p>
        </div>
      </div>
      
      <div class="card mb-6">
        <h2 class="text-xl font-semibold mb-4">Usage by Model</h2>
        <div class="space-y-4">
          {stats.value.byModel.map((item) => (
            <div key={item.model} class="flex justify-between items-center">
              <span>{item.model}</span>
              <div class="flex gap-8">
                <span class="text-text-muted">{item.tokens}</span>
                <span class="font-medium">{item.cost}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Daily Usage</h2>
        <div class="flex items-end gap-2 h-40">
          {stats.value.daily.map((day) => {
            const maxTokens = 280000;
            const height = (parseInt(day.tokens) / maxTokens) * 100;
            return (
              <div key={day.date} class="flex-1 flex flex-col items-center">
                <div 
                  class="w-full bg-primary rounded-t"
                  style={`height: ${height}%`}
                />
                <span class="text-xs text-text-muted mt-2">
                  {day.date.split('-')[2]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
