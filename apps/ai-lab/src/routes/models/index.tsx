import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useModels = routeLoader$(async () => {
  return [
    { id: 'meta-llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Baseten', status: 'active' },
    { id: 'meta-llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Baseten', status: 'active' },
    { id: 'qwen-2.5-72b', name: 'Qwen 2.5 72B', provider: 'Baseten', status: 'active' },
    { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'Baseten', status: 'inactive' },
  ];
});

export default component$(() => {
  const models = useModels();
  
  return (
    <div>
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold">Models</h1>
          <p class="text-text-muted mt-2">Manage and configure LLM models</p>
        </div>
        <button class="btn btn-primary">Scan Models</button>
      </header>
      
      <div class="card">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-light">
              <th class="text-left py-3 px-4">Model</th>
              <th class="text-left py-3 px-4">Provider</th>
              <th class="text-left py-3 px-4">Status</th>
              <th class="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.value.map((model) => (
              <tr key={model.id} class="border-b border-surface-light">
                <td class="py-3 px-4">
                  <div>
                    <p class="font-medium">{model.name}</p>
                    <p class="text-sm text-text-muted">{model.id}</p>
                  </div>
                </td>
                <td class="py-3 px-4">{model.provider}</td>
                <td class="py-3 px-4">
                  <span class={`inline-block px-2 py-1 rounded text-xs ${
                    model.status === 'active' 
                      ? 'bg-success/20 text-success' 
                      : 'bg-surface-light text-text-muted'
                  }`}>
                    {model.status}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <button class="btn btn-secondary text-sm">Configure</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
