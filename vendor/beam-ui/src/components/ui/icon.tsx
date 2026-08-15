import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";

/** Props for {@link Icon}. */
export interface IconProps {
  /** Material Symbol icon name (e.g., "home", "settings", "check"). */
  name: string;
  /** Icon size in pixels or CSS unit string. If numeric, converted to `px`. */
  size?: number | string;
  /** Apply filled variant (FILL 1 font-variation). Defaults to `false`. */
  filled?: boolean;
  /** Optional CSS class for additional styling. */
  className?: string;
  /** When provided, the icon is treated as meaningful: role="img" + aria-label. Otherwise aria-hidden="true". */
  label?: string;
}

/**
 * Material Symbol icon with optional filled variant and accessibility support.
 *
 * @example
 * ```tsx
 * <Icon name="home" size={20} />
 * <Icon name="settings" filled label="Settings" />
 * ```
 */
export function Icon(
  { name, size, filled, className, label }: IconProps,
): ReactNode {
  const style: React.CSSProperties = {
    fontSize: typeof size === "number" ? `${size}px` : size,
    lineHeight: 1,
  };
  if (filled) {
    style.fontVariationSettings = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";
  }

  return (
    <span
      className={cx("material-symbols-outlined", base, className)}
      style={style}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const })}
    >
      {name}
    </span>
  );
}

const base = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});
