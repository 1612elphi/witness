import { css, cx, token } from "../../system.ts";
import { statusColors } from "../../data/statuses.ts";

import { type ReactNode, useEffect, useState } from "react";
import {
  DialogBackdrop,
  DialogCloseTrigger,
  DialogContent,
  DialogPositioner,
  DialogRoot,
} from "@ark-ui/react/dialog";
import { Icon } from "./icon.tsx";
import { Button } from "./button.tsx";
import { MarkdownEditor } from "./markdown-editor.tsx";
import { MarkdownRenderer } from "./markdown-renderer.tsx";
import { Avatar } from "./avatar.tsx";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** Extended card data for detail view. */
export interface KanbanCardData {
  /** Unique identifier for the card. */
  id: string;
  /** Card title / heading. */
  title: string;
  /** Markdown-formatted description. */
  description?: string;
  /** Optional labels (tags) with color token names. */
  labels?: { name: string; color: string }[];
  /** Optional assignees with optional avatar URLs. */
  assignees?: { name: string; avatarUrl?: string }[];
  /** Optional milestone reference. */
  milestone?: string;
  /** ISO date string for due date. */
  dueDate?: string;
  /** Status badge. */
  status?: string;
  /** Priority level. */
  priority?: "low" | "medium" | "high" | "critical";
  /** ISO timestamp when the card was created. */
  createdAt?: string;
  /** ISO timestamp of last update. */
  updatedAt?: string;
  /** Checklist subtasks. */
  checklist?: { id: string; title: string; done: boolean }[];
  /** Activity comments. */
  comments?: {
    id: string;
    author: string;
    avatarColor?: string;
    text: string;
    createdAt: string;
  }[];
  /** File attachments. */
  attachments?: {
    id: string;
    name: string;
    sizeBytes?: number;
    url?: string;
  }[];
  /** Breadcrumb path, e.g. "Beam UI / Components". */
  breadcrumb?: string;
  /** Column/status title, e.g. "Backlog". */
  columnTitle?: string;
  /** Short display ID, e.g. "BEAM-204". */
  shortId?: string;
}

/** Props for {@link KanbanCardDetail}. */
export interface KanbanCardDetailProps {
  card: KanbanCardData;
  open: boolean;
  onClose: () => void;
  /** Optional callback invoked with the new open value when visibility changes. */
  onOpenChange?: (open: boolean) => void;
  onSave?: (card: KanbanCardData) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Label color mapping (matches ref .lb--* classes)                   */
/* ------------------------------------------------------------------ */

const LABEL_STYLE: Record<
  string,
  { background: string; color: string; border: string }
> = {
  orange: {
    background: "rgba(250,82,15,0.12)",
    color: "#fa520f",
    border: "1px solid rgba(250,82,15,0.3)",
  },
  gold: {
    background: "oklab(0.82 0.04 0.15 / 0.5)",
    color: "oklab(0.42 0.08 0.14)",
    border: "1px solid oklab(0.7 0.06 0.14 / 0.4)",
  },
  feature: {
    background: "rgba(250,82,15,0.12)",
    color: "#fa520f",
    border: "1px solid rgba(250,82,15,0.3)",
  },
  design: {
    background: "oklab(0.82 0.04 0.15 / 0.5)",
    color: "oklab(0.42 0.08 0.14)",
    border: "1px solid oklab(0.7 0.06 0.14 / 0.4)",
  },
};

function getLabelStyle(color: string) {
  if (LABEL_STYLE[color]) return LABEL_STYLE[color];
  // hex fallback
  return { background: color + "22", color, border: `1px solid ${color}66` };
}

/* ------------------------------------------------------------------ */
/* Priority badge                                                      */
/* ------------------------------------------------------------------ */

const PRIORITY_STYLE: Record<
  string,
  { background: string; color: string; border: string }
> = {
  low: {
    background: "rgba(13,148,136,0.1)",
    color: "rgb(15,118,110)",
    border: "1px solid rgba(13,148,136,0.25)",
  },
  medium: {
    background: "rgba(217,119,6,0.12)",
    color: "rgb(180,83,9)",
    border: "1px solid rgba(217,119,6,0.3)",
  },
  high: {
    background: "rgba(250,82,15,0.12)",
    color: "#fa520f",
    border: "1px solid rgba(250,82,15,0.3)",
  },
  critical: {
    background: "rgb(254,226,226)",
    color: "rgb(153,27,27)",
    border: "1px solid rgb(252,165,165)",
  },
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * Modal dialog for viewing and editing detailed Kanban card information.
 * Matches the Sunbeam Kanban reference design: 880px centered drawer with
 * head (meta + title) and body (main column + side column).
 */
export function KanbanCardDetail({
  card,
  open,
  onClose,
  onOpenChange,
  onSave,
  onDelete,
  readOnly = false,
  className,
}: KanbanCardDetailProps): ReactNode {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [commentText, setCommentText] = useState("");

  // Sync state when card prop changes (e.g. after save)
  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description ?? "");
  }, [card.title, card.description]);

  // Safety-net Escape handler alongside Ark's built-in
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSave = () => {
    onSave?.({ ...card, title, description });
    setEditingTitle(false);
    setEditingDesc(false);
  };

  const handleCancelDesc = () => {
    setDescription(card.description ?? "");
    setEditingDesc(false);
  };

  const doneCount = (card.checklist ?? []).filter((i) => i.done).length;
  const totalCount = (card.checklist ?? []).length;
  const checklistPct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
  const checklistDone = totalCount > 0 && doneCount === totalCount;

  return (
    <DialogRoot
      open={open}
      onOpenChange={(d) => {
        onOpenChange?.(d.open);
        if (!d.open) onClose();
      }}
    >
      <DialogBackdrop className={backdrop} />
      <DialogPositioner className={positioner}>
        <DialogContent
          className={cx(drawerPanel, className)}
          data-testid="card-detail-modal"
        >
          {/* ── Head ── */}
          <div className={drawerHead}>
            <div className={drawerHeadTop}>
              {/* Meta: BEAM-204 · Beam UI / Components · Backlog */}
              <div className={headMeta}>
                {card.shortId && <span className={headId}>{card.shortId}</span>}
                {card.shortId && <span className={headSep}>·</span>}
                {card.breadcrumb && <span>{card.breadcrumb}</span>}
                {card.breadcrumb && card.columnTitle && <span className={headSep}>·</span>}
                {card.columnTitle && <span>{card.columnTitle}</span>}
              </div>
              {/* Actions: link / more / close */}
              <div className={headActions}>
                <button className={iconBtn} title="Copy link" type="button">
                  <Icon name="link" size={18} />
                </button>
                <button className={iconBtn} title="More" type="button">
                  <Icon name="more_horiz" size={18} />
                </button>
                <DialogCloseTrigger className={iconBtn} title="Close">
                  <Icon name="close" size={18} />
                </DialogCloseTrigger>
              </div>
            </div>

            {/* Editable title */}
            {editingTitle && !readOnly
              ? (
                <textarea
                  className={titleInput}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSave}
                  autoFocus
                  rows={2}
                />
              )
              : (
                <h2
                  className={titleDisplay}
                  onClick={() => {
                    if (!readOnly) setEditingTitle(true);
                  }}
                  style={{ cursor: readOnly ? "default" : "text" }}
                >
                  {title}
                </h2>
              )}
          </div>

          {/* ── Body ── */}
          <div className={drawerBody}>
            {/* ── Main column ── */}
            <div className={drawerMain}>
              {/* Description */}
              <div className={drawerSection}>
                <h4 className={sectionH4}>
                  <Icon name="notes" size={14} />
                  Description
                </h4>
                {editingDesc && !readOnly
                  ? (
                    <>
                      <MarkdownEditor
                        value={description}
                        onChange={setDescription}
                        placeholder="Add a more detailed description…"
                        minHeight="100px"
                      />
                      <div className={descEditActions}>
                        <Button variant="primary" onClick={handleSave}>
                          Save
                        </Button>
                        <Button variant="ghost" onClick={handleCancelDesc}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  )
                  : (
                    <div
                      className={descView}
                      onClick={() => {
                        if (!readOnly) setEditingDesc(true);
                      }}
                      role={readOnly ? undefined : "button"}
                      tabIndex={readOnly ? undefined : 0}
                      onKeyDown={(e) => {
                        if (!readOnly && (e.key === "Enter" || e.key === " ")) {
                          setEditingDesc(true);
                        }
                      }}
                    >
                      {description
                        ? <MarkdownRenderer content={description} />
                        : (
                          <span className={descPlaceholder}>
                            Add a more detailed description…
                          </span>
                        )}
                    </div>
                  )}
              </div>

              {/* Checklist */}
              {(card.checklist && card.checklist.length > 0) && (
                <div className={drawerSection}>
                  <h4 className={sectionH4}>
                    <Icon name="check_box" size={14} />
                    Checklist · {doneCount}/{totalCount}
                  </h4>
                  <div className={progressBar}>
                    <div
                      className={progressFill}
                      style={{
                        width: `${checklistPct}%`,
                        backgroundColor: checklistDone ? statusColors.progressDone : undefined,
                      }}
                    />
                  </div>
                  {card.checklist.map((item) => (
                    <label
                      key={item.id}
                      className={cx(
                        checklistItem,
                        item.done ? checklistItemDone : "",
                      )}
                    >
                      <input
                        type="checkbox"
                        defaultChecked={item.done}
                        style={{
                          accentColor: token.var("colors.sunbeam.orange"),
                          width: token.var("sizes.3.5"),
                          height: token.var("sizes.3.5"),
                          marginTop: token.var("spacing.0.75"),
                          flexShrink: 0,
                        }}
                        readOnly={readOnly}
                      />
                      <span className={checklistLabel}>{item.title}</span>
                    </label>
                  ))}
                  {!readOnly && (
                    <button className={checklistAdd} type="button">
                      <Icon name="add" size={14} />
                      Add subtask
                    </button>
                  )}
                </div>
              )}

              {/* Activity / Comments */}
              <div className={drawerSection}>
                <h4 className={sectionH4}>
                  <Icon name="forum" size={14} />
                  Activity{card.comments && card.comments.length > 0
                    ? ` · ${card.comments.length}`
                    : ""}
                </h4>
                {(card.comments ?? []).map((c) => (
                  <div key={c.id} className={comment}>
                    <Avatar
                      name={c.author}
                      size="sm"
                      {...(c.avatarColor ? { style: { backgroundColor: c.avatarColor } } : {})}
                    />
                    <div>
                      <div className={commentHead}>
                        <span className={commentAuthor}>{c.author}</span>
                        <span className={commentTime}>{c.createdAt}</span>
                      </div>
                      <div className={commentBody}>{c.text}</div>
                    </div>
                  </div>
                ))}
                {!readOnly && (
                  <div className={commentForm}>
                    <textarea
                      className={commentTextarea}
                      placeholder="Write a comment…"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className={commentFormActions}>
                      <Button
                        variant="ghost"
                        onClick={() => setCommentText("")}
                      >
                        Cancel
                      </Button>
                      <Button variant="primary">Comment</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Delete action (bottom of main, non-readOnly) */}
              {!readOnly && onDelete && (
                <div>
                  <Button variant="ghost" onClick={() => onDelete(card.id)}>
                    <Icon name="delete" size={16} /> Delete
                  </Button>
                </div>
              )}
            </div>

            {/* ── Side column ── */}
            <div className={drawerSide}>
              {/* Assignees */}
              <div className={field}>
                <span className={fieldLabel}>Assignees</span>
                <button className={fieldValue} type="button">
                  {card.assignees && card.assignees.length > 0
                    ? (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: token.var("spacing.1"),
                        }}
                      >
                        {card.assignees.map((a) => (
                          <Avatar
                            key={a.name}
                            name={a.name}
                            src={a.avatarUrl}
                            size="sm"
                          />
                        ))}
                      </div>
                    )
                    : <span className={fieldEmpty}>None</span>}
                </button>
              </div>

              {/* Labels */}
              <div className={field}>
                <span className={fieldLabel}>Labels</span>
                <button className={fieldValue} type="button">
                  {card.labels && card.labels.length > 0
                    ? (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: token.var("spacing.1"),
                        }}
                      >
                        {card.labels.map((l) => {
                          const s = getLabelStyle(l.color);
                          return (
                            <span
                              key={l.name}
                              className={labelChip}
                              style={{
                                background: s.background,
                                color: s.color,
                                border: s.border,
                              }}
                            >
                              {l.name}
                            </span>
                          );
                        })}
                      </div>
                    )
                    : <span className={fieldEmpty}>None</span>}
                </button>
              </div>

              {/* Priority */}
              <div className={field}>
                <span className={fieldLabel}>Priority</span>
                <button className={fieldValue} type="button">
                  {card.priority
                    ? (
                      <span
                        className={priorityChip}
                        style={PRIORITY_STYLE[card.priority]}
                      >
                        {card.priority}
                      </span>
                    )
                    : <span className={fieldEmpty}>None</span>}
                </button>
              </div>

              {/* Due date */}
              <div className={field}>
                <span className={fieldLabel}>Due date</span>
                <button className={fieldValue} type="button">
                  {card.dueDate
                    ? <span>{card.dueDate}</span>
                    : <span className={fieldEmpty}>No date</span>}
                </button>
              </div>

              {/* Milestone */}
              <div className={field}>
                <span className={fieldLabel}>Milestone</span>
                <button className={fieldValue} type="button">
                  {card.milestone
                    ? (
                      <>
                        <Icon name="flag" size={14} />
                        {card.milestone}
                      </>
                    )
                    : <span className={fieldEmpty}>None</span>}
                </button>
              </div>

              {/* Attachments */}
              <div className={field}>
                <span className={fieldLabel}>Attachments</span>
                <button className={fieldValue} type="button">
                  {card.attachments && card.attachments.length > 0
                    ? (
                      <span>
                        {card.attachments.length} file{card.attachments.length !== 1 ? "s" : ""}
                      </span>
                    )
                    : <span className={fieldEmpty}>None</span>}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}

/* ------------------------------------------------------------------ */
/* Styles — matching ref-styles.css verbatim                          */
/* ------------------------------------------------------------------ */

const backdrop = css({
  position: "fixed",
  inset: 0,
  background: "scrim.45",
  backdropFilter: "blur(3px)",
  zIndex: 50,
  animationName: "beam-fadeIn",
  animationDuration: "0.15s",
  animationTimingFunction: "ease",
});

const positioner = css({
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  py: "10",
  px: "5",
  zIndex: 51,
  overflowY: "auto",
});

const drawerPanel = css({
  position: "relative",
  width: "220",
  maxWidth: "100%",
  maxHeight: "calc(100vh - 80px)",
  background: "bg.page",
  border: "1px solid",
  borderColor: "border.default",
  borderRadius: "md",
  shadow: "golden",
  zIndex: 60,
  display: "flex",
  flexDirection: "column",
  animationName: "beam-modalIn",
  animationDuration: "0.22s",
  animationTimingFunction: "ease",
  overflow: "hidden",
});

const drawerHead = css({
  pt: "4.5",
  px: "6",
  pb: "3.5",
  borderBottom: "1px solid",
  borderColor: "border.subtle",
  background: "bg.card",
  position: "relative",
});

const drawerHeadTop = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "2",
});

const headMeta = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  fontFamily: "mono",
  fontSize: "11",
  color: "text.muted",
});

const headId = css({
  color: "sunbeam.orange",
  fontWeight: "600",
});

const headSep = css({
  color: "text.muted",
});

const headActions = css({
  display: "flex",
  gap: "1",
});

const iconBtn = css({
  width: "8",
  height: "8",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "1px solid transparent",
  cursor: "pointer",
  color: "text.secondary",
  borderRadius: "sm",
  transition: "color 0.15s, border-color 0.15s, background 0.15s",
  _hover: {
    color: "sunbeam.orange",
    borderColor: "border.default",
    background: "bg.page",
  },
});

const titleDisplay = css({
  fontFamily: "heading",
  fontSize: "2xl",
  fontWeight: "heading",
  lineHeight: "1.2",
  margin: 0,
  color: "text.primary",
});

const titleInput = css({
  width: "100%",
  background: "bg.page",
  border: "1px solid",
  borderColor: "sunbeam.orange",
  borderRadius: "sm",
  fontFamily: "heading",
  fontSize: "2xl",
  fontWeight: "heading",
  lineHeight: "1.2",
  color: "text.primary",
  py: "1",
  px: "1.5",
  my: "-1",
  mx: "-1.5",
  resize: "none",
  outline: "none",
});

const drawerBody = css({
  flex: "1 1 0%",
  overflowY: "auto",
  display: "grid",
  gridTemplateColumns: "1fr 240px",
  gap: 0,
});

const drawerMain = css({
  py: "5.5",
  px: "7",
  borderRight: "1px solid",
  borderColor: "border.subtle",
  minWidth: 0,
});

const drawerSide = css({
  padding: "5.5",
  background: "bg.card",
});

const drawerSection = css({
  marginBottom: "5.5",
});

const sectionH4 = css({
  fontFamily: "body",
  fontSize: "2xs",
  fontWeight: "button",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "sunbeam.orange",
  mt: "0",
  mx: "0",
  mb: "2",
  display: "flex",
  alignItems: "center",
  gap: "1.5",
});

const descView = css({
  fontFamily: "body",
  fontSize: "sm",
  lineHeight: "1.5",
  color: "text.secondary",
  background: "bg.card",
  border: "1px solid",
  borderColor: "border.subtle",
  borderRadius: "sm",
  py: "3",
  px: "3.5",
  whiteSpace: "pre-wrap",
  cursor: "text",
  minHeight: "15",
});

const descPlaceholder = css({
  color: "text.muted",
  fontStyle: "italic",
});

const descEditActions = css({
  display: "flex",
  gap: "2",
  marginTop: "2",
});

/* ── Checklist ── */

const progressBar = css({
  height: "1.25",
  borderRadius: "sm",
  background: "warm.10",
  marginBottom: "2.5",
  overflow: "hidden",
});

const progressFill = css({
  height: "100%",
  background: "sunshine.700",
  transition: "width 0.3s",
});

const checklistItem = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "2",
  py: "1.5",
  px: "1",
  borderRadius: "sm",
  cursor: "pointer",
  _hover: { background: "bg.card" },
});

const checklistItemDone = css({
  "& span": { color: "text.muted", textDecoration: "line-through" },
});

const checklistLabel = css({
  fontFamily: "body",
  fontSize: "13.5",
  color: "text.primary",
  lineHeight: "1.4",
  flex: "1 1 0%",
});

const checklistAdd = css({
  display: "flex",
  alignItems: "center",
  gap: "1.5",
  background: "transparent",
  border: "none",
  py: "1.5",
  px: "1",
  fontFamily: "body",
  fontSize: "xs",
  color: "text.muted",
  cursor: "pointer",
  _hover: { color: "sunbeam.orange" },
});

/* ── Comments ── */

const comment = css({
  display: "grid",
  gridTemplateColumns: "32px 1fr",
  gap: "2.5",
  py: "2.5",
  px: "0",
  borderBottom: "1px solid",
  borderColor: "border.subtle",
  "&:last-of-type": { borderBottom: "none" },
});

const commentHead = css({
  display: "flex",
  alignItems: "baseline",
  gap: "2",
  marginBottom: "1",
});

const commentAuthor = css({
  fontFamily: "body",
  fontWeight: "button",
  fontSize: "13",
  color: "text.primary",
});

const commentTime = css({
  fontFamily: "mono",
  fontSize: "11",
  color: "text.muted",
});

const commentBody = css({
  fontFamily: "body",
  fontSize: "13.5",
  color: "text.secondary",
  lineHeight: "1.5",
});

const commentForm = css({
  display: "flex",
  flexDirection: "column",
  gap: "2",
  marginTop: "3",
});

const commentTextarea = css({
  fontFamily: "body",
  fontSize: "13.5",
  border: "1px solid",
  borderColor: "border.default",
  background: "bg.page",
  borderRadius: "sm",
  py: "2.5",
  px: "3",
  resize: "vertical",
  minHeight: "16",
  outline: "none",
  color: "text.primary",
  _focus: { borderColor: "sunbeam.orange" },
});

const commentFormActions = css({
  display: "flex",
  justifyContent: "flex-end",
  gap: "1.5",
});

/* ── Side fields ── */

const field = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5",
  marginBottom: "4",
});

const fieldLabel = css({
  fontFamily: "body",
  fontSize: "2xs",
  fontWeight: "button",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "text.muted",
});

const fieldValue = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  py: "1.5",
  px: "2",
  background: "transparent",
  border: "1px solid transparent",
  borderRadius: "sm",
  cursor: "pointer",
  fontFamily: "body",
  fontSize: "13",
  color: "text.primary",
  textAlign: "left",
  width: "100%",
  _hover: { borderColor: "border.default", background: "bg.card" },
});

const fieldEmpty = css({
  color: "text.muted",
  fontStyle: "italic",
});

const labelChip = css({
  display: "inline-block",
  fontFamily: "mono",
  fontSize: "2xs",
  fontWeight: "600",
  py: "0.25",
  px: "1.5",
  borderRadius: "sm",
  lineHeight: "1.5",
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
});

const priorityChip = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.75",
  py: "0.25",
  px: "1.25",
  borderRadius: "sm",
  fontFamily: "mono",
  fontSize: "9.5",
  fontWeight: "600",
  letterSpacing: "0.04em",
});
