import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";
import {
  ProgressRange,
  ProgressRoot,
  ProgressTrack,
  ProgressValueText,
} from "@ark-ui/react/progress";

/** Progress bar visual variant. */
type ProgressVariant = "default" | "success" | "error";

/** Props for {@link ProgressBar}. */
export interface ProgressBarProps {
  /** Numeric progress value (0–100). Clamped automatically. */
  value: number;
  /** Visual style. Defaults to `"default"`. */
  variant?: ProgressVariant;
  /** Show percentage label. Defaults to `false`. */
  showLabel?: boolean;
  /** Bar height. Defaults to `"md"`. */
  size?: "sm" | "md";
  /** Additional CSS class. */
  className?: string;
}

const fillColors: Record<ProgressVariant, string> = {
  default: "sunbeam.orange",
  success: "sunshine.700",
  error: "sunbeam.flame",
};

/**
 * Horizontal progress bar with optional percentage label and three color variants.
 *
 * @example
 * ```tsx
 * <ProgressBar value={65} variant="default" showLabel size="md" />
 * ```
 */
export function ProgressBar({
  value,
  variant = "default",
  showLabel = false,
  size = "md",
  className,
}: ProgressBarProps): ReactNode {
  const clamped = Math.max(0, Math.min(100, value));
  const height = size === "sm" ? "4px" : "8px";

  return (
    <ProgressRoot
      value={clamped}
      className={cx(showLabel ? wrapperStyle : undefined, className)}
    >
      <ProgressTrack className={trackStyle} style={{ height }}>
        <ProgressRange
          className={cx(
            fillStyle,
            css({ backgroundColor: fillColors[variant] }),
          )}
        />
      </ProgressTrack>
      {showLabel && <ProgressValueText className={labelStyle} />}
    </ProgressRoot>
  );
}

const wrapperStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
});

const trackStyle = css({
  width: "100%",
  backgroundColor: "bg.card",
  borderRadius: "full",
  overflow: "hidden",
});

const fillStyle = css({
  height: "100%",
  borderRadius: "full",
  transition: "width 0.4s ease",
});

const labelStyle = css({
  fontSize: "xs",
  fontWeight: "button",
  color: "text.secondary",
  whiteSpace: "nowrap",
});
