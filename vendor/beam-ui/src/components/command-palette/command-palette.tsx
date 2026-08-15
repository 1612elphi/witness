import { css } from "../../system.ts";

import { type JSX, useCallback, useEffect, useRef, useState } from "react";
import { DialogBackdrop, DialogContent, DialogPositioner, DialogRoot } from "@ark-ui/react/dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CommandPaletteItem {
  id: string;
  /** Display text shown in the palette row. */
  label: string;
  /** Optional secondary text (small, right-aligned). */
  hint?: string;
  /** Optional icon name (Material Symbols Outlined). */
  icon?: string;
  /** Group label for visual section separators. */
  group?: string;
  /** Callback invoked when the user selects this item. */
  onSelect: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandPaletteItem[];
  /** Optional placeholder for the search input. Default: "Type a command…" */
  placeholder?: string;
  /** Optional empty-state message when no items match. Default: "No matches" */
  emptyMessage?: string;
  /**
   * Optional callback fired on every keystroke with the current raw query.
   * Use this to drive server-side search from outside the palette.
   * When provided, the palette still renders all `items` as-is (no client
   * filtering) so the caller owns the filter/fetch logic.
   */
  onQueryChange?: (query: string) => void;
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

/**
 * Case-insensitive exact-substring match.
 * Every character of the query must appear as a contiguous substring inside
 * the label (not individually scattered). Fuzzier character-order matching
 * is a follow-up.
 */
function matchesQuery(label: string, query: string): boolean {
  if (query === "") return true;
  return label.toLowerCase().includes(query.toLowerCase());
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CommandPalette({
  open,
  onOpenChange,
  items,
  placeholder = "Type a command…",
  emptyMessage = "No matches",
  onQueryChange,
}: CommandPaletteProps): JSX.Element {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // When onQueryChange is provided the caller owns filtering — pass items
  // through as-is. Otherwise apply client-side substring matching.
  const filtered = onQueryChange ? items : items.filter((item) => matchesQuery(item.label, query));

  // Build grouped structure for rendering
  const grouped: { group: string | undefined; items: CommandPaletteItem[] }[] = [];
  for (const item of filtered) {
    const last = grouped[grouped.length - 1];
    if (last && last.group === item.group) {
      last.items.push(item);
    } else {
      grouped.push({ group: item.group, items: [item] });
    }
  }

  // Reset active row when items change
  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  // Clear query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  // Autofocus input on open
  useEffect(() => {
    if (open) {
      // Defer so Ark can mount the content
      const id = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  // Scroll active item into view (scrollIntoView may be absent in jsdom)
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>("[data-active='true']");
    if (active && typeof active.scrollIntoView === "function") {
      active.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const select = useCallback(
    (index: number) => {
      const item = filtered[index];
      if (!item) return;
      item.onSelect();
      onOpenChange(false);
    },
    [filtered, onOpenChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
        case "Tab": {
          if (e.key === "Tab" && e.shiftKey) {
            e.preventDefault();
            setActiveIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1));
          } else {
            e.preventDefault();
            setActiveIndex((i) => (i >= filtered.length - 1 ? 0 : i + 1));
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setActiveIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1));
          break;
        }
        case "Enter": {
          e.preventDefault();
          select(activeIndex);
          break;
        }
        case "Escape": {
          e.preventDefault();
          onOpenChange(false);
          break;
        }
      }
    },
    [filtered.length, activeIndex, select, onOpenChange],
  );

  // Flat index of each item for activeIndex tracking
  let flatIndex = 0;

  return (
    <DialogRoot
      open={open}
      onOpenChange={(details) => {
        if (!details.open) onOpenChange(false);
      }}
    >
      <DialogBackdrop className={backdrop} />
      <DialogPositioner className={positioner}>
        <DialogContent className={content} aria-label="Command palette">
          {/* Search input */}
          <div className={searchRow}>
            <span className={`material-symbols-outlined ${searchIcon}`}>
              search
            </span>
            <input
              ref={inputRef}
              type="search"
              className={searchInput}
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
                onQueryChange?.(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-expanded={filtered.length > 0}
              aria-autocomplete="list"
              aria-controls="cp-listbox"
              aria-activedescendant={filtered[activeIndex]
                ? `cp-item-${filtered[activeIndex].id}`
                : undefined}
            />
          </div>

          {/* Results */}
          <ul
            ref={listRef}
            id="cp-listbox"
            role="listbox"
            className={list}
          >
            {filtered.length === 0
              ? (
                <li className={emptyState} role="option" aria-selected={false}>
                  {emptyMessage}
                </li>
              )
              : (
                grouped.map(({ group, items: groupItems }) => {
                  const nodes = groupItems.map((item) => {
                    const thisIndex = flatIndex++;
                    const isActive = thisIndex === activeIndex;
                    return (
                      <li
                        key={item.id}
                        id={`cp-item-${item.id}`}
                        role="option"
                        aria-selected={isActive}
                        data-active={isActive}
                        className={`${rowBase} ${isActive ? rowActive : ""}`}
                        onClick={() => select(thisIndex)}
                      >
                        {item.icon && (
                          <span
                            className={`material-symbols-outlined ${rowIcon}`}
                          >
                            {item.icon}
                          </span>
                        )}
                        <span className={rowLabel}>{item.label}</span>
                        {item.hint && <span className={rowHint}>{item.hint}</span>}
                      </li>
                    );
                  });

                  return group
                    ? (
                      <li key={group} role="presentation">
                        <div className={groupLabel}>{group}</div>
                        <ul role="group" className={groupList}>
                          {nodes}
                        </ul>
                      </li>
                    )
                    : nodes;
                })
              )}
          </ul>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}

// ---------------------------------------------------------------------------
// Styles (Panda CSS tokens only — feedback_dark_palette_beam_ui_only)
// ---------------------------------------------------------------------------

const backdrop = css({
  position: "fixed",
  inset: 0,
  backgroundColor: "scrim.55",
  zIndex: 200,
});

const positioner = css({
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  zIndex: 201,
  paddingTop: "12vh",
  padding: "12vh 16px 16px",
});

const content = css({
  backgroundColor: "bg.page",
  width: "100%",
  maxWidth: "140",
  shadow: "golden",
  outline: "none",
  overflow: "hidden",
});

const searchRow = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  py: "3",
  px: "4",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.default",
});

const searchIcon = css({
  fontSize: "xl",
  color: "text.secondary",
  flexShrink: 0,
});

const searchInput = css({
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: "15",
  fontFamily: "body",
  color: "text.primary",
  _placeholder: { color: "text.secondary" },
});

const list = css({
  listStyle: "none",
  margin: 0,
  py: "1",
  px: "0",
  maxHeight: "95",
  overflowY: "auto",
});

const rowBase = css({
  display: "flex",
  alignItems: "center",
  gap: "2.5",
  py: "2.25",
  px: "4",
  cursor: "pointer",
  fontSize: "sm",
  fontFamily: "body",
  color: "text.primary",
  userSelect: "none",
  transition: "background 0.1s ease",
  _hover: {
    backgroundColor: "bg.subtle",
  },
});

const rowActive = css({
  backgroundColor: "bg.subtle",
});

const rowIcon = css({
  fontSize: "lg",
  color: "text.secondary",
  flexShrink: 0,
});

const rowLabel = css({
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const rowHint = css({
  fontSize: "xs",
  color: "text.secondary",
  flexShrink: 0,
  marginLeft: "auto",
  paddingLeft: "3",
});

const groupLabel = css({
  fontSize: "11",
  fontWeight: 600,
  fontFamily: "body",
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  pt: "2",
  px: "4",
  pb: "1",
});

const groupList = css({
  listStyle: "none",
  margin: 0,
  padding: 0,
});

const emptyState = css({
  py: "5",
  px: "4",
  fontSize: "sm",
  fontFamily: "body",
  color: "text.secondary",
  textAlign: "center",
});
