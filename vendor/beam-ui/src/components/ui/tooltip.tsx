import { css } from "../../system.ts";

import type { ReactNode } from "react";
import {
  TooltipArrow,
  TooltipArrowTip,
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
} from "@ark-ui/react/tooltip";

/** Props for {@link Tooltip}. */
export interface TooltipProps {
  /** Tooltip text displayed on hover. */
  content: string;
  /** Element that triggers the tooltip. */
  children: ReactNode;
  /** Tooltip placement relative to the trigger. Defaults to `"top"`. */
  position?: "top" | "bottom" | "left" | "right";
  /** Whether the tooltip is open. Defaults to `false`. */
  open?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
}

const contentStyle = css({
  backgroundColor: "sunbeam.black",
  color: "white",
  fontSize: "xs",
  py: "1.5",
  px: "3",
  borderRadius: "sm",
  lineHeight: 1.4,
  maxWidth: "60",
  zIndex: 1000,
});

const arrowStyle = css({
  "--arrow-size": "8px",
  "--arrow-background": "var(--colors-sunbeam-black)",
});

/**
 * Accessible tooltip using Ark UI with 200ms open delay and positioned arrow.
 * Content is plain text; black background with white text.
 *
 * @example
 * ```tsx
 * <Tooltip content="Save changes" position="top">
 *   <button type="button">Save</button>
 * </Tooltip>
 * ```
 */
export function Tooltip(
  { content, children, position = "top", open, onOpenChange }: TooltipProps,
): ReactNode {
  return (
    <TooltipRoot
      openDelay={200}
      positioning={{ placement: position }}
      open={open}
      onOpenChange={(d) => onOpenChange?.(d.open)}
    >
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipPositioner>
        <TooltipContent className={contentStyle}>
          <TooltipArrow className={arrowStyle}>
            <TooltipArrowTip />
          </TooltipArrow>
          {content}
        </TooltipContent>
      </TooltipPositioner>
    </TooltipRoot>
  );
}
