import { css, cx } from "../../system.ts";

import { type ReactNode, useState } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** Single line in a diff hunk. */
export interface DiffLine {
  /** Type of change: "add" (new), "remove" (deleted), or "context" (unchanged). */
  type: "add" | "remove" | "context";
  /** The text content of the line (without leading +/- prefix). */
  content: string;
  /** Line number in the old file (for remove or context lines). */
  oldLineNumber?: number;
  /** Line number in the new file (for add or context lines). */
  newLineNumber?: number;
}

/** Single hunk (contiguous block of changes) in a unified diff. */
export interface DiffHunk {
  /** The hunk header line from the diff (e.g., `@@ -10,5 +12,6 @@`). */
  header: string;
  /** Array of diff lines in this hunk. */
  lines: DiffLine[];
}

/** Props for {@link DiffViewer}. */
export interface DiffViewerProps {
  /** Array of hunks to display. */
  hunks: DiffHunk[];
  /** Optional old file name (shown in unified mode or when different from newFileName). */
  oldFileName?: string;
  /** Optional new file name (shown in all modes). */
  newFileName?: string;
  /** Render mode: "unified" (single column) or "split" (side-by-side). Defaults to `"unified"`. */
  mode?: "unified" | "split";
  /** Extra CSS class names to apply to the root container. */
  className?: string;
}

/* ------------------------------------------------------------------ */
/* parseDiff utility                                                    */
/* ------------------------------------------------------------------ */

/**
 * Parse unified diff text into hunks and lines.
 *
 * @param diffText - Raw unified diff output (e.g., from `git diff` or `git show`).
 * @returns Array of DiffHunk objects.
 *
 * @example
 * ```ts
 * const hunks = parseDiff(unifiedDiffText);
 * ```
 */
export function parseDiff(diffText: string): DiffHunk[] {
  const lines = diffText.split("\n");
  const hunks: DiffHunk[] = [];
  let currentHunk: DiffHunk | null = null;
  let oldLine = 0;
  let newLine = 0;

  for (const line of lines) {
    const hunkMatch = line.match(
      /^@@\s+-(\d+)(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@(.*)$/,
    );
    if (hunkMatch) {
      currentHunk = { header: line, lines: [] };
      hunks.push(currentHunk);
      oldLine = parseInt(hunkMatch[1], 10);
      newLine = parseInt(hunkMatch[2], 10);
      continue;
    }

    if (!currentHunk) continue;

    if (line.startsWith("+")) {
      currentHunk.lines.push({
        type: "add",
        content: line.slice(1),
        newLineNumber: newLine++,
      });
    } else if (line.startsWith("-")) {
      currentHunk.lines.push({
        type: "remove",
        content: line.slice(1),
        oldLineNumber: oldLine++,
      });
    } else if (line.startsWith(" ") || line === "") {
      currentHunk.lines.push({
        type: "context",
        content: line.startsWith(" ") ? line.slice(1) : line,
        oldLineNumber: oldLine++,
        newLineNumber: newLine++,
      });
    }
  }

  return hunks;
}

/* ------------------------------------------------------------------ */
/* Collapse helper — collapse long runs of context lines               */
/* ------------------------------------------------------------------ */
const CONTEXT_COLLAPSE_THRESHOLD = 8;
const CONTEXT_VISIBLE_LINES = 3;

interface DisplaySegment {
  kind: "lines" | "collapsed";
  lines: DiffLine[];
  collapsedCount?: number;
}

function segmentLines(lines: DiffLine[]): DisplaySegment[] {
  const segments: DisplaySegment[] = [];
  let contextRun: DiffLine[] = [];

  const flushContext = () => {
    if (contextRun.length === 0) return;
    if (contextRun.length > CONTEXT_COLLAPSE_THRESHOLD) {
      const top = contextRun.slice(0, CONTEXT_VISIBLE_LINES);
      const bottom = contextRun.slice(
        contextRun.length - CONTEXT_VISIBLE_LINES,
      );
      const hiddenCount = contextRun.length - CONTEXT_VISIBLE_LINES * 2;
      segments.push({ kind: "lines", lines: top });
      segments.push({
        kind: "collapsed",
        lines: contextRun.slice(
          CONTEXT_VISIBLE_LINES,
          contextRun.length - CONTEXT_VISIBLE_LINES,
        ),
        collapsedCount: hiddenCount,
      });
      segments.push({ kind: "lines", lines: bottom });
    } else {
      segments.push({ kind: "lines", lines: contextRun });
    }
    contextRun = [];
  };

  for (const line of lines) {
    if (line.type === "context") {
      contextRun.push(line);
    } else {
      flushContext();
      if (
        segments.length > 0 && segments[segments.length - 1].kind === "lines"
      ) {
        segments[segments.length - 1].lines.push(line);
      } else {
        segments.push({ kind: "lines", lines: [line] });
      }
    }
  }
  flushContext();
  return segments;
}

/* ------------------------------------------------------------------ */
/* DiffViewer                                                          */
/* ------------------------------------------------------------------ */

/**
 * Git diff viewer with unified or side-by-side rendering.
 *
 * Displays file hunks with line numbers, change indicators (+/−), and automatic collapsing
 * of long context sections. Supports both unified (single column) and split (side-by-side) modes.
 * Includes keyboard navigation and accessibility labels.
 *
 * @example
 * ```tsx
 * <DiffViewer
 *   hunks={parseDiff(diffText)}
 *   oldFileName="old.ts"
 *   newFileName="new.ts"
 *   mode="split"
 * />
 * ```
 */
export function DiffViewer({
  hunks,
  oldFileName,
  newFileName,
  mode = "unified",
  className,
}: DiffViewerProps): ReactNode {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  const toggleExpand = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const hasFileNames = oldFileName || newFileName;

  return (
    <div
      aria-label={`Diff: ${oldFileName ?? ""} ${newFileName ? `to ${newFileName}` : ""}`}
      className={cx(rootStyle, className)}
    >
      {/* File name header */}
      {hasFileNames && (
        <div className={fileHeader}>
          {oldFileName && newFileName && oldFileName !== newFileName
            ? (
              <span>
                <span className={fileNameMuted}>{oldFileName}</span>
                <span className={fileNameArrow}>→</span>
                <span className={fileNamePrimary}>{newFileName}</span>
              </span>
            )
            : (
              <span className={fileNamePrimary}>
                {newFileName ?? oldFileName}
              </span>
            )}
        </div>
      )}

      {/* Hunks */}
      {hunks.map((hunk, hunkIdx) => {
        const segments = segmentLines(hunk.lines);
        return (
          <div key={hunkIdx}>
            {/* Hunk header */}
            <div className={hunkHeaderStyle}>{hunk.header}</div>

            {/* Lines */}
            {mode === "unified"
              ? renderUnified(segments, hunkIdx, expandedSections, toggleExpand)
              : renderSplit(segments, hunkIdx, expandedSections, toggleExpand)}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Unified renderer                                                    */
/* ------------------------------------------------------------------ */

function renderUnified(
  segments: DisplaySegment[],
  hunkIdx: number,
  expanded: Set<string>,
  toggleExpand: (key: string) => void,
) {
  return segments.map((seg, segIdx) => {
    const key = `${hunkIdx}-${segIdx}`;
    if (seg.kind === "collapsed" && !expanded.has(key)) {
      return (
        <div key={key} className={collapsedRow}>
          <button
            className={expandBtn}
            onClick={() => toggleExpand(key)}
            type="button"
          >
            {`\u2195 ${seg.collapsedCount} unchanged lines`}
          </button>
        </div>
      );
    }

    const lines = seg.kind === "collapsed" ? seg.lines : seg.lines;
    return lines.map((line, lineIdx) => {
      const bg = line.type === "add" ? addBg : line.type === "remove" ? removeBg : undefined;
      const prefix = line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";
      const ariaLabel = line.type === "add"
        ? `Added: ${line.content}`
        : line.type === "remove"
        ? `Removed: ${line.content}`
        : undefined;

      return (
        <div
          key={`${key}-${lineIdx}`}
          className={cx(unifiedRow, bg)}
          aria-label={ariaLabel}
        >
          <span className={lineNumCell}>{line.oldLineNumber ?? ""}</span>
          <span className={lineNumCell}>{line.newLineNumber ?? ""}</span>
          <span className={cx(prefixCell, bg)}>{prefix}</span>
          <span className={contentCell}>{line.content}</span>
        </div>
      );
    });
  });
}

/* ------------------------------------------------------------------ */
/* Split renderer                                                      */
/* ------------------------------------------------------------------ */

interface SplitRow {
  left: DiffLine | null;
  right: DiffLine | null;
}

function buildSplitRows(lines: DiffLine[]): SplitRow[] {
  const rows: SplitRow[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.type === "context") {
      rows.push({ left: line, right: line });
      i++;
    } else if (line.type === "remove") {
      // Collect consecutive removes, then pair with consecutive adds
      const removes: DiffLine[] = [];
      while (i < lines.length && lines[i].type === "remove") {
        removes.push(lines[i]);
        i++;
      }
      const adds: DiffLine[] = [];
      while (i < lines.length && lines[i].type === "add") {
        adds.push(lines[i]);
        i++;
      }
      const max = Math.max(removes.length, adds.length);
      for (let j = 0; j < max; j++) {
        rows.push({
          left: j < removes.length ? removes[j] : null,
          right: j < adds.length ? adds[j] : null,
        });
      }
    } else if (line.type === "add") {
      rows.push({ left: null, right: line });
      i++;
    }
  }
  return rows;
}

function renderSplit(
  segments: DisplaySegment[],
  hunkIdx: number,
  expanded: Set<string>,
  toggleExpand: (key: string) => void,
) {
  return segments.map((seg, segIdx) => {
    const key = `${hunkIdx}-${segIdx}`;
    if (seg.kind === "collapsed" && !expanded.has(key)) {
      return (
        <div key={key} className={collapsedRow}>
          <button
            className={expandBtn}
            onClick={() => toggleExpand(key)}
            type="button"
          >
            {`\u2195 ${seg.collapsedCount} unchanged lines`}
          </button>
        </div>
      );
    }

    const splitRows = buildSplitRows(seg.lines);
    return splitRows.map((row, rowIdx) => (
      <div key={`${key}-${rowIdx}`} className={splitRowStyle}>
        {/* Left (old) */}
        <div
          className={cx(
            splitHalf,
            splitLeftBorder,
            row.left?.type === "remove" ? removeBg : undefined,
          )}
          aria-label={row.left?.type === "remove" ? `Removed: ${row.left.content}` : undefined}
        >
          <span className={lineNumCell}>{row.left?.oldLineNumber ?? ""}</span>
          <span
            className={cx(
              prefixCell,
              row.left?.type === "remove" ? removeBg : undefined,
            )}
          >
            {row.left?.type === "remove" ? "-" : row.left ? " " : ""}
          </span>
          <span className={contentCell}>{row.left?.content ?? ""}</span>
        </div>

        {/* Right (new) */}
        <div
          className={cx(
            splitHalf,
            row.right?.type === "add" ? addBg : undefined,
          )}
          aria-label={row.right?.type === "add" ? `Added: ${row.right.content}` : undefined}
        >
          <span className={lineNumCell}>{row.right?.newLineNumber ?? ""}</span>
          <span
            className={cx(
              prefixCell,
              row.right?.type === "add" ? addBg : undefined,
            )}
          >
            {row.right?.type === "add" ? "+" : row.right ? " " : ""}
          </span>
          <span className={contentCell}>{row.right?.content ?? ""}</span>
        </div>
      </div>
    ));
  });
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const rootStyle = css({
  borderRadius: "0",
  overflow: "hidden",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  fontFamily: "mono",
  fontSize: "13",
  lineHeight: 1.6,
  color: "text.primary",
});

const fileHeader = css({
  display: "flex",
  alignItems: "center",
  py: "2.5",
  px: "4",
  backgroundColor: "bg.card",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderBottomColor: "border.default",
  fontSize: "13",
  fontWeight: "button",
});

const fileNamePrimary = css({
  color: "text.primary",
});

const fileNameMuted = css({
  color: "text.muted",
});

const fileNameArrow = css({
  color: "text.muted",
  py: "0",
  px: "1",
});

const hunkHeaderStyle = css({
  py: "1.5",
  px: "4",
  backgroundColor: {
    base: "slate.08",
    _dark: "slate.15",
  },
  color: "text.secondary",
  fontSize: "xs",
  fontFamily: "mono",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderBottomColor: "border.default",
});

const unifiedRow = css({
  display: "flex",
  minHeight: "5.5",
  alignItems: "stretch",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderBottomColor: "grid.06",
});

const lineNumCell = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "12",
  minWidth: "12",
  py: "0",
  px: "2",
  color: "text.secondary",
  fontSize: "11",
  userSelect: "none",
  borderRightWidth: "0.25",
  borderRightStyle: "solid",
  borderRightColor: "border.default",
});

const prefixCell = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "6",
  minWidth: "6",
  fontWeight: "button",
  userSelect: "none",
});

const contentCell = css({
  display: "inline-flex",
  alignItems: "center",
  flex: 1,
  py: "0",
  px: "3",
  whiteSpace: "pre",
  overflowX: "auto",
});

const addBg = css({
  backgroundColor: { base: "diff.add.bg", _dark: "diff.add.emphasis" },
  color: { _dark: "chrome.90" },
});

const removeBg = css({
  backgroundColor: { base: "diff.del.bg", _dark: "diff.del.emphasis" },
  color: { _dark: "chrome.90" },
});

const splitRowStyle = css({
  display: "flex",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderBottomColor: "grid.06",
});

const splitHalf = css({
  display: "flex",
  flex: 1,
  minHeight: "5.5",
  alignItems: "stretch",
  overflow: "hidden",
});

const splitLeftBorder = css({
  borderRightWidth: "0.25",
  borderRightStyle: "solid",
  borderRightColor: "border.default",
});

const collapsedRow = css({
  display: "flex",
  justifyContent: "center",
  py: "1",
  px: "0",
  backgroundColor: "slate.05",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderBottomColor: "grid.06",
});

const expandBtn = css({
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "mono",
  fontSize: "11",
  color: "text.muted",
  py: "0.5",
  px: "3",
  borderRadius: "md",
  transition: "all 0.15s ease",
  _hover: {
    color: "text.primary",
    backgroundColor: "slate.10",
  },
});
