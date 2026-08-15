import { css, cx } from "../../system.ts";

import { type ReactNode, useState } from "react";
import {
  PopoverContent,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from "@ark-ui/react/popover";
import { TabContent, TabList, TabsRoot, TabTrigger } from "@ark-ui/react/tabs";
import { Icon } from "./icon.tsx";

/** Props for {@link BranchSelector}. */
export interface BranchSelectorProps {
  /** Array of branch names to choose from. */
  branches: string[];
  /** Array of tag names to choose from. */
  tags: string[];
  /** Currently selected branch or tag name. */
  current: string;
  /** Name of the default/main branch (shown with "default" badge). */
  defaultBranch?: string;
  /** Called with selected branch or tag name. */
  onChange: (ref: string) => void;
  /** Optional callback to create a new branch with the given name. */
  onCreateBranch?: (name: string) => void;
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
 * Dropdown for selecting Git branches or tags with optional branch creation.
 *
 * Shows two tabs (Branches, Tags), a search input, and a list of options. If `onCreateBranch`
 * is provided and the search matches no existing branch, a "Create branch" button appears.
 * The current selection is marked with a checkmark and highlighted in orange.
 *
 * @example
 * ```tsx
 * <BranchSelector
 *   branches={["main", "develop", "feature/auth"]}
 *   tags={["v1.0.0", "v1.1.0"]}
 *   current="main"
 *   defaultBranch="main"
 *   onChange={(ref) => checkout(ref)}
 *   onCreateBranch={(name) => createBranch(name)}
 * />
 * ```
 */
export function BranchSelector({
  branches,
  tags,
  current,
  defaultBranch,
  onChange,
  onCreateBranch,
  portalled = true,
  open,
  onOpenChange,
  className,
}: BranchSelectorProps): ReactNode {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("branches");
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setIsOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const filteredBranches = branches.filter((b) => b.toLowerCase().includes(query.toLowerCase()));

  const filteredTags = tags.filter((t) => t.toLowerCase().includes(query.toLowerCase()));

  const showCreateBranch = onCreateBranch &&
    query.length > 0 &&
    tab === "branches" &&
    !branches.some((b) => b.toLowerCase() === query.toLowerCase());

  const isBranch = branches.includes(current);

  return (
    <PopoverRoot
      positioning={{ placement: "bottom-start" }}
      open={isOpen}
      onOpenChange={(details) => {
        setIsOpen(details.open);
        if (!details.open) {
          setQuery("");
          setTab("branches");
        }
      }}
      portalled={portalled}
    >
      <PopoverTrigger asChild>
        <button className={cx(triggerStyle, className)} type="button">
          <Icon
            name={isBranch ? "fork_right" : "sell"}
            size={16}
            className={triggerIcon}
          />
          <span className={triggerText}>{current}</span>
          <Icon name="expand_more" size={18} className={chevron} />
        </button>
      </PopoverTrigger>
      <PopoverPositioner>
        <PopoverContent className={dropdown}>
          <TabsRoot
            value={tab}
            onValueChange={(details) => {
              setTab(details.value);
              setQuery("");
            }}
          >
            <TabList className={tabList}>
              <TabTrigger value="branches" className={tabTriggerStyle}>
                Branches
              </TabTrigger>
              <TabTrigger value="tags" className={tabTriggerStyle}>
                Tags
              </TabTrigger>
            </TabList>

            <div className={searchWrapper}>
              <Icon name="search" size={16} className={searchIcon} />
              <input
                type="text"
                className={searchInput}
                placeholder={tab === "branches" ? "Filter branches..." : "Filter tags..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <TabContent value="branches">
              <div className={listWrapper}>
                {filteredBranches.map((branch) => (
                  <button
                    key={branch}
                    className={optionRow}
                    onClick={() => onChange(branch)}
                    type="button"
                  >
                    <Icon name="fork_right" size={16} className={refIcon} />
                    <span
                      className={cx(
                        refName,
                        current === branch ? currentRef : undefined,
                      )}
                    >
                      {branch}
                    </span>
                    {branch === defaultBranch && <span className={defaultBadge}>default</span>}
                    {current === branch && <Icon name="check" size={16} className={checkIcon} />}
                  </button>
                ))}
                {showCreateBranch && (
                  <button
                    className={createRow}
                    onClick={() => onCreateBranch(query)}
                    type="button"
                  >
                    <Icon name="add" size={16} className={refIcon} />
                    <span className={createText}>
                      Create branch: <strong>{query}</strong>
                    </span>
                  </button>
                )}
                {filteredBranches.length === 0 && !showCreateBranch && (
                  <span className={emptyText}>No branches found</span>
                )}
              </div>
            </TabContent>

            <TabContent value="tags">
              <div className={listWrapper}>
                {filteredTags.map((tag) => (
                  <button
                    key={tag}
                    className={optionRow}
                    onClick={() => onChange(tag)}
                    type="button"
                  >
                    <Icon name="sell" size={16} className={refIcon} />
                    <span
                      className={cx(
                        refName,
                        current === tag ? currentRef : undefined,
                      )}
                    >
                      {tag}
                    </span>
                    {current === tag && <Icon name="check" size={16} className={checkIcon} />}
                  </button>
                ))}
                {filteredTags.length === 0 && <span className={emptyText}>No tags found</span>}
              </div>
            </TabContent>
          </TabsRoot>
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
  fontFamily: "mono",
  fontSize: "13",
  color: "text.primary",
  minHeight: "9",
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
  whiteSpace: "nowrap",
});

const chevron = css({
  color: "text.muted",
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

const tabList = css({
  display: "flex",
  gap: "0",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.default",
});

const tabTriggerStyle = css({
  flex: 1,
  py: "2.5",
  px: "4",
  fontSize: "xs",
  fontWeight: "button",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  bg: "transparent",
  border: "none",
  cursor: "pointer",
  color: "text.muted",
  borderBottomWidth: "0.5",
  borderBottomStyle: "solid",
  borderBottomColor: "transparent",
  transition: "all 0.15s ease",
  _hover: {
    color: "text.primary",
  },
  _selected: {
    color: "sunbeam.orange",
    borderBottomColor: "sunbeam.orange",
  },
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
  gap: "2",
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

const refIcon = css({
  color: "text.muted",
  flexShrink: 0,
});

const refName = css({
  fontSize: "13",
  fontFamily: "mono",
  color: "text.primary",
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const currentRef = css({
  color: "sunbeam.orange",
  fontWeight: "button",
});

const defaultBadge = css({
  fontSize: "2xs",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "text.muted",
  backgroundColor: "bg.card",
  py: "0.5",
  px: "1.5",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  flexShrink: 0,
});

const checkIcon = css({
  color: "sunbeam.orange",
  flexShrink: 0,
});

const createRow = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  width: "100%",
  py: "2",
  px: "3",
  border: "none",
  background: "none",
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "body",
  borderTopWidth: "0.25",
  borderTopStyle: "solid",
  borderColor: "border.default",
  transition: "background-color 0.1s ease",
  _hover: {
    backgroundColor: "bg.card",
  },
});

const createText = css({
  fontSize: "13",
  color: "sunbeam.orange",
});

const emptyText = css({
  display: "block",
  padding: "4",
  fontSize: "13",
  color: "text.muted",
  textAlign: "center",
});
