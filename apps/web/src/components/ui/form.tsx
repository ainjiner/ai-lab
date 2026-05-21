import { component$, $, Slot, useContext, createContextId, QRL, useStore, useContextProvider } from "@builder.io/qwik";
import { ValidationResult } from "~/lib/validation";

interface FormContext {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  submitting: boolean;
}

export const FormContextId = createContextId<FormContext>("form-context");

interface FormProps {
  class?: string;
  onSubmit$: QRL<(data: Record<string, string>) => void | Promise<void>>;
  validate$?: QRL<(data: Record<string, string>) => ValidationResult<unknown> | Promise<ValidationResult<unknown>>>;
}

export const Form = component$<FormProps>(({ 
  class: className = "", 
  onSubmit$,
  validate$
}) => {
  const state = useStore<FormContext>({
    errors: {},
    touched: {},
    submitting: false,
  });

  useContextProvider(FormContextId, state);

  const handleSubmit = $(async (e: Event) => {
    const form = e.target as HTMLFormElement;
    state.submitting = true;
    
    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData) as Record<string, string>;
      
      if (validate$) {
        const result = await validate$(data);
        
        if (!result.success) {
          state.errors = result.errors;
          Object.keys(result.errors).forEach(field => {
            state.touched[field] = true;
          });
          return;
        }
        
        state.errors = {};
        await onSubmit$(result.data as Record<string, string>);
      } else {
        state.errors = {};
        await onSubmit$(data);
      }
    } finally {
      state.submitting = false;
    }
  });

  return (
    <form class={className} preventdefault:submit onSubmit$={handleSubmit} noValidate>
      <Slot />
    </form>
  );
});

interface FieldProps {
  name: string;
  class?: string;
}

export const Field = component$<FieldProps>(({ name, class: className = "" }) => {
  const context = useContext(FormContextId);
  const hasError = !!context.errors[name];
  const isTouched = context.touched[name];

  return (
    <div 
      class={`space-y-1.5 ${className}`}
      data-invalid={hasError && isTouched ? "true" : undefined}
    >
      <Slot />
    </div>
  );
});

interface LabelProps {
  for?: string;
  required?: boolean;
  class?: string;
}

export const Label = component$<LabelProps>(({ 
  for: htmlFor, 
  required = false, 
  class: className = "" 
}) => {
  return (
    <label 
      for={htmlFor} 
      class={`text-sm font-medium text-text ${className}`}
    >
      <Slot />
      {required && <span class="text-red-400 ml-1">*</span>}
    </label>
  );
});

interface FieldErrorProps {
  name: string;
  class?: string;
}

export const FieldError = component$<FieldErrorProps>(({ 
  name, 
  class: className = "" 
}) => {
  const context = useContext(FormContextId);
  const error = context.errors[name];
  const touched = context.touched[name];

  if (!error || !touched) return null;

  return (
    <p 
      class={`text-xs text-red-400 ${className}`}
      role="alert"
      aria-live="polite"
    >
      {error}
    </p>
  );
});

interface HelperTextProps {
  class?: string;
}

export const HelperText = component$<HelperTextProps>(({ class: className = "" }) => {
  return (
    <p class={`text-xs text-text-muted ${className}`}>
      <Slot />
    </p>
  );
});

interface FormDescriptionProps {
  class?: string;
}

export const FormDescription = component$<FormDescriptionProps>(({ class: className = "" }) => {
  return (
    <p class={`text-sm text-text-muted ${className}`}>
      <Slot />
    </p>
  );
});

export { validate, type ValidationResult } from "~/lib/validation";
