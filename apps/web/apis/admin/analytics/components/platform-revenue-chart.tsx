"use client";

import { formatCurrency } from "@/lib/currency";

const MOCK_REVENUE = [
  { month: "Jan", value: 8200000 },
  { month: "Feb", value: 9500000 },
  { month: "Mar", value: 11800000 },
  { month: "Apr", value: 10400000 },
  { month: "May", value: 13600000 },
  { month: "Jun", value: 12100000 },
  { month: "Jul", value: 15300000 },
  { month: "Aug", value: 14200000 },
  { month: "Sep", value: 16800000 },
  { month: "Oct", value: 18500000 },
  { month: "Nov", value: 17900000 },
  { month: "Dec", value: 19150000 },
];

const SVG_WIDTH = 500;
const SVG_HEIGHT = 220;
const GRAPH_HEIGHT = 160;
const GRAPH_WIDTH = 430;
const START_X = 55;
const START_Y = 20;
const MAX_VAL = 22000000;

export function PlatformRevenueChart() {
  const toX = (index: number) => {
    return START_X + (index / (MOCK_REVENUE.length - 1)) * GRAPH_WIDTH;
  };

  const toY = (val: number) => {
    return START_Y + GRAPH_HEIGHT - (val / MAX_VAL) * GRAPH_HEIGHT;
  };

  // Generate SVG coordinates
  const points = MOCK_REVENUE.map((d, i) => `${toX(i)},${toY(d.value)}`).join(
    " ",
  );
  const areaPoints = `${toX(0)},${START_Y + GRAPH_HEIGHT} ${points} ${toX(MOCK_REVENUE.length - 1)},${START_Y + GRAPH_HEIGHT}`;

  const total = MOCK_REVENUE.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between h-85">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-800">Revenue Analytics</h3>
          <span className="text-[10px] text-blue-600 bg-blue-50 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Yearly total
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
          {[0, 5000000, 10000000, 15000000, 20000000].map((tick) => (
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
                {tick >= 1000000 ? `${tick / 1000000}M` : "0"}
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
          {MOCK_REVENUE.map((d, i) => (
            <circle
              key={d.month}
              cx={toX(i)}
              cy={toY(d.value)}
              r="4"
              className="fill-blue-600 stroke-white hover:r-6 cursor-pointer transition-all"
              strokeWidth="2"
            >
              <title>{`${d.month}: ${formatCurrency(d.value, "VND")}`}</title>
            </circle>
          ))}

          {/* X-axis labels */}
          {MOCK_REVENUE.map((d, i) => {
            // Show label every second month to prevent overlap if screen is small
            if (i % 2 !== 0 && i !== MOCK_REVENUE.length - 1) return null;
            return (
              <text
                key={d.month}
                x={toX(i)}
                y={START_Y + GRAPH_HEIGHT + 20}
                textAnchor="middle"
                className="text-[10px] font-medium fill-gray-400"
              >
                {d.month}
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
