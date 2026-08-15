import { css, cx, token } from "../../system.ts";
import { statusColors } from "../../data/statuses.ts";

import { type ReactNode, useMemo, useState } from "react";
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/** Priority level for a Kanban card. Maps to CardPriority proto enum. */
export type KanbanCardPriority = "low" | "medium" | "high" | "urgent";

/** A single card within a Kanban column. */
export interface KanbanCard {
  /** Unique identifier for the card. */
  id: string;
  /** Card title / heading. */
  title: string;
  /** Optional labels (tags) with custom colors. Rendered above the title. */
  labels?: { name: string; color: string }[];
  /** Optional assignees with optional avatar URLs. */
  assignees?: { name: string; avatarUrl?: string }[];
  /** Optional milestone name shown in the meta row. */
  milestone?: string;
  /**
   * Optional CSS background value for the cover strip rendered at the top of the card.
   * Accepts any valid CSS background: linear-gradient, url(), hex color, etc.
   * When omitted, no cover strip is rendered.
   */
  cover?: string;
  /**
   * When true, renders a "BLOCKED" badge in the card header row.
   * Defaults to `false` (no badge rendered).
   */
  blocked?: boolean;
  /** Optional checklist progress (e.g., subtasks). Renders a progress bar under the title. */
  checklist?: { done: number; total: number };
  /** Optional human-readable due date or activity timestamp shown in the meta line. */
  dueDate?: string;
  /** Optional comment count rendered in the meta line. */
  commentCount?: number;
  /** Optional attachment count rendered in the meta line. */
  attachmentCount?: number;
  /** Optional short card identifier (e.g., "BEAM-210") rendered in the meta line. */
  shortId?: string;
  /** Optional priority level. Renders a colored chip below the title. */
  priority?: KanbanCardPriority;
}

/** A column (swimlane) in the Kanban board containing cards. */
export interface KanbanColumn {
  /** Unique identifier for the column. */
  id: string;
  /** Column title / header. */
  title: string;
  /** Ordered list of cards in this column. */
  cards: KanbanCard[];
  /** Optional accent color for the column's top tab. Defaults to sunbeam.orange. */
  accentColor?: string;
  /** Optional WIP limit shown next to the column count. */
  wipLimit?: number;
  /**
   * Optional column members rendered as a stacked avatar group on the right
   * of the header. Each member can carry an explicit `color` to colour their
   * avatar chip; otherwise a deterministic palette slot is used.
   */
  members?: { name: string; avatarUrl?: string; color?: string }[];
}

const AVATAR_PALETTE = [
  "#fa520f",
  "#1abc9c",
  "#7c3aed",
  "#fb6424",
  "#ffb83e",
  "#9ec5fe",
  "#c084fc",
  "#86efac",
];

function avatarColorFor(name: string, fallbackIdx: number): string {
  if (!name) return AVATAR_PALETTE[fallbackIdx % AVATAR_PALETTE.length];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

/** Props for {@link KanbanBoard}. */
export interface KanbanBoardProps {
  /** Array of columns with their cards. */
  columns: KanbanColumn[];
  /** Called whenever cards are reordered (within or between columns). Receives updated columns array. */
  onChange: (columns: KanbanColumn[]) => void;
  /** Optional callback when user clicks "+ Add card" button for a specific column. */
  onAddCard?: (columnId: string) => void;
  /** Optional callback when user clicks a card (not drag). Receives the card id. */
  onCardClick?: (cardId: string) => void;
  /** Optional CSS class for the board container. */
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Sortable card                                                       */
/* ------------------------------------------------------------------ */
function SortableCard({
  card,
  onClick,
}: {
  card: KanbanCard;
  onClick?: (cardId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-card-id={card.id}
      role="article"
      aria-label={card.title}
      onClick={() => onClick?.(card.id)}
    >
      <KanbanCardView card={card} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card content (shared between sortable + overlay)                    */
/* ------------------------------------------------------------------ */

/**
 * Standalone card display — usable outside the board (e.g., in lists, detail panels).
 *
 * @example
 * ```tsx
 * <KanbanCardView card={myCard} />
 * <KanbanCardView card={myCard} cover="linear-gradient(135deg, #fffaeb, #fa520f)" blocked />
 * ```
 */
const PRIORITY_CONFIG: Record<
  KanbanCardPriority,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  low: {
    label: "Low",
    color: "rgb(15, 118, 110)",
    bg: "rgba(13, 148, 136, 0.1)",
    border: "rgba(13, 148, 136, 0.25)",
    icon: "keyboard_arrow_down",
  },
  medium: {
    label: "Medium",
    color: "rgb(180, 83, 9)",
    bg: "rgba(217, 119, 6, 0.12)",
    border: "rgba(217, 119, 6, 0.3)",
    icon: "keyboard_arrow_up",
  },
  high: {
    label: "High",
    color: "#fa520f",
    bg: "rgba(250, 82, 15, 0.12)",
    border: "rgba(250, 82, 15, 0.3)",
    icon: "priority_high",
  },
  urgent: {
    label: "Urgent",
    color: "rgb(153, 27, 27)",
    bg: "rgb(254, 226, 226)",
    border: "rgb(252, 165, 165)",
    icon: "priority_high",
  },
};

/** Map label style token → reference colours. */
const LABEL_STYLES: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  orange: {
    bg: "rgba(250, 82, 15, 0.12)",
    color: "#fa520f",
    border: "rgba(250, 82, 15, 0.3)",
  },
  gold: {
    bg: "oklab(0.82 0.04 0.15 / 0.5)",
    color: "oklab(0.42 0.08 0.14)",
    border: "oklab(0.7 0.06 0.14 / 0.4)",
  },
  sand: {
    bg: "oklab(0.85 0.02 0.09 / 0.5)",
    color: "oklab(0.36 0.03 0.05)",
    border: "oklab(0.72 0.02 0.06 / 0.45)",
  },
  rust: {
    bg: "oklab(0.58 0.11 0.1 / 0.14)",
    color: "oklab(0.45 0.12 0.12)",
    border: "oklab(0.55 0.11 0.1 / 0.3)",
  },
  olive: {
    bg: "oklab(0.65 -0.05 0.09 / 0.18)",
    color: "oklab(0.4 -0.04 0.08)",
    border: "oklab(0.55 -0.05 0.08 / 0.3)",
  },
  ink: {
    bg: "rgba(31, 31, 31, 0.08)",
    color: "hsl(0,0%,24%)",
    border: "rgba(31, 31, 31, 0.15)",
  },
  green: {
    bg: "rgba(21, 128, 61, 0.1)",
    color: "rgb(21, 128, 61)",
    border: "rgba(21, 128, 61, 0.3)",
  },
  purple: {
    bg: "rgba(126, 34, 206, 0.08)",
    color: "rgb(126, 34, 206)",
    border: "rgba(126, 34, 206, 0.25)",
  },
};

export function KanbanCardView(
  { card, ghost }: { card: KanbanCard; ghost?: boolean },
): ReactNode {
  const checklistPct = card.checklist
    ? Math.round(
      (card.checklist.done / Math.max(card.checklist.total, 1)) * 100,
    )
    : null;

  const priorityCfg = card.priority ? PRIORITY_CONFIG[card.priority] : null;

  return (
    <div className={cx(cardStyle, ghost && cardGhostStyle)}>
      {card.cover && (
        <div
          data-part="cover"
          className={cardCoverStyle}
          style={{ background: card.cover }}
        />
      )}

      {card.blocked && (
        <span
          data-part="blocked-badge"
          className={blockedBadgeStyle}
          style={{
            backgroundColor: statusColors.blockedBg,
            color: statusColors.closed,
            borderColor: statusColors.blockedBorder,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: token.var("fontSizes.xs") }}
            aria-hidden="true"
          >
            block
          </span>
          BLOCKED
        </span>
      )}

      {card.labels && card.labels.length > 0 && (
        <div className={labelsRow}>
          {card.labels.map((l) => {
            const s = LABEL_STYLES[l.color] ?? {
              bg: l.color,
              color: token.var("colors.scrim.85"),
              border: l.color,
            };
            return (
              <span
                key={l.name}
                className={labelPill}
                style={{
                  backgroundColor: s.bg,
                  color: s.color,
                  borderColor: s.border,
                }}
              >
                {l.name}
              </span>
            );
          })}
        </div>
      )}

      <p className={cardTitleStyle}>{card.title}</p>

      {priorityCfg && (
        <div className={priorityRow}>
          <span
            className={priorityChip}
            style={{
              color: priorityCfg.color,
              backgroundColor: priorityCfg.bg,
              borderColor: priorityCfg.border,
            }}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: token.var("fontSizes.11"), lineHeight: 1 }}
            >
              {priorityCfg.icon}
            </span>
            {priorityCfg.label}
          </span>
        </div>
      )}

      {card.checklist && (
        <div className={checklistRow}>
          <div className={checklistMetaRow}>
            <span className={checklistCount}>
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{
                  fontSize: token.var("fontSizes.2xs"),
                  lineHeight: 1,
                  verticalAlign: "middle",
                }}
              >
                check_box_outline_blank
              </span>{" "}
              {card.checklist.done}/{card.checklist.total}
            </span>
            <span className={checklistPctText}>{checklistPct}%</span>
          </div>
          <div className={checklistTrack}>
            <div
              className={checklistFill}
              style={{ width: `${checklistPct}%` }}
            />
          </div>
        </div>
      )}

      {card.milestone && (
        <div className={cardMetaRow}>
          <span className={milestonePill}>
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: token.var("fontSizes.11"), lineHeight: 1 }}
            >
              flag
            </span>
            {card.milestone}
          </span>
        </div>
      )}

      <div className={cardFooter}>
        <div className={metaIcons}>
          {card.shortId && <span className={shortIdText}>{card.shortId}</span>}
          {card.dueDate && (
            <span
              className={dueDateText}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: token.var("spacing.0.5"),
              }}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: token.var("fontSizes.2xs"), lineHeight: 1 }}
              >
                event
              </span>
              {card.dueDate}
            </span>
          )}
          {typeof card.commentCount === "number" && card.commentCount > 0 && (
            <span className={metaIconText}>
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: token.var("fontSizes.2xs"), lineHeight: 1 }}
              >
                chat_bubble_outline
              </span>
              {card.commentCount}
            </span>
          )}
          {typeof card.attachmentCount === "number" &&
            card.attachmentCount > 0 && (
            <span className={metaIconText}>
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: token.var("fontSizes.2xs"), lineHeight: 1 }}
              >
                attach_file
              </span>
              {card.attachmentCount}
            </span>
          )}
        </div>

        {card.assignees && card.assignees.length > 0 && (
          <div className={avatarStack}>
            {card.assignees.map((a, i) => {
              const bg = avatarColorFor(a.name, i);
              return (
                <div
                  key={a.name}
                  className={avatarCircle}
                  style={{
                    zIndex: card.assignees!.length - i,
                    background: bg,
                  }}
                  title={a.name}
                  role="img"
                  aria-label={a.name}
                >
                  {a.avatarUrl
                    ? (
                      <img
                        src={a.avatarUrl}
                        alt={a.name}
                        className={avatarImg}
                      />
                    )
                    : (
                      <span className={avatarInitial} aria-hidden="true">
                        {a.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Column                                                              */
/* ------------------------------------------------------------------ */
function Column({
  column,
  onAddCard,
  onCardClick,
}: {
  column: KanbanColumn;
  onAddCard?: (columnId: string) => void;
  onCardClick?: (cardId: string) => void;
}) {
  const cardIds = useMemo(() => column.cards.map((c) => c.id), [column.cards]);
  const accent = column.accentColor ?? token.var("colors.sunbeam.orange");

  const visibleMembers = column.members?.slice(0, 4) ?? [];
  const overflowMembers = (column.members?.length ?? 0) - visibleMembers.length;

  const hasAccent = Boolean(column.accentColor);

  return (
    <div
      className={columnStyle}
      role="group"
      aria-label={`${column.title} column, ${column.cards.length} card${
        column.cards.length !== 1 ? "s" : ""
      }`}
      data-accent={hasAccent}
      style={hasAccent ? { borderTop: `3px solid ${accent}` } : undefined}
    >
      <div className={columnHeader}>
        <div className={columnHeaderLeft}>
          <span className={columnTitle}>{column.title}</span>
          <span className={columnCount}>{column.cards.length}</span>
          {typeof column.wipLimit === "number" && (
            <span className={wipPill}>WIP {column.wipLimit}</span>
          )}
        </div>
        {column.members && column.members.length > 0 && (
          <div className={memberStack}>
            {visibleMembers.map((m, i) => {
              const bg = m.color ?? avatarColorFor(m.name, i);
              return (
                <div
                  key={m.name}
                  className={memberCircle}
                  style={{
                    zIndex: column.members!.length - i,
                    background: bg,
                  }}
                  title={m.name}
                  role="img"
                  aria-label={m.name}
                >
                  {m.avatarUrl
                    ? (
                      <img
                        src={m.avatarUrl}
                        alt={m.name}
                        className={avatarImg}
                      />
                    )
                    : (
                      <span className={memberInitial} aria-hidden="true">
                        {m.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                </div>
              );
            })}
            {overflowMembers > 0 && (
              <div
                className={memberOverflow}
                title={`${overflowMembers} more`}
                aria-label={`${overflowMembers} more members`}
              >
                +{overflowMembers}
              </div>
            )}
          </div>
        )}
      </div>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className={columnBody}>
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} onClick={onCardClick} />
          ))}
        </div>
      </SortableContext>

      {onAddCard && (
        <button
          className={addCardBtn}
          onClick={() => onAddCard(column.id)}
          type="button"
          aria-label={`Add card to ${column.title}`}
        >
          + Add card
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Board                                                               */
/* ------------------------------------------------------------------ */

/**
 * Interactive Kanban board with drag-and-drop card reordering within and between columns.
 * Uses dnd-kit for smooth DnD and vertical list sorting within each column.
 *
 * @example
 * ```tsx
 * <KanbanBoard
 *   columns={myColumns}
 *   onChange={setColumns}
 *   onAddCard={(colId) => addCardToColumn(colId)}
 * />
 * ```
 */
export function KanbanBoard({
  columns,
  onChange,
  onAddCard,
  onCardClick,
  className,
}: KanbanBoardProps): ReactNode {
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function findColumn(cardId: string) {
    return columns.find((col) => col.cards.some((c) => c.id === cardId));
  }

  function handleDragStart(event: DragStartEvent) {
    const col = findColumn(String(event.active.id));
    const card = col?.cards.find((c) => c.id === String(event.active.id));
    setActiveCard(card ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceCol = findColumn(activeId);
    // over might be a card or a column id
    const destCol = findColumn(overId) ?? columns.find((c) => c.id === overId);

    if (!sourceCol || !destCol || sourceCol.id === destCol.id) return;

    const newColumns = columns.map((col) => ({
      ...col,
      cards: [...col.cards],
    }));
    const src = newColumns.find((c) => c.id === sourceCol.id)!;
    const dst = newColumns.find((c) => c.id === destCol!.id)!;
    const cardIndex = src.cards.findIndex((c) => c.id === activeId);
    const [card] = src.cards.splice(cardIndex, 1);

    const overIndex = dst.cards.findIndex((c) => c.id === overId);
    if (overIndex >= 0) {
      dst.cards.splice(overIndex, 0, card);
    } else {
      dst.cards.push(card);
    }

    onChange(newColumns);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const col = findColumn(activeId);
    if (!col) return;

    const oldIndex = col.cards.findIndex((c) => c.id === activeId);
    const newIndex = col.cards.findIndex((c) => c.id === overId);

    if (oldIndex !== newIndex && newIndex >= 0) {
      const newColumns = columns.map((c) => {
        if (c.id !== col.id) return c;
        return { ...c, cards: arrayMove(c.cards, oldIndex, newIndex) };
      });
      onChange(newColumns);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cx(boardStyle, className)}
        role="region"
        aria-label="Kanban board"
      >
        {columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            onAddCard={onAddCard}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard ? <KanbanCardView card={activeCard} ghost /> : null}
      </DragOverlay>
    </DndContext>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */
const boardStyle = css({
  display: "flex",
  gap: "3.5",
  overflowX: "auto",
  minHeight: "100%",
  alignItems: "flex-start",
});

const columnStyle = css({
  width: "74",
  minWidth: "74",
  backgroundColor: "bg.card",
  border: "1px solid",
  borderColor: "border.warm",
  borderRadius: "sm",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  gap: "2",
  pt: "2.5",
  px: "2.5",
  pb: "2",
  maxHeight: "calc(100vh - 220px)",
});

const columnHeader = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  pt: "1",
  px: "1",
  pb: "2",
  borderBottom: "1px solid",
  borderColor: "border.subtle",
  gap: "2",
});

const columnHeaderLeft = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  minWidth: 0,
});

const columnTitle = css({
  fontSize: "11",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "text.muted",
  whiteSpace: "nowrap",
  flex: "1 1 0%",
});

const columnCount = css({
  fontSize: "10.5",
  fontFamily: "mono",
  color: "text.muted",
  backgroundColor: "bg.page",
  border: "1px solid",
  borderColor: "border.subtle",
  py: "0.25",
  px: "1.75",
  borderRadius: "full",
});

const wipPill = css({
  fontSize: "10.5",
  fontFamily: "mono",
  color: "text.muted",
  backgroundColor: "accent.08",
  border: "1px solid",
  borderColor: "accent.20",
  py: "0.25",
  px: "1.75",
  borderRadius: "full",
  whiteSpace: "nowrap",
});

const memberStack = css({
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
});

const memberCircle = css({
  width: "5.5",
  height: "5.5",
  borderRadius: "50%",
  border: "2px solid",
  borderColor: "cream",
  backgroundColor: "warm.ivory",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: "-1.25",
  overflow: "hidden",
  flexShrink: 0,
});

const memberInitial = css({
  fontSize: "9",
  fontWeight: "button",
  color: "white",
  textTransform: "uppercase",
  lineHeight: 1,
});

const memberOverflow = css({
  width: "5.5",
  height: "5.5",
  borderRadius: "50%",
  border: "2px solid",
  borderColor: "cream",
  backgroundColor: "warm.ivory",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "8",
  fontWeight: "button",
  color: "text.muted",
  fontFamily: "mono",
  flexShrink: 0,
  marginLeft: "0",
});

const columnBody = css({
  flex: 1,
  padding: "0.5",
  margin: "-0.5",
  display: "flex",
  flexDirection: "column",
  gap: "2",
  minHeight: "15",
  overflowY: "auto",
});

const cardCoverStyle = css({
  height: "16",
  mt: "-2.5",
  mx: "-3",
  mb: "0",
  backgroundSize: "cover",
  backgroundPosition: "center",
  borderBottom: "1px solid",
  borderColor: "border.warm",
  position: "relative",
  overflow: "hidden",
});

const blockedBadgeStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1",
  fontSize: "2xs",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  py: "0.5",
  px: "1.5",
  border: "1px solid",
  borderRadius: "sm",
  fontFamily: "mono",
});

const cardStyle = css({
  backgroundColor: "bg.page",
  border: "1px solid",
  borderColor: "border.warm",
  borderRadius: "sm",
  py: "2.5",
  px: "3",
  cursor: "grab",
  transition: "border-color 0.12s, box-shadow 0.12s, transform 0.12s",
  display: "flex",
  flexDirection: "column",
  gap: "2",
  position: "relative",
  _hover: {
    borderColor: "sunbeam.orange",
    shadow: "nav",
  },
  _active: {
    cursor: "grabbing",
  },
});

const cardGhostStyle = css({
  opacity: 0.4,
});

const cardTitleStyle = css({
  fontSize: "sm",
  fontWeight: "button",
  color: "text.primary",
  lineHeight: "1.32",
  overflowWrap: "break-word",
});

const labelsRow = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "1",
});

const labelPill = css({
  display: "inline-block",
  fontFamily: "mono",
  fontSize: "2xs",
  fontWeight: 600,
  py: "0.25",
  px: "1.5",
  borderRadius: "sm",
  lineHeight: "1.5",
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
  border: "1px solid",
});

const checklistRow = css({
  display: "flex",
  flexDirection: "column",
  gap: "1",
});

const checklistMetaRow = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "2",
});

const checklistCount = css({
  fontSize: "10.5",
  color: "text.muted",
  fontFamily: "mono",
});

const checklistPctText = css({
  fontSize: "10.5",
  color: "text.muted",
  fontFamily: "mono",
});

const checklistTrack = css({
  height: "1",
  borderRadius: "sm",
  background: "warm.10",
  width: "100%",
  overflow: "hidden",
});

const checklistFill = css({
  height: "100%",
  backgroundColor: "sunshine.700",
  transition: "width 0.3s",
});

const priorityRow = css({
  display: "flex",
  alignItems: "center",
});

const priorityChip = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.75",
  fontSize: "9.5",
  fontFamily: "mono",
  fontWeight: 600,
  letterSpacing: "0.04em",
  py: "0.25",
  px: "1.25",
  borderRadius: "sm",
  textTransform: "uppercase",
});

const cardMetaRow = css({
  display: "flex",
  alignItems: "center",
  gap: "1.5",
});

const milestonePill = css({
  fontSize: "10.5",
  color: "text.muted",
  fontFamily: "mono",
  display: "inline-flex",
  alignItems: "center",
  gap: "1",
});

const metaIcons = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  flexWrap: "wrap",
  fontSize: "10.5",
  color: "text.muted",
  fontFamily: "mono",
});

const shortIdText = css({
  fontSize: "10.5",
  color: "text.muted",
  fontFamily: "mono",
  fontWeight: 500,
});

const dueDateText = css({
  fontSize: "10.5",
  color: "text.muted",
  fontFamily: "mono",
});

const metaIconText = css({
  fontSize: "10.5",
  color: "text.muted",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.75",
});

const cardFooter = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "2",
  paddingTop: "1",
  borderTop: "1px dashed",
  borderColor: "border.subtle",
});

const avatarStack = css({
  display: "inline-flex",
});

const avatarCircle = css({
  width: "5.5",
  height: "5.5",
  borderRadius: "50%",
  border: "1.5px solid",
  borderColor: "bg.page",
  backgroundColor: "bg.card",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: "-1.5",
  overflow: "hidden",
});

const avatarImg = css({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const avatarInitial = css({
  fontSize: "9",
  fontWeight: "button",
  color: "white",
  textTransform: "uppercase",
  lineHeight: 1,
});

const addCardBtn = css({
  display: "flex",
  alignItems: "center",
  gap: "1.5",
  py: "1.5",
  px: "2",
  fontSize: "xs",
  color: "text.muted",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  borderRadius: "sm",
  fontFamily: "body",
  transition: "color 0.15s, background 0.15s",
  _hover: {
    color: "sunbeam.orange",
    backgroundColor: "bg.page",
  },
});
