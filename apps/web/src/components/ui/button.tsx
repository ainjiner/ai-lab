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
  outline: "border border-surface-light bg-transparent hover:bg-surface-light",
  secondary: "bg-surface-light text-text hover:bg-surface",
  ghost: "hover:bg-surface-light",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

export const Button = component$(({ variant = "default", size = "default", class: className, ...props }: ButtonProps) => {
  return (
    <button
      class={`inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className || ""}`}
      {...props}
    >
      <Slot />
    </button>
  );
});
