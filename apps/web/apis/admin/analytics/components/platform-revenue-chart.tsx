"use client";

import { formatCurrency } from "@/lib/currency";
import type { DailyRevenuePoint } from "@/apis/admin/reports/schema";

const SVG_WIDTH = 500;
const SVG_HEIGHT = 220;
const GRAPH_HEIGHT = 160;
const GRAPH_WIDTH = 430;
const START_X = 55;
const START_Y = 20;
export function PlatformRevenueChart({ data }: { data: DailyRevenuePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-85 flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800">Phân tích doanh thu</h3>
        <div className="grid flex-1 place-items-center text-sm font-medium text-gray-400">
          Chưa có booking hoàn tất trong kỳ này.
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.bookingAmount), 1);
  const toX = (index: number) => {
    return START_X + (index / Math.max(data.length - 1, 1)) * GRAPH_WIDTH;
  };

  const toY = (val: number) => {
    return START_Y + GRAPH_HEIGHT - (val / maxValue) * GRAPH_HEIGHT;
  };

  // Generate SVG coordinates
  const points = data.map((d, i) => `${toX(i)},${toY(d.bookingAmount)}`).join(
    " ",
  );
  const areaPoints = `${toX(0)},${START_Y + GRAPH_HEIGHT} ${points} ${toX(data.length - 1)},${START_Y + GRAPH_HEIGHT}`;

  const total = data.reduce((sum, d) => sum + d.bookingAmount, 0);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(maxValue * ratio));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between h-85">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-800">Phân tích doanh thu</h3>
          <span className="text-[10px] text-blue-600 bg-blue-50 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Theo kỳ
          </span>
        </div>
        <p className="text-2xl font-bold text-gray-900 leading-none">
          {formatCurrency(total, "VND")}
        </p>
      </div>

      {/* SVG Line / Area Chart */}
      <div className="relative flex-1 mt-4">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {ticks.map((tick) => (
            <g key={tick} className="opacity-40">
              <line
                x1={START_X}
                y1={toY(tick)}
                x2={START_X + GRAPH_WIDTH}
                y2={toY(tick)}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={START_X - 10}
                y={toY(tick) + 4}
                textAnchor="end"
                className="text-[9px] font-medium fill-gray-400"
              >
                {tick >= 1000000 ? `${(tick / 1000000).toFixed(1)}M` : tick.toLocaleString("vi-VN")}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <polygon points={areaPoints} fill="url(#areaGrad)" />

          {/* Polyline */}
          <polyline
            points={points}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {data.map((d, i) => (
            <circle
              key={d.date}
              cx={toX(i)}
              cy={toY(d.bookingAmount)}
              r="4"
              className="fill-blue-600 stroke-white hover:r-6 cursor-pointer transition-all"
              strokeWidth="2"
            >
              <title>{`${d.date}: ${formatCurrency(d.bookingAmount, "VND")}`}</title>
            </circle>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => {
            // Show label every second month to prevent overlap if screen is small
            if (i % 2 !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={d.date}
                x={toX(i)}
                y={START_Y + GRAPH_HEIGHT + 20}
                textAnchor="middle"
                className="text-[10px] font-medium fill-gray-400"
              >
                {new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
              </text>
            );
          })}

          {/* Bottom baseline */}
          <line
            x1={START_X}
            y1={START_Y + GRAPH_HEIGHT}
            x2={START_X + GRAPH_WIDTH}
            y2={START_Y + GRAPH_HEIGHT}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
