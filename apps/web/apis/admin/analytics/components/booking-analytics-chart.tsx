"use client";

import { bookingTrendMock as MOCK_DATA } from "../mock-data";

const SVG_WIDTH = 500;
const SVG_HEIGHT = 220;
const GRAPH_HEIGHT = 160;
const GRAPH_WIDTH = 440;
const START_X = 45;
const START_Y = 20;
const MAX_VAL = 350;

export function BookingAnalyticsChart() {
  // Convert values to Y-coordinates
  const toY = (val: number) => {
    return START_Y + GRAPH_HEIGHT - (val / MAX_VAL) * GRAPH_HEIGHT;
  };

  // Divide width into slots for each month
  const stepX = GRAPH_WIDTH / MOCK_DATA.length;
  const barWidth = 14;

  return (
    <div className="flex h-85 flex-col justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Xu hướng đặt lịch</h3>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="inline-block h-3 w-3 rounded-sm bg-blue-500"></span>
              Hoàn tất
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="inline-block h-3 w-3 rounded-sm bg-rose-400"></span>
              Đã hủy
            </span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative flex-1">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {[0, 100, 200, 300].map((tick) => (
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
                className="text-[10px] font-medium fill-gray-400"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Data Bars */}
          {MOCK_DATA.map((d, i) => {
            const centerX = START_X + i * stepX + stepX / 2;
            const completedHeight = (d.completed / MAX_VAL) * GRAPH_HEIGHT;
            const cancelledHeight = (d.cancelled / MAX_VAL) * GRAPH_HEIGHT;

            const compX = centerX - barWidth - 2;
            const compY = toY(d.completed);

            const cancX = centerX + 2;
            const cancY = toY(d.cancelled);

            return (
              <g key={d.month} className="group">
                {/* Completed Bar */}
                <rect
                  x={compX}
                  y={compY}
                  width={barWidth}
                  height={completedHeight}
                  rx="3"
                  className="fill-blue-500 transition-colors duration-200 hover:fill-blue-600"
                >
                  <title>{`Hoàn tất: ${d.completed}`}</title>
                </rect>

                {/* Cancelled Bar */}
                <rect
                  x={cancX}
                  y={cancY}
                  width={barWidth}
                  height={cancelledHeight}
                  rx="3"
                  className="fill-rose-400 transition-colors duration-200 hover:fill-rose-500"
                >
                  <title>{`Đã hủy: ${d.cancelled}`}</title>
                </rect>

                {/* X-axis Label */}
                <text
                  x={centerX}
                  y={START_Y + GRAPH_HEIGHT + 20}
                  textAnchor="middle"
                  className="fill-gray-400 text-[11px] font-medium transition-colors group-hover:fill-gray-700"
                >
                  {d.month}
                </text>
              </g>
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
