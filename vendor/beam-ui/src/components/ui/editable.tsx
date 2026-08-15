import { css, cx } from "../../system.ts";

import { EditableArea, EditableInput, EditablePreview, EditableRoot } from "@ark-ui/react/editable";
import type { ReactNode } from "react";

/** Props for {@link Editable}. */
export interface EditableProps {
  /** Current text value (shown in preview mode). */
  value: string;
  /** Callback fired when the user submits an edit; receives the new text. */
  onChange: (value: string) => void;
  /** Placeholder text shown in edit mode if the field is empty. Defaults to `"Click to edit..."`. */
  placeholder?: string;
  /** Extra CSS class names to apply to the root container. */
  className?: string;
}

/**
 * Click-to-edit inline text field with preview and input modes.
 *
 * Displays text as a clickable preview; clicking enters edit mode with an input field.
 * Press Enter to submit changes, Escape to cancel. Integrates with Ark UI's EditableRoot.
 *
 * @example
 * ```tsx
 * <Editable value={title} onChange={setTitle} placeholder="Untitled" />
 * ```
 */
export function Editable({
  value,
  onChange,
  placeholder = "Click to edit...",
  className,
}: EditableProps): ReactNode {
  return (
    <EditableRoot
      value={value}
      onValueChange={(details) => onChange(details.value)}
      activationMode="click"
      submitMode="enter"
      placeholder={placeholder}
      className={cx(root, className)}
    >
      <EditableArea className={area}>
        <EditableInput className={input} />
        <EditablePreview className={preview} />
      </EditableArea>
    </EditableRoot>
  );
}

const root = css({
  width: "100%",
});

const area = css({
  width: "100%",
});

const preview = css({
  width: "100%",
  py: "2",
  px: "0",
  fontSize: "sm",
  fontFamily: "body",
  color: "text.primary",
  cursor: "pointer",
  lineHeight: 1.5,
  _placeholder: {
    color: "text.muted",
  },
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.5",
  },
});

const input = css({
  width: "100%",
  py: "2",
  px: "3",
  fontSize: "sm",
  fontFamily: "body",
  color: "text.primary",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "0",
  outline: "none",
  lineHeight: 1.5,
  transition: "all 0.15s ease",
  caretColor: "text.primary",
  _focus: {
    ringWidth: "0.5",
    ringColor: "sunbeam.orange",
    borderColor: "transparent",
    color: "text.primary",
  },
});
