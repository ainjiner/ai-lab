import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useIntegrations = routeLoader$(async () => {
  return [
    { 
      id: 'baseten', 
      name: 'Baseten', 
      description: 'Model inference platform',
      status: 'connected',
      icon: '🚀',
    },
    { 
      id: 'pinecone', 
      name: 'Pinecone', 
      description: 'Vector database for RAG',
      status: 'available',
      icon: '🌲',
    },
    { 
      id: 'helicone', 
      name: 'Helicone', 
      description: 'LLM observability platform',
      status: 'available',
      icon: '📊',
    },
    { 
      id: 'langfuse', 
      name: 'Langfuse', 
      description: 'LLM tracing and evaluation',
      status: 'available',
      icon: '🔍',
    },
    { 
      id: 'openai', 
      name: 'OpenAI', 
      description: 'GPT models and embeddings',
      status: 'available',
      icon: '🤖',
    },
    { 
      id: 'anthropic', 
      name: 'Anthropic', 
      description: 'Claude models',
      status: 'available',
      icon: '🧠',
    },
  ];
});

export default component$(() => {
  const integrations = useIntegrations();
  
  const statusColors: Record<string, string> = {
    connected: 'bg-success/20 text-success',
    available: 'bg-surface-light text-text-muted',
  };

  return (
    <div>
      <header class="mb-8">
        <h1 class="text-3xl font-bold">Integrations</h1>
        <p class="text-text-muted mt-2">Connect with ML/LLM services</p>
      </header>
      
      <div class="grid grid-cols-3 gap-6">
        {integrations.value.map((integration) => (
          <div key={integration.id} class="card">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-3xl">{integration.icon}</span>
              <div>
                <h3 class="font-semibold">{integration.name}</h3>
                <span class={`inline-block px-2 py-1 rounded text-xs ${statusColors[integration.status]}`}>
                  {integration.status}
                </span>
              </div>
            </div>
            <p class="text-sm text-text-muted mb-4">{integration.description}</p>
            <button class={`btn w-full ${
              integration.status === 'connected' 
                ? 'btn-secondary' 
                : 'btn-primary'
            }`}>
              {integration.status === 'connected' ? 'Configure' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});
