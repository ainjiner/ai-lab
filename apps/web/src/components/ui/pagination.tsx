import { component$, $, QRL } from "@builder.io/qwik";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  class?: string;
  onPageChange$?: QRL<(page: number) => void>;
}

export const Pagination = component$<PaginationProps>(({
  currentPage,
  totalPages,
  class: className = "",
  onPageChange$
}) => {
  const goToPage = $((page: number) => {
    if (page < 1 || page > totalPages) return;
    if (onPageChange$) {
      onPageChange$(page);
    }
  });

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (showEllipsisStart) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (showEllipsisEnd) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      class={`mx-auto flex w-full justify-center ${className}`}
    >
      <ul class="flex flex-row items-center gap-1">
        <li>
          <button
            type="button"
            aria-label="Go to previous page"
            disabled={currentPage <= 1}
            onClick$={() => goToPage(currentPage - 1)}
            class={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-surface-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 ${
              currentPage <= 1 ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="h-4 w-4"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </li>

        {getPageNumbers().map((page, index) => (
          <li key={index}>
            {page === "..." ? (
              <span class="inline-flex h-9 w-9 items-center justify-center text-sm text-text-muted">
                ...
              </span>
            ) : (
              <button
                type="button"
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
                onClick$={() => goToPage(page)}
                class={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-surface-light text-text"
                }`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        <li>
          <button
            type="button"
            aria-label="Go to next page"
            disabled={currentPage >= totalPages}
            onClick$={() => goToPage(currentPage + 1)}
            class={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-surface-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 ${
              currentPage >= totalPages ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="h-4 w-4"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
});

interface PageSizeSelectorProps {
  value: number;
  options?: number[];
  class?: string;
  onChange$?: QRL<(size: number) => void>;
}

export const PageSizeSelector = component$<PageSizeSelectorProps>(({
  value,
  options = [10, 20, 50, 100],
  class: className = "",
  onChange$
}) => {
  const handleChange = $((e: Event) => {
    const target = e.target as HTMLSelectElement;
    if (onChange$) {
      onChange$(parseInt(target.value));
    }
  });

  return (
    <div class={`flex items-center gap-2 ${className}`}>
      <span class="text-sm text-text-muted">Show</span>
      <select
        value={value.toString()}
        onChange$={handleChange}
        class="h-9 rounded-md border border-surface-light bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {options.map((opt: number) => (
          <option key={opt} value={opt}>
            {String(opt)}
          </option>
        ))}
      </select>
      <span class="text-sm text-text-muted">per page</span>
    </div>
  );
});
