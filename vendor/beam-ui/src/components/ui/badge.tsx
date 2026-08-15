import { css, cx } from "../../system.ts";
import { statusColors } from "../../data/statuses.ts";

import type { ReactNode } from "react";

/**
 * Visual variant tokens for {@link Badge}.
 *
 * **Tier / Recognition**: `featured`, `premier`, `verified`, `partner`, `community` — warm gold/orange palette for status.
 * **Release Stage**: `stable`, `new`, `beta`, `preview`, `experimental`, `deprecated` — temperature progression from cool to hot.
 * **Work Status**: `open`, `draft`, `review`, `approved`, `merged`, `closed`, `revision` — solid, distinct status colors.
 * **Priority**: `critical`, `high`, `medium`, `low` — urgency-coded reds and greens.
 * **Utility**: `section` — renders as a horizontal rule with label (special layout).
 */
export type BadgeVariant =
  // Tier / Recognition
  | "featured"
  | "premier"
  | "verified"
  | "partner"
  | "community"
  // Release Stage
  | "stable"
  | "new"
  | "beta"
  | "preview"
  | "experimental"
  | "deprecated"
  // Work Status
  | "open"
  | "draft"
  | "review"
  | "approved"
  | "merged"
  | "closed"
  | "revision"
  // Priority
  | "critical"
  | "high"
  | "medium"
  | "low"
  // Utility
  | "section";

/** Props for {@link Badge}. */
export interface BadgeProps {
  /** Badge label text. */
  children: React.ReactNode;
  /** Visual style. Defaults to `"premier"`. */
  variant?: BadgeVariant;
  /** Additional Panda CSS classes. */
  className?: string;
}

const base = css({
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  lineHeight: 1,
});

/** For token-based colors (Panda resolves these) */
const pill = (bg: string, fg: string, border?: string) =>
  css({
    backgroundColor: bg,
    color: fg,
    fontSize: "2xs",
    py: "1",
    px: "2",
    borderRadius: "sm",
    display: "inline-block",
    ...(border ? { border: "1px solid", borderColor: border } : {}),
  });

/**
 * Shared layout for solid work-status / priority pills.
 *
 * The background color is applied via inline style from {@link statusColors}:
 * `statuses.ts` is the single source of truth for those colors, and Panda can
 * only statically extract local values, so imported colors cannot go through
 * `css()`.
 */
const solidPill = css({
  color: "white",
  fontSize: "2xs",
  py: "1",
  px: "2",
  borderRadius: "sm",
  display: "inline-block",
});

/** Solid pill background colors, keyed by badge variant (runtime-consumed). */
const solidBackgrounds = {
  // Work Status — solid, distinct, readable in both modes
  open: statusColors.open,
  draft: statusColors.draft,
  review: statusColors.review,
  approved: statusColors.approved,
  merged: statusColors.merged,
  closed: statusColors.closed,
  revision: statusColors.revision,
  // Priority — solid, urgency-coded
  critical: statusColors.critical,
  high: statusColors.high,
  medium: statusColors.medium,
  low: statusColors.low,
} as const;

type SolidVariant = keyof typeof solidBackgrounds;

const isSolidVariant = (variant: BadgeVariant): variant is SolidVariant =>
  variant in solidBackgrounds;

const variants: Record<Exclude<BadgeVariant, "section">, string> = {
  // Tier / Recognition — warm palette
  featured: pill("sunbeam.orange", "white", "bright.yellow"),
  premier: pill("sunbeam.orange", "white"),
  verified: pill("sunshine.900", "white"),
  partner: pill("beam.orange", "white"),
  community: pill("beam.gold", "sunbeam.black", "sunshine.500"),

  // Release Stage — temperature progression
  stable: pill("sunshine.300", "sunbeam.black"),
  new: pill("beam.gold", "sunbeam.black"),
  beta: pill("sunshine.500", "sunbeam.black"),
  preview: pill("sunbeam.flame", "white"),
  experimental: pill("bright.yellow", "sunbeam.black"),
  deprecated: pill("border.warm", "text.secondary"),

  // Work Status — solid, distinct, readable in both modes
  open: solidPill,
  draft: solidPill,
  review: solidPill,
  approved: solidPill,
  merged: solidPill,
  closed: solidPill,
  revision: solidPill,

  // Priority — solid, urgency-coded
  critical: solidPill,
  high: solidPill,
  medium: solidPill,
  low: solidPill,
};

/**
 * Section badge renders as a label on a horizontal rule.
 *
 * Used to visually separate sections in long-form content. The label is left-aligned
 * with an orange background, and a decorative line extends to the right.
 */
function SectionBadge(
  { children, className }: Omit<BadgeProps, "variant">,
): ReactNode {
  return (
    <div
      className={cx(
        css({
          display: "flex",
          alignItems: "center",
          gap: "4",
          marginBottom: "10",
        }),
        className,
      )}
    >
      <span
        className={cx(
          base,
          css({
            fontSize: "2xs",
            color: "sunbeam.orange",
            backgroundColor: "accent.10",
            py: "1",
            px: "2",
            borderRadius: "sm",
            whiteSpace: "nowrap",
          }),
        )}
      >
        {children}
      </span>
      <div
        aria-hidden="true"
        className={css({
          height: "0.25",
          flex: 1,
          backgroundColor: "border.warm",
        })}
      />
    </div>
  );
}

/**
 * Compact labeled badge for status, priority, and release stage tagging.
 *
 * Supports 25+ semantic variants organized by tier, release stage, work status, and priority.
 * The `section` variant renders a horizontal divider instead.
 *
 * @example
 * ```tsx
 * <Badge variant="new">New Feature</Badge>
 * <Badge variant="critical">Urgent</Badge>
 * <Badge variant="section">Documentation</Badge>
 * ```
 */
export function Badge(
  { children, variant = "premier", className }: BadgeProps,
): ReactNode {
  if (variant === "section") {
    return <SectionBadge className={className}>{children}</SectionBadge>;
  }

  return (
    <span
      className={cx(base, variants[variant], className)}
      style={isSolidVariant(variant) ? { backgroundColor: solidBackgrounds[variant] } : undefined}
    >
      {children}
    </span>
  );
}
