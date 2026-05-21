import { component$, createContextId, useContext, Slot, $, useStylesScoped$ } from "@builder.io/qwik";

export interface Toast {
  id: string;
  msg: string;
  kind: "success" | "error" | "info" | "warning";
}

export interface ToastStore {
  toasts: Toast[];
}

export const ToastContext = createContextId<ToastStore>("ai-lab-toast-context");

export const useToast = () => {
  const store = useContext(ToastContext);

  const dismiss = $((id: string) => {
    store.toasts = store.toasts.filter((t) => t.id !== id);
  });

  const show = $((msg: string, kind: Toast["kind"] = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    store.toasts = [...store.toasts, { id, msg, kind }];
    setTimeout(() => {
      store.toasts = store.toasts.filter((t) => t.id !== id);
    }, 4500);
  });

  return {
    show,
    dismiss,
    success: $((msg: string) => show(msg, "success")),
    error: $((msg: string) => show(msg, "error")),
    info: $((msg: string) => show(msg, "info")),
    warning: $((msg: string) => show(msg, "warning")),
  };
};

const TOAST_ICONS: Record<Toast["kind"], string> = {
  success: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  error: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  warning: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z",
  info: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

const TOAST_STYLES: Record<Toast["kind"], string> = {
  success: "bg-[#0d1f0d]/95 border-[#1a4d1a]/60 text-[#4ade80]",
  error:   "bg-[#1f0d0d]/95 border-[#4d1a1a]/60 text-[#f87171]",
  warning: "bg-[#1f1a0d]/95 border-[#4d3d0d]/60 text-[#fbbf24]",
  info:    "bg-[#0d1020]/95 border-[#1a2050]/60 text-[#60a5fa]",
};

export const ToastProvider = component$(() => {
  useStylesScoped$(`
    @keyframes toast-in {
      from { opacity: 0; transform: translateX(100%) scale(0.95); }
      to   { opacity: 1; transform: translateX(0)    scale(1);    }
    }
    .toast-item {
      animation: toast-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `);

  const store = useContext(ToastContext);

  return (
    <div class="contents">
      <Slot />
      <div
        aria-live="polite"
        aria-label="Notifications"
        class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-[340px]"
      >
        {store.toasts.map((toast) => (
          <div
            key={toast.id}
            class={[
              "toast-item flex items-start gap-3 rounded-xl border px-4 py-3.5 pointer-events-auto",
              "backdrop-blur-xl shadow-lg",
              TOAST_STYLES[toast.kind],
            ]}
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4 shrink-0 mt-0.5 opacity-90"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d={TOAST_ICONS[toast.kind]} />
            </svg>

            <p class="text-sm font-medium leading-snug flex-1 min-w-0">{toast.msg}</p>

            <button
              aria-label="Dismiss notification"
              onClick$={() => {
                store.toasts = store.toasts.filter((t) => t.id !== toast.id);
              }}
              class="shrink-0 opacity-50 hover:opacity-100 transition-opacity -mr-1 -mt-0.5 p-0.5 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});
