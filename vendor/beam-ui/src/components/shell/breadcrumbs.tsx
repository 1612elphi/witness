import { css } from "../../system.ts";

import type { ReactNode } from "react";
import type { LinkComponent } from "../../utils/polymorphic.ts";

const nav = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  fontSize: "xs",
  fontWeight: "body",
  marginBottom: "8",
});

const crumbLink = css({
  color: "accent",
  textDecoration: "none",
  transition: "opacity 0.2s",
  _hover: {
    opacity: 0.7,
  },
});

const crumbCurrent = css({
  color: "text.muted",
});

const separator = css({
  color: "text.muted",
  fontSize: "sm",
  lineHeight: 1,
  userSelect: "none",
});

/** A single breadcrumb item. */
export interface BreadcrumbItem {
  /** Display label. */
  label: string;
  /** Optional navigation target. Omit for the current page. */
  href?: string;
}

/** Props for {@link Breadcrumbs}. */
export interface BreadcrumbsProps {
  /** Array of breadcrumb items. Last item is rendered as current page (no link). */
  items: BreadcrumbItem[];
  /** Optional class name to override or extend default styles. */
  className?: string;
  /** Component used to render links. Defaults to a plain `<a>`. */
  linkAs?: LinkComponent;
}

/**
 * Hierarchical breadcrumb navigation showing the current page location within a site structure.
 * Last item is always shown as the current page without a link. Interactive items use the
 * link component supplied by the consumer (or a plain `<a>` if none is supplied).
 *
 * @example
 * ```tsx
 * <Breadcrumbs items={[
 *   { label: "Home", href: "/" },
 *   { label: "Docs", href: "/docs" },
 *   { label: "Components" }
 * ]} />
 * ```
 */
export function Breadcrumbs(
  { items, className, linkAs }: BreadcrumbsProps,
): ReactNode {
  const LinkAs = linkAs ?? DefaultLink;
  return (
    <nav className={className ?? nav} aria-label="Breadcrumb">
      <ol
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {idx > 0 && <span className={separator} aria-hidden="true">&#x203A;</span>}
              {item.href && !isLast
                ? (
                  <LinkAs href={item.href} className={crumbLink}>
                    {item.label}
                  </LinkAs>
                )
                : (
                  <span
                    className={isLast ? crumbCurrent : crumbLink}
                    {...(isLast ? { "aria-current": "page" as const } : {})}
                  >
                    {item.label}
                  </span>
                )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function DefaultLink({
  href,
  children,
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
  [key: string]: unknown;
}): ReactNode {
  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}
