import { component$, createContextId, useContext, useStore, Slot, $ } from "@builder.io/qwik";

export interface Toast {
  id: string;
  msg: string;
  kind: "success" | "error" | "info";
}

export interface ToastStore {
  toasts: Toast[];
}

export const ToastContext = createContextId<ToastStore>("ai-lab-toast-context");

export const useToast = () => {
  const store = useContext(ToastContext);
  
  const show = $((msg: string, kind: Toast["kind"] = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    store.toasts = [...store.toasts, { id, msg, kind }];
    
    setTimeout(() => {
      store.toasts = store.toasts.filter((t) => t.id !== id);
    }, 4000);
  });

  return {
    show,
    success: $((msg: string) => show(msg, "success")),
    error: $((msg: string) => show(msg, "error")),
    info: $((msg: string) => show(msg, "info")),
  };
};

export const ToastProvider = component$(() => {
  const store = useStore<ToastStore>({ toasts: [] });
  
  return (
    <div class="contents">
      <Slot />
      
      <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
        {store.toasts.map((toast) => (
          <div
            key={toast.id}
            onClick$={() => {
              store.toasts = store.toasts.filter((t) => t.id !== toast.id);
            }}
            class={[
              "flex items-start justify-between gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 pointer-events-auto cursor-pointer transform hover:scale-[1.02]",
              toast.kind === "success" && "bg-emerald-950/90 border-emerald-500/30 text-emerald-200",
              toast.kind === "error" && "bg-red-950/90 border-red-500/30 text-red-200",
              toast.kind === "info" && "bg-blue-950/90 border-blue-500/30 text-blue-200",
            ]}
          >
            <div class="flex gap-2.5">
              <span class="text-lg mt-0.5">
                {toast.kind === "success" && "✅"}
                {toast.kind === "error" && "❌"}
                {toast.kind === "info" && "ℹ️"}
              </span>
              <div class="flex flex-col gap-0.5">
                <p class="text-sm font-medium leading-relaxed">{toast.msg}</p>
              </div>
            </div>
            <button
              onClick$={(e) => {
                e.stopPropagation();
                store.toasts = store.toasts.filter((t) => t.id !== toast.id);
              }}
              class="text-current opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});
