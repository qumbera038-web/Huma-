import React, { useEffect, useState, useRef } from "react";
import { AlertTriangle, ArrowRight, Package, X, BellRing } from "lucide-react";

export interface LowStockItemSummary {
  id: string;
  name: string;
  code?: string;
  brand?: string;
  currentStock: number;
  threshold: number;
  unit?: string;
}

export interface LowStockAlertPayload {
  id: string; // unique toast ID
  productId: string;
  productName: string;
  productCode?: string;
  productBrand?: string;
  currentStock: number;
  threshold: number;
  unit?: string;
  totalLowCount: number;
  items?: LowStockItemSummary[];
  timestamp: number;
}

interface LowStockToastProps {
  alert: LowStockAlertPayload | null;
  onClose: () => void;
  onViewInInventory: (productId?: string) => void;
}

// Pleasant, gentle warning chime using Web Audio API
export const playLowStockChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Dual-tone gentle warning chime (F#5 -> C#6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(740, now); // F#5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1108.73, now + 0.12); // C#6
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.48);
  } catch {
    // Graceful fallback if audio context cannot be initialized
  }
};

export const LowStockToast: React.FC<LowStockToastProps> = ({
  alert,
  onClose,
  onViewInInventory,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressIntervalRef = useRef<any>(null);
  const DURATION_MS = 8000;

  useEffect(() => {
    if (!alert) return;

    // Play subtle chime
    playLowStockChime();
    setProgress(100);

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (isHovered) return;
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / DURATION_MS) * 100);
      setProgress(remainingPct);
      if (remainingPct <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 50);

    progressIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
    };
  }, [alert?.id, isHovered]);

  if (!alert) return null;

  const isOut = alert.currentStock <= 0;
  const deficit = Math.max(0, alert.threshold - alert.currentStock);

  return (
    <div 
      dir="ltr"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed top-5 end-4 sm:end-6 z-[9999] max-w-md w-[calc(100vw-2rem)] sm:w-[420px] bg-slate-950/95 border-2 border-rose-500/70 shadow-2xl shadow-rose-950/80 rounded-2xl p-4 backdrop-blur-md animate-in slide-in-from-top-4 duration-300 ring-4 ring-rose-500/20 text-slate-100 overflow-hidden"
    >
      {/* Background radial glow */}
      <div className="absolute -top-12 -end-12 w-36 h-36 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Main Toast Layout */}
      <div className="flex items-start gap-3.5 relative z-10">
        {/* Animated Warning Icon with Ping */}
        <div className="relative shrink-0 mt-0.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/30 to-red-600/30 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-inner">
            <AlertTriangle className="w-5 h-5 animate-pulse text-rose-400" />
          </div>
          <span className="absolute -top-1 -end-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-rose-400" />
                <span>کم اسٹاک انتباہ</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/25 text-rose-300 border border-rose-500/40">
                {isOut ? "OUT OF STOCK" : "LOW STOCK ALERT"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-1">
            <p className="text-xs font-extrabold text-slate-100 truncate">
              {alert.productName}
            </p>
            {alert.productCode && (
              <p className="text-[10px] font-mono text-slate-400">
                Code: <span className="text-blue-400 font-bold">{alert.productCode}</span>
                {alert.productBrand ? ` • ${alert.productBrand}` : ""}
              </p>
            )}
          </div>

          {/* Current Stock vs Threshold Box */}
          <div className="mt-2.5 p-2 bg-slate-900/90 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">موجودہ اسٹاک (Current):</span>
              <span className={`font-mono font-black text-sm ${isOut ? "text-red-400" : "text-rose-300"}`}>
                {alert.currentStock} {alert.unit || "pcs"}
              </span>
            </div>
            <div className="text-end">
              <span className="text-[10px] text-slate-400 block font-medium">الرٹ حد (Threshold):</span>
              <span className="font-mono font-bold text-slate-300 text-xs">
                &le; {alert.threshold} {alert.unit || "pcs"}
              </span>
            </div>
            {deficit > 0 && (
              <div className="text-end ps-2 border-s border-slate-800">
                <span className="text-[10px] text-rose-400 font-bold block">کمی (Deficit):</span>
                <span className="font-mono font-black text-rose-400 text-xs">
                  -{deficit}
                </span>
              </div>
            )}
          </div>

          {/* If there are additional low-stock items */}
          {alert.totalLowCount > 1 && (
            <p className="text-[11px] text-amber-300/90 font-medium mt-2 flex items-center gap-1">
              <span>⚠️ انوینٹری میں مجموعی طور پر {alert.totalLowCount} مصنوعات کا اسٹاک کم ہے۔</span>
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewInInventory(alert.productId)}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>انوینٹری میں دیکھیں و ہائی لائٹ کریں</span>
              <ArrowRight className="w-3.5 h-3.5 ms-0.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              ٹھیک ہے
            </button>
          </div>
        </div>
      </div>

      {/* Countdown Progress Bar */}
      <div className="absolute bottom-0 start-0 end-0 h-1 bg-slate-900 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
