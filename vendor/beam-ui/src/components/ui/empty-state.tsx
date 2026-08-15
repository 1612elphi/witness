import { css } from "../../system.ts";

import type { ReactNode } from "react";
import { Icon } from "./icon.tsx";

/** Props for {@link EmptyState}. */
export interface EmptyStateProps {
  /** Optional Material Design icon name (e.g., "inbox_zero", "search"). */
  icon?: string;
  /** Main heading displayed in the empty state. */
  title: string;
  /** Optional explanatory text shown below the title. */
  description?: string;
  /** Optional call-to-action button or element (e.g., a "Create" button). */
  action?: ReactNode;
}

/**
 * Centered empty state with icon, title, description, and optional action button.
 *
 * Used to inform users when a list, search result, or section is empty.
 * Provides a clear message and optional next steps via an action element.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="inbox_zero"
 *   title="No items"
 *   description="Create a new item to get started."
 *   action={<Button onClick={onCreate}>Create Item</Button>}
 * />
 * ```
 */

const containerStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "16",
  textAlign: "center",
  gap: "4",
});

const iconStyle = css({
  color: "text.muted",
});

const titleStyle = css({
  fontSize: "2xl",
  fontWeight: "heading",
  color: "text.primary",
  lineHeight: 1.3,
});

const descriptionStyle = css({
  fontSize: "sm",
  color: "text.secondary",
  lineHeight: 1.6,
  maxWidth: "100",
});

const actionStyle = css({
  marginTop: "2",
});

// EmptyState is documented above, before const containerStyle
export function EmptyState(
  { icon, title, description, action }: EmptyStateProps,
): ReactNode {
  return (
    <div className={containerStyle}>
      {icon && <Icon name={icon} size={48} className={iconStyle} />}
      <h3 className={titleStyle}>{title}</h3>
      {description && <p className={descriptionStyle}>{description}</p>}
      {action && <div className={actionStyle}>{action}</div>}
    </div>
  );
}
