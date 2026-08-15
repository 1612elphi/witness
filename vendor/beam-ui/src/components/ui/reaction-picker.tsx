import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";
import {
  PopoverCloseTrigger,
  PopoverContent,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from "@ark-ui/react/popover";

/** A single reaction with count and user toggle state. */
export interface Reaction {
  /** Emoji string. */
  emoji: string;
  /** Number of users who reacted with this emoji. */
  count: number;
  /** Whether the current user has reacted. */
  reacted: boolean;
}

/** Props for {@link ReactionPicker}. */
export interface ReactionPickerProps {
  /** Array of existing reactions to display. */
  reactions: Reaction[];
  /** Fired when existing reaction is clicked (toggle on/off). */
  onToggle: (emoji: string) => void;
  /** Fired when a new emoji is selected from the picker. */
  onAdd: (emoji: string) => void;
  /** Whether the add-reaction popover is open. Defaults to `false`. */
  open?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Additional CSS class. */
  className?: string;
}

const COMMON_EMOJIS = [
  "\u{1F44D}",
  "\u{1F44E}",
  "\u{1F604}",
  "\u{1F389}",
  "\u{1F615}",
  "\u{2764}\u{FE0F}",
  "\u{1F680}",
  "\u{1F440}",
];

/**
 * Reaction picker with existing reactions displayed and popover for adding new ones.
 * Shows common emoji grid (8 selections) in the add popover.
 *
 * @example
 * ```tsx
 * <ReactionPicker
 *   reactions={[{ emoji: "👍", count: 3, reacted: true }]}
 *   onToggle={(emoji) => console.log("Toggle:", emoji)}
 *   onAdd={(emoji) => console.log("Add:", emoji)}
 * />
 * ```
 */
export function ReactionPicker({
  reactions,
  onToggle,
  onAdd,
  open,
  onOpenChange,
  className,
}: ReactionPickerProps): ReactNode {
  return (
    <div className={cx(wrapper, className)}>
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          className={cx(
            reactionButton,
            reaction.reacted ? reactionActive : undefined,
          )}
          onClick={() => onToggle(reaction.emoji)}
          type="button"
        >
          <span className={emojiSpan}>{reaction.emoji}</span>
          <span className={countSpan}>{reaction.count}</span>
        </button>
      ))}

      <PopoverRoot
        positioning={{ placement: "bottom-start" }}
        open={open}
        onOpenChange={(d) => onOpenChange?.(d.open)}
      >
        <PopoverTrigger className={addButton}>
          +
        </PopoverTrigger>
        <PopoverPositioner>
          <PopoverContent className={pickerContent}>
            <div className={pickerHeader}>
              <span className={pickerTitle}>Add reaction</span>
              <PopoverCloseTrigger className={closeBtn}>
                &times;
              </PopoverCloseTrigger>
            </div>
            <div className={emojiGrid}>
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className={emojiButton}
                  onClick={() => onAdd(emoji)}
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </PopoverPositioner>
      </PopoverRoot>
    </div>
  );
}

const wrapper = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "1.5",
});

const reactionButton = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1",
  py: "1",
  px: "2.5",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "full",
  cursor: "pointer",
  fontSize: "13",
  fontFamily: "body",
  color: "text.primary",
  transition: "all 0.15s ease",
  _hover: {
    borderColor: "text.muted",
  },
});

const reactionActive = css({
  borderColor: "sunbeam.orange",
  backgroundColor: "bg.card",
});

const emojiSpan = css({
  fontSize: "15",
  lineHeight: 1,
});

const countSpan = css({
  fontSize: "xs",
  fontWeight: "button",
  color: "text.secondary",
  fontFamily: "mono",
});

const addButton = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "7.5",
  height: "7.5",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "dashed",
  borderColor: "border.default",
  borderRadius: "full",
  cursor: "pointer",
  fontSize: "md",
  color: "text.muted",
  transition: "all 0.15s ease",
  _hover: {
    borderColor: "sunbeam.orange",
    color: "sunbeam.orange",
  },
});

const pickerContent = css({
  backgroundColor: "bg.page",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  shadow: "golden",
  padding: "3",
  zIndex: 50,
  outline: "none",
  minWidth: "50",
});

const pickerHeader = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "2.5",
});

const pickerTitle = css({
  fontSize: "13",
  fontWeight: "heading",
  fontFamily: "body",
  color: "text.primary",
});

const closeBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "text.secondary",
  fontSize: "lg",
  lineHeight: 1,
  padding: "0.5",
  transition: "color 0.15s ease",
  _hover: {
    color: "sunbeam.orange",
  },
});

const emojiGrid = css({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "1",
});

const emojiButton = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "9",
  height: "9",
  fontSize: "xl",
  background: "none",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "transparent",
  borderRadius: "md",
  cursor: "pointer",
  transition: "all 0.15s ease",
  _hover: {
    backgroundColor: "bg.card",
    borderColor: "border.default",
  },
});
