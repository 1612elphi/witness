import { css, cx } from "../../system.ts";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { Icon } from "./icon.tsx";

/** Visual surface variant for {@link Card}. */
export type CardVariant = "elevated" | "outlined";

/** Own props for {@link Card}, independent of the rendered element. */
export interface CardOwnProps {
  /** Visual surface variant. */
  variant?: CardVariant;
  /** Material icon name. When provided alongside `title`, renders a structured content card. */
  icon?: string;
  /** Card heading. When provided, renders a structured content card instead of a generic container. */
  title?: string;
  /** Card description text. */
  description?: string;
  /** Link destination. When provided, the whole card becomes a link. */
  href?: string;
  /** Internal call-to-action link rendered inside the card. */
  action?: { label: string; href: string };
  /** Additional Panda CSS classes. */
  className?: string;
  /** Generic card content. Ignored when `title` is provided. */
  children?: ReactNode;
}

/** Props for {@link Card}. */
export type CardProps<T extends ElementType = "article"> =
  & CardOwnProps
  & Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps | "as">
  & {
    /** Element or component to render. Defaults to `article` (or `a` when `href` is set). */
    as?: T;
  };

const elevatedSurface = css({
  backgroundColor: "bg.card",
  padding: { base: "6", lg: "10" },
  borderRadius: "0",
  shadow: "golden",
  transition: "all 0.3s ease",
  _hover: { translateY: "-0.25" },
});

const outlinedSurface = css({
  backgroundColor: "bg.card",
  padding: "8",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.warm",
  borderRadius: "0",
  transition: "border-color 0.2s ease",
  _hover: { borderColor: "sunbeam.orange" },
});

const iconBox = css({
  width: "12",
  height: "12",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "6",
  color: "sunbeam.orange",
});

const iconBoxCompact = css({
  color: "sunbeam.orange",
  fontSize: "36",
  marginBottom: "4",
});

const titleStyle = css({
  fontSize: "2xl",
  fontWeight: "heading",
  color: "text.primary",
  textTransform: "uppercase",
  letterSpacing: "-0.025em",
  marginBottom: "4",
});

const titleStyleCompact = css({
  fontSize: "xl",
  fontWeight: "heading",
  color: "text.primary",
  marginBottom: "2",
});

const descriptionStyle = css({
  color: "text.secondary",
  lineHeight: 1.7,
  marginBottom: "6",
});

const descriptionStyleCompact = css({
  fontSize: "sm",
  color: "text.secondary",
  lineHeight: 1.6,
  marginBottom: "0",
});

const ctaLink = css({
  color: "sunbeam.orange",
  fontWeight: "button",
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  textTransform: "uppercase",
  fontSize: "sm",
  letterSpacing: "0.1em",
  textDecoration: "none",
  transition: "gap 0.2s ease",
  _hover: { gap: "3" },
});

/**
 * Single card implementation that serves as both a generic surface and a
 * structured content card.
 *
 * **Container mode** — pass `children` and no `title`:
 * ```tsx
 * <Card>
 *   <h3>Anything goes here</h3>
 * </Card>
 * ```
 *
 * **Content mode** — pass `title` (and usually `icon` + `description`):
 * - `href` makes the whole card a link.
 * - `action` renders a separate CTA inside the card.
 * - neither produces a static content card.
 *
 * Use `variant="outlined"` for the bordered CapabilityCard/TopicCard look, or
 * `variant="elevated"` (default) for the shadow-lift FeatureCard look.
 *
 * @example
 * ```tsx
 * <Card icon="code" title="API" description="..." action={{ label: "Explore", href: "/api" }} />
 * <Card icon="guide" title="Guide" description="..." href="/guide" variant="outlined" />
 * <Card icon="shield" title="Security" description="..." variant="outlined" />
 * ```
 */
export function Card<T extends ElementType = "article">(
  {
    variant,
    icon,
    title,
    description,
    href,
    action,
    className,
    children,
    as,
    ...rest
  }: CardProps<T>,
): ReactNode {
  const isContent = title != null && title.length > 0;
  const isLink = href != null && href.length > 0;
  const isInteractive = isLink || action != null;

  const resolvedVariant = variant ??
    (isContent && !isInteractive ? "outlined" : "elevated");
  const surfaceClass = resolvedVariant === "outlined" ? outlinedSurface : elevatedSurface;

  const Component = as ?? (isLink ? "a" : "article");

  if (!isContent) {
    return (
      <Component
        className={cx(surfaceClass, className)}
        {...(isLink ? { href } : {})}
        {...rest}
      >
        {children}
      </Component>
    );
  }

  const compact = resolvedVariant === "outlined";

  const content = (
    <>
      {icon && (
        <div className={compact ? iconBoxCompact : iconBox}>
          <Icon
            name={icon}
            size={compact ? 36 : 30}
            filled
            aria-hidden="true"
          />
        </div>
      )}
      <h3 className={compact ? titleStyleCompact : titleStyle}>{title}</h3>
      {description && (
        <p
          className={cx(
            compact ? descriptionStyleCompact : descriptionStyle,
            action ? undefined : css({ marginBottom: "0" }),
          )}
        >
          {description}
        </p>
      )}
      {action && (
        <a href={action.href} className={ctaLink}>
          {action.label} <Icon name="arrow_forward" size={14} />
        </a>
      )}
    </>
  );

  return (
    <Component
      href={isLink ? href : undefined}
      className={cx(surfaceClass, className)}
      {...rest}
    >
      {content}
    </Component>
  );
}
