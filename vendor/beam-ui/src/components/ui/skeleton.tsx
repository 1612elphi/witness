import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";

/** Props for {@link Skeleton}. */
export interface SkeletonProps {
  /** Width (CSS string). */
  width?: string;
  /** Height (CSS string). */
  height?: string;
  /** Skeleton shape. Defaults to `"text"`. */
  variant?: "text" | "circle" | "rect";
  /** Number of skeletons to render (stacked vertically). Defaults to `1`. */
  count?: number;
  /** Additional CSS class. */
  className?: string;
}

const shimmerName = "beam-shimmer";

const base = css({
  backgroundColor: { base: "warm.10", _dark: "chrome.06" },
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  backgroundImage: {
    base: "linear-gradient(90deg, transparent 0%, rgba(127,99,21,0.15) 50%, transparent 100%)",
    _dark: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
  },
  backgroundSize: "200% 100%",
  animationName: shimmerName,
  animationDuration: "1.8s",
  animationTimingFunction: "ease-in-out",
  animationIterationCount: "infinite",
});

const textStyle = css({
  width: "100%",
  height: "4",
  borderRadius: "sm",
});

const circleStyle = css({
  borderRadius: "full",
});

const rectStyle = css({
  borderRadius: "sm",
});

const stackStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "3",
});

/**
 * Animated loading placeholder with shimmer effect.
 * Renders as text line (100% width, 16px), circle, or rect by default.
 * Circle defaults to square (set height = width). Multiple skeletons stack vertically.
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" width="100%" />
 * <Skeleton variant="circle" width="48px" />
 * <Skeleton variant="rect" width="200px" height="100px" count={3} />
 * ```
 */
export function Skeleton({
  width,
  height,
  variant = "text",
  count = 1,
  className,
}: SkeletonProps): ReactNode {
  const variantStyle = variant === "text"
    ? textStyle
    : variant === "circle"
    ? circleStyle
    : rectStyle;

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;
  if (variant === "circle" && width && !height) style.height = width;

  const single = (
    <div
      role="status"
      aria-label="Loading"
      className={cx(base, variantStyle, className)}
      style={style}
    />
  );

  if (count <= 1) return single;

  return (
    <div role="status" aria-label="Loading" className={stackStyle}>
      {Array.from(
        { length: count },
        (_, i) => (
          <div
            key={i}
            aria-hidden="true"
            className={cx(base, variantStyle, className)}
            style={style}
          />
        ),
      )}
    </div>
  );
}
