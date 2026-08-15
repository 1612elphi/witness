import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";
import {
  HoverCardContent,
  HoverCardPositioner,
  HoverCardRoot,
  HoverCardTrigger,
} from "@ark-ui/react/hover-card";

/** Props for {@link HoverCard}. */
export interface HoverCardProps {
  /** Content that triggers the hover card on mouse hover. */
  trigger: ReactNode;
  /** Content displayed in the popover when hovering. */
  children: ReactNode;
  /** Whether the hover card is open. Defaults to `false`. */
  open?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Optional CSS class for the popover content container. */
  className?: string;
}

/**
 * Popover that appears on hover with a 300ms open delay and 100ms close delay.
 *
 * @example
 * ```tsx
 * <HoverCard trigger={<span>Hover me</span>}>
 *   <p>This appears on hover</p>
 * </HoverCard>
 * ```
 */
export function HoverCard(
  { trigger, children, open, onOpenChange, className }: HoverCardProps,
): ReactNode {
  return (
    <HoverCardRoot
      openDelay={300}
      closeDelay={100}
      open={open}
      onOpenChange={(d) => onOpenChange?.(d.open)}
    >
      <HoverCardTrigger asChild>
        <span className={triggerStyle}>{trigger}</span>
      </HoverCardTrigger>
      <HoverCardPositioner>
        <HoverCardContent className={cx(content, className)}>
          {children}
        </HoverCardContent>
      </HoverCardPositioner>
    </HoverCardRoot>
  );
}

const triggerStyle = css({
  display: "inline-flex",
  cursor: "pointer",
});

const content = css({
  backgroundColor: "bg.page",
  border: "1px solid",
  borderColor: "border.default",
  shadow: "golden",
  padding: "4",
  fontSize: "sm",
  fontFamily: "body",
  color: "text.primary",
  lineHeight: 1.5,
  zIndex: 50,
  maxWidth: "80",
});
