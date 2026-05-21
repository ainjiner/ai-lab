import { component$, useSignal, $, Slot, useContext, createContextId, useContextProvider, QRL } from "@builder.io/qwik";

interface StepsContext {
  currentStep: number;
  totalSteps: number;
  goToStep$: QRL<(step: number) => void>;
  nextStep$: QRL<() => void>;
  prevStep$: QRL<() => void>;
}

export const StepsContext = createContextId<StepsContext>("steps-context");

interface StepsProps {
  defaultValue?: number;
  totalSteps: number;
  class?: string;
  onChange$?: QRL<(step: number) => void>;
}

export const Steps = component$<StepsProps>(({
  defaultValue = 0,
  totalSteps,
  class: className = "",
  onChange$
}) => {
  const currentStep = useSignal(defaultValue);

  const context: StepsContext = {
    currentStep: currentStep.value,
    totalSteps,
    goToStep$: $((step: number) => {
      if (step >= 0 && step < totalSteps) {
        currentStep.value = step;
        if (onChange$) {
          onChange$(step);
        }
      }
    }),
    nextStep$: $(() => {
      if (currentStep.value < totalSteps - 1) {
        currentStep.value++;
        if (onChange$) {
          onChange$(currentStep.value);
        }
      }
    }),
    prevStep$: $(() => {
      if (currentStep.value > 0) {
        currentStep.value--;
        if (onChange$) {
          onChange$(currentStep.value);
        }
      }
    })
  };

  useContextProvider(StepsContext, context);

  return (
    <div class={className}>
      <Slot />
    </div>
  );
});

interface StepListProps {
  class?: string;
}

export const StepList = component$<StepListProps>(({ class: className = "" }) => {
  return (
    <div class={`flex items-center justify-between ${className}`}>
      <Slot />
    </div>
  );
});

interface StepItemProps {
  step: number;
  title?: string;
  class?: string;
}

export const StepItem = component$<StepItemProps>(({
  step,
  title,
  class: className = ""
}) => {
  const context = useContext(StepsContext);
  const isActive = context.currentStep === step;
  const isCompleted = context.currentStep > step;

  return (
    <div
      class={`flex flex-col items-center ${className}`}
      onClick$={() => context.goToStep$(step)}
    >
      <div
        class={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
          isCompleted
            ? "border-primary bg-primary text-primary-foreground"
            : isActive
            ? "border-primary text-primary"
            : "border-surface-light text-text-muted"
        }`}
      >
        {isCompleted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="3"
            stroke="currentColor"
            class="h-5 w-5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <span class="text-sm font-medium">{step + 1}</span>
        )}
      </div>
      {title && (
        <span
          class={`mt-2 text-xs font-medium ${
            isActive ? "text-text" : "text-text-muted"
          }`}
        >
          {title}
        </span>
      )}
    </div>
  );
});

interface StepConnectorProps {
  class?: string;
}

export const StepConnector = component$<StepConnectorProps>(({ class: className = "" }) => {
  return (
    <div class={`flex-1 h-0.5 bg-surface-light mx-2 ${className}`}>
      <Slot />
    </div>
  );
});

interface StepContentProps {
  step: number;
  class?: string;
}

export const StepContent = component$<StepContentProps>(({
  step,
  class: className = ""
}) => {
  const context = useContext(StepsContext);
  
  if (context.currentStep !== step) return null;

  return (
    <div class={`mt-6 ${className}`}>
      <Slot />
    </div>
  );
});

interface StepControlsProps {
  class?: string;
}

export const StepControls = component$<StepControlsProps>(({ class: className = "" }) => {
  const context = useContext(StepsContext);
  const isFirst = context.currentStep === 0;
  const isLast = context.currentStep === context.totalSteps - 1;

  return (
    <div class={`mt-6 flex justify-between ${className}`}>
      <button
        type="button"
        disabled={isFirst}
        onClick$={() => context.prevStep$()}
        class="inline-flex items-center justify-center rounded-lg border border-surface-light bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
      >
        Previous
      </button>
      <button
        type="button"
        disabled={isLast}
        onClick$={() => context.nextStep$()}
        class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
      >
        {isLast ? "Finish" : "Next"}
      </button>
    </div>
  );
});
