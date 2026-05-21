import { component$, $, useStylesScoped$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";

interface CommandItem {
  id: string;
  label: string;
  group: string;
  href: string;
  icon: string;
  keywords: string;
}

const COMMANDS: CommandItem[] = [
  { id: "dashboard",     label: "Dashboard",     group: "Navigate", href: "/",              icon: "M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z", keywords: "home overview" },
  { id: "models",        label: "Models",        group: "Navigate", href: "/models",        icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z", keywords: "catalog ai llm" },
  { id: "experiments",   label: "Experiments",   group: "Navigate", href: "/experiments",   icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5", keywords: "research tracking benchmark" },
  { id: "tokens",        label: "Tokens",        group: "Navigate", href: "/tokens",        icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125", keywords: "usage quota" },
  { id: "cost",          label: "Cost",          group: "Navigate", href: "/cost",          icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z", keywords: "budget spend analytics" },
  { id: "tracing",       label: "Tracing",       group: "Navigate", href: "/tracing",       icon: "M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z", keywords: "logs requests latency" },
  { id: "orchestration", label: "Orchestration", group: "Navigate", href: "/orchestration", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z", keywords: "agents skills omo" },
  { id: "integrations",  label: "Integrations",  group: "Navigate", href: "/integrations",  icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244", keywords: "providers api keys" },
  { id: "settings",      label: "Settings",      group: "Navigate", href: "/settings",      icon: "M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z M15 12a3 3 0 11-6 0 3 3 0 016 0z", keywords: "preferences config" },
  { id: "compare",       label: "Compare Models", group: "Navigate", href: "/compare",      icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5", keywords: "side by side diff" },
  { id: "prompts",       label: "Prompts",        group: "Navigate", href: "/prompts",      icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z", keywords: "template library" },
];

export interface CommandPaletteStore {
  open: boolean;
  query: string;
  activeIndex: number;
}

function matchesQuery(item: CommandItem, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    item.label.toLowerCase().includes(lower) ||
    item.keywords.toLowerCase().includes(lower) ||
    item.group.toLowerCase().includes(lower)
  );
}

export const CommandPalette = component$(
  ({ store }: { store: CommandPaletteStore }) => {
    useStylesScoped$(`
      @keyframes cp-in {
        from { opacity: 0; transform: translateY(-8px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0)   scale(1);     }
      }
      .cp-panel {
        animation: cp-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    `);

    const nav = useNavigate();

    const filtered = store.query.trim()
      ? COMMANDS.filter((c) => matchesQuery(c, store.query))
      : COMMANDS;

    const groups = [...new Set(filtered.map((c) => c.group))];

    const close = $(() => {
      store.open = false;
      store.query = "";
      store.activeIndex = 0;
    });

    const navigate = $((href: string) => {
      close();
      nav(href);
    });

    const handleKey = $((e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowDown") {
        store.activeIndex = Math.min(store.activeIndex + 1, filtered.length - 1);
      } else if (e.key === "ArrowUp") {
        store.activeIndex = Math.max(store.activeIndex - 1, 0);
      } else if (e.key === "Enter" && filtered[store.activeIndex]) {
        navigate(filtered[store.activeIndex].href);
      }
    });

    if (!store.open) return <></>;

    let globalIdx = -1;

    return (
      <div
        class="fixed inset-0 z-[9998] flex items-start justify-center pt-[18vh]"
        onClick$={close}
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <div
          class="cp-panel relative w-full max-w-[560px] mx-4 bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl shadow-2xl overflow-hidden"
          onClick$={(e) => e.stopPropagation()}
          onKeyDown$={handleKey}
        >
          <div class="flex items-center gap-3 px-4 py-3 border-b border-[#2c2c2e]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-[#636366] shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              autoFocus
              type="text"
              placeholder="Search pages and actions..."
              value={store.query}
              onInput$={(e) => {
                store.query = (e.target as HTMLInputElement).value;
                store.activeIndex = 0;
              }}
              onKeyDown$={handleKey}
              preventdefault:keydown
              class="flex-1 bg-transparent py-3 text-sm text-[#f5f5f7] placeholder:text-[#636366] outline-none"
            />
            <kbd class="hidden sm:flex items-center gap-1 shrink-0 text-[10px] text-[#636366] border border-[#3a3a3c] rounded px-1.5 py-0.5">
              ESC
            </kbd>
          </div>

          <div class="max-h-[320px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <p class="text-center text-sm text-[#636366] py-8">No results for "{store.query}"</p>
            ) : (
              groups.map((group) => (
                <div key={group}>
                  <p class="px-4 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[#636366]">
                    {group}
                  </p>
                  {filtered
                    .filter((c) => c.group === group)
                    .map((item) => {
                      globalIdx++;
                      const idx = globalIdx;
                      const isActive = store.activeIndex === idx;
                      return (
                        <button
                          key={item.id}
                          onClick$={() => navigate(item.href)}
                          onMouseEnter$={() => { store.activeIndex = idx; }}
                          class={[
                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                            isActive
                              ? "bg-[#2c2c2e] text-[#f5f5f7]"
                              : "text-[#ebebf5]/80 hover:bg-[#2c2c2e]",
                          ]}
                        >
                          <span class={["flex items-center justify-center w-7 h-7 rounded-lg shrink-0", isActive ? "bg-[#3a3a3c]" : "bg-[#2c2c2e]"]}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
                            </svg>
                          </span>
                          <span class="font-medium">{item.label}</span>
                          <span class="ml-auto text-[#636366] text-xs">{item.href === "/" ? "/" : item.href}</span>
                        </button>
                      );
                    })}
                </div>
              ))
            )}
          </div>

          <div class="flex items-center gap-4 px-4 py-2.5 border-t border-[#2c2c2e]">
            <span class="flex items-center gap-1 text-[10px] text-[#636366]">
              <kbd class="border border-[#3a3a3c] rounded px-1 py-0.5">↑↓</kbd>
              navigate
            </span>
            <span class="flex items-center gap-1 text-[10px] text-[#636366]">
              <kbd class="border border-[#3a3a3c] rounded px-1 py-0.5">↵</kbd>
              open
            </span>
            <span class="flex items-center gap-1 text-[10px] text-[#636366]">
              <kbd class="border border-[#3a3a3c] rounded px-1 py-0.5">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    );
  }
);
