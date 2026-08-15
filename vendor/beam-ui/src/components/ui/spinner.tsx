import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";

/** Props for {@link Spinner}. */
export interface SpinnerProps {
  /** Size. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Optional label shown below spinner. */
  label?: string;
  /** Use brand orange color instead of muted gold. Defaults to `false`. */
  accent?: boolean;
  /** Custom color hex (overrides accent). */
  color?: string;
  /** Additional CSS class. */
  className?: string;
}

const sizes = {
  sm: 20,
  md: 32,
  lg: 48,
} as const;

const strokes = {
  sm: 2.5,
  md: 3,
  lg: 3.5,
} as const;

/**
 * SVG spinner with animated arc and optional label.
 * Three sizes and customizable color.
 *
 * @example
 * ```tsx
 * <Spinner size="md" label="Loading..." accent />
 * ```
 */
export function Spinner({
  size = "md",
  label,
  accent = false,
  color,
  className,
}: SpinnerProps): ReactNode {
  const dim = sizes[size];
  const stroke = strokes[size];
  const r = (dim - stroke) / 2;

  return (
    <div
      className={cx(wrapper, className)}
      role="status"
      aria-label={label ?? "Loading"}
    >
      <svg
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        className={svgStyle}
        aria-hidden="true"
      >
        <g transform={`rotate(-90 ${dim / 2} ${dim / 2})`}>
          {/* Track */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke={color ? `${color}25` : accent ? "rgba(250,82,15,0.15)" : "rgba(127,99,21,0.1)"}
            strokeWidth={stroke}
          />
          {/* Spinning arc — dash animated via beam-spin-dash */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke={color ?? (accent ? "#fa520f" : "rgba(127,99,21,0.4)")}
            strokeWidth={stroke}
            strokeLinecap="round"
            className={arcStyle}
          />
        </g>
      </svg>
      {label && <span className={labelStyle}>{label}</span>}
    </div>
  );
}

const wrapper = css({
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2.5",
});

const svgStyle = css({
  animationName: "beam-spin",
  animationDuration: "1.4s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
});

const arcStyle = css({
  animationName: "beam-spin-dash",
  animationDuration: "1.4s",
  animationTimingFunction: "ease-in-out",
  animationIterationCount: "infinite",
  transformOrigin: "center",
});

const labelStyle = css({
  fontSize: "xs",
  color: "text.muted",
  fontFamily: "body",
});
