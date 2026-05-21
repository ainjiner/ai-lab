import { component$, Slot } from "@builder.io/qwik";

export const Tooltip = component$((props: { content: string; class?: string; position?: "top" | "bottom" }) => {
  const isBottom = props.position === "bottom";
  
  return (
    <div class={`group relative inline-flex items-center justify-center ${props.class || ""}`}>
      <Slot />
      <div
        class={[
          "pointer-events-none absolute whitespace-nowrap rounded-md bg-surface-light border border-surface-light px-2.5 py-1 text-[11px] font-medium text-text opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-50 shadow-lg",
          isBottom ? "top-full mt-2" : "bottom-full mb-2",
        ]}
      >
        {props.content}
      </div>
    </div>
  );
});