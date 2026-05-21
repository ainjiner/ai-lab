import { component$, Slot, PropsOf } from "@builder.io/qwik";

export interface CardProps extends PropsOf<"div"> {
  class?: string;
}

export const Card = component$((props: CardProps) => {
  const { class: className, ...rest } = props;
  return (
    <div class={`rounded-2xl border border-surface-light bg-surface ${className || ""}`} {...rest}>
      <Slot />
    </div>
  );
});

export interface CardHeaderProps extends PropsOf<"div"> {
  class?: string;
}

export const CardHeader = component$((props: CardHeaderProps) => {
  const { class: className, ...rest } = props;
  return (
    <div class={`p-6 pb-0 flex flex-col space-y-1.5 ${className || ""}`} {...rest}>
      <Slot />
    </div>
  );
});

export interface CardTitleProps extends PropsOf<"h3"> {
  class?: string;
}

export const CardTitle = component$((props: CardTitleProps) => {
  const { class: className, ...rest } = props;
  return (
    <h3 class={`text-base font-semibold leading-none tracking-tight text-text ${className || ""}`} {...rest}>
      <Slot />
    </h3>
  );
});

export interface CardDescriptionProps extends PropsOf<"p"> {
  class?: string;
}

export const CardDescription = component$((props: CardDescriptionProps) => {
  const { class: className, ...rest } = props;
  return (
    <p class={`text-sm text-text-muted ${className || ""}`} {...rest}>
      <Slot />
    </p>
  );
});

export interface CardContentProps extends PropsOf<"div"> {
  class?: string;
}

export const CardContent = component$((props: CardContentProps) => {
  const { class: className, ...rest } = props;
  return (
    <div class={`p-6 ${className || ""}`} {...rest}>
      <Slot />
    </div>
  );
});

export interface CardFooterProps extends PropsOf<"div"> {
  class?: string;
}

export const CardFooter = component$((props: CardFooterProps) => {
  const { class: className, ...rest } = props;
  return (
    <div class={`p-6 pt-0 flex items-center ${className || ""}`} {...rest}>
      <Slot />
    </div>
  );
});
