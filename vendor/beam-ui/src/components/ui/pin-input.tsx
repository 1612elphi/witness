import { css } from "../../system.ts";

import {
  PinInputControl,
  PinInputHiddenInput,
  PinInputInput,
  PinInputLabel,
  PinInputRoot,
} from "@ark-ui/react/pin-input";
import type { ReactNode } from "react";

/** Props for {@link PinInput}. */
export interface PinInputProps {
  /** Number of input slots. Defaults to `4`. */
  length?: number;
  /** Current value as a concatenated string. */
  value: string;
  /** Fired when value changes. */
  onChange: (value: string) => void;
  /** Mask input (show dots instead of digits). Defaults to `false`. */
  mask?: boolean;
  /** Optional label above the input. */
  label?: string;
}

/**
 * PIN/OTP input with customizable length and optional masking.
 *
 * @example
 * ```tsx
 * const [pin, setPin] = useState("");
 * <PinInput value={pin} onChange={setPin} length={6} label="Verification Code" />
 * ```
 */
export function PinInput({
  length = 4,
  value,
  onChange,
  mask = false,
  label,
}: PinInputProps): ReactNode {
  // Pad the value array so Ark always sees the right number of slots
  const values = Array.from({ length }, (_, i) => value[i] ?? "");

  return (
    <PinInputRoot
      value={values}
      onValueChange={(details) => onChange(details.value.join(""))}
      mask={mask}
      otp
      className={root}
    >
      {label && <PinInputLabel className={labelStyle}>{label}</PinInputLabel>}
      <PinInputControl className={control}>
        {Array.from(
          { length },
          (_, i) => <PinInputInput key={i} index={i} className={input} />,
        )}
      </PinInputControl>
      <PinInputHiddenInput />
    </PinInputRoot>
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
  gap: "2",
});

const input = css({
  width: "12",
  height: "12",
  textAlign: "center",
  fontSize: "lg",
  fontWeight: "heading",
  fontFamily: "body",
  color: "text.primary",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "md",
  outline: "none",
  transition: "all 0.15s ease",
  _focus: {
    borderColor: "sunbeam.orange",
    boxShadow: "focusRing.2xl",
  },
});
