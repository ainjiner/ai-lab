import { component$ } from "@builder.io/qwik";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  class?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-lg",
  lg: "w-12 h-12 text-xl",
};

export const Avatar = component$(({ name, size = "md", class: className }: AvatarProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      class={`rounded-full bg-surface-light flex items-center justify-center font-medium ${sizeClasses[size]} ${className || ""}`}
    >
      {initials}
    </div>
  );
});

interface AvatarImageProps {
  src: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  class?: string;
}

export const AvatarImage = component$(({ src, alt, size = "md", class: className }: AvatarImageProps) => {
  const dimensions = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  return (
    <img
      src={src}
      alt={alt || ""}
      width={dimensions[size]}
      height={dimensions[size]}
      class={`rounded-full object-cover ${sizeClasses[size]} ${className || ""}`}
    />
  );
});
