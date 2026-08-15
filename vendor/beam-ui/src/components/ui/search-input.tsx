import { css, cx } from "../../system.ts";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { docsSidebar } from "../../data/navigation.ts";

/** Props for {@link SearchInput}. */
export interface SearchInputProps {
  /** Additional CSS class. */
  className?: string;
}

// Build a flat list of all nav items for search
const allNavItems = docsSidebar.flatMap((section) =>
  section.items.flatMap((item) => {
    const results = [{
      label: item.label,
      href: item.href,
      section: section.title,
    }];
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

/**
 * Searchable documentation input with keyboard shortcuts and live filtering.
 * Responds to Cmd+K / Ctrl+K, displays filtered results grouped by section.
 *
 * @example
 * ```tsx
 * <SearchInput />
 * ```
 */
export function SearchInput({ className }: SearchInputProps): ReactNode {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
      globalThis.location.href = href;
    },
    [],
  );

  return (
    <div className={cx(wrapper, className)} ref={wrapperRef}>
      <span className={`material-symbols-outlined ${iconStyle}`}>search</span>
      <input
        ref={inputRef}
        className={input}
        type="text"
        placeholder="Search docs..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        aria-label="Search"
      />
      <kbd className={kbd}>⌘K</kbd>
      {showResults && query.trim() && (
        <div className={dropdown} role="listbox">
          {filtered.length === 0
            ? (
              <div className={noResults}>
                No results for &ldquo;{query}&rdquo;
              </div>
            )
            : (
              (() => {
                let lastSection = "";
                return filtered.map((item) => {
                  const showSection = item.section !== lastSection;
                  lastSection = item.section;
                  return (
                    <div key={item.href + item.label}>
                      {showSection && (
                        <div className={sectionHeader} role="presentation">
                          {item.section}
                        </div>
                      )}
                      <a
                        className={resultItem}
                        role="option"
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelect(item.href);
                        }}
                      >
                        {item.label}
                      </a>
                    </div>
                  );
                });
              })()
            )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const wrapper = css({
  position: "relative",
  display: "block",
});

const iconStyle = css({
  position: "absolute",
  top: "50%",
  left: "3",
  transform: "translateY(-50%)",
  fontSize: "md",
  color: "text.muted",
  pointerEvents: "none",
});

const input = css({
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

const kbd = css({
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
  fontFamily: "mono",
  lineHeight: 1,
  pointerEvents: "none",
});

const dropdown = css({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  marginTop: "1",
  backgroundColor: "bg.page",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  shadow: "golden",
  maxHeight: "80",
  overflowY: "auto",
  zIndex: 100,
});

const sectionHeader = css({
  paddingBlock: "2",
  paddingInline: "3",
  fontSize: "2xs",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "text.muted",
  backgroundColor: "bg.card",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.subtle",
});

const resultItem = css({
  display: "block",
  paddingBlock: "2",
  paddingInline: "3",
  fontSize: "sm",
  color: "text.primary",
  textDecoration: "none",
  cursor: "pointer",
  _hover: {
    backgroundColor: "bg.card",
    color: "sunbeam.orange",
  },
});

const noResults = css({
  padding: "4",
  fontSize: "13",
  color: "text.muted",
  textAlign: "center",
});
