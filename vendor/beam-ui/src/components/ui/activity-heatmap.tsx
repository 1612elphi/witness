import { css, cx } from "../../system.ts";

import { type ReactNode, useMemo } from "react";
import { useTheme } from "../../hooks/use-theme.ts";
import { ScrollArea } from "./scroll-area.tsx";

/** Single day in the activity heatmap. */
export interface ActivityDay {
  /** ISO 8601 date string (YYYY-MM-DD). */
  date: string;
  /** Number of contributions or activities on this day. */
  count: number;
}

/** Props for {@link ActivityHeatmap}. */
export interface ActivityHeatmapProps {
  /** Array of daily activity data (last 365 days). */
  data: ActivityDay[];
  /** Additional Panda CSS classes. */
  className?: string;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const LEVEL_COLORS_LIGHT = [
  "rgba(127,99,21,0.08)", // border.subtle (light)
  "#ffe8a0", // very light gold
  "#ffd06a", // sunshine.300
  "#ffb83e", // sunshine.500
  "#fa520f", // sunbeam.orange
];

const LEVEL_COLORS_DARK = [
  "rgba(255,161,16,0.08)", // border.subtle (dark)
  "rgba(255,208,106,0.25)", // faint gold
  "#ffd06a", // sunshine.300
  "#ffb83e", // sunshine.500
  "#fa520f", // sunbeam.orange
];

function getLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

const CELL = 11;
const GAP = 2;
const STEP = CELL + GAP;
const LABEL_W = 32;

/**
 * GitHub-style activity heatmap showing contributions over the last 365 days.
 *
 * Renders an SVG grid where each cell represents one day, colored by intensity (0–5 levels).
 * Includes month labels, day-of-week labels, and a legend. Horizontally scrollable on small screens.
 *
 * @example
 * ```tsx
 * const data = [
 *   { date: "2026-01-01", count: 3 },
 *   { date: "2026-01-02", count: 0 },
 * ];
 * <ActivityHeatmap data={data} />
 * ```
 */
export function ActivityHeatmap(
  { data, className }: ActivityHeatmapProps,
): ReactNode {
  const { theme } = useTheme();
  const colors = theme === "dark" ? LEVEL_COLORS_DARK : LEVEL_COLORS_LIGHT;

  const { weeks, monthLabels, totalWeeks } = useMemo(() => {
    const lookup = new Map<string, number>();
    for (const d of data) lookup.set(d.date, d.count);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start 52 weeks ago, aligned to Sunday
    const start = new Date(today);
    start.setDate(start.getDate() - 363);
    start.setDate(start.getDate() - start.getDay());

    const weeksArr: { date: string; count: number; dow: number }[][] = [];
    const months: { label: string; x: number }[] = [];
    let lastMonth = -1;
    const cursor = new Date(start);

    while (cursor <= today) {
      const week: { date: string; count: number; dow: number }[] = [];
      for (let d = 0; d < 7; d++) {
        if (cursor > today) break;
        const ds = cursor.toISOString().split("T")[0];
        const m = cursor.getMonth();
        if (m !== lastMonth) {
          months.push({ label: MONTH_NAMES[m], x: weeksArr.length });
          lastMonth = m;
        }
        week.push({
          date: ds,
          count: lookup.get(ds) ?? 0,
          dow: cursor.getDay(),
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeksArr.push(week);
    }

    return {
      weeks: weeksArr,
      monthLabels: months,
      totalWeeks: weeksArr.length,
    };
  }, [data]);

  const svgW = LABEL_W + totalWeeks * STEP;
  const svgH = 20 + 7 * STEP + 24; // month labels + cells + legend

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <ScrollArea
      direction="horizontal"
      scrollbar="hover"
      className={cx(wrapper, className)}
    >
      <div
        role="img"
        aria-label={`Activity heatmap: ${total} contributions in the last year`}
      >
        <a href="#after-heatmap" className="sr-only">Skip activity heatmap</a>
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          className={svg}
          aria-hidden="true"
        >
          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={LABEL_W + m.x * STEP}
              y={12}
              className={svgText}
              fill={theme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {[1, 3, 5].map((dow) => (
            <text
              key={dow}
              x={LABEL_W - 6}
              y={20 + dow * STEP + CELL - 2}
              className={svgTextEnd}
              fill={theme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dow]}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((day) => (
              <rect
                key={day.date}
                x={LABEL_W + wi * STEP}
                y={20 + day.dow * STEP}
                width={CELL}
                height={CELL}
                rx={2}
                fill={colors[getLevel(day.count)]}
              >
                <title>
                  {day.count} contribution{day.count !== 1 ? "s" : ""} on {day.date}
                </title>
              </rect>
            ))
          )}

          {/* Legend */}
          <text
            x={svgW - 5 * (CELL + 3) - 36}
            y={svgH - 4}
            className={svgTextEnd}
            fill={theme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
          >
            Less
          </text>
          {[0, 1, 2, 3, 4].map((level) => (
            <rect
              key={level}
              x={svgW - (5 - level) * (CELL + 3) - 30}
              y={svgH - CELL - 5}
              width={CELL}
              height={CELL}
              rx={2}
              fill={colors[level]}
            />
          ))}
          <text
            x={svgW - 1}
            y={svgH - 4}
            className={svgTextEnd}
            fill={theme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
          >
            More
          </text>
        </svg>
        <span id="after-heatmap" />
      </div>
    </ScrollArea>
  );
}

const wrapper = css({});

const svg = css({
  display: "block",
});

const svgText = css({
  fontSize: "2xs",
  fontFamily: "body",
});

const svgTextEnd = css({
  fontSize: "9",
  fontFamily: "body",
  textAnchor: "end",
});
