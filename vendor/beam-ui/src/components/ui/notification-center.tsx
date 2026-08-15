import { css, cx } from "../../system.ts";

import {
  PopoverCloseTrigger,
  PopoverContent,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from "@ark-ui/react/popover";
import { type ReactNode, useState } from "react";
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from "@ark-ui/react/collapsible";
import { Icon } from "./icon.tsx";
import { ScrollArea } from "./scroll-area.tsx";

/** A single notification in the notification center. */
export interface Notification {
  /** Unique notification identifier. */
  id: string;
  /** Material Symbol icon name (e.g., from {@link notificationIcons}). */
  icon?: string;
  /** Primary notification text. */
  title: string;
  /** Grouping key — notifications are grouped by this value (e.g., repo name, app name, channel). */
  group?: string;
  /** Secondary text — sender, channel, etc. */
  subtitle?: string;
  /** Human-readable timestamp. */
  timestamp?: string;
  /** Whether the notification has been marked as read. */
  read: boolean;
  /** Optional action URL. */
  href?: string;
  /** Any additional metadata the consumer wants to attach. */
  meta?: Record<string, unknown>;
}

/** Props for {@link NotificationCenter}. */
export interface NotificationCenterProps {
  /** Array of notifications to display. */
  notifications: Notification[];
  /** Called when user marks a single notification as read. */
  onMarkRead: (id: string) => void;
  /** Called when user clicks "Mark all as read" button. */
  onMarkAllRead: () => void;
  /** Optional callback when user clicks a notification. */
  onClickNotification?: (notification: Notification) => void;
  /** Whether the notification panel is open. Defaults to `false`. */
  open?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Header title. Defaults to `"Notifications"`. */
  title?: string;
  /** Trigger icon name. Defaults to `"notifications"`. */
  triggerIcon?: string;
  /** If true, groups are collapsible with unread count badges. Defaults to `false`. */
  collapsibleGroups?: boolean;
  /** Optional CSS class for the trigger button. */
  className?: string;
}

/** Built-in icon suggestions for common notification types */
export const notificationIcons = {
  // Code forge
  issue: "bug_report",
  pr: "merge",
  release: "new_releases",
  mention: "alternate_email",
  review: "rate_review",
  commit: "commit",
  // Communication
  email: "mail",
  chat: "chat",
  dm: "forum",
  // Calendar
  event: "event",
  reminder: "alarm",
  // Storage
  upload: "cloud_upload",
  share: "share",
  // System
  security: "security",
  update: "system_update",
  warning: "warning",
  info: "info",
} as const;

/**
 * Standalone notification row — usable outside the {@link NotificationCenter} dropdown.
 * Displays icon, title, subtitle, timestamp, and optional read-mark button.
 *
 * @example
 * ```tsx
 * <NotificationItem
 *   notification={notif}
 *   onMarkRead={(id) => markAsRead(id)}
 *   onClick={(notif) => openNotification(notif)}
 * />
 * ```
 */
export function NotificationItem({
  notification,
  onMarkRead,
  onClick,
}: {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onClick?: (notification: Notification) => void;
}): ReactNode {
  return (
    <div
      className={cx(
        notifRow,
        !notification.read ? notifUnread : undefined,
        onClick && clickableRow,
      )}
      onClick={() => onClick?.(notification)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onClick) {
          e.preventDefault();
          onClick(notification);
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {notification.icon && <Icon name={notification.icon} size={18} className={typeIcon} />}
      <div className={notifContent}>
        <span className={notifTitle}>{notification.title}</span>
        {(notification.subtitle || notification.timestamp) && (
          <span className={notifTime}>
            {notification.subtitle}
            {notification.subtitle && notification.timestamp && " · "}
            {notification.timestamp}
          </span>
        )}
      </div>
      {!notification.read && onMarkRead && (
        <button
          className={markReadBtn}
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
          aria-label={`Mark "${notification.title}" as read`}
          type="button"
        >
          <Icon name="check" size={14} />
        </button>
      )}
    </div>
  );
}

function CollapsibleGroup({
  group,
  items,
  onMarkRead,
  onClick,
}: {
  group: string;
  items: Notification[];
  onMarkRead: (id: string) => void;
  onClick?: (n: Notification) => void;
}) {
  const [open, setOpen] = useState(true);
  const groupUnread = items.filter((n) => !n.read).length;

  return (
    <CollapsibleRoot open={open} onOpenChange={(d) => setOpen(d.open)}>
      <CollapsibleTrigger className={groupTrigger}>
        <span>{group}</span>
        <span className={groupRight}>
          {!open && groupUnread > 0 && <span className={groupUnreadBadge}>{groupUnread}</span>}
          <Icon name={open ? "expand_less" : "expand_more"} size={16} />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {items.map((notif) => (
          <NotificationItem
            key={notif.id}
            notification={notif}
            onMarkRead={onMarkRead}
            onClick={onClick}
          />
        ))}
      </CollapsibleContent>
    </CollapsibleRoot>
  );
}

/**
 * Notification dropdown center with unread badge, grouping support, and bulk mark-as-read.
 * Optionally collapses groups with unread count badges.
 * Comes with built-in icon suggestions via {@link notificationIcons}.
 *
 * @example
 * ```tsx
 * <NotificationCenter
 *   notifications={notifications}
 *   onMarkRead={(id) => markAsRead(id)}
 *   onMarkAllRead={() => markAllAsRead()}
 *   onClickNotification={(notif) => navigate(notif.href)}
 *   collapsibleGroups
 * />
 * ```
 */
export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClickNotification,
  open,
  onOpenChange,
  title: headerText = "Notifications",
  triggerIcon = "notifications",
  collapsibleGroups = false,
  className,
}: NotificationCenterProps): ReactNode {
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Group by group field (ungrouped items go under "")
  const grouped = notifications.reduce<Record<string, Notification[]>>(
    (acc, notif) => {
      const key = notif.group ?? "";
      if (!acc[key]) acc[key] = [];
      acc[key].push(notif);
      return acc;
    },
    {},
  );

  return (
    <PopoverRoot
      positioning={{ placement: "bottom-end" }}
      open={open}
      onOpenChange={(d) => onOpenChange?.(d.open)}
    >
      <PopoverTrigger asChild>
        <button
          className={cx(triggerBtn, className)}
          aria-label={`${headerText}, ${unreadCount} unread`}
          type="button"
        >
          <Icon name={triggerIcon} size={20} />
          {unreadCount > 0 && <span className={badge} aria-hidden="true">{unreadCount}</span>}
        </button>
      </PopoverTrigger>
      <PopoverPositioner>
        <PopoverContent className={popoverContent}>
          <div className={header}>
            <span className={headerTitle}>{headerText}</span>
            <div className={headerActions}>
              {unreadCount > 0 && (
                <button
                  className={markAllBtn}
                  onClick={onMarkAllRead}
                  type="button"
                >
                  Mark all as read
                </button>
              )}
              <PopoverCloseTrigger
                className={closeBtn}
                aria-label="Close notifications"
              >
                <Icon name="close" size={16} />
              </PopoverCloseTrigger>
            </div>
          </div>

          <ScrollArea maxHeight="400px" scrollbar="visible">
            {notifications.length === 0
              ? (
                <div className={emptyState}>
                  <Icon
                    name="notifications_none"
                    size={32}
                    className={emptyIcon}
                  />
                  <p>No notifications</p>
                </div>
              )
              : (
                Object.entries(grouped).map(([group, items]) => {
                  if (collapsibleGroups && group) {
                    return (
                      <CollapsibleGroup
                        key={group}
                        group={group}
                        items={items}
                        onMarkRead={onMarkRead}
                        onClick={onClickNotification}
                      />
                    );
                  }

                  return (
                    <div key={group}>
                      {group && <div className={groupHeader}>{group}</div>}
                      {items.map((notif) => (
                        <NotificationItem
                          key={notif.id}
                          notification={notif}
                          onMarkRead={onMarkRead}
                          onClick={onClickNotification}
                        />
                      ))}
                    </div>
                  );
                })
              )}
          </ScrollArea>
        </PopoverContent>
      </PopoverPositioner>
    </PopoverRoot>
  );
}

const triggerBtn = css({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "10",
  height: "10",
  backgroundColor: "transparent",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  color: "text.primary",
  cursor: "pointer",
  transition: "all 0.15s ease",
  _hover: {
    borderColor: "sunbeam.orange",
    color: "sunbeam.orange",
  },
});

const badge = css({
  position: "absolute",
  top: "-1",
  right: "-1",
  minWidth: "4.5",
  height: "4.5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "sunbeam.orange",
  color: "white",
  fontSize: "2xs",
  fontWeight: "button",
  fontFamily: "body",
  borderRadius: "full",
  py: "0",
  px: "1",
  lineHeight: 1,
});

const popoverContent = css({
  width: "90",
  backgroundColor: "bg.page",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  shadow: "golden",
  zIndex: 50,
  outline: "none",
});

const header = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "4",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.default",
});

const headerTitle = css({
  fontSize: "md",
  fontWeight: "heading",
  fontFamily: "heading",
  color: "text.primary",
});

const headerActions = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
});

const markAllBtn = css({
  fontSize: "11",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "sunbeam.orange",
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
  fontFamily: "body",
  _hover: {
    textDecoration: "underline",
  },
});

const closeBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "text.secondary",
  padding: "1",
  transition: "color 0.15s ease",
  _hover: {
    color: "sunbeam.orange",
  },
});

const groupTrigger = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  paddingBlock: "2",
  paddingInline: "4",
  fontSize: "2xs",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "text.muted",
  fontFamily: "body",
  backgroundColor: "bg.card",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.default",
  border: "none",
  cursor: "pointer",
  _hover: { color: "text.primary" },
});

const groupRight = css({
  display: "flex",
  alignItems: "center",
  gap: "1.5",
});

const groupUnreadBadge = css({
  fontSize: "2xs",
  fontFamily: "mono",
  fontWeight: "button",
  color: "white",
  backgroundColor: "sunbeam.orange",
  borderRadius: "full",
  minWidth: "4.5",
  height: "4.5",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  py: "0",
  px: "1",
  lineHeight: 1,
});

const emptyState = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2",
  paddingBlock: "12",
  paddingInline: "4",
  color: "text.muted",
  fontSize: "sm",
  fontFamily: "body",
});

const emptyIcon = css({
  color: "text.muted",
});

const groupHeader = css({
  paddingBlock: "2",
  paddingInline: "4",
  fontSize: "2xs",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "text.muted",
  fontFamily: "body",
  backgroundColor: "bg.card",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.default",
});

const notifRow = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "2.5",
  paddingBlock: "3",
  paddingInline: "4",
  paddingLeft: "19px",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderColor: "border.subtle",
  position: "relative",
  transition: "background 0.1s ease",
});

const clickableRow = css({
  cursor: "pointer",
  _hover: { backgroundColor: "bg.card" },
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "-0.5",
  },
});

const notifUnread = css({
  backgroundColor: "bg.card",
  _before: {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "0.75",
    backgroundColor: "sunbeam.orange",
  },
});

const typeIcon = css({
  color: "text.muted",
  flexShrink: 0,
  marginTop: "0.5",
});

const notifContent = css({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.5",
  minWidth: 0,
});

const notifTitle = css({
  fontSize: "13",
  fontFamily: "body",
  color: "text.primary",
  lineHeight: 1.4,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const notifTime = css({
  fontSize: "11",
  fontFamily: "body",
  color: "text.muted",
});

const markReadBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "6",
  height: "6",
  backgroundColor: "transparent",
  border: "none",
  color: "text.muted",
  cursor: "pointer",
  flexShrink: 0,
  transition: "color 0.15s ease",
  _hover: {
    color: "sunbeam.orange",
  },
});
