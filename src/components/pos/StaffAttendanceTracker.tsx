import React, { useState } from "react";
import { StaffAttendanceLog, UserAccount, Branch, StoreSettings } from "../../types";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Users,
  Store,
  Building2,
  UserCheck,
  Search,
  Filter,
  Download,
  ShieldCheck,
  ArrowRight,
  LogIn,
  Phone
} from "lucide-react";

interface StaffAttendanceTrackerProps {
  attendanceLogs: StaffAttendanceLog[];
  users: UserAccount[];
  branches: Branch[];
  activeUser: UserAccount;
  settings: StoreSettings;
  onPunchIn?: (user: UserAccount) => void;
}

export const StaffAttendanceTracker: React.FC<StaffAttendanceTrackerProps> = ({
  attendanceLogs,
  users,
  branches,
  activeUser,
  settings,
  onPunchIn,
}) => {
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [searchStaff, setSearchStaff] = useState<string>("");

  // Filter logs
  const filteredLogs = (attendanceLogs || []).filter((log) => {
    if (selectedBranchFilter !== "all" && log.branchId !== selectedBranchFilter) return false;
    if (selectedDate && log.loginDate !== selectedDate) return false;
    if (searchStaff.trim()) {
      const q = searchStaff.toLowerCase();
      if (!log.userName.toLowerCase().includes(q) && !log.counterStation.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Calculate shop opening times for today per branch
  const getBranchOpeningTime = (branchId: string) => {
    const branchDayLogs = (attendanceLogs || []).filter(
      (l) => l.branchId === branchId && l.loginDate === selectedDate
    );
    if (branchDayLogs.length === 0) return null;
    const firstLogin = branchDayLogs.find((l) => l.isFirstLoginOfDay) || branchDayLogs[0];
    return firstLogin;
  };

  return (
    <div className="p-4 max-w-[1700px] mx-auto space-y-4 text-xs">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-bold text-slate-100">
                حاضری و دکان اوپننگ ٹائمنگ مانیٹرنگ (Shop Opening & Staff Login Tracker)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Automated Timestamp Log</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              ہر کیشئر اور مینیجر کے لاگ ان ہوتے ہی وقت خودکار محفوظ ہوتا ہے: دکان کس وقت کھلی (8:30 بمقابلہ 9:00 بجے) اور کون آن-ٹائم آیا۔
            </p>
          </div>
        </div>

        {/* Punch in manual button */}
        {onPunchIn && (
          <button
            onClick={() => onPunchIn(activeUser)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>حاضری لاگ ان درج کریں ({activeUser.name})</span>
          </button>
        )}
      </div>

      {/* 3 Branches Shop Opening Cards (دکان کھلنے کے اوقات) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((branch) => {
          const opening = getBranchOpeningTime(branch.id);
          const hasOpened = !!opening;

          return (
            <div
              key={branch.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden shadow-lg space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{branch.shortName}</h3>
                    <p className="text-[11px] text-slate-400">{branch.headName}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    hasOpened
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {hasOpened ? "Shop Opened" : "Not Opened Yet"}
                </span>
              </div>

              {/* Shop Opening Info Box */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>دکان کھلنے کا وقت (Shop Opening Time):</span>
                  <span className="font-mono font-bold text-slate-200">
                    {hasOpened ? opening.loginTime : "--:-- --"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>دکان کھولنے والا ملازم (Opened By):</span>
                  <span className="font-semibold text-slate-200">
                    {hasOpened ? opening.userName : "None"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>پابندی وقت (Punctuality):</span>
                  {hasOpened ? (
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        opening.punctualityStatus === "on_time" || opening.punctualityStatus === "early"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {opening.punctualityStatus === "on_time" || opening.punctualityStatus === "early"
                        ? "بر وقت (On Time / 8:30 - 8:45 AM)"
                        : "تاخیر (Late after 9:00 AM)"}
                    </span>
                  ) : (
                    <span className="text-slate-500">Pending</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute start-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name or counter..."
                value={searchStaff}
                onChange={(e) => setSearchStaff(e.target.value)}
                className="ps-9 pe-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs outline-none focus:border-indigo-500 w-56"
              />
            </div>

            {/* Date filter */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs outline-none"
            />

            {/* Branch filter */}
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs outline-none"
            >
              <option value="all">All Branches (سب برانچز)</option>
              <option value="branch-1">Branch 1 - Main Head Office</option>
              <option value="branch-2">Branch 2 - City Market</option>
              <option value="branch-3">Branch 3 - Highway Bypass</option>
            </select>
          </div>

          <span className="text-slate-400 text-xs">
            Showing <strong>{filteredLogs.length}</strong> login timestamps
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Staff Member & Role</th>
                <th className="py-2.5 px-3">Branch & Counter</th>
                <th className="py-2.5 px-3">Exact Login Time</th>
                <th className="py-2.5 px-3">Shop Opening Tag</th>
                <th className="py-2.5 px-3 text-end">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => {
                const isOnTime = log.punctualityStatus === "on_time" || log.punctualityStatus === "early";

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {log.loginDate}
                    </td>

                    <td className="py-3 px-3">
                      {(() => {
                        const staffMember = users.find((u) => u.id === log.userId || u.name === log.userName);
                        return (
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                staffMember?.avatarUrl ||
                                (staffMember as any)?.avatar ||
                                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                              }
                              alt={log.userName}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-100">{log.userName}</span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                  {log.userRole}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-amber-300 font-mono mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                <span>{staffMember?.phone || "0300-5861463"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-300 block font-medium">{log.branchName}</span>
                      <span className="text-slate-500 text-[10px]">{log.counterStation}</span>
                    </td>

                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold text-sm">
                      {log.loginTime}
                    </td>

                    <td className="py-3 px-3">
                      {log.isFirstLoginOfDay ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30 flex items-center gap-1 w-max">
                          <Store className="w-3 h-3" />
                          <span>Official Shop Opening (پہلا لاگ ان)</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Subsequent Shift Login</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-end">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          isOnTime
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {isOnTime ? "✓ On-Time (بروقت)" : "⚠ Late (تاخیر)"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
