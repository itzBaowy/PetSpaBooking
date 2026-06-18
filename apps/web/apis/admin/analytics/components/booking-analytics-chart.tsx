"use client";

const MOCK_DATA = [
  { month: "Jan", completed: 180, cancelled: 15 },
  { month: "Feb", completed: 215, cancelled: 24 },
  { month: "Mar", completed: 260, cancelled: 18 },
  { month: "Apr", completed: 230, cancelled: 32 },
  { month: "May", completed: 285, cancelled: 21 },
  { month: "Jun", completed: 325, cancelled: 14 },
];

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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between h-[340px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Booking Trends</h3>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="w-3 h-3 bg-blue-500 rounded-sm inline-block"></span>
              Completed
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="w-3 h-3 bg-rose-400 rounded-sm inline-block"></span>
              Cancelled
            </span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative flex-1">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full"
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
                  className="fill-blue-500 hover:fill-blue-600 transition-colors duration-200"
                >
                  <title>{`Completed: ${d.completed}`}</title>
                </rect>

                {/* Cancelled Bar */}
                <rect
                  x={cancX}
                  y={cancY}
                  width={barWidth}
                  height={cancelledHeight}
                  rx="3"
                  className="fill-rose-400 hover:fill-rose-500 transition-colors duration-200"
                >
                  <title>{`Cancelled: ${d.cancelled}`}</title>
                </rect>

                {/* X-axis Label */}
                <text
                  x={centerX}
                  y={START_Y + GRAPH_HEIGHT + 20}
                  textAnchor="middle"
                  className="text-[11px] font-medium fill-gray-400 group-hover:fill-gray-700 transition-colors"
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
