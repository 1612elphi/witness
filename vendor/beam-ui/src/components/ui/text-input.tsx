import { css, cx } from "../../system.ts";

import { type ReactNode, useId } from "react";

/** Props for {@link TextInput}. */
export interface TextInputProps {
  /** Current input value. */
  value: string;
  /** Called when the input value changes. */
  onChange: (value: string) => void;
  /** Placeholder text displayed when empty. */
  placeholder?: string;
  /** Optional label displayed above the input. */
  label?: string;
  /** Error message displayed below the input with orange accent. */
  error?: string;
  /** Whether the input is disabled. Defaults to `false`. */
  disabled?: boolean;
  /** HTML input type. Defaults to `"text"`. */
  type?: "text" | "password" | "email" | "number";
  /** Optional CSS class applied to the wrapper. */
  className?: string;
}

/**
 * Foundational text input with optional label, error message, and type variants.
 * Supports accessibility attributes and automatic error styling.
 *
 * @example
 * ```tsx
 * const [email, setEmail] = useState("");
 * <TextInput
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   label="Email"
 *   placeholder="name@example.com"
 *   error={emailError ? "Invalid email" : undefined}
 * />
 * ```
 */
export function TextInput({
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  type = "text",
  className,
}: TextInputProps): ReactNode {
  const id = useId();
  const inputId = `text-input-${id}`;
  const errorId = `text-input-error-${id}`;

  return (
    <div className={cx(wrapper, className)}>
      {label && <label htmlFor={inputId} className={labelStyle}>{label}</label>}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cx(input, error ? inputError : undefined)}
      />
      {error && <p id={errorId} className={errorText} role="alert">{error}</p>}
    </div>
  );
}

const wrapper = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5",
  width: "100%",
});

const labelStyle = css({
  fontSize: "xs",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "text.secondary",
  fontFamily: "body",
});

const input = css({
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
  _placeholder: {
    color: "text.muted",
  },
});

const inputError = css({
  borderColor: "sunbeam.orange",
});

const errorText = css({
  fontSize: "xs",
  color: "sunbeam.orange",
  fontFamily: "body",
  margin: 0,
});
