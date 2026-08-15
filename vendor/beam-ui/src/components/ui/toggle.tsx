import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";
import { ToggleRoot } from "@ark-ui/react/toggle";

/** Props for {@link Toggle}. */
export interface ToggleProps {
  /** Whether the toggle is currently pressed (active). */
  pressed: boolean;
  /** Called when the toggle is clicked with the new pressed state. */
  onChange: (pressed: boolean) => void;
  /** Content displayed inside the button (text, icon, or both). */
  children: ReactNode;
  /** Optional CSS class applied to the button. */
  className?: string;
}

/**
 * Button-style toggle using Ark UI that tracks pressed state.
 * Changes appearance when active; fires onChange when clicked.
 *
 * @example
 * ```tsx
 * const [bold, setBold] = useState(false);
 * <Toggle pressed={bold} onChange={setBold}>
 *   <Icon name="format_bold" size={18} />
 * </Toggle>
 * ```
 */
export function Toggle(
  { pressed, onChange, children, className }: ToggleProps,
): ReactNode {
  return (
    <ToggleRoot
      pressed={pressed}
      onPressedChange={(pressed) => onChange(pressed)}
      className={cx(
        toggle,
        pressed ? togglePressed : toggleUnpressed,
        className,
      )}
    >
      {children}
    </ToggleRoot>
  );
}

const toggle = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1.5",
  py: "2",
  px: "4",
  fontSize: "sm",
  fontFamily: "body",
  fontWeight: "button",
  borderWidth: "0.25",
  borderStyle: "solid",
  cursor: "pointer",
  transition: "all 0.15s ease",
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.5",
  },
});

const toggleUnpressed = css({
  backgroundColor: "bg.card",
  color: "text.primary",
  borderColor: "border.default",
  _hover: {
    borderColor: "sunbeam.orange",
  },
});

const togglePressed = css({
  backgroundColor: "sunbeam.orange",
  color: "white",
  borderColor: "sunbeam.orange",
  _hover: {
    backgroundColor: "sunbeam.flame",
  },
});
