import { css, cx } from "../../system.ts";

import type { CSSProperties, ReactNode } from "react";

/** Props for {@link ScrollArea}. */
export interface ScrollAreaProps {
  /** Content to scroll. */
  children: ReactNode;
  /** Max height before scrolling (CSS string). */
  maxHeight?: string;
  /** Scrollbar visibility mode. `"visible"` always shows themed scrollbar, `"hover"` hides until hover, `"auto"` uses browser default. Defaults to `"visible"`. */
  scrollbar?: "visible" | "hover" | "auto";
  /** Scroll direction. Defaults to `"vertical"`. */
  direction?: "vertical" | "horizontal" | "both";
  /** Additional CSS class. */
  className?: string;
}

/**
 * Native scrollable container with themed golden scrollbars (Webkit & Firefox).
 * Supports three scrollbar modes and flexible scroll directions.
 *
 * @example
 * ```tsx
 * <ScrollArea maxHeight="400px" scrollbar="hover" direction="vertical">
 *   <LongContent />
 * </ScrollArea>
 * ```
 */
export function ScrollArea({
  children,
  maxHeight,
  scrollbar = "visible",
  direction = "vertical",
  className,
}: ScrollAreaProps): ReactNode {
  const dirClass = direction === "horizontal"
    ? dirHorizontal
    : direction === "both"
    ? dirBoth
    : dirVertical;

  const barClass = scrollbar === "hover" ? barHover : scrollbar === "auto" ? barAuto : barVisible;

  const inlineStyle: CSSProperties = {};
  if (maxHeight) inlineStyle.maxHeight = maxHeight;

  // Firefox hover behavior needs JS for scrollbarColor toggle
  const hoverProps = scrollbar === "hover"
    ? {
      onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
        (e.currentTarget.style as unknown as Record<string, string>)
          .scrollbarColor = "rgba(255,161,16,0.25) transparent";
      },
      onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
        (e.currentTarget.style as unknown as Record<string, string>)
          .scrollbarColor = "transparent transparent";
      },
    }
    : {};

  // Firefox scrollbar inline styles (Panda can't compile these)
  const scrollbarInline: Record<string, string> = scrollbar === "hover"
    ? { scrollbarWidth: "thin", scrollbarColor: "transparent transparent" }
    : {
      scrollbarWidth: "thin",
      scrollbarColor: "rgba(255,161,16,0.25) transparent",
    };

  return (
    <div
      className={cx(base, dirClass, barClass, className)}
      style={{
        ...inlineStyle,
        ...scrollbarInline,
      }}
      {...hoverProps}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Base                                                                */
/* ------------------------------------------------------------------ */

const base = css({
  position: "relative",
});

const dirVertical = css({ overflowY: "auto", overflowX: "hidden" });
const dirHorizontal = css({ overflowX: "auto", overflowY: "hidden" });
const dirBoth = css({ overflow: "auto" });

/* ------------------------------------------------------------------ */
/* Scrollbar variants                                                  */
/* ------------------------------------------------------------------ */

/** Always visible, themed golden scrollbar */
const barVisible = css({
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(255,161,16,0.25) transparent",

  "&::-webkit-scrollbar": { width: "1", height: "1" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    background: "sunshine.25",
    borderRadius: "full",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "sunshine.50",
  },
  "&::-webkit-scrollbar-corner": { background: "transparent" },
});

/** Hidden by default, appears on hover with golden theme */
const barHover = css({
  /* Firefox: scrollbarColor toggled via JS events above */

  "&::-webkit-scrollbar": { width: "1", height: "1" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    background: "transparent",
    borderRadius: "full",
  },
  "&:hover::-webkit-scrollbar-thumb": {
    background: "sunshine.25",
  },
  "&:hover::-webkit-scrollbar-thumb:hover": {
    background: "sunshine.50",
  },
  "&::-webkit-scrollbar-corner": { background: "transparent" },
});

/** Browser default scrollbar with theme-matching colors */
const barAuto = css({
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(127,99,21,0.25) transparent",

  "&::-webkit-scrollbar": { width: "1.5", height: "1.5" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    background: "warm.25",
    borderRadius: "full",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "warm.40",
  },
  "&::-webkit-scrollbar-corner": { background: "transparent" },
});
