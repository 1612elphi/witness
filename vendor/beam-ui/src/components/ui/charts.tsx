import { css, cx, token } from "../../system.ts";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart as RAreaChart,
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RLineChart,
  Pie,
  PieChart as RPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ------------------------------------------------------------------ */
/* Shared types & constants                                            */
/* ------------------------------------------------------------------ */

interface ChartDataPoint {
  label: string;
  [key: string]: string | number;
}

interface BeamTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{ color?: string; name?: string; value?: number | string }>;
}

const DEFAULT_COLORS = [
  "#fa520f", // sunbeam orange
  "#4a9eff", // steel blue
  "#5bb8a6", // teal
  "#a855f7", // purple
  "#f59e0b", // amber
  "#ef4444", // red
  "#22c55e", // green
  "#ec4899", // pink
];

/* ------------------------------------------------------------------ */
/* Custom tooltip                                                      */
/* ------------------------------------------------------------------ */
function BeamTooltip({ active, payload, label }: BeamTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className={tooltipWrapper}>
      {label && <p className={tooltipLabel}>{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className={tooltipEntry}>
          <span
            className={tooltipDot}
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}:{" "}
          <strong className={tooltipValue}>
            {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </strong>
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* LineChart                                                           */
/* ------------------------------------------------------------------ */

/** Props for {@link LineChart}. */
export interface LineChartProps {
  /** Array of data points with a `label` key and numeric data series. */
  data: ChartDataPoint[];
  /** Array of line series; each specifies a data `key`, optional `color`, and optional `label`. */
  lines: { key: string; color?: string; label?: string }[];
  /** Chart width as a number (px) or CSS string. Defaults to "100%". */
  width?: number | string;
  /** Chart height in pixels. Defaults to 300. */
  height?: number;
  /** Additional Panda CSS classes. */
  className?: string;
  /** Accessible description of the chart for screen readers. */
  "aria-label"?: string;
}

/**
 * Recharts line chart wrapper with beam-ui styling.
 *
 * Displays one or more lines with grid, axes, legend, and tooltip. Custom tooltip shows
 * data values with consistent formatting. Colors cycle from a warm palette if not specified.
 *
 * @example
 * ```tsx
 * <LineChart
 *   data={[{ label: "Jan", revenue: 4000 }, { label: "Feb", revenue: 5200 }]}
 *   lines={[{ key: "revenue", label: "Monthly Revenue" }]}
 * />
 * ```
 */
export function LineChart(
  {
    data,
    lines,
    width = "100%",
    height = 300,
    className,
    "aria-label": ariaLabel,
  }: LineChartProps,
): ReactNode {
  const defaultLabel = `Line chart with ${data.length} data points`;
  return (
    <div
      className={cx(chartWrapper, className)}
      role="img"
      aria-label={ariaLabel ?? defaultLabel}
      style={{ width }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RLineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={token.var("colors.grid.15")}
          />
          <XAxis
            dataKey="label"
            tick={axisTick}
            axisLine={{ stroke: token.var("colors.grid.20") }}
            tickLine={false}
          />
          <YAxis
            tick={axisTick}
            axisLine={{ stroke: token.var("colors.grid.20") }}
            tickLine={false}
          />
          <Tooltip content={<BeamTooltip />} />
          <Legend
            wrapperStyle={{
              fontSize: token.var("fontSizes.xs"),
              fontFamily: "var(--fonts-body)",
              color: token.var("colors.text.primary"),
            }}
          />
          {lines.map((line, i) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label ?? line.key}
              stroke={line.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BarChart                                                            */
/* ------------------------------------------------------------------ */

/** Props for {@link BarChart}. */
export interface BarChartProps {
  /** Array of data points with a `label` key and numeric data series. */
  data: ChartDataPoint[];
  /** Array of bar series; each specifies a data `key`, optional `color`, and optional `label`. */
  bars: { key: string; color?: string; label?: string }[];
  /** Chart width as a number (px) or CSS string. Defaults to "100%". */
  width?: number | string;
  /** Chart height in pixels. Defaults to 300. */
  height?: number;
  /** Additional Panda CSS classes. */
  className?: string;
  /** Accessible description of the chart for screen readers. */
  "aria-label"?: string;
}

/**
 * Recharts bar chart wrapper with beam-ui styling.
 *
 * Displays grouped or stacked bars with grid, axes, legend, and tooltip. Bars have
 * subtle rounded corners. Colors cycle from warm palette if not specified.
 *
 * @example
 * ```tsx
 * <BarChart
 *   data={[{ label: "Q1", sales: 2400, costs: 1800 }]}
 *   bars={[{ key: "sales" }, { key: "costs" }]}
 * />
 * ```
 */
export function BarChart(
  {
    data,
    bars,
    width = "100%",
    height = 300,
    className,
    "aria-label": ariaLabel,
  }: BarChartProps,
): ReactNode {
  const defaultLabel = `Bar chart with ${data.length} data points`;
  return (
    <div
      className={cx(chartWrapper, className)}
      role="img"
      aria-label={ariaLabel ?? defaultLabel}
      style={{ width }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RBarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={token.var("colors.grid.15")}
          />
          <XAxis
            dataKey="label"
            tick={axisTick}
            axisLine={{ stroke: token.var("colors.grid.20") }}
            tickLine={false}
          />
          <YAxis
            tick={axisTick}
            axisLine={{ stroke: token.var("colors.grid.20") }}
            tickLine={false}
          />
          <Tooltip content={<BeamTooltip />} />
          <Legend
            wrapperStyle={{
              fontSize: token.var("fontSizes.xs"),
              fontFamily: "var(--fonts-body)",
              color: token.var("colors.text.primary"),
            }}
          />
          {bars.map((bar, i) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.label ?? bar.key}
              fill={bar.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PieChart                                                            */
/* ------------------------------------------------------------------ */

/** Props for {@link PieChart}. */
export interface PieChartProps {
  /** Array of segments; each with `name`, `value`, and optional `color`. */
  data: { name: string; value: number; color?: string }[];
  /** Chart width as a number (px) or CSS string. Defaults to "100%". */
  width?: number | string;
  /** Chart height in pixels. Defaults to 300. */
  height?: number;
  /** If true, renders as a donut (hollow center) instead of a pie. Defaults to false. */
  donut?: boolean;
  /** Additional Panda CSS classes. */
  className?: string;
  /** Accessible description of the chart for screen readers. */
  "aria-label"?: string;
}

/**
 * Recharts pie/donut chart wrapper with beam-ui styling.
 *
 * Displays proportional segments with legend and tooltip. Donut mode adds a hollow center
 * and slight spacing between slices. Colors cycle from warm palette if not specified.
 *
 * @example
 * ```tsx
 * <PieChart
 *   data={[
 *     { name: "Completed", value: 65 },
 *     { name: "In Progress", value: 25 },
 *     { name: "Blocked", value: 10 },
 *   ]}
 *   donut={true}
 * />
 * ```
 */
export function PieChart(
  {
    data,
    width = "100%",
    height = 300,
    donut = false,
    className,
    "aria-label": ariaLabel,
  }: PieChartProps,
): ReactNode {
  const defaultLabel = `${donut ? "Donut" : "Pie"} chart with ${data.length} segments`;
  return (
    <div
      className={cx(chartWrapper, className)}
      role="img"
      aria-label={ariaLabel ?? defaultLabel}
      style={{ width }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={donut ? 60 : 0}
            outerRadius={100}
            dataKey="value"
            nameKey="name"
            paddingAngle={donut ? 2 : 0}
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={entry.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<BeamTooltip />} />
          <Legend
            wrapperStyle={{
              fontSize: token.var("fontSizes.xs"),
              fontFamily: "var(--fonts-body)",
              color: token.var("colors.text.primary"),
            }}
          />
        </RPieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AreaChart                                                           */
/* ------------------------------------------------------------------ */

/** Props for {@link AreaChart}. */
export interface AreaChartProps {
  /** Array of data points with a `label` key and numeric data series. */
  data: ChartDataPoint[];
  /** Array of area series; each specifies a data `key`, optional `color`, and optional `label`. */
  areas: { key: string; color?: string; label?: string }[];
  /** Chart width as a number (px) or CSS string. Defaults to "100%". */
  width?: number | string;
  /** Chart height in pixels. Defaults to 300. */
  height?: number;
  /** Additional Panda CSS classes. */
  className?: string;
  /** Accessible description of the chart for screen readers. */
  "aria-label"?: string;
}

/**
 * Recharts area chart wrapper with beam-ui styling.
 *
 * Displays stacked or overlapping areas with grid, axes, legend, and tooltip. Fill color
 * is semi-transparent (15% opacity) for visibility when stacked. Colors cycle from warm palette if not specified.
 *
 * @example
 * ```tsx
 * <AreaChart
 *   data={[{ label: "Mon", desktop: 400, mobile: 240 }]}
 *   areas={[{ key: "desktop" }, { key: "mobile" }]}
 * />
 * ```
 */
export function AreaChart(
  {
    data,
    areas,
    width = "100%",
    height = 300,
    className,
    "aria-label": ariaLabel,
  }: AreaChartProps,
): ReactNode {
  const defaultLabel = `Area chart with ${data.length} data points`;
  return (
    <div
      className={cx(chartWrapper, className)}
      role="img"
      aria-label={ariaLabel ?? defaultLabel}
      style={{ width }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RAreaChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={token.var("colors.grid.15")}
          />
          <XAxis
            dataKey="label"
            tick={axisTick}
            axisLine={{ stroke: token.var("colors.grid.20") }}
            tickLine={false}
          />
          <YAxis
            tick={axisTick}
            axisLine={{ stroke: token.var("colors.grid.20") }}
            tickLine={false}
          />
          <Tooltip content={<BeamTooltip />} />
          <Legend
            wrapperStyle={{
              fontSize: token.var("fontSizes.xs"),
              fontFamily: "var(--fonts-body)",
              color: token.var("colors.text.primary"),
            }}
          />
          {areas.map((area, i) => {
            const color = area.color ??
              DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            return (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                name={area.label ?? area.key}
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            );
          })}
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const chartWrapper = css({
  backgroundColor: "bg.card",
  border: "1px solid",
  borderColor: "border.default",
  borderRadius: "0",
  padding: "6",
});

const axisTick = {
  fontSize: token.var("fontSizes.11"),
  fill: token.var("colors.text.secondary"),
  fontFamily: "'Monaspace Argon', 'SF Mono', 'Fira Code', monospace",
};

const tooltipWrapper = css({
  backgroundColor: "bg.page",
  border: "1px solid",
  borderColor: "border.default",
  py: "3",
  px: "4",
  fontSize: "13",
  fontFamily: "body",
  color: "text.primary",
  shadow: "sm",
});

const tooltipLabel = css({
  fontWeight: "heading",
  marginBottom: "1",
  fontSize: "xs",
  color: "text.secondary",
});

const tooltipEntry = css({
  display: "flex",
  alignItems: "center",
  gap: "1.5",
  fontSize: "13",
  margin: 0,
  lineHeight: 1.6,
});

const tooltipValue = css({
  fontFamily: "mono",
});

const tooltipDot = css({
  width: "2",
  height: "2",
  borderRadius: "50%",
  flexShrink: 0,
});
