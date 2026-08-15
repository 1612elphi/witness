import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";
import { Icon } from "./icon.tsx";

/** Props for {@link Pagination}. */
export interface PaginationProps {
  /** Currently active page (1-indexed). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Called when user clicks a page number or navigation arrow. Receives new page number. */
  onPageChange: (page: number) => void;
  /** Current items-per-page count. If provided with onPageSizeChange, shows size selector. */
  pageSize?: number;
  /** Called when user changes page size. Receives new size. */
  onPageSizeChange?: (size: number) => void;
  /** Optional CSS class for the nav element. */
  className?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Pagination control with previous/next arrows, numbered buttons (with smart ellipsis), and optional page size selector.
 * Always shows exactly 7 page slots. Disables prev/next buttons at boundaries.
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   onPageChange={setPage}
 *   pageSize={size}
 *   onPageSizeChange={setSize}
 * />
 * ```
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  className,
}: PaginationProps): ReactNode {
  const pages = buildPageList(currentPage, totalPages);

  // Size buttons based on the widest possible page number
  const digits = String(totalPages).length;
  // ~10px per digit in mono at 13px + 16px padding + 2px border
  const btnWidth = Math.max(36, digits * 10 + 18);
  const cellStyle = { width: btnWidth, height: 36 };

  return (
    <nav className={cx(wrapper, className)} aria-label="Pagination">
      <div className={pageButtons}>
        <button
          className={navBtn}
          style={cellStyle}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          type="button"
          aria-label="Previous page"
        >
          <Icon name="chevron_left" size={18} />
        </button>

        {pages.map((p, i) =>
          p === "..."
            ? (
              <span
                key={`ellipsis-${i}`}
                className={ellipsis}
                style={cellStyle}
              >
                ...
              </span>
            )
            : (
              <button
                key={p}
                type="button"
                className={cx(pageBtn, p === currentPage && activePage)}
                style={cellStyle}
                onClick={() => onPageChange(p as number)}
                {...(p === currentPage ? { "aria-current": "page" as const } : {})}
              >
                {p}
              </button>
            )
        )}

        <button
          className={navBtn}
          style={cellStyle}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          type="button"
          aria-label="Next page"
        >
          <Icon name="chevron_right" size={18} />
        </button>
      </div>

      {pageSize !== undefined && onPageSizeChange && (
        <div className={sizeSelector}>
          <label className={sizeLabel}>Per page</label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={sizeSelect}
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Page range logic                                                    */
/* ------------------------------------------------------------------ */

function buildPageList(current: number, total: number): (number | "...")[] {
  // Always show exactly 7 slots: [1] [..|n] [n] [current] [n] [..|n] [last]
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Near the start: 1 2 3 4 5 ... 20
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  // Near the end: 1 ... 16 17 18 19 20
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  // Middle: 1 ... 4 5 6 ... 20
  return [1, "...", current - 1, current, current + 1, "...", total];
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const wrapper = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "4",
  fontFamily: "body",
  flexWrap: "wrap",
});

const pageButtons = css({
  display: "flex",
  alignItems: "center",
  gap: "1",
});

const navBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "9",
  height: "9",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  backgroundColor: "bg.card",
  color: "text.primary",
  cursor: "pointer",
  transition: "all 0.15s ease",
  _hover: { borderColor: "sunbeam.orange", color: "sunbeam.orange" },
  _disabled: {
    opacity: 0.35,
    cursor: "default",
    _hover: { borderColor: "border.default", color: "text.primary" },
  },
});

const pageBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "9",
  height: "9",
  padding: "0",
  fontSize: "13",
  fontFamily: "mono",
  fontWeight: "button",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  backgroundColor: "bg.card",
  color: "text.primary",
  cursor: "pointer",
  transition: "all 0.15s ease",
  _hover: { borderColor: "sunbeam.orange", color: "sunbeam.orange" },
});

const activePage = css({
  backgroundColor: "sunbeam.orange",
  color: "white",
  borderColor: "sunbeam.orange",
  _hover: {
    backgroundColor: "sunbeam.flame",
    borderColor: "sunbeam.flame",
    color: "white",
  },
});

const ellipsis = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "9",
  height: "9",
  padding: "0",
  fontSize: "sm",
  fontFamily: "mono",
  color: "text.muted",
  userSelect: "none",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "transparent",
});

const sizeSelector = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
});

const sizeLabel = css({
  fontSize: "11",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "text.muted",
});

const sizeSelect = css({
  paddingBlock: "1",
  paddingInline: "2",
  fontSize: "13",
  fontFamily: "body",
  fontWeight: "body",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  backgroundColor: "bg.card",
  color: "text.primary",
  cursor: "pointer",
  _hover: { borderColor: "sunbeam.orange" },
});
