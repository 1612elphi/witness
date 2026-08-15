import { css } from "../../system.ts";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import TurndownService from "turndown";
import { Icon } from "../ui/icon.tsx";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});
// Strip material icons
turndown.addRule("materialIcons", {
  filter: (node: HTMLElement) => node.classList?.contains("material-symbols-outlined") ?? false,
  replacement: () => "",
});
// Strip buttons (tab triggers, copy buttons, etc.)
turndown.addRule("buttons", {
  filter: "button",
  replacement: () => "",
});
// Strip nav/breadcrumb elements
turndown.addRule("navs", {
  filter: "nav",
  replacement: () => "",
});
// Strip small badge/pill elements (tag pills, read time, section badges)
turndown.addRule("badges", {
  filter: (node: HTMLElement) => {
    const fontSize = node.style?.fontSize || "";
    const isSmallCaps = node.textContent?.trim() === node.textContent?.trim().toUpperCase() &&
      (node.textContent?.trim().length ?? 0) < 20;
    const isBadge = fontSize === "10px" || fontSize === "11px" ||
      fontSize === "12px";
    return (isBadge && isSmallCaps) || false;
  },
  replacement: () => "",
});
// Convert callout boxes to blockquotes
turndown.addRule("callouts", {
  filter: (node: HTMLElement) => {
    return node.getAttribute?.("style")?.includes("border-left") &&
        node.getAttribute?.("style")?.includes("4px") || false;
  },
  replacement: (_content: string, node: HTMLElement) => {
    const text = (node as HTMLElement).textContent?.trim() ?? "";
    // Remove the label (PRO TIP, OPTIMIZATION TIP, etc.)
    const cleaned = text.replace(
      /^(PRO TIP|OPTIMIZATION TIP|WARNING|INFO|TIP)\s*/i,
      "",
    );
    return `\n> **Tip:** ${cleaned}\n\n`;
  },
});

const aside = css({
  width: "50",
  minWidth: "50",
  position: "sticky",
  top: "16",
  height: "calc(100vh - 64px)",
  overflowY: "auto",
  paddingInline: "6",
  paddingBlock: "10",
  borderLeftWidth: "0.25",
  borderLeftStyle: "solid",
  borderLeftColor: "border.subtle",
});

const heading = css({
  fontSize: "2xs",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  color: "text.muted",
  marginBottom: "5",
});

const navList = css({
  display: "flex",
  flexDirection: "column",
  gap: "3",
  paddingLeft: "3",
  borderLeftWidth: "0.5",
  borderLeftStyle: "solid",
  borderLeftColor: "border.subtle",
});

const navItem = css({
  fontSize: "13",
  fontWeight: "body",
  color: "text.muted",
  textDecoration: "none",
  transition: "color 0.15s",
  cursor: "pointer",
  _hover: { color: "text.primary" },
});

const navItemActive = css({
  fontSize: "13",
  fontWeight: "button",
  color: "accent",
  textDecoration: "none",
  cursor: "pointer",
  marginLeft: "-3.5",
  paddingLeft: "3",
  borderLeftWidth: "0.5",
  borderLeftStyle: "solid",
  borderLeftColor: "accent",
});

const divider = css({
  marginBlock: "6",
  border: "none",
  borderTopWidth: "0.25",
  borderTopStyle: "solid",
  borderTopColor: "border.subtle",
});

const actionList = css({
  display: "flex",
  flexDirection: "column",
  gap: "3",
});

const actionBtn = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  fontSize: "xs",
  fontWeight: "body",
  color: "text.muted",
  textDecoration: "none",
  cursor: "pointer",
  transition: "color 0.15s",
  background: "none",
  border: "none",
  padding: 0,
  fontFamily: "body",
  _hover: { color: "accent" },
});

const metaText = css({
  fontSize: "11",
  color: "text.muted",
  display: "flex",
  alignItems: "center",
  gap: "1.5",
});

/** Props for {@link RightRail}. */
export interface RightRailProps {
  /** Table-of-contents items: each must correspond to a section heading with a matching `id`. */
  items: Array<{ label: string; id: string }>;
  /** Optional timestamp (e.g., "May 1, 2026") shown at the bottom. */
  lastUpdated?: string;
}

/**
 * Sticky right-side navigation panel showing an on-page table of contents with smooth scroll-to
 * and active-section tracking. Includes utility actions (copy link, copy as markdown, report issue).
 *
 * @example
 * ```tsx
 * <RightRail
 *   items={[
 *     { label: "Installation", id: "installation" },
 *     { label: "Usage", id: "usage" }
 *   ]}
 *   lastUpdated="May 1, 2026"
 * />
 * ```
 */
export function RightRail({ items, lastUpdated }: RightRailProps): ReactNode {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  // Intersection Observer — track which section heading is in view
  useEffect(() => {
    const ids = items.map((i) => i.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Observe within the top 30% of viewport
        rootMargin: "-64px 0px -70% 0px",
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  // Smooth scroll to section on click
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Update URL hash without jumping
      history.replaceState(null, "", `#${id}`);
    }
  }, []);

  // On mount, check if URL has a hash and scroll to it
  useEffect(() => {
    const hash = globalThis.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(
          () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
          100,
        );
        setActiveId(hash);
      }
    }
  }, []);

  return (
    <aside className={aside} aria-label="On this page">
      {/* Section navigation */}
      <h4 className={heading}>On This Page</h4>
      <nav className={navList} aria-label="On this page">
        <ul
          role="list"
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(item.id);
                }}
                className={item.id === activeId ? navItemActive : navItem}
                {...(item.id === activeId ? { "aria-current": "location" as const } : {})}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <hr className={divider} />

      {/* Utility actions */}
      <div className={actionList}>
        <button
          className={actionBtn}
          aria-label="Copy permalink"
          onClick={() => {
            const url = `${globalThis.location.origin}${globalThis.location.pathname}${
              activeId ? `#${activeId}` : ""
            }`;
            navigator.clipboard?.writeText(url);
          }}
          type="button"
        >
          <Icon name="link" size={14} />
          <span>Copy permalink</span>
        </button>
        <button
          type="button"
          className={actionBtn}
          aria-label="Copy as markdown"
          onClick={() => {
            const el = document.querySelector('[data-content="center"]') ??
              document.body;
            const clone = el.cloneNode(true) as HTMLElement;
            // Remove elements that shouldn't be in the markdown
            clone.querySelectorAll("[data-breadcrumbs], [data-meta-bar]")
              .forEach((n) => n.remove());
            let md = turndown.turndown(clone.innerHTML);
            // Clean up badge text that leaked (ALL CAPS short strings on their own line)
            md = md.replace(/^[A-Z][A-Z\s]{1,25}$/gm, "");
            // Clean up empty link brackets
            md = md.replace(/\[\s*\]\([^)]*\)/g, "");
            // Clean up excessive newlines
            md = md.replace(/\n{3,}/g, "\n\n");
            navigator.clipboard?.writeText(md.trim());
          }}
        >
          <Icon name="content_copy" size={14} />
          <span>Copy as markdown</span>
        </button>
        <a
          className={actionBtn}
          aria-label="Edit in source control"
          href="https://src.sunbeam.pt/studio/beam-ui"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="edit_note" size={14} />
          <span>Edit in source control</span>
        </a>
        <button
          type="button"
          className={actionBtn}
          aria-label="Report an issue"
          onClick={() => {}}
        >
          <Icon name="bug_report" size={14} />
          <span>Report an issue</span>
        </button>
      </div>

      <hr className={divider} />

      {/* Meta */}
      {lastUpdated && (
        <div className={metaText}>
          <Icon name="schedule" size={12} />
          <span>Last updated {lastUpdated}</span>
        </div>
      )}
    </aside>
  );
}
