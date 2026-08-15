import { css, cx } from "../../system.ts";

import { type ReactNode, useEffect, useRef } from "react";

/** Props for {@link Checkbox}. */
export interface CheckboxProps {
  /** Whether the checkbox is checked. */
  checked: boolean;
  /** Called with the new checked state when the user toggles the checkbox. */
  onChange: (checked: boolean) => void;
  /** Optional label text displayed next to the checkbox. */
  label?: string;
  /** If true, disables interaction. Defaults to false. */
  disabled?: boolean;
  /** If true, shows a dash (indeterminate state) instead of a checkmark. Defaults to false. */
  indeterminate?: boolean;
  /** Additional Panda CSS classes. */
  className?: string;
}

/**
 * Custom checkbox with optional label, indeterminate state, and focus styling.
 *
 * Uses a hidden native input with styled visual box. Supports three states: unchecked,
 * checked (with checkmark), and indeterminate (with dash). Hover and focus-visible styling included.
 *
 * @example
 * ```tsx
 * <Checkbox
 *   checked={agreed}
 *   onChange={setAgreed}
 *   label="I agree to the terms"
 *   indeterminate={someButNotAll}
 * />
 * ```
 */
export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  indeterminate = false,
  className,
}: CheckboxProps): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label
      className={cx(
        wrapper,
        disabled ? disabledStyle : undefined,
        className,
      )}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={hiddenInput}
      />
      <div
        className={cx(
          box,
          checked || indeterminate ? boxChecked : undefined,
        )}
      >
        {indeterminate
          ? (
            <svg
              width="10"
              height="2"
              viewBox="0 0 10 2"
              fill="none"
              aria-hidden="true"
            >
              <rect width="10" height="2" rx="1" fill="white" />
            </svg>
          )
          : checked
          ? (
            <svg
              width="10"
              height="8"
              viewBox="0 0 10 8"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 4L3.5 6.5L9 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )
          : null}
      </div>
      {label && <span className={labelStyle}>{label}</span>}
    </label>
  );
}

const wrapper = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  cursor: "pointer",
  userSelect: "none",
});

const disabledStyle = css({
  opacity: 0.5,
  cursor: "not-allowed",
});

const hiddenInput = css({
  position: "absolute",
  width: "0.25",
  height: "0.25",
  padding: 0,
  margin: "-0.25",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
});

const box = css({
  width: "4.5",
  height: "4.5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "sm",
  backgroundColor: "transparent",
  transition: "all 0.15s ease",
  flexShrink: 0,
  "input:focus-visible + &": {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.5",
  },
});

const boxChecked = css({
  backgroundColor: "accent",
  borderColor: "accent",
});

const labelStyle = css({
  fontSize: "sm",
  color: "text.primary",
  fontFamily: "body",
  lineHeight: 1.4,
});
