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
interface TweakRadioOption {
  /** Unique value for this option. */
  value: string;
  /** Display label. */
  label: string;
}

/** Props for {@link TweakRadio}. */
interface TweakRadioProps {
  /** Control label. */
  label: string;
  /** Currently selected value. */
  value: string;
  /** Array of radio options. */
  options: TweakRadioOption[];
  /** Fired when selection changes. */
  onChange: (value: string) => void;
}

/**
 * Single-select radio control for tweaks panel.
 * Renders a label and horizontal row of pill buttons.
 *
 * @example
 * ```tsx
 * <TweakRadio
 *   label="Density"
 *   value={density}
 *   options={[
 *     { value: "compact", label: "Compact" },
 *     { value: "regular", label: "Regular" },
 *   ]}
 *   onChange={setDensity}
 * />
 * ```
 */
export function TweakRadio({
  label,
  value,
  options,
  onChange,
}: TweakRadioProps): ReactNode {
  const labelId = useId();
  return (
    <div className={root}>
      <label htmlFor={labelId} className={labelStyle}>
        {label}
      </label>
      <RadioGroupRoot
        id={labelId}
        value={value}
        onValueChange={(details) => onChange(details.value)}
        className={group}
        aria-labelledby={labelId}
      >
        {options.map((option) => (
          <RadioGroupItem
            key={option.value}
            value={option.value}
            className={item}
            data-state={value === option.value ? "checked" : "unchecked"}
          >
            <RadioGroupItemControl className={control} />
            <RadioGroupItemText className={text}>
              {option.label}
            </RadioGroupItemText>
            <RadioGroupItemHiddenInput />
          </RadioGroupItem>
        ))}
      </RadioGroupRoot>
    </div>
  );
}

const root = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5",
});

const labelStyle = css({
  fontSize: "13",
  fontWeight: 500,
  color: "text.primary",
  fontFamily: "body",
  lineHeight: 1.4,
});

const group = css({
  display: "flex",
  gap: "1.5",
  flexWrap: "wrap",
});

const item = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0",
  cursor: "pointer",
  flexShrink: 0,
});

const control = css({
  width: "4.5",
  height: "4.5",
  borderRadius: "full",
  border: "1.5px solid",
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
    width: "1.5",
    height: "1.5",
    borderRadius: "full",
    backgroundColor: "transparent",
    transition: "all 0.15s ease",
  },
  "&[data-state=checked]::before": {
    backgroundColor: "sunbeam.orange",
  },
});

const text = css({
  fontSize: "13",
  color: "text.primary",
  fontFamily: "body",
  lineHeight: 1.4,
  paddingX: "1.5",
});
