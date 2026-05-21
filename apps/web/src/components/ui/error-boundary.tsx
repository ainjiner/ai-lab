import { component$, useErrorBoundary, $, Slot, QRL } from "@builder.io/qwik";
import type { ErrorFallbackRenderFn } from "~/lib/types";

interface ErrorBoundaryProps {
  fallback?: ErrorFallbackRenderFn | unknown;
  class?: string;
}

export const ErrorBoundary = component$<ErrorBoundaryProps>(({
  fallback,
  class: className = ""
}) => {
  const errorBoundary = useErrorBoundary();

  const reset = $(() => {
    errorBoundary.error = undefined;
  });

  return (
    <div class={className}>
      {errorBoundary.error ? (
        fallback ? (
          typeof fallback === "function" ? (
            fallback(errorBoundary.error, reset)
          ) : (
            fallback
          )
        ) : (
          <ErrorFallback error={errorBoundary.error} onReset$={reset} />
        )
      ) : (
        <Slot />
      )}
    </div>
  );
});

interface ErrorFallbackProps {
  error?: Error | null;
  onReset$?: QRL<() => void>;
  class?: string;
}

export const ErrorFallback = component$<ErrorFallbackProps>(({
  error,
  onReset$,
  class: className = ""
}) => {
  return (
    <div class={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div class="w-16 h-16 mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-8 h-8 text-red-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-text mb-2">Something went wrong</h2>
      <p class="text-sm text-text-muted mb-4 max-w-md">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      {onReset$ && (
        <button
          type="button"
          onClick$={onReset$}
          class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
      )}
    </div>
  );
});

interface ErrorAlertProps {
  title?: string;
  message?: string;
  onRetry$?: QRL<() => void>;
  onDismiss$?: QRL<() => void>;
  class?: string;
}

export const ErrorAlert = component$<ErrorAlertProps>(({
  title = "Error",
  message,
  onRetry$,
  onDismiss$,
  class: className = ""
}) => {
  return (
    <div class={`rounded-lg border border-red-500/20 bg-red-500/10 p-4 ${className}`}>
      <div class="flex items-start gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-5 w-5 text-red-400 shrink-0 mt-0.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-red-400">{title}</h3>
          {message && (
            <p class="mt-1 text-sm text-text-muted">{message}</p>
          )}
          {(onRetry$ || onDismiss$) && (
            <div class="mt-3 flex gap-2">
              {onRetry$ && (
                <button
                  type="button"
                  onClick$={onRetry$}
                  class="text-sm font-medium text-red-400 hover:text-red-300"
                >
                  Retry
                </button>
              )}
              {onDismiss$ && (
                <button
                  type="button"
                  onClick$={onDismiss$}
                  class="text-sm font-medium text-text-muted hover:text-text"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
