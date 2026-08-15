import { css, cx } from "../../system.ts";

import { type ReactNode, useState } from "react";
import { Icon } from "./icon.tsx";

/** Column configuration for {@link Table}. */
interface Column {
  /** Unique key matching a field in row data. */
  key: string;
  /** Display label for the column header. */
  label: string;
  /** Whether the column can be clicked to sort. Defaults to `false`. */
  sortable?: boolean;
  /** Optional CSS width (e.g. "120px", "20%"). */
  width?: string;
}

/** Props for {@link Table}. */
export interface TableProps {
  /** Array of column definitions with keys, labels, and optional sort/width. */
  columns: Column[];
  /** Array of row objects, matched against column keys. */
  rows: Array<Record<string, ReactNode>>;
  /** Called when a sortable column header is clicked with the column key and direction. */
  onSort?: (key: string, dir: "asc" | "desc") => void;
  /** Whether checkboxes appear for row selection. Defaults to `false`. */
  selectable?: boolean;
  /** Called when row selection changes with an array of selected row keys. */
  onSelect?: (selectedKeys: string[]) => void;
  /** Data key to use as the unique row identifier. Defaults to `"id"`. */
  rowKey?: string;
  /** Optional CSS class applied to the wrapper. */
  className?: string;
  /** Accessible caption for the table (visually hidden by default). */
  caption?: string;
}

/**
 * Data table with sorting, row selection, and alternating row colors.
 * Columns are configured via an array of `Column` definitions matching row data keys.
 *
 * @example
 * ```tsx
 * const columns: Column[] = [
 *   { key: "name", label: "Name", sortable: true },
 *   { key: "status", label: "Status" },
 * ];
 * const rows = [
 *   { id: "1", name: "Alice", status: "Active" },
 *   { id: "2", name: "Bob", status: "Inactive" },
 * ];
 * <Table columns={columns} rows={rows} selectable onSort={handleSort} onSelect={handleSelect} />
 * ```
 */
export function Table({
  columns,
  rows,
  onSort,
  selectable,
  onSelect,
  rowKey = "id",
  className,
  caption,
}: TableProps): ReactNode {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleSort = (key: string) => {
    const nextDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(nextDir);
    onSort?.(key, nextDir);
  };

  const toggleRow = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
    onSelect?.(Array.from(next));
  };

  const toggleAll = () => {
    if (selected.size === rows.length) {
      setSelected(new Set());
      onSelect?.([]);
    } else {
      const all = new Set(
        rows.map((r) => String((r[rowKey] as unknown) ?? "")),
      );
      setSelected(all);
      onSelect?.(Array.from(all));
    }
  };

  return (
    <div className={cx(wrapper, className)}>
      <table className={table}>
        {caption && <caption className={srOnly}>{caption}</caption>}
        <thead>
          <tr className={headerRow}>
            {selectable && (
              <th
                scope="col"
                className={cx(headerCell, css({ width: "10" }))}
                aria-label="Select row"
              >
                <input
                  type="checkbox"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={toggleAll}
                  className={checkbox}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={headerCell}
                style={col.width ? { width: col.width } : undefined}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                aria-sort={col.sortable
                  ? sortKey === col.key ? sortDir === "asc" ? "ascending" : "descending" : "none"
                  : undefined}
              >
                <span className={headerLabel}>
                  {col.label}
                  {col.sortable && (
                    <Icon
                      name={sortKey === col.key && sortDir === "desc"
                        ? "arrow_downward"
                        : "arrow_upward"}
                      size={14}
                      className={css({
                        opacity: sortKey === col.key ? 1 : 0.3,
                        transition: "opacity 0.15s ease",
                      })}
                    />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const key = String((row[rowKey] as unknown) ?? i);
            return (
              <tr
                key={key}
                className={cx(
                  dataRow,
                  i % 2 === 0 ? evenRow : oddRow,
                )}
              >
                {selectable && (
                  <td className={dataCell}>
                    <input
                      type="checkbox"
                      checked={selected.has(key)}
                      onChange={() => toggleRow(key)}
                      className={checkbox}
                      aria-label={`Select row ${key}`}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={dataCell}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const wrapper = css({
  overflowX: "auto",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
});

const table = css({
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: "body",
});

const headerRow = css({
  backgroundColor: "bg.card",
});

const headerCell = css({
  paddingBlock: "2.5",
  paddingInline: "4",
  textAlign: "left",
  fontSize: "11",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "text.muted",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.default",
  cursor: "default",
  whiteSpace: "nowrap",
  userSelect: "none",
  "&[onClick]": { cursor: "pointer" },
});

const headerLabel = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1",
});

const dataRow = css({
  transition: "background-color 0.15s ease",
  _hover: { backgroundColor: "bg.card" },
});

const evenRow = css({ backgroundColor: "bg.page" });
const oddRow = css({ backgroundColor: "bg.card" });

const dataCell = css({
  paddingBlock: "2.5",
  paddingInline: "4",
  fontSize: "sm",
  fontFamily: "mono",
  color: "text.primary",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.subtle",
});

const checkbox = css({
  accentColor: "sunbeam.orange",
  cursor: "pointer",
});

const srOnly = css({
  position: "absolute",
  width: "0.25",
  height: "0.25",
  padding: 0,
  margin: "-0.25",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
});
