import { component$ } from "@builder.io/qwik";

export interface SkeletonProps {
  class?: string;
}

export const Skeleton = component$<SkeletonProps>((props) => {
  return (
    <div class={["animate-pulse bg-surface-light rounded-lg", props.class]} />
  );
});
