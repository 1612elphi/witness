import { css } from "../../system.ts";

import type { ReactNode } from "react";
import { TabContent, TabIndicator, TabList, TabsRoot, TabTrigger } from "@ark-ui/react/tabs";

/** Tab definition for {@link Tabs}. */
interface TabItem {
  /** Unique identifier for the tab. */
  value: string;
  /** Display label for the tab trigger. */
  label: string;
}

/** Props for {@link Tabs}. */
export interface TabsProps {
  /** Array of tab items with value and label. */
  items: TabItem[];
  /** Currently active tab value. */
  activeValue: string;
  /** Called when a tab is clicked with its value. */
  onChange: (value: string) => void;
  /** Visual style. Defaults to `"default"`. */
  variant?: "default" | "dark";
}

const tabList = css({
  display: "flex",
  gap: "8",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.subtle",
  marginBottom: "8",
});

const tabListDark = css({
  display: "flex",
  gap: "6",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "chrome.10",
  marginBottom: "6",
});

const tabTrigger = css({
  paddingBottom: "4",
  fontSize: "xs",
  fontWeight: "button",
  letterSpacing: "0.15em",
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

const tabTriggerDark = css({
  paddingBottom: "3",
  fontSize: "11",
  fontWeight: "button",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  bg: "transparent",
  border: "none",
  cursor: "pointer",
  color: "chrome.40",
  borderBottomWidth: "0.5",
  borderBottomStyle: "solid",
  borderBottomColor: "transparent",
  transition: "all 0.15s ease",
  _hover: {
    color: "chrome.60",
  },
  _selected: {
    color: "sunbeam.orange",
    borderBottomColor: "sunbeam.orange",
  },
});

/**
 * Accessible tab component using Ark UI primitives with customizable visual variants.
 * Manages tab selection state and triggers content display via controlled value.
 *
 * @example
 * ```tsx
 * const [active, setActive] = useState("overview");
 * <Tabs
 *   items={[
 *     { value: "overview", label: "Overview" },
 *     { value: "details", label: "Details" },
 *   ]}
 *   activeValue={active}
 *   onChange={setActive}
 *   variant="default"
 * />
 * ```
 */
export function Tabs(
  { items, activeValue, onChange, variant = "default" }: TabsProps,
): ReactNode {
  const isDark = variant === "dark";

  return (
    <TabsRoot
      value={activeValue}
      onValueChange={(details) => onChange(details.value)}
    >
      <TabList className={isDark ? tabListDark : tabList}>
        {items.map((item) => (
          <TabTrigger
            key={item.value}
            value={item.value}
            className={isDark ? tabTriggerDark : tabTrigger}
          >
            {item.label}
          </TabTrigger>
        ))}
        <TabIndicator />
      </TabList>

      {items.map((item) => <TabContent key={item.value} value={item.value} />)}
    </TabsRoot>
  );
}
