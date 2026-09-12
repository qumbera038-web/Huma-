import React, { useState, useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";
import { Invoice, Branch } from "../../types";
import { Clock, TrendingUp, ShoppingBag, DollarSign, Activity, Calendar, SlidersHorizontal, Building2, Info, Users, Sparkles } from "lucide-react";

interface HourlyActivityHeatmapProps {
  invoices: Invoice[];
  branches: Branch[];
  currencySymbol?: string;
}

const DAYS_URDU = ["اتوار (Sunday)", "پیر (Monday)", "منگل (Tuesday)", "بدھ (Wednesday)", "جمعرات (Thursday)", "جمعہ (Friday)", "ہفتہ (Saturday)"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const HourlyActivityHeatmap: React.FC<HourlyActivityHeatmapProps> = ({
  invoices = [],
  branches = [],
  currencySymbol = "Rs.",
}) => {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<"sales" | "count">("sales");
  const [selectedPeriod, setSelectedPeriod] = useState<"all" | "30days" | "7days">("all");
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number; val: number; count: number } | null>(null);

  // Parse and filter invoices
  const filteredInvoices = useMemo(() => {
    let result = (invoices || []).filter((inv) => inv.status !== "cancelled");

    // Filter by branch
    if (selectedBranch !== "all") {
      result = result.filter((inv) => {
        const branch = branches.find((b) => b.id === selectedBranch);
        if (!branch) return false;
        // Match branch ID or branch name
        return inv.branchId === selectedBranch || 
               inv.branchName === branch.name || 
               (inv.branchName || "").toLowerCase().includes(branch.name.toLowerCase());
      });
    }

    // Filter by time period
    const now = new Date();
    if (selectedPeriod === "30days") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter((inv) => new Date(inv.date) >= thirtyDaysAgo);
    } else if (selectedPeriod === "7days") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter((inv) => new Date(inv.date) >= sevenDaysAgo);
    }

    return result;
  }, [invoices, selectedBranch, selectedPeriod, branches]);

  // Construct the 7 days x 24 hours grid data
  const heatmapData = useMemo(() => {
    // Initializing 7x24 grid
    const grid = Array.from({ length: 7 }, (_, d) =>
      Array.from({ length: 24 }, (_, h) => ({
        day: d,
        hour: h,
        sales: 0,
        count: 0,
      }))
    );

    filteredInvoices.forEach((inv) => {
      const dateObj = new Date(inv.date);
      // Ensure date is valid
      if (isNaN(dateObj.getTime())) return;

      const day = dateObj.getDay(); // 0 (Sunday) to 6 (Saturday)
      const hour = dateObj.getHours(); // 0 to 23

      grid[day][hour].sales += inv.grandTotal || 0;
      grid[day][hour].count += 1;
    });

    return grid;
  }, [filteredInvoices]);

  // Flattened heatmap cells and find peak values
  const { maxVal, totalSales, totalInvoices, flatCells } = useMemo(() => {
    let maxV = 0;
    let sumSales = 0;
    let sumInvoices = 0;
    const cells: Array<{ day: number; hour: number; sales: number; count: number }> = [];

    heatmapData.forEach((row, d) => {
      row.forEach((cell, h) => {
        const checkVal = selectedMetric === "sales" ? cell.sales : cell.count;
        if (checkVal > maxV) maxV = checkVal;
        sumSales += cell.sales;
        sumInvoices += cell.count;
        cells.push({ day: d, hour: h, sales: cell.sales, count: cell.count });
      });
    });

    return { maxVal: maxV || 1, totalSales: sumSales, totalInvoices: sumInvoices, flatCells: cells };
  }, [heatmapData, selectedMetric]);

  // Aggregate hourly data across all 7 days for the Recharts Chart
  const hourlyChartData = useMemo(() => {
    const hourlyStats = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      hourLabel: h === 0 ? "12 AM" : h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`,
      sales: 0,
      count: 0,
    }));

    heatmapData.forEach((row) => {
      row.forEach((cell) => {
        hourlyStats[cell.hour].sales += cell.sales;
        hourlyStats[cell.hour].count += cell.count;
      });
    });

    return hourlyStats;
  }, [heatmapData]);

  // Find Peak Business Hours and Stats
  const insights = useMemo(() => {
    // 1. Peak Hour
    let peakHourIdx = 0;
    let maxHourVal = 0;
    hourlyChartData.forEach((h, idx) => {
      const val = selectedMetric === "sales" ? h.sales : h.count;
      if (val > maxHourVal) {
        maxHourVal = val;
        peakHourIdx = idx;
      }
    });

    // 2. Peak Day
    const dayTotals = Array.from({ length: 7 }, () => 0);
    heatmapData.forEach((row, d) => {
      row.forEach((cell) => {
        dayTotals[d] += selectedMetric === "sales" ? cell.sales : cell.count;
      });
    });

    let peakDayIdx = 0;
    let maxDayVal = 0;
    dayTotals.forEach((total, idx) => {
      if (total > maxDayVal) {
        maxDayVal = total;
        peakDayIdx = idx;
      }
    });

    // 3. Recommended staff action window
    const peakStartLabel = peakHourIdx === 0 ? "12 AM" : peakHourIdx === 12 ? "12 PM" : peakHourIdx > 12 ? `${peakHourIdx - 12} PM` : `${peakHourIdx} AM`;
    const peakEndLabel = (peakHourIdx + 1) === 12 ? "12 PM" : (peakHourIdx + 1) === 24 ? "12 AM" : (peakHourIdx + 1) > 12 ? `${(peakHourIdx + 1) - 12} PM` : `${(peakHourIdx + 1)} AM`;

    return {
      peakHour: peakHourIdx,
      peakHourLabel: `${peakStartLabel} - ${peakEndLabel}`,
      peakHourVal: maxHourVal,
      peakDay: DAYS_FULL[peakDayIdx],
      peakDayUrdu: DAYS_URDU[peakDayIdx].split(" ")[0],
      staffRecommendation: `بیزنس کی ضرورت کے مطابق، آپ کی برانچز پر دن کا سب سے مصروف ترین وقت ${peakStartLabel} سے ${peakEndLabel} کے درمیان ہوتا ہے۔ ہم تجویز کرتے ہیں کہ اس دوران اضافی عملہ بلنگ کاؤنٹرز پر تعینات کیا جائے تاکہ گاہکوں کا رش کم کیا جا سکے۔`,
    };
  }, [hourlyChartData, heatmapData, selectedMetric]);

  // Color Intensity function for heat blocks
  const getCellBgColor = (val: number) => {
    if (val === 0) return "bg-slate-950/70 text-slate-700 border border-slate-900";
    const ratio = val / maxVal;

    if (selectedMetric === "sales") {
      if (ratio < 0.25) return "bg-indigo-950/40 text-indigo-300 border border-indigo-900/40";
      if (ratio < 0.5) return "bg-indigo-900/60 text-indigo-200 border border-indigo-800/50";
      if (ratio < 0.75) return "bg-amber-600/60 text-amber-100 border border-amber-600/40 animate-pulse";
      return "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black border border-amber-400 ring-1 ring-amber-300 animate-pulse";
    } else {
      if (ratio < 0.25) return "bg-slate-800/70 text-slate-400 border border-slate-800";
      if (ratio < 0.5) return "bg-emerald-950/40 text-emerald-300 border border-emerald-900/40";
      if (ratio < 0.75) return "bg-emerald-800/60 text-emerald-100 border border-emerald-700/50";
      return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black border border-emerald-400 ring-1 ring-emerald-300 animate-pulse";
    }
  };

  // Helper to format hour labels
  const formatHourLabel = (h: number) => {
    if (h === 0) return "12am";
    if (h === 12) return "12pm";
    return h > 12 ? `${h - 12}pm` : `${h}am`;
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6" id="hourly-activity-heatmap-container">
      {/* 🔮 Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Clock className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-black text-white text-base tracking-tight flex items-center gap-1.5">
                <span>پیئک بزنس آورز کی نشاندہی (Peak Business Hours & Sales Heatmap)</span>
                <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Recharts AI Engine
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                گا ہکوں کے لائیو رجحانات اور مصروف ترین اوقات کو سمجھنے کے لیے گھنٹہ وار سرگرمی کا چارٹ
              </p>
            </div>
          </div>
        </div>

        {/* 🛠️ Real-time Interactive Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-200 cursor-pointer max-w-[130px]"
            >
              <option value="all" className="bg-slate-950 text-slate-200 font-bold">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-950 text-slate-200">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedMetric("sales")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                selectedMetric === "sales"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>سیلز آمدن (Amount)</span>
            </button>
            <button
              onClick={() => setSelectedMetric("count")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                selectedMetric === "count"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>کل بل (Invoice Qty)</span>
            </button>
          </div>

          {/* Time Period Filter */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedPeriod("all")}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                selectedPeriod === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setSelectedPeriod("30days")}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                selectedPeriod === "30days" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedPeriod("7days")}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                selectedPeriod === "7days" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              7 Days
            </button>
          </div>
        </div>
      </div>

      {/* 📊 Split Layout: Insights Summary on Left, 2D Heatmap Grid on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Quick Peak Stats & Smart Insights (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 space-y-3 flex-1">
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs tracking-wider uppercase">
              <TrendingUp className="w-4 h-4 shrink-0 text-amber-500 animate-bounce" />
              <span>مصروف ترین اوقات کے ہائی لائٹس</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                <span className="text-[10px] text-slate-400 block font-bold">بیزنس کا سب سے مصروف گھنٹہ</span>
                <span className="text-sm font-black text-white block mt-0.5 font-mono">{insights.peakHourLabel}</span>
                <span className="text-[10px] text-indigo-300 block mt-1 font-bold">
                  {selectedMetric === "sales" 
                    ? `سیلز: ${currencySymbol} ${insights.peakHourVal.toLocaleString()}` 
                    : `انوائسز: ${insights.peakHourVal} بل`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <span className="text-[10px] text-slate-400 block font-bold">ہفتے کا سب سے مصروف دن</span>
                <span className="text-sm font-black text-white block mt-0.5">{insights.peakDayUrdu} ({insights.peakDay})</span>
                <span className="text-[10px] text-emerald-300 block mt-1 font-bold">پیک سیلز ہاٹ اسپاٹ</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>سمارٹ مینجمنٹ تجویز (Staff Recommendation)</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {insights.staffRecommendation}
              </p>
            </div>

            <div className="text-[10px] text-slate-400 leading-tight space-y-1.5 pt-1.5 border-t border-slate-800/80">
              <div className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-bold text-slate-400">Heatmap Color Code Key:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-slate-950 border border-slate-900" />
                  No Sales
                </span>
                <span className="flex items-center gap-1">
                  <span className={`w-2.5 h-2.5 rounded ${selectedMetric === "sales" ? "bg-indigo-950/50" : "bg-slate-800"}`} />
                  Quiet
                </span>
                <span className="flex items-center gap-1">
                  <span className={`w-2.5 h-2.5 rounded ${selectedMetric === "sales" ? "bg-indigo-900/80" : "bg-emerald-950"}`} />
                  Low
                </span>
                <span className="flex items-center gap-1">
                  <span className={`w-2.5 h-2.5 rounded ${selectedMetric === "sales" ? "bg-amber-600/70" : "bg-emerald-700"}`} />
                  Moderate
                </span>
                <span className="flex items-center gap-1">
                  <span className={`w-2.5 h-2.5 rounded ${selectedMetric === "sales" ? "bg-amber-500" : "bg-emerald-500"}`} />
                  Peak Busy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 2D Heatmap Board Grid (8 cols) */}
        <div className="xl:col-span-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>گھنٹہ وار لائیو سرگرمی گرڈ (7 Days &times; 24 Hours Live Grid)</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Hover over blocks for details • بائیں سے دائیں 24 گھنٹے
              </span>
            </div>

            {/* Scrollable Heatmap grid container */}
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <div className="min-w-[800px] bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
                {/* 24 Hour columns header labels */}
                <div className="grid gap-1 mb-1.5 text-center text-[9px] font-mono font-bold text-slate-500" style={{ display: "grid", gridTemplateColumns: "50px repeat(24, minmax(0, 1fr))" }}>
                  <div className="text-start ps-1">Day</div>
                  {Array.from({ length: 24 }).map((_, h) => (
                    <div key={h} className="truncate">
                      {formatHourLabel(h)}
                    </div>
                  ))}
                </div>

                {/* Grid Rows for each Day of the Week */}
                <div className="space-y-1">
                  {heatmapData.map((row, d) => (
                    <div key={d} className="grid gap-1 items-center" style={{ display: "grid", gridTemplateColumns: "50px repeat(24, minmax(0, 1fr))" }}>
                      {/* Day Header Column */}
                      <div className="text-[10px] font-black text-slate-400 text-start truncate pe-1">
                        {DAYS_SHORT[d]}
                      </div>

                      {/* 24 Hour Cells */}
                      {row.map((cell, h) => {
                        const checkVal = selectedMetric === "sales" ? cell.sales : cell.count;
                        const isHovered = hoveredCell && hoveredCell.day === d && hoveredCell.hour === h;

                        return (
                          <div
                            key={h}
                            onMouseEnter={() =>
                              setHoveredCell({
                                day: d,
                                hour: h,
                                val: cell.sales,
                                count: cell.count,
                              })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`h-7 rounded transition-all duration-150 cursor-pointer flex items-center justify-center text-[10px] font-bold ${getCellBgColor(checkVal)} ${
                              isHovered ? "ring-2 ring-white scale-110 z-10 shadow-lg shadow-white/10" : ""
                            }`}
                          >
                            {/* Inside cell number shorthand */}
                            {checkVal > 0 && (
                              <span className="text-[8px] opacity-75 font-mono">
                                {selectedMetric === "sales" 
                                  ? `${Math.round(checkVal / 1000)}k` 
                                  : checkVal}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hover details feedback display */}
            <div className="h-12 flex items-center justify-center rounded-xl bg-slate-950/60 border border-slate-850/60 text-xs">
              {hoveredCell ? (
                <div className="flex items-center gap-4 text-slate-300 font-bold animate-fadeIn">
                  <span className="text-indigo-400">
                    📅 {DAYS_FULL[hoveredCell.day]} ({DAYS_URDU[hoveredCell.day].split(" ")[0]})
                  </span>
                  <span className="text-amber-400">
                    ⏰ {formatHourLabel(hoveredCell.hour)} - {formatHourLabel((hoveredCell.hour + 1) % 24)}
                  </span>
                  <span className="text-emerald-400 font-mono">
                    💰 سیلز: {currencySymbol} {hoveredCell.val.toLocaleString()}
                  </span>
                  <span className="text-purple-400 font-mono">
                    🧾 انوائسز: {hoveredCell.count} بل
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 font-bold">
                  کسی بلاک پر ماؤس لائیں تا کہ اس مخصوص دن اور وقت کی سیلز کی معلومات یہاں ظاہر ہوں
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📈 Primary Recharts Component: Daily Hourly Peak Business Curve */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>گھنٹہ وار مجموعی تجزیہ چارٹ (Hourly Aggregate Peaks Area Trend)</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Filtered Data Volume: {filteredInvoices.length} invoices
          </span>
        </div>

        {/* Responsive AreaChart Container */}
        <div className="h-56 w-full bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={hourlyChartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
              <XAxis 
                dataKey="hourLabel" 
                stroke="#64748b" 
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10}
                fontWeight="bold"
                tickFormatter={(value) => {
                  if (selectedMetric === "sales") {
                    return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value;
                  }
                  return value;
                }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#cbd5e1",
                  fontFamily: "monospace",
                }}
                formatter={(value: any, name: any) => {
                  if (name === "sales") {
                    return [`${currencySymbol} ${Number(value).toLocaleString()}`, "کل سیلز (Sales)"];
                  }
                  return [value, "انوائس مقدار (Invoices)"];
                }}
                labelFormatter={(label) => `Time Window: ${label}`}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={selectedMetric === "sales" ? "#6366f1" : "#10b981"}
                strokeWidth={3}
                fillOpacity={1}
                fill={selectedMetric === "sales" ? "url(#colorSales)" : "url(#colorCount)"}
                name={selectedMetric}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
