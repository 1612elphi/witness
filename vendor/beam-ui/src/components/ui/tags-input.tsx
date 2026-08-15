import { css } from "../../system.ts";

import type { ReactNode } from "react";
import {
  TagsInputControl,
  TagsInputHiddenInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDeleteTrigger,
  TagsInputItemPreview,
  TagsInputItemText,
  TagsInputLabel,
  TagsInputRoot,
} from "@ark-ui/react/tags-input";

/** Props for {@link TagsInput}. */
export interface TagsInputProps {
  /** Array of tag strings. */
  value: string[];
  /** Called when tags are added or removed with the updated array. */
  onChange: (value: string[]) => void;
  /** Placeholder text for the input. Defaults to `"Add tag..."`. */
  placeholder?: string;
  /** Maximum number of tags allowed. */
  max?: number;
  /** Optional label displayed above the input. */
  label?: string;
}

/**
 * Tag input using Ark UI with search, add/remove, and optional label.
 * Tags are displayed as removable pills; new tags are typed and confirmed via Enter.
 *
 * @example
 * ```tsx
 * const [tags, setTags] = useState(["react", "typescript"]);
 * <TagsInput
 *   value={tags}
 *   onChange={setTags}
 *   label="Framework tags"
 *   max={5}
 * />
 * ```
 */
export function TagsInput({
  value,
  onChange,
  placeholder = "Add tag...",
  max,
  label,
}: TagsInputProps): ReactNode {
  return (
    <TagsInputRoot
      value={value}
      onValueChange={(details) => onChange(details.value)}
      max={max}
      className={root}
    >
      {label && <TagsInputLabel className={labelStyle}>{label}</TagsInputLabel>}
      <TagsInputControl className={control}>
        {value.map((tag, index) => (
          <TagsInputItem key={index} index={index} value={tag} className={item}>
            <TagsInputItemPreview className={itemPreview}>
              <TagsInputItemText>{tag}</TagsInputItemText>
              <TagsInputItemDeleteTrigger
                className={deleteTrigger}
                aria-label={`Remove ${tag}`}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1l8 8M9 1l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </TagsInputItemDeleteTrigger>
            </TagsInputItemPreview>
          </TagsInputItem>
        ))}
        <TagsInputInput className={input} placeholder={placeholder} />
      </TagsInputControl>
      <TagsInputHiddenInput />
    </TagsInputRoot>
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
  flexWrap: "wrap",
  alignItems: "center",
  gap: "1.5",
  paddingBlock: "1.5",
  paddingInline: "2",
  borderRadius: "md",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  backgroundColor: "transparent",
  transition: "all 0.15s ease",
  _focusWithin: {
    borderColor: "sunbeam.orange",
    boxShadow: "focusRing.lg",
  },
});

const item = css({
  display: "inline-flex",
});

const itemPreview = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1",
  paddingBlock: "0.5",
  paddingInline: "2",
  borderRadius: "sm",
  backgroundColor: "sunbeam.orange/10",
  color: "sunbeam.orange",
  fontSize: "13",
  fontFamily: "body",
  fontWeight: "body",
  lineHeight: 1.4,
});

const deleteTrigger = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "sunbeam.orange",
  opacity: 0.7,
  background: "none",
  border: "none",
  pt: "0",
  pr: "0",
  pb: "0",
  pl: "0.5",
  _hover: {
    opacity: 1,
  },
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.25",
  },
});

const input = css({
  flex: 1,
  minWidth: "20",
  py: "1",
  px: "0",
  fontSize: "sm",
  fontFamily: "body",
  fontWeight: "body",
  color: "text.primary",
  backgroundColor: "transparent",
  border: "none",
  outline: "none",
  _placeholder: {
    color: "text.muted",
  },
});
