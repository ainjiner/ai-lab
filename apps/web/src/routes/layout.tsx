import {
  component$,
  Slot,
  useContextProvider,
  useStore,
  $,
  useOnDocument,
  useOnWindow,
  useSignal,
} from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { Logo } from "~/components/logo/Logo";
import { ToastProvider, ToastContext, type ToastStore } from "~/components/ui/toast";
import { CommandPalette, type CommandPaletteStore } from "~/components/ui/command-palette";
import { ErrorBoundary } from "~/components/ui/error-boundary";

const ICONS = {
  dashboard: "M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z",
  models: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  experiments: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
  tokens: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
  cost: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  tracing: "M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  orchestration: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  integrations: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
  settings: "M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  datasets: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
  playground: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  alerts: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  apikeys: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.436-5.436A6 6 0 1121 9z",
  playbooks: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  annotations: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
  cache: "M13 10V3L4 14h7v7l9-11h-7z",
  teams: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  embeddings: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
  finetuning: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  agents: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  reports: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  explorer: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2 0V4.07c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93z",
  marketplace: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 4h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z",
  hamburger: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
  close: "M6 18L18 6M6 6l12 12",
};

const NavIcon = component$(({ path }: { path: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-4 h-4 flex-shrink-0"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d={path} />
  </svg>
));

const navSections = [
  {
    title: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: "dashboard" as const },
      { href: "/models", label: "Models", icon: "models" as const },
      { href: "/playground", label: "Playground", icon: "playground" as const },
    ],
  },
  {
    title: "Discover",
    items: [
      { href: "/explorer", label: "Explorer", icon: "explorer" as const },
      { href: "/marketplace", label: "Marketplace", icon: "marketplace" as const },
    ],
  },
  {
    title: "Research",
    items: [
      { href: "/datasets", label: "Datasets", icon: "datasets" as const },
      { href: "/experiments", label: "Experiments", icon: "experiments" as const },
      { href: "/playbooks", label: "Playbooks", icon: "playbooks" as const },
      { href: "/annotations", label: "Annotations", icon: "annotations" as const },
    ],
  },
  {
    title: "Monitoring",
    items: [
      { href: "/tokens", label: "Tokens", icon: "tokens" as const },
      { href: "/cost", label: "Cost", icon: "cost" as const },
      { href: "/tracing", label: "Tracing", icon: "tracing" as const },
      { href: "/alerts", label: "Alerts", icon: "alerts" as const },
      { href: "/cache", label: "Cache", icon: "cache" as const },
    ],
  },
  {
    title: "Development",
    items: [
      { href: "/orchestration", label: "Orchestration", icon: "orchestration" as const },
      { href: "/agents", label: "Agents", icon: "agents" as const },
      { href: "/embeddings", label: "Embeddings", icon: "embeddings" as const },
      { href: "/fine-tuning", label: "Fine-tuning", icon: "finetuning" as const },
    ],
  },
  {
    title: "Platform",
    items: [
      { href: "/integrations", label: "Integrations", icon: "integrations" as const },
      { href: "/api-keys", label: "API Keys", icon: "apikeys" as const },
      { href: "/teams", label: "Teams", icon: "teams" as const },
      { href: "/reports", label: "Reports", icon: "reports" as const },
      { href: "/settings", label: "Settings", icon: "settings" as const },
    ],
  },
];

export default component$(() => {
  const loc = useLocation();
  const toastStore = useStore<ToastStore>({ toasts: [] });
  useContextProvider(ToastContext, toastStore);

  const ui = useStore({ sidebarOpen: false });
  const cmdStore = useStore<CommandPaletteStore>({ open: false, query: "", activeIndex: 0 });
  const isOffline = useSignal(false);

  useOnDocument(
    "keydown",
    $((e: Event) => {
      const ke = e as KeyboardEvent;
      if ((ke.metaKey || ke.ctrlKey) && ke.key === "k") {
        cmdStore.open = !cmdStore.open;
        if (cmdStore.open) {
          cmdStore.query = "";
          cmdStore.activeIndex = 0;
        }
      }
    })
  );

  useOnWindow("offline", $(() => { isOffline.value = true; }));
  useOnWindow("online",  $(() => { isOffline.value = false; }));

  const closeSidebar = $(() => {
    ui.sidebarOpen = false;
  });

  const SidebarContent = component$(() => (
    <div class="flex flex-col h-full">
      <div class="border-b border-surface-light px-5 py-4 flex items-center justify-between shrink-0">
        <Logo size={26} showTagline={false} />
        <button
          aria-label="Close sidebar"
          class="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-light text-text-muted transition-colors"
          onClick$={closeSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d={ICONS.close} />
          </svg>
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <p class="mb-1 px-3 text-[10px] font-medium uppercase tracking-wider text-text-subtle/60">
              {section.title}
            </p>
            <ul class="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? loc.url.pathname === "/"
                    : loc.url.pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick$={closeSidebar}
                      class={[
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
                        isActive
                          ? "bg-surface-light text-text font-medium"
                          : "text-text-muted font-normal hover:text-text hover:bg-surface-light/50",
                      ]}
                    >
                      <NavIcon path={ICONS[item.icon]} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div class="border-t border-surface-light px-5 py-3 space-y-2 shrink-0">
        <button
          onClick$={() => { cmdStore.open = true; cmdStore.query = ""; cmdStore.activeIndex = 0; }}
          class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-text hover:bg-surface-light transition-colors"
          aria-label="Open command palette"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span class="flex-1 text-left">Search...</span>
          <kbd class="hidden sm:inline-flex items-center gap-0.5 border border-surface-light rounded px-1 py-0.5 text-[9px] font-mono">
            ⌘K
          </kbd>
        </button>
        <p class="text-[11px] text-text-subtle">AI Lab v0.1.0</p>
      </div>
    </div>
  ));

  return (
    <ToastProvider>
      <div class="flex min-h-screen bg-background">
        {ui.sidebarOpen && (
          <div
            class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick$={closeSidebar}
          />
        )}

        <aside
          class={[
            "fixed inset-y-0 left-0 z-50 w-60 bg-surface-elevated border-r border-surface-light flex flex-col transition-transform duration-200 ease-in-out",
            "md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex",
            ui.sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          ]}
        >
          <SidebarContent />
        </aside>

        <div
          class={[
            "fixed top-0 left-0 h-[2px] bg-primary z-[100] transition-all duration-300 ease-out",
            loc.isNavigating ? "w-2/3 opacity-100" : "w-full opacity-0",
          ]}
        />

        {isOffline.value && (
          <div class="fixed bottom-0 left-0 right-0 z-[9997] flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#2a1a00]/95 border-t border-[#5a3a00]/60 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-[#fbbf24] shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
            </svg>
            <p class="text-sm text-[#fbbf24] font-medium">API connection lost — data may be stale. Reconnecting…</p>
          </div>
        )}

        <div class="flex flex-col flex-1 min-w-0">
          <header class="md:hidden flex items-center gap-3 px-4 py-3 border-b border-surface-light bg-surface-elevated sticky top-0 z-30">
            <button
              aria-label="Open sidebar"
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-light text-text-muted transition-colors"
              onClick$={() => { ui.sidebarOpen = true; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d={ICONS.hamburger} />
              </svg>
            </button>
            <Logo size={22} showTagline={false} />
          </header>

          <main class="flex-1 overflow-y-auto p-6 md:p-8">
            <ErrorBoundary>
              <Slot />
            </ErrorBoundary>
          </main>
        </div>
      </div>

      <CommandPalette store={cmdStore} />
    </ToastProvider>
  );
});
