import { component$, $, QRL } from "@builder.io/qwik";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  class?: string;
  onRating?: QRL<(rating: number) => void>;
}

const sizeClasses = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const ratingColors: Record<number, string> = {
  1: "text-red-400",
  2: "text-orange-400",
  3: "text-yellow-400",
  4: "text-lime-400",
  5: "text-green-400",
};

export const StarRating = component$(({ rating, maxRating = 5, size = "md", class: className, onRating }: StarRatingProps) => {
  const colorClass = ratingColors[rating] || "text-yellow-400";

  const handleClick = $((star: number) => {
    if (onRating) {
      onRating(star);
    }
  });

  return (
    <div class={`flex items-center gap-1 ${className || ""}`}>
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          onClick$={() => handleClick(star)}
          class={`${sizeClasses[size]} ${star <= rating ? colorClass : "text-text-muted/30"} transition-all hover:scale-125 ${onRating ? "cursor-pointer" : ""}`}
          disabled={!onRating}
        >
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
});
