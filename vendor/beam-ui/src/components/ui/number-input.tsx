import { css } from "../../system.ts";

import {
  NumberInputControl,
  NumberInputDecrementTrigger,
  NumberInputIncrementTrigger,
  NumberInputInput,
  NumberInputLabel,
  NumberInputRoot,
} from "@ark-ui/react/number-input";
import type { ReactNode } from "react";

/** Props for {@link NumberInput}. */
export interface NumberInputProps {
  /** Current numeric value. */
  value: number;
  /** Called when user types or clicks increment/decrement buttons. Receives new number. */
  onChange: (value: number) => void;
  /** Minimum allowed value (inclusive). */
  min?: number;
  /** Maximum allowed value (inclusive). */
  max?: number;
  /** Increment/decrement step size. Defaults to `1`. */
  step?: number;
  /** Optional label text above the input. */
  label?: string;
}

/**
 * Spinbox input for numeric values with increment/decrement buttons and optional min/max constraints.
 * Supports mouse wheel for scrolling adjustment.
 *
 * @example
 * ```tsx
 * <NumberInput
 *   value={count}
 *   onChange={setCount}
 *   min={0}
 *   max={100}
 *   step={5}
 *   label="Quantity"
 * />
 * ```
 */
export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
}: NumberInputProps): ReactNode {
  return (
    <NumberInputRoot
      value={value != null ? String(value) : ""}
      onValueChange={(details) => {
        const n = details.valueAsNumber;
        onChange(Number.isNaN(n) ? 0 : n);
      }}
      allowMouseWheel
      min={min}
      max={max}
      step={step}
      className={root}
    >
      {label && <NumberInputLabel className={labelStyle}>{label}</NumberInputLabel>}
      <NumberInputControl className={control}>
        <NumberInputDecrementTrigger
          className={trigger}
          aria-label="Decrease value"
        >
          <svg
            width="12"
            height="2"
            viewBox="0 0 12 2"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 1h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </NumberInputDecrementTrigger>
        <NumberInputInput className={input} readOnly={false} />
        <NumberInputIncrementTrigger
          className={trigger}
          aria-label="Increase value"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 0v12M0 6h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </NumberInputIncrementTrigger>
      </NumberInputControl>
    </NumberInputRoot>
  );
}

const root = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5",
});

const labelStyle = css({
  fontSize: "sm",
  fontWeight: "body",
  color: "text.primary",
  fontFamily: "body",
});

const control = css({
  display: "flex",
  alignItems: "center",
  borderRadius: "md",
  border: "1px solid",
  borderColor: "border.default",
  overflow: "hidden",
});

const input = css({
  width: "100%",
  paddingBlock: "2",
  paddingInline: "3",
  fontSize: "sm",
  fontFamily: "body",
  fontWeight: "body",
  color: "text.primary",
  backgroundColor: "bg.card",
  border: "none",
  outline: "none",
  textAlign: "center",
  _focus: {
    boxShadow: "0 0 0 2px token(colors.sunbeam.orange)",
  },
});

const trigger = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "9",
  height: "9",
  flexShrink: 0,
  backgroundColor: "sunbeam.orange",
  color: "white",
  border: "none",
  cursor: "pointer",
  transition: "all 0.15s ease",
  _hover: {
    backgroundColor: "sunbeam.flame",
  },
  _focus: {
    outline: "2px solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.5",
  },
  _disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});
