import { css } from "../../system.ts";

import type { ReactNode } from "react";
import { useState } from "react";
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from "@ark-ui/react/collapsible";
import type { NavSection } from "../../data/navigation.ts";
import type { LinkComponent } from "../../utils/polymorphic.ts";

const aside = css({
  width: "60",
  minWidth: "60",
  position: "sticky",
  top: "16",
  height: "calc(100vh - 64px)",
  overflowY: "auto",
  alignSelf: "flex-start",
  bg: "bg.page",
  paddingInline: "6",
  paddingBlock: "8",
});

const sectionGroup = css({
  marginBottom: "8",
});

const sectionHeader = css({
  fontSize: "11",
  fontWeight: "button",
  color: "sectionLabel",
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  marginBottom: "4",
});

const itemList = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5",
  listStyle: "none",
  padding: 0,
  margin: 0,
});

const itemLink = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBlock: "2",
  paddingInline: "3",
  fontSize: "sm",
  fontWeight: "body",
  color: "text.secondary",
  textDecoration: "none",
  borderLeftWidth: "0.75",
  borderLeftStyle: "solid",
  borderLeftColor: "transparent",
  transition: "all 0.15s",
  _hover: {
    color: "accent",
  },
});

const itemLinkActive = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBlock: "2",
  paddingInline: "3",
  fontSize: "sm",
  fontWeight: "button",
  color: "accent",
  textDecoration: "none",
  borderLeftWidth: "0.75",
  borderLeftStyle: "solid",
  borderLeftColor: "sunbeam.orange",
  bg: "creamA.30",
});

const collapsibleTrigger = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  paddingBlock: "2",
  paddingInline: "3",
  fontSize: "sm",
  fontWeight: "body",
  color: "text.primary",
  textDecoration: "none",
  bg: "transparent",
  border: "none",
  cursor: "pointer",
  borderLeftWidth: "0.75",
  borderLeftStyle: "solid",
  borderLeftColor: "transparent",
  transition: "all 0.15s",
  _hover: {
    color: "accent",
  },
});

const collapsibleTriggerActive = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  paddingBlock: "2",
  paddingInline: "3",
  fontSize: "sm",
  fontWeight: "button",
  color: "text.primary",
  bg: "transparent",
  border: "none",
  cursor: "pointer",
  borderLeftWidth: "0.75",
  borderLeftStyle: "solid",
  borderLeftColor: "transparent",
});

const chevron = css({
  fontSize: "lg",
  transition: "transform 0.2s",
  color: "text.muted",
  lineHeight: 1,
});

const chevronOpen = css({
  fontSize: "lg",
  transition: "transform 0.2s",
  transform: "rotate(90deg)",
  color: "text.muted",
  lineHeight: 1,
});

const childList = css({
  marginLeft: "4",
  borderLeftWidth: "0.25",
  borderLeftStyle: "solid",
  borderLeftColor: "border.default",
  display: "flex",
  flexDirection: "column",
  gap: "0.5",
  paddingBlock: "0.5",
  listStyle: "none",
  paddingInlineStart: 0,
});

const childLabel = css({
  display: "block",
  paddingBlock: "1.5",
  paddingLeft: "4",
  fontSize: "13",
  fontWeight: "body",
  color: "text.secondary",
  textDecoration: "none",
  borderLeftWidth: "0.25",
  borderLeftStyle: "solid",
  borderLeftColor: "border.subtle",
  marginLeft: "-0.25",
  cursor: "pointer",
  transition: "color 0.15s",
  _hover: {
    color: "accent",
  },
});

const childLabelOnPage = css({
  display: "block",
  paddingBlock: "1.5",
  paddingLeft: "4",
  fontSize: "13",
  fontWeight: "body",
  color: "text.primary",
  textDecoration: "none",
  borderLeftWidth: "0.5",
  borderLeftStyle: "solid",
  borderLeftColor: "sunbeam.orange",
  marginLeft: "-0.25",
  cursor: "pointer",
  transition: "color 0.15s",
  _hover: {
    color: "accent",
  },
});

const childLink = css({
  display: "block",
  paddingBlock: "2",
  paddingLeft: "4",
  fontSize: "sm",
  fontWeight: "body",
  color: "text.secondary",
  textDecoration: "none",
  borderLeftWidth: "0.75",
  borderLeftStyle: "solid",
  borderLeftColor: "transparent",
  marginLeft: "-0.25",
  transition: "all 0.15s",
  _hover: {
    color: "accent",
  },
});

const childLinkActive = css({
  display: "block",
  paddingBlock: "2",
  paddingLeft: "4",
  fontSize: "sm",
  fontWeight: "button",
  color: "accent",
  textDecoration: "none",
  borderLeftWidth: "0.75",
  borderLeftStyle: "solid",
  borderLeftColor: "sunbeam.orange",
  marginLeft: "-0.25",
  bg: "creamA.30",
});

/** Props for {@link Sidebar}. */
export interface SidebarProps {
  /** Navigation sections to render. Each section has a title and list of items. */
  sections: NavSection[];
  /** Current path used to compute active items. */
  currentPath?: string;
  /** Component used to render links. Defaults to a plain `<a>`. */
  linkAs?: LinkComponent;
}

export interface SidebarItemProps {
  item: NavSection["items"][number];
  currentPath: string;
  LinkAs: LinkComponent;
}

function SidebarItem({ item, currentPath, LinkAs }: SidebarItemProps) {
  const isActive = currentPath === item.href;
  const hasChildren = item.children && item.children.length > 0;
  const childActive = hasChildren ? item.children!.some((c) => currentPath === c.href) : false;
  const [open, setOpen] = useState(isActive || childActive);

  if (!hasChildren) {
    return (
      <LinkAs
        href={item.href}
        className={isActive ? itemLinkActive : itemLink}
        {...(isActive ? { "aria-current": "page" as const } : {})}
      >
        <span>{item.label}</span>
      </LinkAs>
    );
  }

  return (
    <CollapsibleRoot open={open} onOpenChange={(d) => setOpen(d.open)}>
      <CollapsibleTrigger
        className={isActive || childActive ? collapsibleTriggerActive : collapsibleTrigger}
      >
        <span>{item.label}</span>
        <span className={open ? chevronOpen : chevron}>&#x203A;</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className={childList} role="list">
          {item.children!.map((child) => {
            const sameAsParent = child.href === item.href;
            const onParentPage = sameAsParent && currentPath === item.href;
            const cActive = !sameAsParent && currentPath === child.href;
            return (
              <li key={child.label}>
                <LinkAs
                  href={child.href}
                  className={cActive
                    ? childLinkActive
                    : onParentPage
                    ? childLabelOnPage
                    : sameAsParent
                    ? childLabel
                    : childLink}
                  {...(cActive ? { "aria-current": "page" as const } : {})}
                >
                  {child.label}
                </LinkAs>
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </CollapsibleRoot>
  );
}

/**
 * Left-side navigation rail for documentation and API reference sites.
 *
 * Renders a sticky sidebar with collapsible sections and nested links.
 * Handles active state based on the `currentPath` prop. The consumer supplies
 * the link component (React Router, TanStack Router, Fresh, etc.) via `linkAs`;
 * otherwise plain `<a>` tags are used.
 *
 * @example
 * ```tsx
 * <Sidebar sections={docsSidebar} currentPath="/components/button" />
 * ```
 */
export function Sidebar(
  { sections, currentPath = "", linkAs }: SidebarProps,
): ReactNode {
  const LinkAs = linkAs ?? DefaultLink;
  return (
    <aside
      className={aside}
      aria-label="Documentation navigation"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "transparent transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.setProperty(
          "scrollbar-color",
          "rgba(255,161,16,0.25) transparent",
        );
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.setProperty(
          "scrollbar-color",
          "transparent transparent",
        );
      }}
    >
      {sections.map((section) => (
        <div key={section.title} className={sectionGroup}>
          <h3 className={sectionHeader}>{section.title}</h3>
          <ul className={itemList} role="list">
            {section.items.map((item) => (
              <li key={item.label}>
                <SidebarItem
                  item={item}
                  currentPath={currentPath}
                  LinkAs={LinkAs}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
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
