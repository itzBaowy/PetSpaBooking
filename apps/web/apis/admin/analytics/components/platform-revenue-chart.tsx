"use client";

import { useId } from "react";
import { formatCurrency } from "@/lib/currency";
import type { DailyRevenuePoint } from "@/apis/admin/reports/schema";

const SVG_WIDTH = 500;
const SVG_HEIGHT = 220;
const GRAPH_HEIGHT = 160;
const GRAPH_WIDTH = 430;
const START_X = 55;
const START_Y = 20;

export function PlatformRevenueChart({ data }: { data: DailyRevenuePoint[] }) {
  const safeId = useId().replace(/:/g, "");
  const gradientId = `areaGrad-${safeId}`;
  const clipId = `chartClip-${safeId}`;

  if (data.length === 0) {
    return (
      <div className="flex h-[320px] min-w-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="font-semibold text-gray-800">Phân tích doanh thu</h3>
        <div className="grid flex-1 place-items-center text-sm font-medium text-gray-400">
          Chưa có booking hoàn tất trong kỳ này.
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.bookingAmount), 1);
  const toX = (index: number) => START_X + (index / Math.max(data.length - 1, 1)) * GRAPH_WIDTH;
  const toY = (value: number) => START_Y + GRAPH_HEIGHT - (value / maxValue) * GRAPH_HEIGHT;
  const points = data.map((item, index) => `${toX(index)},${toY(item.bookingAmount)}`).join(" ");
  const areaPoints = `${toX(0)},${START_Y + GRAPH_HEIGHT} ${points} ${toX(data.length - 1)},${START_Y + GRAPH_HEIGHT}`;
  const total = data.reduce((sum, item) => sum + item.bookingAmount, 0);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(maxValue * ratio));

  return (
    <div className="flex h-[320px] min-w-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="min-w-0">
        <div className="mb-1 flex min-w-0 items-start justify-between gap-3">
          <h3 className="min-w-0 break-words font-semibold text-gray-800">Phân tích doanh thu</h3>
          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Theo kỳ
          </span>
        </div>
        <p className="break-words text-xl font-bold leading-none text-gray-900 sm:text-2xl">
          {formatCurrency(total, "VND")}
        </p>
      </div>

      <div className="relative mt-4 h-[210px] min-w-0 shrink-0 overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="block h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
            <clipPath id={clipId}>
              <rect x={START_X} y={START_Y} width={GRAPH_WIDTH} height={GRAPH_HEIGHT} />
            </clipPath>
          </defs>

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

          <g clipPath={`url(#${clipId})`}>
            <polygon points={areaPoints} fill={`url(#${gradientId})`} />
            <polyline
              points={points}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {data.map((item, index) => (
              <circle
                key={item.date}
                cx={toX(index)}
                cy={toY(item.bookingAmount)}
                r="4"
                className="cursor-pointer fill-blue-600 stroke-white transition-all hover:r-6"
                strokeWidth="2"
              >
                <title>{`${item.date}: ${formatCurrency(item.bookingAmount, "VND")}`}</title>
              </circle>
            ))}
          </g>

          {data.map((item, index) => {
            if (index % 2 !== 0 && index !== data.length - 1) return null;
            return (
              <text
                key={item.date}
                x={toX(index)}
                y={START_Y + GRAPH_HEIGHT + 20}
                textAnchor="middle"
                className="text-[10px] font-medium fill-gray-400"
              >
                {new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
              </text>
            );
          })}

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
