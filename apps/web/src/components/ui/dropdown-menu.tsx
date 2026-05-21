import { component$, $, Slot, QRL } from "@builder.io/qwik";

interface DropdownMenuProps {
  class?: string;
}

export const DropdownMenu = component$<DropdownMenuProps>(({ class: className = "" }) => {
  return (
    <div class={`relative inline-block ${className}`}>
      <Slot name="trigger" />
      <Slot name="content" />
    </div>
  );
});

interface DropdownMenuTriggerProps {
  class?: string;
  onClick$?: QRL<() => void>;
}

export const DropdownMenuTrigger = component$<DropdownMenuTriggerProps>(({
  class: className = "",
  onClick$
}) => {
  return (
    <button
      type="button"
      onClick$={onClick$}
      class={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      <Slot />
    </button>
  );
});

interface DropdownMenuContentProps {
  open?: boolean;
  align?: "start" | "center" | "end";
  class?: string;
  onClose$?: QRL<() => void>;
}

export const DropdownMenuContent = component$<DropdownMenuContentProps>(({
  open = false,
  align = "start",
  class: className = "",
  onClose$
}) => {
  if (!open) return null;

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0"
  };

  const handleClose = $(() => {
    if (onClose$) {
      onClose$();
    }
  });

  return (
    <>
      <div
        class="fixed inset-0 z-40"
        onClick$={handleClose}
      />
      <div
        class={`absolute top-full mt-1 z-50 min-w-[180px] rounded-lg border border-surface-light bg-surface-elevated p-1 shadow-lg ${alignClasses[align]} ${className}`}
      >
        <Slot />
      </div>
    </>
  );
});

interface DropdownMenuItemProps {
  disabled?: boolean;
  variant?: "default" | "destructive";
  class?: string;
  onClick$?: QRL<() => void>;
}

export const DropdownMenuItem = component$<DropdownMenuItemProps>(({
  disabled = false,
  variant = "default",
  class: className = "",
  onClick$
}) => {
  const variantClasses = {
    default: "text-text hover:bg-surface-light focus:bg-surface-light",
    destructive: "text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick$={onClick$}
      class={`relative flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${className}`}
    >
      <Slot />
    </button>
  );
});

interface DropdownMenuSeparatorProps {
  class?: string;
}

export const DropdownMenuSeparator = component$<DropdownMenuSeparatorProps>(({ class: className = "" }) => {
  return (
    <div class={`-mx-1 my-1 h-px bg-surface-light ${className}`} />
  );
});

interface DropdownMenuLabelProps {
  class?: string;
}

export const DropdownMenuLabel = component$<DropdownMenuLabelProps>(({ class: className = "" }) => {
  return (
    <div class={`px-3 py-2 text-xs font-semibold text-text-muted ${className}`}>
      <Slot />
    </div>
  );
});
