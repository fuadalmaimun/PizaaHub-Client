"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChartDatum = {
  name: string;
  value: number;
  color?: string;
};

type TooltipPayload = ReadonlyArray<{
  name?: string | number;
  value?: number | string;
  color?: string;
  payload?: { name?: string };
}>;

function ChartTooltip({
  active,
  payload,
  label,
  suffix = "",
}: {
  active?: boolean;
  payload?: TooltipPayload;
  label?: string | number;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const name = item?.payload?.name ?? item?.name ?? label;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0f11]/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="font-semibold text-white">{name}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-white/60">
        <span
          className="inline-block size-2 rounded-full"
          style={{ background: item?.color ?? "#10b981" }}
        />
        {typeof item?.value === "number" ? item.value : String(item?.value ?? 0)}
        {suffix}
      </p>
    </div>
  );
}

const AXIS_TICK = { fill: "rgba(255,255,255,0.45)", fontSize: 11 };

/**
 * Donut chart with a custom legend. Used for role, order and menu status
 * breakdowns. Falls back to a friendly empty state when every value is zero.
 */
export function DonutChart({
  data,
  centerValue,
  centerLabel,
  height = 220,
  suffix = "",
}: {
  data: ChartDatum[];
  centerValue: string | number;
  centerLabel: string;
  height?: number;
  suffix?: string;
}) {
  const visible = data.filter((entry) => entry.value > 0);
  const total = visible.reduce((sum, entry) => sum + entry.value, 0);

  if (visible.length === 0) {
    return (
      <div
        className="grid place-items-center rounded-xl border border-dashed border-white/10 text-xs text-white/40"
        style={{ height }}
      >
        No data yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto w-full max-w-[220px] shrink-0" style={{ height }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 220, height }}
        >
          <PieChart>
            <Pie
              data={visible}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
            >
              {visible.map((entry) => (
                <Cell key={entry.name} fill={entry.color ?? "#10b981"} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip suffix={suffix} />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{centerValue}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
              {centerLabel}
            </p>
          </div>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-2.5">
        {visible.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2.5 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: entry.color ?? "#10b981" }}
            />
            <span className="min-w-0 flex-1 truncate capitalize text-white/60">
              {entry.name}
            </span>
            <span className="font-semibold text-white">{entry.value}</span>
            <span className="w-10 text-right text-white/35">
              {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Rounded bar chart for status counts. */
export function BarSeriesChart({
  data,
  color = "#10b981",
  height = 240,
  suffix = "",
}: {
  data: ChartDatum[];
  color?: string;
  height?: number;
  suffix?: string;
}) {
  if (data.length === 0) {
    return (
      <div
        className="grid place-items-center rounded-xl border border-dashed border-white/10 text-xs text-white/40"
        style={{ height }}
      >
        No data yet
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 600, height }}
      >
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="bar-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.95} />
              <stop offset="100%" stopColor={color} stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 6"
            vertical={false}
            stroke="rgba(255,255,255,0.07)"
          />
          <XAxis
            dataKey="name"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            allowDecimals={false}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={38}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={<ChartTooltip suffix={suffix} />}
          />
          <Bar dataKey="value" radius={[8, 8, 2, 2]} maxBarSize={46}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color ?? "url(#bar-fill)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Soft area chart used for monthly revenue trends. */
export function AreaTrendChart({
  data,
  color = "#10b981",
  height = 240,
  suffix = "",
  valuePrefix = "",
}: {
  data: ChartDatum[];
  color?: string;
  height?: number;
  suffix?: string;
  valuePrefix?: string;
}) {
  if (data.length === 0) {
    return (
      <div
        className="grid place-items-center rounded-xl border border-dashed border-white/10 text-xs text-white/40"
        style={{ height }}
      >
        No data yet
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 600, height }}
      >
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 6"
            vertical={false}
            stroke="rgba(255,255,255,0.07)"
          />
          <XAxis
            dataKey="name"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            allowDecimals={false}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={38}
            tickFormatter={(value: number) => `${valuePrefix}${value}`}
          />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.15)" }}
            content={<ChartTooltip suffix={suffix} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill="url(#area-fill)"
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
