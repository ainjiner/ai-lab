import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div class="flex flex-col items-center justify-center p-12 text-center bg-surface-elevated/30 rounded-3xl border border-surface-light backdrop-blur-sm max-w-md w-full shadow-2xl shadow-black/50">
        <div class="w-16 h-16 mb-6 rounded-2xl bg-surface-light flex items-center justify-center border border-surface-light">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-text-muted">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 class="text-4xl font-bold tracking-tight text-text mb-2">404</h1>
        <h2 class="text-lg font-medium text-text-muted mb-6">Page Not Found</h2>
        <p class="text-sm text-text-muted/80 mb-8 max-w-[250px]">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/"
          class="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "404 Not Found - AI Lab",
};
