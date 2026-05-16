import { component$, Slot, PropsOf } from "@builder.io/qwik";

export const Table = component$(({ class: className, ...props }: PropsOf<"table">) => {
  return (
    <div class="relative w-full overflow-auto">
      <table class={`w-full caption-bottom text-sm ${className || ""}`} {...props}>
        <Slot />
      </table>
    </div>
  );
});

export const TableHeader = component$(({ class: className, ...props }: PropsOf<"thead">) => {
  return (
    <thead class={`[&_tr]:border-b ${className || ""}`} {...props}>
      <Slot />
    </thead>
  );
});

export const TableBody = component$(({ class: className, ...props }: PropsOf<"tbody">) => {
  return (
    <tbody class={`[&_tr:last-child]:border-0 ${className || ""}`} {...props}>
      <Slot />
    </tbody>
  );
});

export const TableRow = component$(({ class: className, ...props }: PropsOf<"tr">) => {
  return (
    <tr class={`border-b border-surface-light transition-colors hover:bg-surface-light/50 ${className || ""}`} {...props}>
      <Slot />
    </tr>
  );
});

export const TableHead = component$(({ class: className, ...props }: PropsOf<"th">) => {
  return (
    <th class={`h-12 px-4 text-left align-middle font-medium text-text-muted ${className || ""}`} {...props}>
      <Slot />
    </th>
  );
});

export const TableCell = component$(({ class: className, ...props }: PropsOf<"td">) => {
  return (
    <td class={`p-4 align-middle ${className || ""}`} {...props}>
      <Slot />
    </td>
  );
});
