import { component$, $, Slot, QRL, useOnDocument, useSignal, useTask$ } from "@builder.io/qwik";

interface ModalProps {
  open: boolean;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  onClose$?: QRL<() => void>;
  class?: string;
}

export const Modal = component$<ModalProps>(({ 
  open, 
  title, 
  size = "md", 
  onClose$,
  class: className = ""
}) => {
  const modalRef = useSignal<HTMLElement | undefined>();
  const previousActiveElement = useSignal<HTMLElement | null>(null);

  useOnDocument(
    "keydown",
    $((e: Event) => {
      if (!open || !onClose$) return;
      const ke = e as KeyboardEvent;
      if (ke.key === "Escape") {
        onClose$();
      }
    })
  );

  useTask$(({ track }) => {
    const isOpen = track(() => open);
    
    if (isOpen) {
      previousActiveElement.value = document.activeElement as HTMLElement;
      const firstFocusable = modalRef.value?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    } else if (previousActiveElement.value) {
      previousActiveElement.value.focus();
      previousActiveElement.value = null;
    }
  });

  if (!open) return null;
  
  const sizeClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-4xl",
  };
  
  return (
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick$={(e) => {
        if (e.target === e.currentTarget && onClose$) {
          onClose$();
        }
      }}
    >
      <div 
        ref={modalRef}
        class={`relative w-full ${sizeClasses[size]} mx-4 rounded-2xl border border-surface-light bg-surface shadow-2xl ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {title && (
          <div class="flex items-center justify-between p-4 border-b border-surface-light">
            <h2 id="modal-title" class="text-lg font-semibold">{title}</h2>
            {onClose$ && (
              <button
                type="button"
                class="text-text-muted hover:text-foreground text-xl leading-none p-1 hover:bg-surface-light rounded-lg transition-colors"
                onClick$={onClose$}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div class="p-4">
          <Slot />
        </div>
      </div>
    </div>
  );
});

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm$?: QRL<() => void>;
  onCancel$?: QRL<() => void>;
}

export const ConfirmDialog = component$<ConfirmDialogProps>(({ 
  open, 
  title, 
  message, 
  confirmLabel = "Confirm", 
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm$,
  onCancel$
}) => {
  return (
    <Modal open={open} title={title} size="sm" onClose$={onCancel$}>
      <p class="text-sm text-text-muted mb-4">{message}</p>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium rounded-lg border border-surface-light hover:bg-surface-light transition-colors"
          onClick$={onCancel$}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          class={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            variant === "danger"
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
          onClick$={onConfirm$}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
});

interface DrawerProps {
  open: boolean;
  title?: string;
  side?: "left" | "right";
  onClose$?: QRL<() => void>;
  class?: string;
}

export const Drawer = component$<DrawerProps>(({
  open,
  title,
  side = "right",
  onClose$,
  class: className = ""
}) => {
  const drawerRef = useSignal<HTMLElement | undefined>();
  const previousActiveElement = useSignal<HTMLElement | null>(null);

  useOnDocument(
    "keydown",
    $((e: Event) => {
      if (!open || !onClose$) return;
      const ke = e as KeyboardEvent;
      if (ke.key === "Escape") {
        onClose$();
      }
    })
  );

  useTask$(({ track }) => {
    const isOpen = track(() => open);
    
    if (isOpen) {
      previousActiveElement.value = document.activeElement as HTMLElement;
      const firstFocusable = drawerRef.value?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    } else if (previousActiveElement.value) {
      previousActiveElement.value.focus();
      previousActiveElement.value = null;
    }
  });

  if (!open) return null;

  const sideClasses = side === "left" 
    ? "left-0 border-r" 
    : "right-0 border-l";

  return (
    <div 
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick$={(e) => {
        if (e.target === e.currentTarget && onClose$) {
          onClose$();
        }
      }}
    >
      <div 
        ref={drawerRef}
        class={`fixed ${sideClasses} top-0 bottom-0 w-full max-w-2xl bg-surface border-surface-light shadow-2xl flex flex-col overflow-hidden ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
      >
        {title && (
          <div class="flex items-center justify-between p-4 border-b border-surface-light">
            <h2 id="drawer-title" class="text-lg font-semibold">{title}</h2>
            {onClose$ && (
              <button
                type="button"
                class="text-text-muted hover:text-foreground text-xl leading-none p-1 hover:bg-surface-light rounded-lg transition-colors"
                onClick$={onClose$}
                aria-label="Close drawer"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div class="flex-1 overflow-y-auto p-4">
          <Slot />
        </div>
      </div>
    </div>
  );
});
