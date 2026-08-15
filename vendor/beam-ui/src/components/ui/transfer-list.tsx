import { css, cx } from "../../system.ts";

import { type ReactNode, useCallback, useId, useState } from "react";
import { Icon } from "./icon.tsx";

/** Item in a transfer list. */
export interface TransferItem {
  /** Unique identifier for the item. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional Material Symbols icon name. */
  icon?: string;
}

/** Props for {@link TransferList}. */
export interface TransferListProps {
  /** Array of available items (left panel). */
  available: TransferItem[];
  /** Array of selected items (right panel). */
  selected: TransferItem[];
  /** Called when items are moved between panels with updated available and selected arrays. */
  onChange: (available: TransferItem[], selected: TransferItem[]) => void;
  /** Title for the available items panel. Defaults to `"Available"`. */
  availableTitle?: string;
  /** Title for the selected items panel. Defaults to `"Selected"`. */
  selectedTitle?: string;
  /** Optional CSS class applied to the root container. */
  className?: string;
}

/**
 * Dual-panel transfer list for moving items between available and selected sets.
 * Each panel has search/filter, checkbox selection, and item counts.
 * Center buttons move selected or all items left/right; supports Ctrl+Click for multi-select.
 *
 * @example
 * ```tsx
 * const [available, setAvailable] = useState([...]);
 * const [selected, setSelected] = useState([...]);
 * <TransferList
 *   available={available}
 *   selected={selected}
 *   onChange={(avail, sel) => { setAvailable(avail); setSelected(sel); }}
 *   availableTitle="Permissions"
 *   selectedTitle="Granted"
 * />
 * ```
 */
export function TransferList({
  available,
  selected,
  onChange,
  availableTitle = "Available",
  selectedTitle = "Selected",
  className,
}: TransferListProps): ReactNode {
  const instanceId = useId();
  const availableLabelId = `${instanceId}-available`;
  const selectedLabelId = `${instanceId}-selected`;
  const [availableSearch, setAvailableSearch] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");
  const [checkedAvailable, setCheckedAvailable] = useState<Set<string>>(
    new Set(),
  );
  const [checkedSelected, setCheckedSelected] = useState<Set<string>>(
    new Set(),
  );

  const filteredAvailable = available.filter((item) =>
    item.label.toLowerCase().includes(availableSearch.toLowerCase())
  );

  const filteredSelected = selected.filter((item) =>
    item.label.toLowerCase().includes(selectedSearch.toLowerCase())
  );

  const handleItemClick = useCallback(
    (
      id: string,
      side: "available" | "selected",
      event: React.MouseEvent | React.KeyboardEvent,
    ) => {
      const setter = side === "available" ? setCheckedAvailable : setCheckedSelected;
      setter((prev) => {
        const next = new Set(prev);
        if (event.metaKey || event.ctrlKey) {
          if (next.has(id)) next.delete(id);
          else next.add(id);
        } else {
          if (next.has(id) && next.size === 1) {
            next.clear();
          } else {
            next.clear();
            next.add(id);
          }
        }
        return next;
      });
    },
    [],
  );

  const moveRight = () => {
    const toMove = available.filter((item) => checkedAvailable.has(item.id));
    if (toMove.length === 0) return;
    onChange(
      available.filter((item) => !checkedAvailable.has(item.id)),
      [...selected, ...toMove],
    );
    setCheckedAvailable(new Set());
  };

  const moveAllRight = () => {
    onChange([], [...selected, ...available]);
    setCheckedAvailable(new Set());
  };

  const moveLeft = () => {
    const toMove = selected.filter((item) => checkedSelected.has(item.id));
    if (toMove.length === 0) return;
    onChange(
      [...available, ...toMove],
      selected.filter((item) => !checkedSelected.has(item.id)),
    );
    setCheckedSelected(new Set());
  };

  const moveAllLeft = () => {
    onChange([...available, ...selected], []);
    setCheckedSelected(new Set());
  };

  return (
    <div
      className={cx(container, className)}
      role="group"
      aria-label="Transfer list"
    >
      {/* Available panel */}
      <div className={panel}>
        <div className={panelHeader}>
          <span id={availableLabelId} className={panelTitle}>
            {availableTitle}
          </span>
          <span className={panelCount}>{available.length}</span>
        </div>
        <div className={searchWrapper}>
          <Icon name="search" size={14} className={searchIcon} />
          <input
            type="text"
            placeholder="Filter..."
            value={availableSearch}
            onChange={(e) => setAvailableSearch(e.target.value)}
            className={searchInput}
            aria-label={`Filter ${availableTitle}`}
          />
        </div>
        <div
          className={itemList}
          role="listbox"
          aria-labelledby={availableLabelId}
          aria-multiselectable="true"
          tabIndex={0}
        >
          {filteredAvailable.map((item) => (
            <div
              key={item.id}
              role="option"
              aria-selected={checkedAvailable.has(item.id)}
              tabIndex={0}
              className={cx(
                listItem,
                checkedAvailable.has(item.id) ? listItemSelected : undefined,
              )}
              onClick={(e) => handleItemClick(item.id, "available", e)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleItemClick(item.id, "available", e);
                }
              }}
            >
              {item.icon && <Icon name={item.icon} size={16} />}
              <span>{item.label}</span>
            </div>
          ))}
          {filteredAvailable.length === 0 && <div className={emptyPanel}>No items</div>}
        </div>
      </div>

      {/* Action buttons */}
      <div className={actions}>
        <button
          className={actionBtn}
          onClick={moveAllRight}
          type="button"
          aria-label={`Move all to ${selectedTitle}`}
        >
          <Icon name="keyboard_double_arrow_right" size={18} />
        </button>
        <button
          className={actionBtn}
          onClick={moveRight}
          type="button"
          aria-label={`Move selected to ${selectedTitle}`}
        >
          <Icon name="chevron_right" size={18} />
        </button>
        <button
          className={actionBtn}
          onClick={moveLeft}
          type="button"
          aria-label={`Move selected to ${availableTitle}`}
        >
          <Icon name="chevron_left" size={18} />
        </button>
        <button
          className={actionBtn}
          onClick={moveAllLeft}
          type="button"
          aria-label={`Move all to ${availableTitle}`}
        >
          <Icon name="keyboard_double_arrow_left" size={18} />
        </button>
      </div>

      {/* Selected panel */}
      <div className={panel}>
        <div className={panelHeader}>
          <span id={selectedLabelId} className={panelTitle}>
            {selectedTitle}
          </span>
          <span className={panelCount}>{selected.length}</span>
        </div>
        <div className={searchWrapper}>
          <Icon name="search" size={14} className={searchIcon} />
          <input
            type="text"
            placeholder="Filter..."
            value={selectedSearch}
            onChange={(e) => setSelectedSearch(e.target.value)}
            className={searchInput}
            aria-label={`Filter ${selectedTitle}`}
          />
        </div>
        <div
          className={itemList}
          role="listbox"
          aria-labelledby={selectedLabelId}
          aria-multiselectable="true"
          tabIndex={0}
        >
          {filteredSelected.map((item) => (
            <div
              key={item.id}
              role="option"
              aria-selected={checkedSelected.has(item.id)}
              tabIndex={0}
              className={cx(
                listItem,
                checkedSelected.has(item.id) ? listItemSelected : undefined,
              )}
              onClick={(e) => handleItemClick(item.id, "selected", e)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleItemClick(item.id, "selected", e);
                }
              }}
            >
              {item.icon && <Icon name={item.icon} size={16} />}
              <span>{item.label}</span>
            </div>
          ))}
          {filteredSelected.length === 0 && <div className={emptyPanel}>No items</div>}
        </div>
      </div>
    </div>
  );
}

const container = css({
  display: "flex",
  alignItems: "stretch",
  gap: "3",
});

const panel = css({
  flex: 1,
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  display: "flex",
  flexDirection: "column",
  minWidth: "50",
});

const panelHeader = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBlock: "3",
  paddingInline: "4",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.default",
});

const panelTitle = css({
  fontSize: "xs",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "text.secondary",
  fontFamily: "body",
});

const panelCount = css({
  fontSize: "11",
  fontWeight: "button",
  color: "text.muted",
  fontFamily: "mono",
});

const searchWrapper = css({
  position: "relative",
  padding: "2",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.default",
});

const searchIcon = css({
  position: "absolute",
  left: "4",
  top: "50%",
  transform: "translateY(-50%)",
  color: "text.muted",
  pointerEvents: "none",
});

const searchInput = css({
  width: "100%",
  paddingBlock: "1.5",
  paddingRight: "2",
  paddingLeft: "7",
  backgroundColor: "bg.page",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  fontSize: "13",
  fontFamily: "body",
  color: "text.primary",
  outline: "none",
  _focus: {
    borderColor: "sunbeam.orange",
  },
  _placeholder: {
    color: "text.muted",
  },
});

const itemList = css({
  flex: 1,
  overflowY: "auto",
  maxHeight: "65",
  minHeight: "30",
});

const listItem = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  paddingBlock: "2",
  paddingInline: "4",
  fontSize: "sm",
  fontFamily: "body",
  color: "text.primary",
  cursor: "pointer",
  borderLeftWidth: "0.75",
  borderLeftStyle: "solid",
  borderLeftColor: "transparent",
  transition: "all 0.1s ease",
  userSelect: "none",
  _hover: {
    backgroundColor: "bg.page",
  },
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "-0.5",
  },
});

const listItemSelected = css({
  borderLeftColor: "sunbeam.orange",
  backgroundColor: "bg.page",
});

const actions = css({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "1",
});

const actionBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "9",
  height: "9",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  color: { base: "text.secondary", _dark: "warm.ivory" },
  cursor: "pointer",
  transition: "all 0.15s ease",
  _hover: {
    borderColor: "sunbeam.orange",
    color: "sunbeam.orange",
  },
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.5",
  },
});

const emptyPanel = css({
  paddingBlock: "6",
  paddingInline: "4",
  textAlign: "center",
  fontSize: "13",
  color: "text.muted",
  fontFamily: "body",
});
