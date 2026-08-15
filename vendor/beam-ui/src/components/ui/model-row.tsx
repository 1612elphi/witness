import { css, cx } from "../../system.ts";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { Icon } from "./icon.tsx";
import { Badge, type BadgeVariant } from "./badge.tsx";

/** Own props for {@link ModelRow}, independent of the rendered element. */
export interface ModelRowOwnProps {
  /** Model name / display label. */
  name: string;
  /** Material Symbol icon name for the model. */
  icon: string;
  /** Tier/category badge text (e.g., "PREMIUM", "STANDARD", "BETA"). */
  tier: string;
  /** Version string (e.g., "1.0", "2.5-alpha"). */
  version: string;
  /** Short description of the model. */
  description: string;
  /** Optional link target. If provided, row becomes a link. */
  href?: string;
  /** Additional Panda CSS classes. */
  className?: string;
}

/** Props for {@link ModelRow}. */
export type ModelRowProps<T extends ElementType = "a"> =
  & ModelRowOwnProps
  & Omit<ComponentPropsWithoutRef<T>, keyof ModelRowOwnProps | "as">
  & {
    /** Element or component to render. Defaults to a plain link when href is set, otherwise div. */
    as?: T;
  };

const row = css({
  display: "flex",
  alignItems: "center",
  gap: "4",
  padding: "4",
  margin: "-4",
  borderRadius: "0",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "transparent",
  transition: "all 0.15s ease",
  textDecoration: "none",
  color: "text.primary",
  cursor: "pointer",
  _hover: {
    bg: "bg.page",
    borderColor: "border.default",
  },
});

const iconBox = css({
  width: "10",
  height: "10",
  minWidth: "10",
  bg: "bg.card",
  borderRadius: "md",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "sunbeam.orange",
});

const info = css({
  flex: 1,
  minWidth: 0,
});

const nameRow = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  marginBottom: "0.5",
});

const nameText = css({
  fontWeight: "button",
  fontSize: "sm",
});

const desc = css({
  fontSize: "xs",
  color: "text.secondary",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "50",
});

const versionText = css({
  fontSize: "2xs",
  fontWeight: "button",
  color: "text.muted",
  whiteSpace: "nowrap",
});

/**
 * Single-row display for a model with icon, name, tier badge, version, and description.
 * Optionally renders as a link if href is provided.
 *
 * @example
 * ```tsx
 * <ModelRow
 *   name="GPT-4"
 *   icon="auto_awesome"
 *   tier="premium"
 *   version="1.0"
 *   description="Advanced language model"
 *   href="/models/gpt-4"
 * />
 * ```
 */
export function ModelRow<T extends ElementType = "a">(
  {
    name,
    icon: iconName,
    tier,
    version,
    description,
    href,
    className,
    as,
    ...rest
  }: ModelRowProps<T>,
): ReactNode {
  const content = (
    <>
      <div className={iconBox}>
        <Icon name={iconName} size={20} />
      </div>
      <div className={info}>
        <div className={nameRow}>
          <span className={nameText}>{name}</span>
          <Badge variant={tier as BadgeVariant}>{tier.toUpperCase()}</Badge>
        </div>
        <p className={desc}>{description}</p>
      </div>
      <span className={versionText}>{version}</span>
    </>
  );

  const isLink = href != null && href.length > 0;
  const Component = as ?? (isLink ? "a" : "div");

  return (
    <Component
      href={isLink ? href : undefined}
      className={cx(row, className)}
      aria-label={isLink ? `View ${name} model details` : undefined}
      {...rest}
    >
      {content}
    </Component>
  );
}
