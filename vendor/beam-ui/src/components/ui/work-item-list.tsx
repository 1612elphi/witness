import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";
import type { LinkComponent } from "../../utils/polymorphic.ts";
import { Icon } from "./icon.tsx";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** Label badge for a work item. */
export interface WorkItemLabel {
  /** Label text. */
  name: string;
  /** Hex or CSS color for the label background/border. */
  color: string;
}

/** Branch information displayed inline with a work item. */
export interface WorkItemBranch {
  /** Target branch name. */
  base: string;
  /** Source branch name. */
  head: string;
}

/** A single row in a work item list (e.g., PR, issue). */
export interface WorkItemRow {
  /** Unique identifier for the item. */
  id: string;
  /** Optional left-column icon (e.g., status indicator, avatar). */
  icon?: ReactNode;
  /** Item title (becomes a link if href is provided). */
  title: string;
  /** Link destination for the title. If omitted, title is displayed as plain text. */
  href?: string;
  /** Optional array of labels (colored badges). */
  labels?: WorkItemLabel[];
  /** Metadata displayed below title (e.g., author, date). */
  meta: ReactNode;
  /** Optional branch information ("into base from head"). */
  branches?: WorkItemBranch;
  /** Optional status indicator (right column, e.g., "open", "merged"). */
  status?: ReactNode;
  /** Number of comments; if >0, displayed with a comment icon. */
  commentCount?: number;
}

/** Props for {@link WorkItemList}. */
export interface WorkItemListProps {
  /** Array of work item rows. */
  items: WorkItemRow[];
  /** Set of currently selected item IDs. */
  selected?: Set<string>;
  /** Called when selection changes with the updated Set. */
  onSelect?: (selected: Set<string>) => void;
  /** Whether checkboxes appear for row selection. Defaults to `false`. */
  selectable?: boolean;
  /** Called when "Load more" button is clicked. */
  onLoadMore?: () => void;
  /** Optional CSS class applied to the root container. */
  className?: string;
  /** Component used to render item links. Defaults to a plain `<a>`. */
  linkAs?: LinkComponent;
}

/* ------------------------------------------------------------------ */
/* Checkbox                                                            */
/* ------------------------------------------------------------------ */

function Checkbox(
  { checked, onChange, ariaLabel }: {
    checked: boolean;
    onChange: () => void;
    ariaLabel?: string;
  },
) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={0}
      className={cx(checkboxOuter, checked && checkboxChecked)}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          onChange();
        }
      }}
    >
      {checked && <Icon name="check" size={14} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WorkItemList                                                        */
/* ------------------------------------------------------------------ */

/**
 * List of work items (PRs, issues, tasks) with title, labels, metadata, branches, and status.
 * Optional checkboxes for multi-select; "Load more" button at bottom if provided.
 * Rows highlight on hover and when selected; title is a link if href is provided.
 *
 * @example
 * ```tsx
 * const items: WorkItemRow[] = [
 *   {
 *     id: "pr-1",
 *     title: "Add feature X",
 *     href: "/pr/1",
 *     meta: "opened by alice",
 *     labels: "[{ name: "feature", color: "#0066cc" }],
 *     branches: "{ base: "main", head: "feat/x" },
 *     status: <Badge>Draft</Badge>,
 *     commentCount: 3,
 *   },
 * ];
 * <WorkItemList items={items} selectable onSelect={handleSelect} onLoadMore={loadMore} />
 * ```
 */
export function WorkItemList({
  items,
  selected,
  onSelect,
  selectable = false,
  onLoadMore,
  className,
  linkAs,
}: WorkItemListProps): ReactNode {
  const LinkAs = linkAs ?? DefaultLink;
  const sel = selected ?? new Set<string>();

  const toggle = (id: string) => {
    if (!onSelect) return;
    const next = new Set(sel);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelect(next);
  };

  return (
    <div className={cx(container, className)} role="list">
      {items.map((item) => {
        const isSelected = sel.has(item.id);
        return (
          <div
            key={item.id}
            role="listitem"
            className={cx(row, isSelected && rowSelected)}
          >
            {/* Left: checkbox + icon */}
            <div className={leftCol}>
              {selectable && (
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggle(item.id)}
                  ariaLabel={`Select ${item.title}`}
                />
              )}
              {item.icon && <div className={iconCell}>{item.icon}</div>}
            </div>

            {/* Center: title, labels, meta+branches */}
            <div className={centerCol}>
              {/* Line 1: Title */}
              {item.href
                ? (
                  <LinkAs href={item.href} className={titleLink}>
                    {item.title}
                  </LinkAs>
                )
                : <span className={titleText}>{item.title}</span>}

              {/* Line 2: Labels */}
              {item.labels && item.labels.length > 0 && (
                <div className={labelRow}>
                  {item.labels.map((label) => (
                    <span
                      key={label.name}
                      className={labelBadge}
                      style={{
                        backgroundColor: `${label.color}18`,
                        color: label.color,
                        borderColor: `${label.color}40`,
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Line 3: Meta + branches */}
              <div className={metaRow}>
                <span className={metaText}>{item.meta}</span>
                {item.branches && (
                  <span className={branchInline}>
                    <span className={metaText}>&nbsp;·&nbsp;into&nbsp;</span>
                    <span className={branchPill}>{item.branches.base}</span>
                    <span className={metaText}>&nbsp;from&nbsp;</span>
                    <span className={branchPill}>{item.branches.head}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right: status + comments */}
            <div className={rightCol}>
              {item.status}
              {item.commentCount != null && item.commentCount > 0 && (
                <span
                  className={commentBadge}
                  aria-label={`${item.commentCount} comment${item.commentCount !== 1 ? "s" : ""}`}
                >
                  <Icon name="chat_bubble_outline" size={14} />
                  {item.commentCount}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {onLoadMore && (
        <div
          className={loadMoreBtn}
          role="button"
          tabIndex={0}
          onClick={onLoadMore}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onLoadMore!();
            }
          }}
        >
          Load more
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const container = css({
  display: "flex",
  flexDirection: "column",
});

const row = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  gap: "3",
  paddingBlock: "3",
  paddingInline: "4",
  cursor: "default",
  transition: "background 0.1s ease",
  _hover: { backgroundColor: "bg.card" },
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.subtle",
  alignItems: "stretch",
});

const rowSelected = css({
  backgroundColor: "sunbeam.orange/6",
});

const leftCol = css({
  display: "flex",
  alignItems: "center",
  gap: "2.5",
  paddingTop: "0.5",
});

const iconCell = css({
  display: "flex",
  alignItems: "center",
});

const centerCol = css({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: "1",
});

const titleLink = css({
  fontSize: "sm",
  fontWeight: "heading",
  color: "text.primary",
  textDecoration: "none",
  lineHeight: 1.4,
  _hover: { textDecoration: "underline" },
});

const titleText = css({
  fontSize: "sm",
  fontWeight: "heading",
  color: "text.primary",
  lineHeight: 1.4,
});

const labelRow = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "1.5",
});

const labelBadge = css({
  display: "inline-block",
  fontSize: "2xs",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  lineHeight: 1,
  py: "0.75",
  px: "2",
  borderRadius: "sm",
  borderWidth: "0.25",
  borderStyle: "solid",
  whiteSpace: "nowrap",
});

const metaRow = css({
  display: "flex",
  alignItems: "center",
  whiteSpace: "nowrap",
});

const metaText = css({
  fontSize: "xs",
  color: "text.muted",
  fontFamily: "mono",
});

const branchInline = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0",
});

const branchPill = css({
  display: "inline-block",
  fontSize: "xs",
  fontFamily: "mono",
  fontWeight: "body",
  py: "0",
  px: "1.5",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  color: "text.primary",
  whiteSpace: "nowrap",
  marginInline: "1",
  lineHeight: 1.5,
});

const rightCol = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "space-between",
  whiteSpace: "nowrap",
});

const commentBadge = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1",
  fontSize: "xs",
  marginTop: "auto",
  color: "text.muted",
  fontFamily: "mono",
});

const checkboxOuter = css({
  width: "4.5",
  height: "4.5",
  minWidth: "4.5",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: { base: "warm.30", _dark: "sunshine.35" },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.15s ease",
});

const checkboxChecked = css({
  backgroundColor: "sunbeam.orange",
  borderColor: "sunbeam.orange",
  color: "white",
});

const loadMoreBtn = css({
  display: "flex",
  justifyContent: "center",
  paddingBlock: "3",
  paddingInline: "4",
  cursor: "pointer",
  fontSize: "sm",
  fontWeight: "button",
  color: "text.muted",
  transition: "color 0.15s ease",
  _hover: { color: "text.primary" },
});

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
