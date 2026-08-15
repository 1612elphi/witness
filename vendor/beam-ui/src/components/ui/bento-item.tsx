import { css, cx } from "../../system.ts";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { Icon } from "./icon.tsx";

/** Own props for {@link BentoItem}, independent of the rendered element. */
export interface BentoItemOwnProps {
  /** Layout variant: `large` (2x2 grid cell), `horizontal` (2-col row), or `small` (compact). */
  variant: "large" | "horizontal" | "small";
  /** Card heading. */
  title: string;
  /** Card description text. */
  description: string;
  /** Difficulty level (e.g., "Beginner", "Advanced"); displayed in label. */
  difficulty: string;
  /** Category tag (e.g., "Web Development"); displayed as badge. */
  category: string;
  /** Alt text for image (currently unused). */
  imageAlt?: string;
  /** Internal or external link target. Defaults to "/guides". */
  href?: string;
}

/** Props for {@link BentoItem}. */
export type BentoItemProps<T extends ElementType = "a"> =
  & BentoItemOwnProps
  & Omit<ComponentPropsWithoutRef<T>, keyof BentoItemOwnProps | "as">
  & {
    /** Element or component to render. Defaults to a plain link. */
    as?: T;
  };

/* ------------------------------------------------------------------ */
/* Shared styles                                                       */
/* ------------------------------------------------------------------ */

const categoryBadge = css({
  display: "inline-block",
  bg: "sunbeam.orange",
  color: "white",
  fontSize: "2xs",
  fontWeight: "button",
  paddingInline: "2",
  paddingBlock: "1",
  letterSpacing: "0.05em",
});

const difficultyLabel = css({
  fontSize: "2xs",
  fontWeight: "button",
  textTransform: "uppercase",
  color: "sunbeam.orange",
  bg: "bg.page",
  padding: "1",
});

const arrowIcon = css({
  color: "sunbeam.orange",
  transition: "transform 0.2s ease",
});

/* ------------------------------------------------------------------ */
/* Large variant                                                       */
/* ------------------------------------------------------------------ */

const largeCard = css({
  gridColumn: { base: "span 1", md: "span 2" },
  gridRow: { base: "span 1", md: "span 2" },
  display: "flex",
  flexDirection: "column",
  bg: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.warm",
  textDecoration: "none",
  color: "text.primary",
  overflow: "hidden",
});

const largeImage = css({
  height: "72",
  bg: "linear-gradient(135deg, token(colors.sunbeam.orange), token(colors.sunbeam.flame))",
  position: "relative",
  overflow: "hidden",
});

const largeImagePlaceholder = css({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontSize: "4xl",
  opacity: 0.3,
});

const largeBody = css({
  padding: "8",
  flex: 1,
  display: "flex",
  flexDirection: "column",
});

const largeTitle = css({
  fontSize: "2xl",
  fontWeight: "button",
  marginBottom: "4",
  color: "text.primary",
});

const largeDesc = css({
  fontSize: "sm",
  color: "text.secondary",
  marginBottom: "6",
  flex: 1,
  lineHeight: 1.6,
});

const largeFooter = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const ctaLink = css({
  fontWeight: "button",
  fontSize: "sm",
  display: "flex",
  alignItems: "center",
  gap: "1",
  transition: "transform 0.2s ease",
  _groupHover: {
    transform: "translateX(8px)",
  },
});

/* ------------------------------------------------------------------ */
/* Horizontal variant                                                  */
/* ------------------------------------------------------------------ */

const horizontalCard = css({
  gridColumn: { base: "span 1", md: "span 2" },
  display: "flex",
  flexDirection: { base: "column", md: "row" },
  bg: "bg.page",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.warm",
  textDecoration: "none",
  color: "text.primary",
  overflow: "hidden",
});

const horizontalImage = css({
  width: { base: "100%", md: "33.333%" },
  minHeight: { base: "40", md: "100%" },
  bg: "linear-gradient(135deg, token(colors.sunbeam.black), token(colors.card.dark))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "sunbeam.orange",
  fontSize: "40",
  opacity: 0.5,
  overflow: "hidden",
});

const horizontalBody = css({
  flex: 1,
  padding: "6",
});

const horizontalCategory = css({
  fontSize: "2xs",
  fontWeight: "button",
  color: "sunbeam.orange",
  letterSpacing: "-0.02em",
  marginBottom: "2",
  display: "block",
});

const horizontalTitle = css({
  fontSize: "xl",
  fontWeight: "heading",
  marginBottom: "2",
  color: "text.primary",
});

const horizontalDesc = css({
  fontSize: "sm",
  color: "text.secondary",
  marginBottom: "4",
  lineHeight: 1.6,
});

const horizontalCta = css({
  fontSize: "sm",
  fontWeight: "button",
  borderBottomWidth: "0.5",
  borderBottomStyle: "solid",
  borderColor: "sunbeam.orange",
  display: "inline",
});

/* ------------------------------------------------------------------ */
/* Small variant                                                       */
/* ------------------------------------------------------------------ */

const smallCard = css({
  bg: "bg.card",
  padding: "6",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.warm",
  textDecoration: "none",
  color: "text.primary",
  display: "flex",
  flexDirection: "column",
});

const smallTitle = css({
  fontSize: "lg",
  fontWeight: "heading",
  marginBottom: "3",
  color: "text.primary",
});

const smallDesc = css({
  fontSize: "xs",
  color: "text.secondary",
  marginBottom: "4",
  flex: 1,
  lineHeight: 1.6,
});

const smallFooter = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "auto",
});

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * Grid card for bento-style layouts with three visual variants.
 *
 * **Variants:**
 * - `large`: 2x2 grid cell with full-height image, title, description, and footer (category + difficulty + CTA).
 * - `horizontal`: 2-column row with side image, category badge, title, description, and inline CTA.
 * - `small`: Compact 1-column card with title, description, difficulty, and arrow icon.
 *
 * Renders as a plain link by default. Pass `as` to render with a router Link or
 * any other component that accepts `href`.
 *
 * @example
 * ```tsx
 * <BentoItem
 *   variant="large"
 *   title="Advanced Patterns"
 *   description="Master complex React patterns..."
 *   difficulty="Advanced"
 *   category="React"
 *   href="/guides/patterns"
 * />
 *
 * <BentoItem as={Link} variant="small" ... />
 * ```
 */
export function BentoItem<T extends ElementType = "a">(
  {
    variant,
    title,
    description,
    difficulty,
    category,
    href = "/guides",
    as,
    ...rest
  }: BentoItemProps<T>,
): ReactNode {
  const Component = as ?? "a";

  if (variant === "large") {
    return (
      <Component
        href={href}
        className={cx(
          largeCard,
          css({ _hover: { "& .arrow": { transform: "translateX(8px)" } } }),
        )}
        aria-label={`${title} — ${category}`}
        {...rest}
      >
        <div className={largeImage}>
          <div className={largeImagePlaceholder}>
            <Icon name="auto_awesome" size={48} aria-hidden="true" />
          </div>
          <div style={{ position: "absolute", top: 16, left: 16 }}>
            <span className={categoryBadge}>{category}</span>
          </div>
        </div>
        <div className={largeBody}>
          <h3 className={largeTitle}>{title}</h3>
          <p className={largeDesc}>{description}</p>
          <div className={largeFooter}>
            <span className={difficultyLabel}>{difficulty.toUpperCase()}</span>
            <span className={ctaLink}>
              READ RECIPE <Icon name="arrow_forward" size={16} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Component>
    );
  }

  if (variant === "horizontal") {
    return (
      <Component
        href={href}
        className={horizontalCard}
        aria-label={`${title} — ${category}`}
        {...rest}
      >
        <div className={horizontalImage}>
          <Icon name="developer_board" size={40} aria-hidden="true" />
        </div>
        <div className={horizontalBody}>
          <span className={horizontalCategory}>{category}</span>
          <h3 className={horizontalTitle}>{title}</h3>
          <p className={horizontalDesc}>{description}</p>
          <span className={horizontalCta}>Explore Cookbook</span>
        </div>
      </Component>
    );
  }

  // small
  return (
    <Component
      href={href}
      className={smallCard}
      aria-label={`${title} — ${difficulty}`}
      {...rest}
    >
      <h3 className={smallTitle}>{title}</h3>
      <p className={smallDesc}>{description}</p>
      <div className={smallFooter}>
        <span className={difficultyLabel}>{difficulty}</span>
        <Icon name="east" size={20} className={arrowIcon} aria-hidden="true" />
      </div>
    </Component>
  );
}
