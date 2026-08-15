import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";
import {
  createListCollection,
  SelectContent,
  SelectControl,
  SelectItem,
  SelectItemText,
  SelectPositioner,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@ark-ui/react/select";
import { Icon } from "./icon.tsx";

/** Single select option. */
interface SelectOption {
  /** Unique value. */
  value: string;
  /** Display label. */
  label: string;
}

/** Props for {@link Select}. */
export interface SelectProps {
  /** Array of available options. */
  options: SelectOption[];
  /** Currently selected value. */
  value: string;
  /** Fired when selection changes. */
  onChange: (value: string) => void;
  /** Placeholder text. Defaults to `"Select…"`. */
  placeholder?: string;
  /** Whether the options dropdown is open. Defaults to `false`. */
  open?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Disable the select. Defaults to `false`. */
  disabled?: boolean;
  /** Additional CSS class. */
  className?: string;
}

/**
 * Dropdown select using Ark UI with keyboard navigation and custom styling.
 * Displays dropdown below trigger by default.
 *
 * @example
 * ```tsx
 * <Select
 *   options={[
 *     { value: "a", label: "Option A" },
 *     { value: "b", label: "Option B" },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 *   placeholder="Choose..."
 * />
 * ```
 */
export function Select({
  options,
  value,
  onChange,
  placeholder = "Select…",
  open,
  onOpenChange,
  disabled = false,
  className,
}: SelectProps): ReactNode {
  const collection = createListCollection({
    items: options,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  });

  return (
    <SelectRoot
      collection={collection}
      value={[value]}
      onValueChange={(details) => {
        const next = details.value[0];
        if (next !== undefined) onChange(next);
      }}
      open={open}
      onOpenChange={(d) => onOpenChange?.(d.open)}
      disabled={disabled}
      positioning={{ sameWidth: true }}
    >
      <SelectControl className={cx(control, className)}>
        <SelectTrigger className={trigger}>
          <SelectValueText placeholder={placeholder} />
          <Icon name="expand_more" size={20} />
        </SelectTrigger>
      </SelectControl>

      <SelectPositioner>
        <SelectContent className={content}>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              item={option}
              className={item}
            >
              <SelectItemText>{option.label}</SelectItemText>
            </SelectItem>
          ))}
        </SelectContent>
      </SelectPositioner>
    </SelectRoot>
  );
}

const control = css({
  width: "100%",
});

const trigger = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  py: "2.5",
  px: "3",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "0",
  fontSize: "sm",
  fontFamily: "body",
  color: "text.primary",
  cursor: "pointer",
  outline: "none",
  transition: "all 0.15s ease",
  _focus: {
    ringWidth: "0.5",
    ringColor: "sunbeam.orange",
    borderColor: "transparent",
  },
  _disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

const content = css({
  backgroundColor: "bg.page",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  shadow: "golden",
  zIndex: 50,
  maxHeight: "60",
  overflowY: "auto",
});

const item = css({
  display: "flex",
  alignItems: "center",
  py: "2",
  px: "3",
  fontSize: "sm",
  fontFamily: "body",
  color: "text.primary",
  cursor: "pointer",
  transition: "all 0.1s ease",
  outline: "none",
  _hover: {
    backgroundColor: "bg.card",
  },
  _highlighted: {
    backgroundColor: "bg.card",
  },
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "-0.5",
  },
  _selected: {
    color: "sunbeam.orange",
  },
});
