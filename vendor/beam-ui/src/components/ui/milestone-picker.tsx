import { css, cx } from "../../system.ts";

import { type ReactNode, useState } from "react";
import {
  PopoverContent,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from "@ark-ui/react/popover";
import { Icon } from "./icon.tsx";

/** A milestone option with progress tracking and completion counts. */
export interface MilestoneOption {
  /** Unique identifier for the milestone. */
  id: string;
  /** Milestone name / title. */
  title: string;
  /** Optional due date string (e.g., ISO date or human-readable format). */
  dueDate?: string;
  /** Progress percentage (0–100). */
  progress: number;
  /** Count of open items in the milestone. */
  open: number;
  /** Count of closed/completed items in the milestone. */
  closed: number;
}

/** Props for {@link MilestonePicker}. */
export interface MilestonePickerProps {
  /** Array of available milestones to choose from. */
  options: MilestoneOption[];
  /** ID of the currently selected milestone, or null if none selected. */
  selected: string | null;
  /** Called when user selects or deselects a milestone. Receives milestone id or null. */
  onChange: (selected: string | null) => void;
  /** Placeholder text when no milestone is selected. Defaults to `"Milestone"`. */
  placeholder?: string;
  /** Whether the milestone dropdown is open. Defaults to `false`. */
  open?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Optional CSS class for the trigger button. */
  className?: string;
}

/**
 * Single-select dropdown for choosing milestones with progress tracking.
 * Displays due date, open/closed counts, and progress bar for each milestone.
 * Supports search filtering by milestone title.
 * Clicking a selected milestone again deselects it.
 *
 * @example
 * ```tsx
 * <MilestonePicker
 *   options={milestones}
 *   selected={selectedMilestoneId}
 *   onChange={setSelectedMilestoneId}
 * />
 * ```
 */
export function MilestonePicker({
  options,
  selected,
  onChange,
  placeholder = "Milestone",
  open,
  onOpenChange,
  className,
}: MilestonePickerProps): ReactNode {
  const [query, setQuery] = useState("");

  const filtered = options.filter((opt) => opt.title.toLowerCase().includes(query.toLowerCase()));

  const selectedOption = options.find((o) => o.id === selected);

  function handleSelect(id: string) {
    if (selected === id) {
      onChange(null);
    } else {
      onChange(id);
    }
  }

  return (
    <PopoverRoot
      positioning={{ placement: "bottom-start" }}
      open={open}
      onOpenChange={(d) => {
        onOpenChange?.(d.open);
        if (!d.open) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button className={cx(triggerStyle, className)} type="button">
          <Icon name="flag" size={16} className={triggerIcon} />
          <span className={selectedOption ? triggerText : placeholderStyle}>
            {selectedOption ? selectedOption.title : placeholder}
          </span>
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
              placeholder="Filter milestones..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={listWrapper}>
            {filtered.map((opt) => {
              const isSelected = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  className={optionRow}
                  onClick={() => handleSelect(opt.id)}
                  type="button"
                >
                  <span className={optionMain}>
                    <span className={optionTitle}>
                      <Icon name="flag" size={14} className={milestoneIcon} />
                      {opt.title}
                    </span>
                    <span className={optionMeta}>
                      {opt.dueDate && <span className={dueDate}>Due {opt.dueDate}</span>}
                      <span className={counts}>
                        {opt.closed} closed / {opt.open} open
                      </span>
                    </span>
                    <span className={progressTrack}>
                      <span
                        className={progressFill}
                        style={{
                          width: `${Math.max(0, Math.min(100, opt.progress))}%`,
                        }}
                      />
                    </span>
                  </span>
                  {isSelected && <Icon name="check" size={16} className={checkIcon} />}
                </button>
              );
            })}
            {filtered.length === 0 && <span className={emptyText}>No milestones found</span>}
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

const triggerIcon = css({
  color: "text.muted",
  flexShrink: 0,
});

const triggerText = css({
  flex: 1,
  textAlign: "left",
});

const placeholderStyle = css({
  color: "text.muted",
  flex: 1,
  textAlign: "left",
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
  width: "80",
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
  maxHeight: "75",
  overflowY: "auto",
});

const optionRow = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "2.5",
  width: "100%",
  py: "2.5",
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

const optionMain = css({
  display: "flex",
  flexDirection: "column",
  gap: "1",
  flex: 1,
  minWidth: 0,
});

const optionTitle = css({
  display: "flex",
  alignItems: "center",
  gap: "1.5",
  fontSize: "sm",
  color: "text.primary",
  fontWeight: "button",
});

const milestoneIcon = css({
  color: "text.muted",
  flexShrink: 0,
});

const optionMeta = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  fontSize: "xs",
  color: "text.muted",
});

const dueDate = css({});

const counts = css({});

const progressTrack = css({
  width: "100%",
  height: "1",
  backgroundColor: "bg.card",
  borderRadius: "full",
  overflow: "hidden",
  marginTop: "0.5",
});

const progressFill = css({
  height: "100%",
  backgroundColor: "sunbeam.orange",
  borderRadius: "full",
  transition: "width 0.3s ease",
});

const checkIcon = css({
  color: "sunbeam.orange",
  flexShrink: 0,
  marginTop: "0.5",
});

const emptyText = css({
  display: "block",
  padding: "4",
  fontSize: "13",
  color: "text.muted",
  textAlign: "center",
});
