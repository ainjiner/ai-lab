import { component$, Slot } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { Logo } from "~/components/logo/Logo";

export default component$(() => {
  const loc = useLocation();

  const navSections = [
    {
      title: "Overview",
      items: [
        { href: "/", label: "Dashboard", icon: "📊" },
        { href: "/models", label: "Models", icon: "🤖" },
      ],
    },
    {
      title: "Research",
      items: [
        { href: "/experiments", label: "Experiments", icon: "🔬" },
      ],
    },
    {
      title: "Monitoring",
      items: [
        { href: "/tokens", label: "Tokens", icon: "🔢" },
        { href: "/cost", label: "Cost", icon: "💰" },
        { href: "/tracing", label: "Tracing", icon: "🔍" },
      ],
    },
    {
      title: "Orchestration",
      items: [
        { href: "/orchestration", label: "Orchestration", icon: "🎭" },
      ],
    },
    {
      title: "Settings",
      items: [
        { href: "/integrations", label: "Integrations", icon: "🔌" },
        { href: "/settings", label: "Settings", icon: "⚙️" },
      ],
    },
  ];

  return (
    <div class="flex min-h-screen">
      <aside class="flex w-64 flex-col border-r border-surface-light bg-surface">
        <div class="border-b border-surface-light px-4 py-5">
          <Logo size={28} showTagline />
        </div>

        <nav class="flex-1 overflow-y-auto p-4">
          {navSections.map((section) => (
            <div key={section.title} class="mb-4">
              <p class="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {section.title}
              </p>
              <ul class="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      class={`flex items-center gap-3 rounded-lg px-4 py-2 transition-colors ${
                        loc.url.pathname === item.href
                          ? "bg-primary text-white"
                          : "text-text-muted hover:bg-surface-light"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div class="border-t border-surface-light p-4">
          <p class="text-xs text-text-muted">ML Engine v0.1.0</p>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto p-8">
        <Slot />
      </main>
    </div>
  );
});
