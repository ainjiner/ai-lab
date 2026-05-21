import { component$ } from "@builder.io/qwik";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  class?: string;
}

const sizeClasses = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-6 h-6",
};

export const Spinner = component$(({ size = "md", class: className }: SpinnerProps) => {
  return (
    <svg
      class={`animate-spin ${sizeClasses[size]} ${className || ""}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
});

interface CircleSpinnerProps {
  size?: "sm" | "md" | "lg";
  class?: string;
}

const circleSizeClasses = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-10 h-10 border-3",
};

export const CircleSpinner = component$(({ size = "md", class: className }: CircleSpinnerProps) => {
  return (
    <div
      class={`rounded-full border-primary border-t-transparent animate-spin ${circleSizeClasses[size]} ${className || ""}`}
    />
  );
});
