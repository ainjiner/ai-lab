import { component$, Slot, PropsOf } from "@builder.io/qwik";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends PropsOf<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-primary text-white hover:bg-primary-dark",
  destructive: "bg-error text-white hover:bg-error/90",
  outline: "border border-surface-light bg-transparent hover:bg-surface-light text-text",
  secondary: "bg-surface-light text-text hover:bg-surface-light/80",
  ghost: "hover:bg-surface-light text-text",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 rounded-lg px-3 text-xs",
  lg: "h-11 rounded-xl px-8 text-sm",
  icon: "h-9 w-9",
};

export const Button = component$(({ variant = "default", size = "default", class: className, ...props }: ButtonProps) => {
  return (
    <button
      class={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-150 cursor-pointer active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 ${variantStyles[variant]} ${sizeStyles[size]} ${className || ""}`}
      {...props}
    >
      <Slot />
    </button>
  );
});
