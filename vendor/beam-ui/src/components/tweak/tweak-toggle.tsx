import { css } from "../../system.ts";

import type { ReactNode } from "react";
import { Switch } from "../ui/switch.tsx";

/** Props for {@link TweakToggle}. */
interface TweakToggleProps {
  /** Control label. */
  label: string;
  /** Current toggle state. */
  value: boolean;
  /** Fired when toggled. */
  onChange: (value: boolean) => void;
}

/**
 * Boolean toggle control for tweaks panel.
 * Renders a label with a Switch component.
 *
 * @example
 * ```tsx
 * <TweakToggle
 *   label="Show WIP limits"
 *   value={showWip}
 *   onChange={setShowWip}
 * />
 * ```
 */
export function TweakToggle({
  label,
  value,
  onChange,
}: TweakToggleProps): ReactNode {
  return (
    <div className={root}>
      <label className={labelStyle}>{label}</label>
      <Switch checked={value} onChange={onChange} />
    </div>
  );
}

const root = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "3",
});

const labelStyle = css({
  fontSize: "13",
  fontWeight: 500,
  color: "text.primary",
  fontFamily: "body",
  lineHeight: 1.4,
  flex: 1,
});
