import { css } from "../../system.ts";

import { type ReactNode, useId } from "react";
import {
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemHiddenInput,
  RadioGroupItemText,
  RadioGroupRoot,
} from "@ark-ui/react/radio-group";

/** Single radio option. */
interface RadioOption {
  /** Unique value for this option. */
  value: string;
  /** Display label. */
  label: string;
}

/** Props for {@link RadioGroup}. */
export interface RadioGroupProps {
  /** Array of radio options. */
  options: RadioOption[];
  /** Currently selected value. */
  value: string;
  /** Fired when selection changes. */
  onChange: (value: string) => void;
  /** Optional group label. */
  label?: string;
}

/**
 * Radio button group with keyboard navigation and optional label.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   options={[
 *     { value: "opt1", label: "Option 1" },
 *     { value: "opt2", label: "Option 2" },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 *   label="Choose one:"
 * />
 * ```
 */
export function RadioGroup(
  { options, value, onChange, label }: RadioGroupProps,
): ReactNode {
  const labelId = useId();
  return (
    <RadioGroupRoot
      value={value}
      onValueChange={(details) => onChange(details.value)}
      className={root}
      aria-labelledby={label ? labelId : undefined}
    >
      {label && <span className={groupLabel} id={labelId}>{label}</span>}
      {options.map((option) => (
        <RadioGroupItem
          key={option.value}
          value={option.value}
          className={item}
        >
          <RadioGroupItemControl className={control} />
          <RadioGroupItemText className={text}>
            {option.label}
          </RadioGroupItemText>
          <RadioGroupItemHiddenInput />
        </RadioGroupItem>
      ))}
    </RadioGroupRoot>
  );
}

const root = css({
  display: "flex",
  flexDirection: "column",
  gap: "2.5",
});

const groupLabel = css({
  fontSize: "sm",
  fontWeight: "body",
  color: "text.primary",
  fontFamily: "body",
  marginBottom: "0.5",
});

const item = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  cursor: "pointer",
});

const control = css({
  width: "4.5",
  height: "4.5",
  borderRadius: "full",
  borderWidth: "0.5",
  borderStyle: "solid",
  borderColor: "border.default",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "all 0.15s ease",
  _checked: {
    borderColor: "sunbeam.orange",
  },
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.5",
  },
  _before: {
    content: '""',
    display: "block",
    width: "2",
    height: "2",
    borderRadius: "full",
    backgroundColor: "transparent",
    transition: "all 0.15s ease",
  },
  "&[data-state=checked]::before": {
    backgroundColor: "sunbeam.orange",
  },
});

const text = css({
  fontSize: "sm",
  color: "text.primary",
  fontFamily: "body",
  lineHeight: 1.4,
});
