import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';

const app = new Hono();
const port = 3003;

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/models', label: 'Models' },
  { href: '/tokens', label: 'Tokens' },
  { href: '/experiments', label: 'Experiments' },
  { href: '/evaluations', label: 'Evaluations' },
  { href: '/integrations', label: 'Integrations' },
];

const stats = [
  { label: 'Available Models', value: 12, color: 'text-primary' },
  { label: 'Active Experiments', value: 8, color: 'text-success' },
  { label: 'Evaluations', value: 24, color: 'text-warning' },
  { label: 'Tokens Used', value: '1.2M', color: 'text-error' },
];

function Layout({ children, path }: { children: any; path: string }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AI Lab</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          {`tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#6366f1',
                  'primary-dark': '#4f46e5',
                  background: '#0f172a',
                  surface: '#1e293b',
                  'surface-light': '#334155',
                  text: '#f8fafc',
                  'text-muted': '#94a3b8',
                  success: '#22c55e',
                  warning: '#eab308',
                  error: '#ef4444',
                }
              }
            }
          }`}
        </script>
      </head>
      <body class="bg-background text-text min-h-screen">
        <div class="flex min-h-screen">
          <aside class="w-64 bg-surface border-r border-surface-light flex flex-col">
            <div class="p-6 border-b border-surface-light">
              <h1 class="text-xl font-bold text-primary">AI Lab</h1>
              <p class="text-sm text-text-muted">ML/LLM Engineering</p>
            </div>
            <nav class="flex-1 p-4">
              <ul class="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      class={`block px-4 py-2 rounded-lg transition-colors ${
                        path === item.href
                          ? 'bg-primary text-white'
                          : 'text-text-muted hover:bg-surface-light'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div class="p-4 border-t border-surface-light">
              <p class="text-xs text-text-muted">Powered by Hono + Bun</p>
            </div>
          </aside>
          <main class="flex-1 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function Dashboard() {
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
}

app.get('/', (c) => {
  return c.html(
    <Layout path="/">
      <Dashboard />
    </Layout>
  );
});

app.get('/models', (c) => {
  return c.html(
    <Layout path="/models">
      <div>
        <header class="mb-8 flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold">Models</h1>
            <p class="text-text-muted mt-2">Manage and configure LLM models</p>
          </div>
          <button class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            Scan Models
          </button>
        </header>
        <div class="bg-surface rounded-xl p-6 border border-surface-light">
          <p class="text-text-muted">Model list will be loaded from Baseten API...</p>
        </div>
      </div>
    </Layout>
  );
});

app.get('/tokens', (c) => {
  return c.html(
    <Layout path="/tokens">
      <div>
        <header class="mb-8">
          <h1 class="text-3xl font-bold">Token Usage</h1>
          <p class="text-text-muted mt-2">Track token consumption and costs</p>
        </header>
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-surface rounded-xl p-6 border border-surface-light text-center">
            <p class="text-text-muted">Total Tokens</p>
            <p class="text-4xl font-bold text-primary">1.2M</p>
          </div>
          <div class="bg-surface rounded-xl p-6 border border-surface-light text-center">
            <p class="text-text-muted">Total Cost</p>
            <p class="text-4xl font-bold text-success">$24.50</p>
          </div>
        </div>
      </div>
    </Layout>
  );
});

app.get('/experiments', (c) => {
  return c.html(
    <Layout path="/experiments">
      <div>
        <header class="mb-8 flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold">Experiments</h1>
            <p class="text-text-muted mt-2">Track and manage ML experiments</p>
          </div>
          <button class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            New Experiment
          </button>
        </header>
        <div class="bg-surface rounded-xl p-6 border border-surface-light">
          <p class="text-text-muted">Experiments will be loaded...</p>
        </div>
      </div>
    </Layout>
  );
});

app.get('/evaluations', (c) => {
  return c.html(
    <Layout path="/evaluations">
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
        <div class="bg-surface rounded-xl p-6 border border-surface-light">
          <p class="text-text-muted">Evaluations will be loaded...</p>
        </div>
      </div>
    </Layout>
  );
});

app.get('/integrations', (c) => {
  return c.html(
    <Layout path="/integrations">
      <div>
        <header class="mb-8">
          <h1 class="text-3xl font-bold">Integrations</h1>
          <p class="text-text-muted mt-2">Connect with ML/LLM services</p>
        </header>
        <div class="grid grid-cols-3 gap-6">
          <div class="bg-surface rounded-xl p-6 border border-surface-light">
            <p class="text-3xl mb-2">🚀</p>
            <h3 class="font-semibold">Baseten</h3>
            <p class="text-sm text-text-muted mb-4">Model inference platform</p>
            <button class="bg-success/20 text-success px-4 py-2 rounded-lg w-full">
              Connected
            </button>
          </div>
          <div class="bg-surface rounded-xl p-6 border border-surface-light">
            <p class="text-3xl mb-2">🌲</p>
            <h3 class="font-semibold">Pinecone</h3>
            <p class="text-sm text-text-muted mb-4">Vector database for RAG</p>
            <button class="bg-primary text-white px-4 py-2 rounded-lg w-full hover:bg-primary-dark transition-colors">
              Connect
            </button>
          </div>
          <div class="bg-surface rounded-xl p-6 border border-surface-light">
            <p class="text-3xl mb-2">📊</p>
            <h3 class="font-semibold">Helicone</h3>
            <p class="text-sm text-text-muted mb-4">LLM observability</p>
            <button class="bg-primary text-white px-4 py-2 rounded-lg w-full hover:bg-primary-dark transition-colors">
              Connect
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
});

app.get('/favicon.svg', serveStatic({ path: './public/favicon.svg' }));

export default {
  fetch: app.fetch,
  port,
};
