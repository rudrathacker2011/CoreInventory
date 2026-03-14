"use client";

import {
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
import { useEffect, useState } from "react";

// Resolve CSS custom properties at runtime
function useCssVar(varName: string, fallback: string) {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    const root = document.documentElement;
    const computed = getComputedStyle(root).getPropertyValue(varName).trim();
    if (computed) {
      setValue(`oklch(${computed})`);
    }
  }, [varName]);
  return value;
}

interface StockBarChartProps {
  data: { name: string; stock: number; sku: string }[];
}

const BAR_COLORS = [
  "#60a5fa", // blue-400
  "#34d399", // emerald-400
  "#a78bfa", // violet-400
  "#fbbf24", // amber-400
  "#f87171", // red-400
  "#2dd4bf", // teal-400
  "#e879f9", // fuchsia-400
  "#fb923c", // orange-400
];

export function StockBarChart({ data }: StockBarChartProps) {
  const mutedFg = useCssVar("--muted-foreground", "#a1a1aa");
  const borderColor = useCssVar("--border", "#27272a");
  const cardBg = useCssVar("--card", "#1c1917");
  const fg = useCssVar("--foreground", "#fafaf9");

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
        No products to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.08)"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1c1917",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#fafaf9",
            fontSize: "13px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
          }}
          itemStyle={{ color: "#fafaf9" }}
          labelStyle={{ color: "#a1a1aa", fontWeight: 600, marginBottom: 4 }}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar dataKey="stock" radius={[6, 6, 0, 0]} maxBarSize={50}>
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={BAR_COLORS[index % BAR_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface MoveTypePieChartProps {
  data: { name: string; value: number; fill: string }[];
}

const PIE_COLORS = [
  "#34d399", // Receipts  - emerald
  "#a78bfa", // Deliveries - violet
  "#60a5fa", // Transfers  - blue
  "#fbbf24", // Adjustments - amber
];

export function MoveTypePieChart({ data }: MoveTypePieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  // Override fill colors with the brighter palette
  const coloredData = data.map((d, i) => ({
    ...d,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
        No stock movements yet
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={coloredData.filter((d) => d.value > 0)}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {coloredData
              .filter((d) => d.value > 0)
              .map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1c1917",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fafaf9",
              fontSize: "13px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
            }}
            itemStyle={{ color: "#fafaf9" }}
            labelStyle={{ color: "#a1a1aa" }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
        {coloredData
          .filter((d) => d.value > 0)
          .map((entry) => (
            <div
              key={entry.name}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.fill }}
              />
              {entry.name}: {entry.value}
            </div>
          ))}
      </div>
    </div>
  );
}
