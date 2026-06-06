"use client";

import { useMemo, useState } from "react";
import { AdminIcon } from "./admin-shell";

type SaleItem = {
  id: string;
  orderNumber: string;
  total: string | number;
  placedAt: string;
};

type ChartDataPoint = {
  label: string;
  value: number;
  ordersCount: number;
  fullDate?: string;
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  }).format(val);
}

export function PremiumSalesChart({
  sales,
  preset,
  customFrom,
  customTo,
}: {
  sales: SaleItem[];
  preset: string | null;
  customFrom?: string;
  customTo?: string;
}) {
  const [viewType, setViewType] = useState<"line" | "bar">("line");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Process and bucket data points dynamically
  const dataPoints = useMemo<ChartDataPoint[]>(() => {
    if (!sales || sales.length === 0) {
      return [
        { label: "Mon", value: 0, ordersCount: 0 },
        { label: "Tue", value: 0, ordersCount: 0 },
        { label: "Wed", value: 0, ordersCount: 0 },
        { label: "Thu", value: 0, ordersCount: 0 },
        { label: "Fri", value: 0, ordersCount: 0 },
        { label: "Sat", value: 0, ordersCount: 0 },
        { label: "Sun", value: 0, ordersCount: 0 },
      ];
    }

    // Determine grouping type
    let mode: "hourly" | "weekly" | "daily" | "monthly" = "weekly";
    
    if (preset === "Today" || preset === "Yesterday") {
      mode = "hourly";
    } else if (preset === "This Week") {
      mode = "weekly";
    } else if (preset === "This Month") {
      mode = "daily";
    } else {
      // Analyze custom date range or overall sales dates
      const dates = sales.map(s => new Date(s.placedAt).getTime());
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      const diffDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);

      if (diffDays <= 1.5) {
        mode = "hourly";
      } else if (diffDays <= 8) {
        mode = "weekly";
      } else if (diffDays <= 35) {
        mode = "daily";
      } else {
        mode = "monthly";
      }
    }

    if (mode === "hourly") {
      const hours = [
        { label: "12 AM", start: 0, end: 3 },
        { label: "3 AM", start: 3, end: 6 },
        { label: "6 AM", start: 6, end: 9 },
        { label: "9 AM", start: 9, end: 12 },
        { label: "12 PM", start: 12, end: 15 },
        { label: "3 PM", start: 15, end: 18 },
        { label: "6 PM", start: 18, end: 21 },
        { label: "9 PM", start: 21, end: 24 }
      ];

      const buckets = hours.map(h => ({
        label: h.label,
        value: 0,
        ordersCount: 0,
        fullDate: `${h.label} block`
      }));

      sales.forEach(s => {
        const d = new Date(s.placedAt);
        const hour = d.getHours();
        const bIndex = hours.findIndex(h => hour >= h.start && hour < h.end);
        if (bIndex !== -1) {
          buckets[bIndex].value += Number(s.total);
          buckets[bIndex].ordersCount += 1;
        }
      });
      return buckets;
    }

    if (mode === "weekly") {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const displayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon to Sun

      const buckets = displayOrder.map(dayIdx => ({
        label: dayNames[dayIdx],
        value: 0,
        ordersCount: 0,
        fullDate: fullDayNames[dayIdx]
      }));

      sales.forEach(s => {
        const d = new Date(s.placedAt);
        const dayIdx = d.getDay();
        const bIndex = displayOrder.indexOf(dayIdx);
        if (bIndex !== -1) {
          buckets[bIndex].value += Number(s.total);
          buckets[bIndex].ordersCount += 1;
        }
      });
      return buckets;
    }

    if (mode === "daily") {
      const dateMap: Record<string, { value: number; ordersCount: number; rawDate: Date }> = {};
      
      sales.forEach(s => {
        const d = new Date(s.placedAt);
        const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!dateMap[dateStr]) {
          dateMap[dateStr] = { value: 0, ordersCount: 0, rawDate: d };
        }
        dateMap[dateStr].value += Number(s.total);
        dateMap[dateStr].ordersCount += 1;
      });

      const sortedKeys = Object.keys(dateMap).sort((a, b) => 
        dateMap[a].rawDate.getTime() - dateMap[b].rawDate.getTime()
      );

      if (sortedKeys.length === 0) {
        return [];
      }

      return sortedKeys.map(key => ({
        label: key,
        value: dateMap[key].value,
        ordersCount: dateMap[key].ordersCount,
        fullDate: dateMap[key].rawDate.toDateString()
      }));
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const buckets = monthNames.map(name => ({
      label: name,
      value: 0,
      ordersCount: 0,
      fullDate: name
    }));

    sales.forEach(s => {
      const d = new Date(s.placedAt);
      const mIdx = d.getMonth();
      buckets[mIdx].value += Number(s.total);
      buckets[mIdx].ordersCount += 1;
    });

    let firstActive = 0;
    let lastActive = 11;
    for (let i = 0; i < 12; i++) {
      if (buckets[i].value > 0) {
        firstActive = i;
        break;
      }
    }
    for (let i = 11; i >= 0; i--) {
      if (buckets[i].value > 0) {
        lastActive = i;
        break;
      }
    }
    const startIdx = Math.max(0, firstActive - 1);
    const endIdx = Math.min(11, lastActive + 1);
    return buckets.slice(startIdx, endIdx + 1);

  }, [sales, preset]);

  // Max value calculation for vertical scaling
  const maxVal = useMemo(() => {
    const vals = dataPoints.map(d => d.value);
    const max = Math.max(...vals, 1000);
    const order = Math.pow(10, Math.floor(Math.log10(max)));
    const multiplier = Math.ceil(max / (order / 2));
    return (multiplier * order) / 2;
  }, [dataPoints]);

  const totalSales = useMemo(() => {
    return sales.reduce((sum, s) => sum + Number(s.total), 0);
  }, [sales]);

  const totalOrders = useMemo(() => {
    return sales.length;
  }, [sales]);

  // SVG dimensions
  const width = 500;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Coordinate mapper
  const points = useMemo(() => {
    if (dataPoints.length === 0) return [];
    return dataPoints.map((dp, i) => {
      const x = paddingLeft + (i / Math.max(dataPoints.length - 1, 1)) * chartWidth;
      const y = paddingTop + chartHeight - (dp.value / maxVal) * chartHeight;
      return { x, y, ...dp };
    });
  }, [dataPoints, maxVal, chartWidth, chartHeight]);

  // SVG Line path
  const pathD = useMemo(() => {
    if (points.length < 2) return "";
    return `M ${points[0].x} ${points[0].y} ` + points.map((p, i) => {
      if (i === 0) return "";
      const prev = points[i - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 3;
      const cpY1 = prev.y;
      const cpX2 = p.x - (p.x - prev.x) / 3;
      const cpY2 = p.y;
      return `C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }).join(" ");
  }, [points]);

  // Area path under the line
  const areaD = useMemo(() => {
    if (points.length < 2) return "";
    const baseLineY = paddingTop + chartHeight;
    return `${pathD} L ${points[points.length - 1].x} ${baseLineY} L ${points[0].x} ${baseLineY} Z`;
  }, [points, pathD, chartHeight]);

  // Grid lines
  const gridLines = useMemo(() => {
    const lines = [];
    const count = 4;
    for (let i = 0; i <= count; i++) {
      const ratio = i / count;
      const y = paddingTop + chartHeight * ratio;
      const value = maxVal * (1 - ratio);
      lines.push({ y, value });
    }
    return lines;
  }, [maxVal, chartHeight]);

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    if (points.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clientX = e.clientX - rect.left;

    let nearestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - (clientX * (width / rect.width)));
      if (diff < minDiff) {
        minDiff = diff;
        nearestIdx = idx;
      }
    });

    setHoveredIndex(nearestIdx);
    
    const tooltipX = (points[nearestIdx].x / width) * rect.width;
    const tooltipY = (points[nearestIdx].y / height) * rect.height - 10;
    
    setTooltipPos({ x: tooltipX, y: tooltipY });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Sales Analytics</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              Sales: <strong className="text-slate-800">{formatCurrency(totalSales)}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              Orders: <strong className="text-slate-800">{totalOrders}</strong>
            </span>
            {preset && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                Range: {preset}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewType("line")}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
              viewType === "line"
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
            Line View
          </button>
          <button
            onClick={() => setViewType("bar")}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
              viewType === "bar"
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
            Bar View
          </button>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-64 overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="premiumAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            
            <linearGradient id="premiumBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Grid Lines */}
          {gridLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={width - paddingRight}
                y2={line.y}
                stroke="#e2e8f0"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={line.y + 4}
                textAnchor="end"
                className="text-[9px] fill-slate-400 font-medium font-sans"
              >
                {line.value >= 1000 ? `${(line.value / 1000).toFixed(0)}K` : line.value}
              </text>
            </g>
          ))}

          {/* Chart Rendering */}
          {viewType === "line" ? (
            <>
              {areaD && <path d={areaD} fill="url(#premiumAreaGrad)" className="transition-all duration-300" />}

              {hoveredIndex !== null && points[hoveredIndex] && (
                <line
                  x1={points[hoveredIndex].x}
                  y1={paddingTop}
                  x2={points[hoveredIndex].x}
                  y2={paddingTop + chartHeight}
                  stroke="#93c5fd"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
              )}

              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                  className="transition-all duration-300"
                />
              )}

              {points.map((p, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? "#2563eb" : "#ffffff"}
                      stroke="#3b82f6"
                      strokeWidth={isHovered ? 2.5 : 1.8}
                      className="transition-all duration-150 cursor-pointer"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={15}
                      fill="transparent"
                      className="cursor-pointer"
                    />
                  </g>
                );
              })}
            </>
          ) : (
            <g className="transition-all duration-300">
              {points.map((p, idx) => {
                const isHovered = hoveredIndex === idx;
                const barWidth = Math.max(6, Math.min(24, chartWidth / (dataPoints.length * 1.8)));
                const barHeight = chartHeight - (p.y - paddingTop);
                const barX = p.x - barWidth / 2;
                
                return (
                  <g key={idx} className="cursor-pointer">
                    <rect
                      x={barX}
                      y={p.y}
                      width={barWidth}
                      height={Math.max(2, barHeight)}
                      fill="url(#premiumBarGrad)"
                      rx="3"
                      className={`transition-all duration-200 ${
                        isHovered ? "opacity-100 filter brightness-105" : "opacity-85"
                      }`}
                    />
                    <rect
                      x={p.x - chartWidth / (dataPoints.length * 2)}
                      y={paddingTop}
                      width={chartWidth / dataPoints.length}
                      height={chartHeight}
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* X Axis Labels */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            const shouldDrawLabel = points.length <= 10 || idx % Math.ceil(points.length / 8) === 0;
            if (!shouldDrawLabel && !isHovered) return null;

            return (
              <text
                key={idx}
                x={p.x}
                y={height - paddingBottom + 14}
                textAnchor="middle"
                className={`text-[9px] font-sans font-medium transition-all ${
                  isHovered ? "fill-blue-600 font-semibold" : "fill-slate-400"
                }`}
              >
                {p.label}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip Box */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute z-50 pointer-events-none rounded-lg border border-slate-200 bg-white p-3 shadow-md transition-all duration-75 text-xs"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 72}px`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="font-semibold text-slate-800">
              {points[hoveredIndex].fullDate || points[hoveredIndex].label}
            </p>
            <div className="mt-1.5 space-y-1 font-medium text-slate-500">
              <div className="flex items-center justify-between gap-4">
                <span>Sales:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(points[hoveredIndex].value)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Orders:</span>
                <span className="font-semibold text-slate-800">{points[hoveredIndex].ordersCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
