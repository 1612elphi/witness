import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";
import { Icon } from "./icon.tsx";

/** Single file or folder in a {@link FileList}. */
export interface FileItem {
  /** Unique identifier for this item. */
  id: string;
  /** Display name of the file or folder. */
  name: string;
  /** Optional Material Design icon name (overrides default folder/file icons). */
  icon?: string;
  /** Type of item: "file" or "folder". Defaults to "file". */
  type?: "file" | "folder";
  /** Human-readable file size (e.g., "1.2 MB"). */
  size?: string;
  /** Human-readable modification time (e.g., "2 days ago"). */
  modified?: string;
  /** Optional extra metadata content. */
  meta?: ReactNode;
}

/** Props for {@link FileList}. */
export interface FileListProps {
  /** Array of files and folders to display. */
  items: FileItem[];
  /** Set of currently selected item IDs. */
  selected: Set<string>;
  /** Callback fired when the selection changes; receives the new Set of selected IDs. */
  onSelect: (selected: Set<string>) => void;
  /** Callback fired when the user double-clicks an item; receives the FileItem. */
  onOpen?: (item: FileItem) => void;
  /** Render layout: "list" (detailed table) or "grid" (icon grid). Defaults to `"list"`. */
  layout?: "list" | "grid";
  /** Font family for file names: "body" (Ysabeau Infant) or "mono" (Monaspace Argon). Defaults to `"body"`. */
  font?: "body" | "mono";
  /** Extra CSS class names to apply to the root container. */
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

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

function defaultIcon(item: FileItem) {
  if (item.icon) return item.icon;
  return item.type === "folder" ? "folder" : "description";
}

/* ------------------------------------------------------------------ */
/* List layout                                                         */
/* ------------------------------------------------------------------ */

const listContainer = css({
  display: "flex",
  flexDirection: "column",
});

const listHeader = css({
  display: "grid",
  gridTemplateColumns: "32px 24px 1fr 100px 140px",
  gap: "2",
  alignItems: "center",
  py: "2",
  px: "3",
  fontSize: "11",
  fontWeight: "button",
  color: "text.muted",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.default",
});

const listRow = css({
  display: "grid",
  gridTemplateColumns: "32px 24px 1fr 100px 140px",
  gap: "2",
  alignItems: "center",
  py: "2",
  px: "3",
  cursor: "pointer",
  transition: "background 0.1s ease",
  _hover: { backgroundColor: "bg.card" },
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.subtle",
});

const listRowSelected = css({
  backgroundColor: "accent.06",
});

const fileName = css({
  fontSize: "sm",
  color: "text.primary",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const fileNameMono = css({
  fontFamily: "mono",
  fontSize: "13",
});

const fileMeta = css({
  fontSize: "xs",
  color: "text.muted",
});

const fileIcon = css({
  color: "text.secondary",
});

const folderIcon = css({
  color: "sunbeam.orange",
});

function ListView({
  items,
  selected,
  onSelect,
  onOpen,
  font = "body",
}: Omit<FileListProps, "layout" | "className">) {
  const allSelected = items.length > 0 &&
    items.every((i) => selected.has(i.id));

  const toggleAll = () => {
    if (allSelected) {
      onSelect(new Set());
    } else {
      onSelect(new Set(items.map((i) => i.id)));
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelect(next);
  };

  return (
    <div className={listContainer} role="grid">
      <div className={listHeader} role="row">
        <Checkbox
          checked={allSelected}
          onChange={toggleAll}
          ariaLabel="Select all files"
        />
        <span />
        <span>Name</span>
        <span>Size</span>
        <span>Modified</span>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="row"
          className={cx(listRow, selected.has(item.id) && listRowSelected)}
          onDoubleClick={() => onOpen?.(item)}
        >
          <Checkbox
            checked={selected.has(item.id)}
            onChange={() => toggle(item.id)}
            ariaLabel={`Select ${item.name}`}
          />
          <Icon
            name={defaultIcon(item)}
            size={18}
            className={item.type === "folder" ? folderIcon : fileIcon}
          />
          <span className={cx(fileName, font === "mono" && fileNameMono)}>
            {item.name}
          </span>
          <span className={fileMeta}>{item.size ?? "—"}</span>
          <span className={fileMeta}>{item.modified ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Grid layout                                                         */
/* ------------------------------------------------------------------ */

const gridContainer = css({
  display: "grid",
  gridTemplateColumns: {
    base: "repeat(auto-fill, minmax(120px, 1fr))",
    md: "repeat(auto-fill, minmax(140px, 1fr))",
  },
  gap: "3",
});

const gridCell = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2",
  py: "4",
  px: "2",
  cursor: "pointer",
  position: "relative",
  transition: "background 0.1s ease",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "transparent",
  _hover: { backgroundColor: "bg.card" },
});

const gridCellSelected = css({
  backgroundColor: "accent.06",
  borderColor: "sunbeam.orange",
});

const gridCheckbox = css({
  position: "absolute",
  top: "2",
  left: "2",
});

const gridName = css({
  fontSize: "xs",
  color: "text.primary",
  textAlign: "center",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  width: "100%",
});

const gridNameMono = css({
  fontFamily: "mono",
  fontSize: "11",
});

function GridView({
  items,
  selected,
  onSelect,
  onOpen,
  font = "body",
}: Omit<FileListProps, "layout" | "className">) {
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelect(next);
  };

  return (
    <div className={gridContainer} role="listbox" aria-label="Files">
      {items.map((item) => (
        <div
          key={item.id}
          role="option"
          aria-selected={selected.has(item.id)}
          className={cx(gridCell, selected.has(item.id) && gridCellSelected)}
          onClick={() => toggle(item.id)}
          onDoubleClick={() => onOpen?.(item)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              toggle(item.id);
            }
          }}
        >
          <div className={gridCheckbox}>
            <Checkbox
              checked={selected.has(item.id)}
              onChange={() => toggle(item.id)}
              ariaLabel={`Select ${item.name}`}
            />
          </div>
          <Icon
            name={defaultIcon(item)}
            size={40}
            className={item.type === "folder" ? folderIcon : fileIcon}
          />
          <span className={cx(gridName, font === "mono" && gridNameMono)}>
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FileList                                                            */
/* ------------------------------------------------------------------ */

/**
 * Multi-select file browser with list and grid layout options.
 *
 * Displays files and folders with icons, sizes, and modification times.
 * Supports checkbox multi-select, double-click to open, and layout toggle.
 * List mode shows detailed metadata; grid mode is compact and icon-focused.
 *
 * @example
 * ```tsx
 * <FileList
 *   items={files}
 *   selected={selected}
 *   onSelect={setSelected}
 *   onOpen={(item) => openFile(item.id)}
 *   layout="list"
 * />
 * ```
 */
export function FileList({
  items,
  selected,
  onSelect,
  onOpen,
  layout = "list",
  font = "body",
  className,
}: FileListProps): ReactNode {
  const inner = layout === "grid"
    ? (
      <GridView
        items={items}
        selected={selected}
        onSelect={onSelect}
        onOpen={onOpen}
        font={font}
      />
    )
    : (
      <ListView
        items={items}
        selected={selected}
        onSelect={onSelect}
        onOpen={onOpen}
        font={font}
      />
    );

  return <div className={className}>{inner}</div>;
}
