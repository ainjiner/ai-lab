import { component$ } from "@builder.io/qwik";

interface LogoProps {
  size?: number;
  showTagline?: boolean;
}

export const Logo = component$<LogoProps>(({ size = 32, showTagline = false }) => {
  return (
    <div class="flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="32" cy="32" r="32" fill="#0f0f1a" />
        <path
          d="M10 50 L22 16 L26 16 L38 50 H32 L22 24 L14 50 Z"
          fill="#6366f1"
        />
        <rect x="15" y="36" width="14" height="4" rx="2" fill="#6366f1" />
        <rect x="41" y="16" width="5" height="34" rx="2" fill="#a5b4fc" />
        <rect x="41" y="45" width="13" height="5" rx="2" fill="#a5b4fc" />
        <circle cx="55" cy="14" r="3" fill="#6366f1" opacity="0.6" />
      </svg>
      <div>
        <h1 class="text-xl font-bold text-primary">AI Lab</h1>
        {showTagline && (
          <p class="text-sm text-text-muted">ML/LLM Engineering</p>
        )}
      </div>
    </div>
  );
});
