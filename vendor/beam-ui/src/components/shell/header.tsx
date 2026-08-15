import { css } from "../../system.ts";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DialogBackdrop,
  DialogCloseTrigger,
  DialogContent,
  DialogPositioner,
  DialogRoot,
} from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { docsSidebar, headerLinks } from "../../data/navigation.ts";
import type { NavSection } from "../../data/navigation.ts";
import type { LinkComponent } from "../../utils/polymorphic.ts";
import { Sidebar } from "./sidebar.tsx";
import { Breadcrumbs } from "./breadcrumbs.tsx";
import { ThemeToggle } from "../ui/theme-toggle.tsx";

const header = css({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "16",
  backdropFilter: "blur(12px)",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.subtle",
  bg: "bg.nav",
  shadow: "nav",
});

const inner = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  maxWidth: "360",
  paddingInline: { base: "4", md: "6", lg: "8" },
});

const innerFullWidth = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  paddingInline: { base: "4", md: "6", lg: "8" },
});

const leftGroup = css({
  display: "flex",
  alignItems: "center",
  gap: { base: "3", lg: "10" },
});

const brandLink = css({
  textDecoration: "none",
  fontSize: "xl",
  fontFamily: "heading",
  fontWeight: "heading",
  letterSpacing: "-0.3px",
  color: "text.primary",
});

const nav = css({
  display: { base: "none", lg: "flex" },
  alignItems: "center",
  gap: "6",
});

const breadcrumbsNav = css({
  display: { base: "none", md: "flex" },
  alignItems: "center",
  gap: "2",
  fontSize: "13",
  fontWeight: "body",
  marginBottom: "0",
});

const menuBtn = css({
  display: { base: "flex", lg: "none" },
  alignItems: "center",
  justifyContent: "center",
  width: "9",
  height: "9",
  bg: "transparent",
  border: "none",
  cursor: "pointer",
  color: "text.primary",
  transition: "color 0.2s",
  _hover: {
    color: "accent",
  },
});

const drawerBackdrop = css({
  position: "fixed",
  inset: 0,
  bg: "scrim.50",
  zIndex: 99,
});

const drawerPositioner = css({
  position: "fixed",
  top: 0,
  left: 0,
  bottom: 0,
  zIndex: 100,
});

const drawerContent = css({
  width: "75",
  height: "100%",
  bg: "bg.page",
  overflowY: "auto",
  boxShadow: "drawer",
});

const drawerCloseBtn = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "9",
  height: "9",
  bg: "transparent",
  border: "none",
  cursor: "pointer",
  color: "text.secondary",
  fontSize: "xl",
  position: "absolute",
  top: "3.5",
  right: "2",
  _hover: {
    color: "accent",
  },
});

const navLink = css({
  textDecoration: "none",
  fontSize: "sm",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "text.secondary",
  transition: "color 0.2s",
  position: "relative",
  _hover: {
    color: "accent",
  },
});

const navLinkActive = css({
  textDecoration: "none",
  fontSize: "sm",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "accent",
  position: "relative",
  _after: {
    content: '""',
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "-0.5",
    height: "0.5",
    bg: "accent",
  },
});

const rightGroup = css({
  display: "flex",
  alignItems: "center",
  gap: "4",
});

const searchWrapper = css({
  position: "relative",
  display: { base: "none", md: "block" },
});

const searchTriggerMobile = css({
  display: { base: "flex", md: "none" },
  alignItems: "center",
  justifyContent: "center",
  width: "9",
  height: "9",
  bg: "transparent",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "sm",
  cursor: "pointer",
  color: "text.muted",
  fontSize: "md",
  _hover: {
    borderColor: "accent",
    color: "accent",
  },
});

const searchIcon = css({
  position: "absolute",
  top: "50%",
  left: "3",
  transform: "translateY(-50%)",
  fontSize: "md",
  color: "text.muted",
  pointerEvents: "none",
});

const searchInput = css({
  width: "60",
  paddingLeft: "9",
  paddingRight: "12",
  paddingBlock: "2",
  fontSize: "sm",
  fontFamily: "body",
  fontWeight: "body",
  bg: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "sm",
  outline: "none",
  color: "text.primary",
  _placeholder: {
    color: "text.muted",
  },
  _focus: {
    borderColor: "accent",
    boxShadow: "focusRing.sm",
  },
});

const kbdStyle = css({
  position: "absolute",
  top: "50%",
  right: "3",
  transform: "translateY(-50%)",
  fontSize: "2xs",
  fontWeight: "button",
  color: "text.muted",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  paddingInline: "1.5",
  paddingBlock: "0.5",
  borderRadius: "sm",
  pointerEvents: "none",
});

const searchDropdown = css({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  marginTop: "1",
  bg: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "sm",
  boxShadow: "pop",
  maxHeight: "80",
  overflowY: "auto",
  zIndex: 100,
});

const searchResultItem = css({
  display: "block",
  py: "2.5",
  px: "4",
  fontSize: "sm",
  color: "text.secondary",
  textDecoration: "none",
  cursor: "pointer",
  transition: "all 0.1s",
  _hover: {
    bg: "accent.08",
    color: "accent",
  },
});

const searchResultSection = css({
  fontSize: "2xs",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "text.muted",
  pt: "2",
  px: "4",
  pb: "1",
});

const searchNoResults = css({
  padding: "4",
  fontSize: "13",
  color: "text.muted",
  textAlign: "center",
});

/** A single item that can appear in the header search dropdown. */
export interface HeaderSearchItem {
  /** Display label. */
  label: string;
  /** Navigation target URL path. */
  href: string;
  /** Optional section heading for grouping results. */
  section?: string;
}

/** A simple navigation link rendered in the desktop header bar. */
export interface HeaderNavLink {
  /** Display label. */
  label: string;
  /** Navigation target URL path. */
  href: string;
}

/** A single breadcrumb item. */
export interface HeaderBreadcrumbItem {
  /** Display label. */
  label: string;
  /** Optional navigation target. Omit for the current page. */
  href?: string;
}

function buildSearchItems(sections?: NavSection[]): HeaderSearchItem[] {
  if (!sections) return [];
  return sections.flatMap((section) =>
    section.items.flatMap((item) => {
      const results: HeaderSearchItem[] = [
        { label: item.label, href: item.href, section: section.title },
      ];
      if (item.children) {
        item.children.forEach((child) =>
          results.push({
            label: child.label,
            href: child.href,
            section: section.title,
          })
        );
      }
      return results;
    })
  );
}

/** Default active matcher: exact for root, prefix otherwise. */
function defaultIsActive(
  _label: string,
  href: string,
  currentPath: string,
): boolean {
  if (href === "/") return currentPath === "/";
  return currentPath.startsWith(href);
}

/** Props for {@link Header}. */
export interface HeaderProps {
  /** Show a theme toggle button (right-aligned). Defaults to true. */
  showThemeToggle?: boolean;
  /** Extra elements rendered in the right group before the theme toggle. */
  actions?: ReactNode;
  /** Replace the default brand link with a custom element. */
  brand?: ReactNode;
  /** Navigation links for the desktop header bar. Defaults to beam-ui docs links. Ignored when `breadcrumbs` is set. */
  navLinks?: HeaderNavLink[];
  /** Breadcrumb items shown in place of nav links. When set, nav links are hidden. */
  breadcrumbs?: HeaderBreadcrumbItem[];
  /** Sections for the mobile drawer sidebar. Defaults to beam-ui docs sidebar. */
  drawerSections?: NavSection[];
  /** Searchable items for the Cmd+K search. Defaults to items derived from drawerSections. */
  searchItems?: HeaderSearchItem[];
  /** Placeholder text for the search input. Defaults to "Search docs...". */
  searchPlaceholder?: string;
  /** Show the search input and Cmd+K shortcut. Defaults to true. */
  showSearch?: boolean;
  /** Remove the max-width constraint so the header spans the full viewport. Defaults to false. */
  fullWidth?: boolean;
  /** Current path used to compute active states and close the mobile drawer on navigation. */
  currentPath?: string;
  /** Component used to render links. Defaults to a plain `<a>`. */
  linkAs?: LinkComponent;
  /** Called when the user selects a search result or a nav link should trigger client-side navigation. */
  onNavigate?: (href: string) => void;
  /** Override the default active-state matcher. */
  isActive?: (label: string, href: string, currentPath: string) => boolean;
}

/**
 * Fixed top navigation header with logo, nav links or breadcrumbs (desktop), search
 * (with Cmd+K support), mobile menu drawer, and optional theme toggle.
 *
 * All data sources are configurable via props. When omitted, sensible defaults
 * (beam-ui documentation navigation) are used so the component works out of the box.
 * The component is router-agnostic: pass `linkAs` (your router's `Link`) and
 * `currentPath`/`onNavigate` to wire it into any routing framework.
 *
 * @example
 * ```tsx
 * <Header
 *   brand={<Link href="/">My App</Link>}
 *   navLinks={[{ label: "Dashboard", href: "/" }, { label: "Settings", href: "/settings" }]}
 *   currentPath="/settings"
 *   searchPlaceholder="Search..."
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Header
 *   brand={<Link href="/">My App</Link>}
 *   breadcrumbs={[{ label: "Home", href: "/" }, { label: "Settings" }]}
 *   showSearch={false}
 * />
 * ```
 */
export function Header({
  showThemeToggle = true,
  actions,
  brand,
  navLinks: navLinksProp,
  breadcrumbs,
  drawerSections: drawerSectionsProp,
  searchItems: searchItemsProp,
  searchPlaceholder = "Search docs...",
  showSearch = true,
  fullWidth = false,
  currentPath = "",
  linkAs,
  onNavigate,
  isActive = defaultIsActive,
}: HeaderProps = {}): ReactNode {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const resolvedNavLinks = navLinksProp ?? headerLinks;
  const resolvedDrawerSections = drawerSectionsProp ?? docsSidebar;
  const allNavItems = searchItemsProp ??
    buildSearchItems(resolvedDrawerSections);
  const LinkAs = linkAs ?? DefaultLink;

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [currentPath]);

  // Cmd+K / Ctrl+K to focus, Escape to blur
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowResults(true);
      }
      if (e.key === "Escape") {
        setQuery("");
        setShowResults(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim()
    ? allNavItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelect = useCallback(
    (href: string) => {
      setQuery("");
      setShowResults(false);
      inputRef.current?.blur();
      onNavigate?.(href);
    },
    [onNavigate],
  );

  const defaultBrand = (
    <LinkAs href="/" className={brandLink}>
      Sunbeam Studios
    </LinkAs>
  );

  return (
    <>
      <header className={header}>
        <div className={fullWidth ? innerFullWidth : inner}>
          <div className={leftGroup}>
            <button
              type="button"
              className={menuBtn}
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "24px" }}
              >
                menu
              </span>
            </button>
            {brand !== undefined ? brand : defaultBrand}
            {breadcrumbs
              ? <Breadcrumbs items={breadcrumbs} className={breadcrumbsNav} />
              : (
                <nav className={nav} aria-label="Main">
                  {currentPath !== "/" && resolvedNavLinks.map((link) => (
                    <LinkAs
                      key={link.label}
                      href={link.href}
                      className={isActive(link.label, link.href, currentPath)
                        ? navLinkActive
                        : navLink}
                      {...(isActive(link.label, link.href, currentPath)
                        ? { "aria-current": "page" as const }
                        : {})}
                    >
                      {link.label}
                    </LinkAs>
                  ))}
                </nav>
              )}
          </div>
          <div className={rightGroup}>
            {showSearch && (
              <>
                <button
                  type="button"
                  className={searchTriggerMobile}
                  onClick={() => inputRef.current?.focus()}
                  aria-label="Search"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    search
                  </span>
                </button>
                <div className={searchWrapper} ref={wrapperRef}>
                  <span className={`material-symbols-outlined ${searchIcon}`}>
                    search
                  </span>
                  <input
                    ref={inputRef}
                    className={searchInput}
                    type="text"
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    role="combobox"
                    aria-expanded={showResults && query.trim().length > 0}
                    aria-controls={showResults && query.trim() ? "search-listbox" : undefined}
                    aria-autocomplete="list"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                  />
                  <kbd className={kbdStyle}>&#x2318;K</kbd>
                  {showResults && query.trim() && (
                    <div
                      className={searchDropdown}
                      role="listbox"
                      id="search-listbox"
                    >
                      {filtered.length === 0
                        ? (
                          <div className={searchNoResults}>
                            No results for "{query}"
                          </div>
                        )
                        : (
                          (() => {
                            let lastSection = "";
                            return filtered.map((item) => {
                              const showSection = item.section !== lastSection;
                              lastSection = item.section ?? lastSection;
                              return (
                                <div key={item.href + item.label}>
                                  {showSection && item.section && (
                                    <div
                                      className={searchResultSection}
                                      role="presentation"
                                    >
                                      {item.section}
                                    </div>
                                  )}
                                  <SearchResult
                                    item={item}
                                    onSelect={onNavigate ? handleSelect : undefined}
                                  />
                                </div>
                              );
                            });
                          })()
                        )}
                    </div>
                  )}
                </div>
              </>
            )}
            {actions}
            {showThemeToggle && <ThemeToggle />}
          </div>
        </div>
      </header>

      {/* Mobile/Tablet navigation drawer */}
      <DialogRoot open={drawerOpen} onOpenChange={(d) => setDrawerOpen(d.open)}>
        <Portal>
          <DialogBackdrop className={drawerBackdrop} />
          <DialogPositioner className={drawerPositioner}>
            <DialogContent className={drawerContent}>
              <DialogCloseTrigger
                type="button"
                className={drawerCloseBtn}
                aria-label="Close navigation"
              >
                <span className="material-symbols-outlined">close</span>
              </DialogCloseTrigger>
              <Sidebar
                sections={resolvedDrawerSections}
                currentPath={currentPath}
                linkAs={linkAs}
              />
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </DialogRoot>
    </>
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

function SearchResult({
  item,
  onSelect,
}: {
  item: HeaderSearchItem;
  onSelect?: (href: string) => void;
}) {
  return (
    <a
      className={searchResultItem}
      role="option"
      href={item.href}
      onClick={onSelect
        ? (e) => {
          e.preventDefault();
          onSelect(item.href);
        }
        : undefined}
    >
      {item.label}
    </a>
  );
}
