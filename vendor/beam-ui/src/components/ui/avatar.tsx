import { css, cx } from "../../system.ts";

import type { CSSProperties, ReactNode } from "react";

/** Props for {@link Avatar}. */
export interface AvatarProps {
  /** Person's name (used for initials fallback and accessibility). */
  name: string;
  /** Image URL; if omitted, renders initials on a colored background. */
  src?: string;
  /** Avatar size. Defaults to `"md"` (40px). */
  size?: "sm" | "md" | "lg";
  /** Additional Panda CSS classes. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: CSSProperties;
}

const sizes = {
  sm: 32,
  md: 40,
  lg: 56,
} as const;

const backgroundColors = [
  "#fa520f", // sunbeam orange
  "#4a9eff", // steel blue
  "#5bb8a6", // teal
  "#a855f7", // purple
  "#ef4444", // red
  "#22c55e", // green
  "#ec4899", // pink
  "#f59e0b", // amber
  "#6366f1", // indigo
  "#14b8a6", // cyan
  "#e11d48", // rose
  "#8b5cf6", // violet
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return backgroundColors[Math.abs(hash) % backgroundColors.length];
}

/**
 * User avatar: displays an image or generates initials on a color-coded background.
 *
 * If `src` is provided, renders an `<img>`. Otherwise, extracts initials from the name and assigns
 * a consistent background color based on a hash of the name.
 *
 * @example
 * ```tsx
 * <Avatar name="Alice Smith" src="https://example.com/alice.jpg" size="md" />
 * <Avatar name="Bob Jones" size="lg" />
 * ```
 */
const base = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "full",
  border: "2px solid",
  borderColor: "bg.page",
  overflow: "hidden",
  flexShrink: 0,
});

export function Avatar(
  { name, src, size = "md", className, style }: AvatarProps,
): ReactNode {
  const dim = sizes[size];
  const fontSize = Math.round(dim * 0.38);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cx(base, className)}
        style={{ width: dim, height: dim, ...style }}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={cx(base, className)}
      style={{
        width: dim,
        height: dim,
        backgroundColor: getColor(name),
        color: "white",
        fontSize,
        fontWeight: 600,
        ...style,
      }}
    >
      {getInitials(name)}
    </span>
  );
}
