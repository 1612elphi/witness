import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";
import type { LinkComponent } from "../../utils/polymorphic.ts";
import { Icon } from "./icon.tsx";

/** A single list item with optional icon, description, and link. */
interface ListItem {
  /** Primary text for the list item. */
  label: string;
  /** Optional secondary text. Hidden in compact variant. */
  description?: string;
  /** Optional Material Symbol icon name. */
  icon?: string;
  /** Optional href (internal route or external URL). If provided, item becomes a link. */
  href?: string;
}

/** Visual style variant for the list. */
type Variant = "default" | "compact" | "bordered";

/** Props for {@link List}. */
export interface ListProps {
  /** Array of items to display. */
  items: ListItem[];
  /** If true, render as `<ol>` (numbered). Defaults to `<ul>` (unordered). */
  ordered?: boolean;
  /** Visual style. Defaults to `"default"`. */
  variant?: Variant;
  /** Optional CSS class for the list container. */
  className?: string;
  /** Component used to render item links. Defaults to a plain `<a>`. */
  linkAs?: LinkComponent;
}

/**
 * Semantic list with optional icons, descriptions, and links in three visual styles.
 * Items may link to internal routes or external URLs.
 *
 * @example
 * ```tsx
 * <List
 *   variant="default"
 *   items={[
 *     { label: "Home", icon: "home", href: "/" },
 *     { label: "Settings", description: "Configure your account", icon: "settings", href: "/settings" },
 *   ]}
 * />
 * ```
 */
export function List({
  items,
  ordered,
  variant = "default",
  className,
  linkAs,
}: ListProps): ReactNode {
  const Tag = ordered ? "ol" : "ul";
  const LinkAs = linkAs ?? DefaultLink;

  return (
    <Tag
      className={cx(
        listBase,
        ordered ? orderedList : unorderedList,
        variantStyles[variant],
        className,
      )}
    >
      {items.map((item, i) => (
        <li
          key={i}
          className={cx(
            listItem,
            variant === "compact" && compactItem,
            variant === "bordered" && borderedItem,
          )}
        >
          <ItemContent item={item} variant={variant} LinkAs={LinkAs} />
        </li>
      ))}
    </Tag>
  );
}

function ItemContent(
  { item, variant, LinkAs }: {
    item: ListItem;
    variant: Variant;
    LinkAs: LinkComponent;
  },
) {
  const inner: ReactNode = (
    <div className={itemInner}>
      {item.icon && (
        <Icon
          name={item.icon}
          size={18}
          className={css({ color: "text.secondary", flexShrink: 0 })}
        />
      )}
      <div>
        <span className={labelStyle}>{item.label}</span>
        {variant !== "compact" && item.description && (
          <p className={descStyle}>{item.description}</p>
        )}
      </div>
    </div>
  );

  if (item.href) {
    if (item.href.startsWith("http")) {
      return (
        <a
          href={item.href}
          className={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
        >
          {inner}
        </a>
      );
    }
    return <LinkAs href={item.href} className={linkStyle}>{inner}</LinkAs>;
  }

  return inner;
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

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const listBase = css({
  fontFamily: "body",
  margin: 0,
  paddingLeft: "6",
});

const unorderedList = css({
  listStyleType: "disc",
  "& > li::marker": { color: "sunbeam.orange" },
});

const orderedList = css({
  listStyleType: "decimal",
  "& > li::marker": {
    color: "sunbeam.orange",
    fontWeight: "button",
  },
});

const variantStyles: Record<Variant, string> = {
  default: css({ display: "flex", flexDirection: "column", gap: "3" }),
  compact: css({ display: "flex", flexDirection: "column", gap: "1" }),
  bordered: css({
    display: "flex",
    flexDirection: "column",
    gap: "0",
    listStyleType: "none",
    paddingLeft: "0",
  }),
};

const listItem = css({
  color: "text.primary",
  fontSize: "sm",
  lineHeight: "1.5",
});

const compactItem = css({
  fontSize: "13",
});

const borderedItem = css({
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.default",
  py: "3",
  px: "0",
  _first: { paddingTop: 0 },
});

const itemInner = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "2",
});

const labelStyle = css({
  fontWeight: "body",
  color: "text.primary",
});

const descStyle = css({
  margin: 0,
  marginTop: "0.5",
  fontSize: "13",
  color: "text.secondary",
  lineHeight: "1.4",
});

const linkStyle = css({
  textDecoration: "none",
  color: "inherit",
  _hover: { color: "sunbeam.orange" },
  transition: "color 0.15s ease",
});
