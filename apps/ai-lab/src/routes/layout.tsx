import { component$, Slot } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

export default component$(() => {
  const loc = useLocation();
  
  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/models', label: 'Models' },
    { href: '/tokens', label: 'Tokens' },
    { href: '/experiments', label: 'Experiments' },
    { href: '/evaluations', label: 'Evaluations' },
    { href: '/integrations', label: 'Integrations' },
  ];

  return (
    <div class="min-h-screen flex">
      <aside class="w-64 bg-surface border-r border-surface-light flex flex-col">
        <div class="p-6 border-b border-surface-light">
          <h1 class="text-xl font-bold text-primary">AI Lab</h1>
          <p class="text-sm text-text-muted">ML/LLM Engineering</p>
        </div>
        
        <nav class="flex-1 p-4">
          <ul class="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  class={`block px-4 py-2 rounded-lg transition-colors ${
                    loc.url.pathname === item.href 
                      ? 'bg-primary text-white' 
                      : 'text-text-muted hover:bg-surface-light'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div class="p-4 border-t border-surface-light">
          <p class="text-xs text-text-muted">Powered by Qwik + Baseten</p>
        </div>
      </aside>
      
      <main class="flex-1 p-8">
        <Slot />
      </main>
    </div>
  );
});
