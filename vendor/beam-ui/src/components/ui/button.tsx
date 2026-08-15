import { css, cx } from "../../system.ts";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/**
 * Variant style tokens for {@link Button}.
 *
 * - `primary` — solid sunbeam orange (default CTA).
 * - `dark` — sunbeam black bg, white text (high contrast actions).
 * - `cream` — beam gold bg, black text (warm secondary CTA).
 * - `ghost` — transparent with bordered outline (subtle actions).
 * - `text` — link-style underline-only (inline tertiary actions).
 */
type Variant = "dark" | "cream" | "ghost" | "text" | "primary";

/** Own props for {@link Button}, independent of the rendered element. */
export interface ButtonOwnProps {
  /** Visual style. Defaults to `"dark"`. */
  variant?: Variant;
  /** When set, the component renders as a link (or as the `as` component with this href). */
  href?: string;
  /** Disables interaction and dims the visual. */
  disabled?: boolean;
  /** ARIA disabled flag (independent of `disabled` for advanced cases). */
  "aria-disabled"?: boolean;
}

/** Props for {@link Button}. */
export type ButtonProps<T extends ElementType = ElementType> =
  & ButtonOwnProps
  & Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps | "as">
  & {
    /** Element or component to render. Defaults to `<button type="button">` (or `<a>` when `href` is set). */
    as?: T;
  };

const base = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontSize: "sm",
  cursor: "pointer",
  transition: "all 0.2s ease",
  textDecoration: "none",
  border: "none",
  lineHeight: 1,
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.5",
  },
});

const variants: Record<Variant, string> = {
  dark: css({
    backgroundColor: "sunbeam.black",
    color: "white",
    py: "2.5",
    px: "5",
    borderRadius: "0",
    _hover: { backgroundColor: "sunbeam.flame" },
    _active: { transform: "scale(0.95)" },
  }),
  cream: css({
    backgroundColor: { base: "beam.gold", _dark: "beam.gold" },
    color: "sunbeam.black",
    py: "2.5",
    px: "5",
    borderRadius: "0",
    borderWidth: "0.25",
    borderStyle: "solid",
    borderColor: { base: "sunshine.500", _dark: "sunshine.300" },
    _hover: {
      backgroundColor: { base: "sunshine.300", _dark: "sunshine.300" },
    },
  }),
  ghost: css({
    backgroundColor: "transparent",
    color: "text.primary",
    borderWidth: "0.25",
    borderStyle: "solid",
    borderColor: "border.default",
    py: "2.5",
    px: "5",
    borderRadius: "0",
    _hover: { borderColor: "sunbeam.orange", color: "sunbeam.orange" },
  }),
  text: css({
    backgroundColor: "transparent",
    color: "sunbeam.orange",
    padding: 0,
    textDecoration: "underline",
    textUnderlineOffset: "1",
    _hover: { textDecorationColor: "sunbeam.orange" },
  }),
  primary: css({
    backgroundColor: "sunbeam.orange",
    color: "white",
    py: "2.5",
    px: "5",
    borderRadius: "0",
    _hover: { backgroundColor: "sunbeam.flame" },
    _active: { transform: "scale(0.95)" },
  }),
};

const disabledStyle = css({
  opacity: 0.5,
  cursor: "not-allowed",
  pointerEvents: "none",
});

/**
 * Primary action button with five visual variants and polymorphic rendering.
 *
 * Renders a `<button type="button">` by default. Pass `href` to render a link, or pass `as`
 * to render a custom component such as a router `Link`. External URLs
 * (`http*`) open in a new tab when rendered as a plain link.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={() => save()}>Save</Button>
 * <Button href="/docs">Read the docs</Button>
 * <Button as={Link} href="/docs">Read the docs</Button>
 * <Button variant="text" href="https://jsr.io">Learn more</Button>
 * ```
 */
export function Button<T extends ElementType = "button">(
  {
    as,
    children,
    variant = "dark",
    href,
    className,
    disabled,
    "aria-disabled": ariaDisabled,
    ...rest
  }: ButtonProps<T>,
): ReactNode {
  const classes = cx(
    base,
    variants[variant],
    disabled && disabledStyle,
    className,
  );

  const resolvedAs = as ?? (href ? "a" : "button");

  if (resolvedAs === "a" && href && href.startsWith("http")) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }

  const Component = resolvedAs;
  return (
    <Component
      href={resolvedAs === "a" ? href : undefined}
      className={classes}
      disabled={resolvedAs === "button" ? disabled : undefined}
      aria-disabled={ariaDisabled}
      {...rest}
    >
      {children}
    </Component>
  );
}
