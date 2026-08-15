import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";
import {
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
  SwitchThumb,
} from "@ark-ui/react/switch";

/** Props for {@link Switch}. */
export interface SwitchProps {
  /** Checked state. */
  checked: boolean;
  /** Fired when toggled. */
  onChange: (checked: boolean) => void;
  /** Optional label beside the toggle. */
  label?: string;
  /** Disable interaction. Defaults to `false`. */
  disabled?: boolean;
  /** Additional CSS class. */
  className?: string;
}

/**
 * Accessible toggle switch with optional label using Ark UI.
 * Animated thumb with orange accent when checked.
 *
 * @example
 * ```tsx
 * <Switch checked={enabled} onChange={setEnabled} label="Dark mode" />
 * ```
 */
export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}: SwitchProps): ReactNode {
  return (
    <SwitchRoot
      checked={checked}
      onCheckedChange={(details) => onChange(details.checked)}
      disabled={disabled}
      className={cx(root, className)}
    >
      <SwitchControl className={control}>
        <SwitchThumb className={thumb} />
      </SwitchControl>
      {label && <SwitchLabel className={labelStyle}>{label}</SwitchLabel>}
      <SwitchHiddenInput />
    </SwitchRoot>
  );
}

const root = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  cursor: "pointer",
  _disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

const control = css({
  display: "inline-flex",
  alignItems: "center",
  width: "10",
  height: "6",
  padding: "0.5",
  borderRadius: "full",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  transition: "all 0.2s ease",
  flexShrink: 0,
  "&[data-state=checked]": {
    backgroundColor: "sunbeam.orange",
    borderColor: "sunbeam.orange",
  },
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.5",
  },
});

const thumb = css({
  width: "4.5",
  height: "4.5",
  borderRadius: "full",
  backgroundColor: "white",
  transition: "transform 0.2s ease",
  boxShadow: "thumb",
  "&[data-state=checked]": {
    transform: "translateX(16px)",
  },
});

const labelStyle = css({
  fontSize: "sm",
  color: "text.primary",
  fontFamily: "body",
  lineHeight: 1.4,
  userSelect: "none",
});
