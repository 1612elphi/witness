import { css, cx } from "../../system.ts";

import { type ReactNode, useState } from "react";
import {
  PopoverContent,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from "@ark-ui/react/popover";
import { Icon } from "./icon.tsx";
import { Avatar } from "./avatar.tsx";

/** Represents a single user option in the picker. */
export interface UserOption {
  /** Unique user identifier. */
  id: string;
  /** Login username. */
  username: string;
  /** Display name. */
  displayName: string;
  /** Avatar image URL (optional). */
  avatarUrl?: string;
}

/** Props for {@link AssigneePicker}. */
export interface AssigneePickerProps {
  /** List of available users to pick from. */
  options: UserOption[];
  /** Array of selected user IDs. */
  selected: string[];
  /** Called with updated array of selected user IDs when selection changes. */
  onChange: (selected: string[]) => void;
  /** Placeholder text shown when no users are selected. Defaults to "Assignees". */
  placeholder?: string;
  /** If false, the dropdown is rendered inline instead of in a portal. Defaults to true. */
  portalled?: boolean;
  /** Controlled open state of the dropdown. */
  open?: boolean;
  /** Called when the dropdown open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Additional Panda CSS classes. */
  className?: string;
}

/**
 * Multi-select dropdown for assigning users.
 *
 * Shows selected avatars inline. Clicking opens a popover with a search input and checkbox list.
 * Multiple users can be selected simultaneously.
 *
 * @example
 * ```tsx
 * <AssigneePicker
 *   options={[
 *     { id: "1", username: "alice", displayName: "Alice Smith" },
 *     { id: "2", username: "bob", displayName: "Bob Jones" },
 *   ]}
 *   selected={["1"]}
 *   onChange={(ids) => setSprint({ ...sprint, assignees: ids })}
 * />
 * ```
 */
export function AssigneePicker({
  options,
  selected,
  onChange,
  placeholder = "Assignees",
  portalled = true,
  open,
  onOpenChange,
  className,
}: AssigneePickerProps): ReactNode {
  const [query, setQuery] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setIsOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const filtered = options.filter(
    (opt) =>
      opt.username.toLowerCase().includes(query.toLowerCase()) ||
      opt.displayName.toLowerCase().includes(query.toLowerCase()),
  );

  const selectedOptions = options.filter((o) => selected.includes(o.id));

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <PopoverRoot
      positioning={{ placement: "bottom-start" }}
      open={isOpen}
      onOpenChange={(details) => {
        setIsOpen(details.open);
        if (!details.open) setQuery("");
      }}
      portalled={portalled}
    >
      <PopoverTrigger asChild>
        <button className={cx(triggerStyle, className)} type="button">
          {selectedOptions.length === 0
            ? <span className={placeholderStyle}>{placeholder}</span>
            : (
              <span className={avatarRow}>
                {selectedOptions.map((opt) => (
                  <Avatar
                    key={opt.id}
                    name={opt.displayName}
                    src={opt.avatarUrl}
                    size="sm"
                    className={avatarSmall}
                  />
                ))}
              </span>
            )}
          <Icon name="expand_more" size={18} className={chevron} />
        </button>
      </PopoverTrigger>
      <PopoverPositioner>
        <PopoverContent className={dropdown}>
          <div className={searchWrapper}>
            <Icon name="search" size={16} className={searchIcon} />
            <input
              type="text"
              className={searchInput}
              placeholder="Filter users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={listWrapper}>
            {filtered.map((opt) => {
              const isSelected = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  className={optionRow}
                  onClick={() => toggle(opt.id)}
                  type="button"
                >
                  <Avatar
                    name={opt.displayName}
                    src={opt.avatarUrl}
                    size="sm"
                    className={avatarSmall}
                  />
                  <span className={optionText}>
                    <span className={displayName}>{opt.displayName}</span>
                    <span className={username}>@{opt.username}</span>
                  </span>
                  {isSelected && <Icon name="check" size={16} className={checkIcon} />}
                </button>
              );
            })}
            {filtered.length === 0 && <span className={emptyText}>No users found</span>}
          </div>
        </PopoverContent>
      </PopoverPositioner>
    </PopoverRoot>
  );
}

const triggerStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  py: "1.5",
  px: "3",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  cursor: "pointer",
  fontFamily: "body",
  fontSize: "sm",
  color: "text.primary",
  minHeight: "9",
  minWidth: "45",
  transition: "border-color 0.15s ease",
  _hover: {
    borderColor: "sunbeam.orange",
  },
});

const placeholderStyle = css({
  color: "text.muted",
});

const avatarRow = css({
  display: "flex",
  alignItems: "center",
  flex: 1,
});

const avatarSmall = css({
  width: "6!",
  height: "6!",
  fontSize: "2xs!",
  marginRight: "-1",
});

const chevron = css({
  color: "text.muted",
  marginLeft: "auto",
  flexShrink: 0,
});

const dropdown = css({
  backgroundColor: "bg.page",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  shadow: "golden",
  zIndex: 50,
  outline: "none",
  width: "75",
  overflow: "hidden",
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
});

const searchInput = css({
  width: "100%",
  pt: "1.5",
  pr: "2",
  pb: "1.5",
  pl: "8",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  backgroundColor: "bg.card",
  fontSize: "13",
  fontFamily: "body",
  color: "text.primary",
  outline: "none",
  _focus: {
    borderColor: "sunbeam.orange",
  },
});

const listWrapper = css({
  maxHeight: "65",
  overflowY: "auto",
});

const optionRow = css({
  display: "flex",
  alignItems: "center",
  gap: "2.5",
  width: "100%",
  py: "2",
  px: "3",
  border: "none",
  background: "none",
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "body",
  transition: "background-color 0.1s ease",
  _hover: {
    backgroundColor: "bg.card",
  },
});

const optionText = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.25",
  flex: 1,
  minWidth: 0,
});

const displayName = css({
  fontSize: "sm",
  color: "text.primary",
  fontWeight: "button",
});

const username = css({
  fontSize: "xs",
  color: "text.muted",
  fontFamily: "mono",
});

const checkIcon = css({
  color: "sunbeam.orange",
  flexShrink: 0,
});

const emptyText = css({
  display: "block",
  padding: "4",
  fontSize: "13",
  color: "text.muted",
  textAlign: "center",
});
