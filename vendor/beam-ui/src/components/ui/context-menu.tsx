import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";
import {
  MenuContent,
  MenuContextTrigger,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuSeparator,
} from "@ark-ui/react/menu";
import { Icon } from "./icon.tsx";

/** Single menu item in a {@link ContextMenu}. */
interface ContextMenuItem {
  /** Display label for the menu item. */
  label: string;
  /** Optional Material Design icon name. */
  icon?: string;
  /** Callback fired when the user clicks this item. */
  onClick: () => void;
  /** If true, the item is styled as a destructive action (e.g., delete, remove). */
  danger?: boolean;
  /** If true, a separator line is drawn above this item. */
  divider?: boolean;
}

/** Props for {@link ContextMenu}. */
export interface ContextMenuProps {
  /** Array of menu items to display. */
  items: ContextMenuItem[];
  /** Element or component that triggers the context menu on right-click. */
  children: ReactNode;
  /** Whether the context menu is open. Defaults to `false`. */
  open?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Right-click context menu with optional icons and danger styling.
 *
 * Wraps Ark UI's MenuRoot with contextual positioning. Provides danger item styling for
 * destructive actions. Renders below or above the pointer based on viewport space.
 *
 * @example
 * ```tsx
 * <ContextMenu
 *   items={[
 *     { label: "Edit", icon: "edit", onClick: () => edit() },
 *     { label: "Delete", icon: "delete", onClick: () => delete(), danger: true }
 *   ]}
 * >
 *   <span>Right-click me</span>
 * </ContextMenu>
 * ```
 */

const contentStyle = css({
  backgroundColor: "bg.page",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  shadow: "golden",
  padding: "1",
  minWidth: "45",
  zIndex: 1000,
});

const itemStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  fontSize: "sm",
  py: "2",
  px: "3",
  cursor: "pointer",
  color: "text.primary",
  transition: "background 0.15s ease",
  _hover: { backgroundColor: "bg.card" },
});

const itemDangerStyle = css({
  _hover: { color: "sunbeam.orange" },
});

const iconStyle = css({
  color: "text.secondary",
});

const separatorStyle = css({
  height: "0.25",
  backgroundColor: "border.default",
  my: "1",
  mx: "0",
});

const rootWrapper = css({
  display: "inline-block",
  width: "fit-content",
});

// ContextMenu function is documented above, before the const contentStyle declaration
export function ContextMenu({
  items,
  children,
  open,
  onOpenChange,
}: ContextMenuProps): ReactNode {
  return (
    <div className={rootWrapper}>
      <MenuRoot open={open} onOpenChange={(d) => onOpenChange?.(d.open)}>
        <MenuContextTrigger asChild>{children}</MenuContextTrigger>
        <MenuPositioner>
          <MenuContent className={contentStyle}>
            {items.map((item, i) => (
              <div key={i}>
                {item.divider && <MenuSeparator className={separatorStyle} />}
                <MenuItem
                  value={item.label}
                  className={cx(itemStyle, item.danger && itemDangerStyle)}
                  onClick={item.onClick}
                >
                  {item.icon && <Icon name={item.icon} size={16} className={iconStyle} />}
                  {item.label}
                </MenuItem>
              </div>
            ))}
          </MenuContent>
        </MenuPositioner>
      </MenuRoot>
    </div>
  );
}
