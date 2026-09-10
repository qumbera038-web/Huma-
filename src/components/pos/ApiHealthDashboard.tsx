import React, { useState, useEffect } from "react";
import {
  Activity,
  RotateCw,
  Key,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Zap,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Server,
  Info
} from "lucide-react";
import { ApiKeyPoolHealth, ApiKeyPoolItem } from "../../types.ts";

interface ApiHealthDashboardProps {
  className?: string;
  onNotification?: (msg: string) => void;
}

export const ApiHealthDashboard: React.FC<ApiHealthDashboardProps> = ({
  className = "",
  onNotification,
}) => {
  const [pool, setPool] = useState<ApiKeyPoolHealth>({
    status: "standby",
    rotationCount: 0,
    currentIndex: 0,
    totalKeys: 0,
    keys: [],
    totalRequests: 0,
    rateLimitEvents: 0,
    lastRotatedAt: null,
    algorithm: "Infinite Round-Robin with Automatic 429 Failover",
    activeModel: "gemini-2.5-flash",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    message: string;
    timestamp: string;
  } | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState("");
  const [addError, setAddError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const notify = (msg: string) => {
    if (onNotification) onNotification(msg);
  };

  const fetchPoolHealth = async () => {
    try {
      const res = await fetch("/api/keys/pool");
      if (res.ok) {
        const data = await res.json();
        setPool(data);
      }
    } catch (err) {
      console.warn("Failed to fetch API key pool status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPoolHealth();
    // Periodic refresh every 10 seconds
    const interval = setInterval(fetchPoolHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRotateKey = async () => {
    setIsRotating(true);
    try {
      const res = await fetch("/api/keys/rotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Super Admin Manual Rotation" }),
      });
      const data = await res.json();
      if (data.pool) {
        setPool(data.pool);
        notify(`✓ Key rotated! Active index is now #${data.pool.currentIndex + 1} (Rotation #${data.pool.rotationCount})`);
      }
    } catch (err) {
      notify("Failed to rotate API key.");
    } finally {
      setIsRotating(false);
    }
  };

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/keys/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          latencyMs: data.latencyMs,
          message: `Connection Verified: Active Key #${data.testedIndex + 1} responded in ${data.latencyMs}ms (${data.response})`,
          timestamp: new Date().toLocaleTimeString(),
        });
        if (data.pool) setPool(data.pool);
        notify(`✓ Active Gemini API Key is HEALTHY (${data.latencyMs}ms latency)`);
      } else {
        setTestResult({
          success: false,
          latencyMs: data.latencyMs,
          message: `API Test Failed: ${data.error || "Request failed"}`,
          timestamp: new Date().toLocaleTimeString(),
        });
        if (data.pool) setPool(data.pool);
        notify(`⚠️ Gemini API Key Test Warning: ${data.error || "Key issue"}`);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Network or Server Error: ${err.message || "Could not reach server"}`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    if (!newKeyInput.trim()) {
      setAddError("Please enter an API Key.");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("/api/keys/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKeyInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPool(data.pool);
        setNewKeyInput("");
        setShowAddModal(false);
        notify(`✓ ${data.message}`);
      } else {
        setAddError(data.message || "Failed to add API key. Check formatting.");
      }
    } catch (err: any) {
      setAddError("Network error while adding key.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteKey = async (index: number) => {
    if (!confirm(`Are you sure you want to remove Key #${index + 1} from the rotation pool?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/keys/${index}`, { method: "DELETE" });
      const data = await res.json();
      if (data.pool) {
        setPool(data.pool);
        notify(`Key #${index + 1} removed from pool.`);
      }
    } catch (err) {
      notify("Failed to remove key.");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm shadow-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>POOL HEALTHY & ONLINE</span>
          </span>
        );
      case "degraded":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm shadow-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>DEGRADED (FAILOVER ACTIVE)</span>
          </span>
        );
      case "exhausted":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-sm shadow-rose-500/20">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>ALL KEYS RATE-LIMITED / EXHAUSTED</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>STANDBY / PENDING KEYS</span>
          </span>
        );
    }
  };

  const activeKeyItem = pool.keys[pool.currentIndex];

  return (
    <div
      id="api-health-monitor-section"
      className={`bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-5 text-slate-100 scroll-mt-6 ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/10">
            <Activity className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-extrabold text-slate-100 text-lg tracking-tight flex items-center gap-2">
                <span>Google Gemini API Health & Pool Monitor</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {pool.activeModel}
                </span>
              </h3>
              {getStatusBadge(pool.status)}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Round-robin key balancing, failover tracking, and live quota protection for 3 Branches, WhatsApp AI & Estimates
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchPoolHealth}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 active:scale-95"
            title="Refresh Pool Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleRotateKey}
            disabled={isRotating || pool.totalKeys <= 1}
            className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
            title="Rotate to Next API Key in Pool"
          >
            <RotateCw className={`w-3.5 h-3.5 text-indigo-400 ${isRotating ? "animate-spin" : ""}`} />
            <span>Rotate Key (Next)</span>
          </button>

          <button
            type="button"
            onClick={handleTestKey}
            disabled={isTesting || pool.totalKeys === 0}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
            title="Ping Gemini with Active Key to Verify Connectivity"
          >
            <Zap className={`w-3.5 h-3.5 ${isTesting ? "animate-bounce" : ""}`} />
            <span>{isTesting ? "Pinging AI..." : "Test Active Key"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-600/30 active:scale-95"
            title="Add a new Gemini API Key into rotation"
          >
            <Plus className="w-4 h-4" />
            <span>Add Key to Pool</span>
          </button>
        </div>
      </div>

      {/* 4 Core Vital Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Active Key Index */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-2 relative overflow-hidden">
          <div className="absolute right-2 top-2 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Current Active Index</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20">
              Active Key
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              Index #{pool.currentIndex}
            </span>
            <span className="text-xs text-slate-400 font-bold">
              (Key #{pool.currentIndex + 1} of {Math.max(pool.totalKeys, 1)})
            </span>
          </div>
          <div className="pt-1.5 border-t border-slate-900 text-[11px] text-slate-400 font-mono truncate">
            {activeKeyItem ? activeKeyItem.maskedKey : "No key active"}
          </div>
        </div>

        {/* Rotation Count */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-2 relative overflow-hidden">
          <div className="absolute right-2 top-2 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Rotation Count</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
              Cycles
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">
              {pool.rotationCount}
            </span>
            <span className="text-xs text-slate-400">rotations logged</span>
          </div>
          <div className="pt-1.5 border-t border-slate-900 text-[11px] text-slate-400">
            {pool.lastRotatedAt ? (
              <span>Last rotated: {new Date(pool.lastRotatedAt).toLocaleTimeString()}</span>
            ) : (
              <span>Ready for initial rotation</span>
            )}
          </div>
        </div>

        {/* Total API Requests Handled */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-2 relative overflow-hidden">
          <div className="absolute right-2 top-2 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total API Requests</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
              Throughput
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {pool.totalRequests}
            </span>
            <span className="text-xs text-slate-400">calls processed</span>
          </div>
          <div className="pt-1.5 border-t border-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Pool Capacity</span>
            <span className="text-emerald-400 font-bold">{pool.totalKeys} keys loaded</span>
          </div>
        </div>

        {/* Rate Limit Recovery Events (429) */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-2 relative overflow-hidden">
          <div className="absolute right-2 top-2 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>429 Rate-Limit Failovers</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
              Auto-Protected
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
              {pool.rateLimitEvents}
            </span>
            <span className="text-xs text-slate-400">failover switches</span>
          </div>
          <div className="pt-1.5 border-t border-slate-900 text-[11px] text-slate-400">
            Automatic round-robin protection enabled
          </div>
        </div>
      </div>

      {/* Live Test Diagnostic Output Banner */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            testResult.success
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/40 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="font-bold block text-sm">{testResult.message}</span>
              <span className="text-[10px] opacity-75">Checked at {testResult.timestamp}</span>
            </div>
          </div>
          {testResult.latencyMs && (
            <div className="px-3 py-1 rounded-xl bg-black/40 border border-emerald-500/30 font-mono text-emerald-300 font-bold shrink-0">
              ⚡ {testResult.latencyMs}ms Latency
            </div>
          )}
        </div>
      )}

      {/* Key Pool Visual Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Configured Key Pool ({pool.keys.length} API Keys)</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            Algorithm: <strong className="text-slate-200">{pool.algorithm}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {pool.keys.map((item, idx) => {
            const isActive = idx === pool.currentIndex;
            return (
              <div
                key={item.id || idx}
                className={`p-4 rounded-2xl border transition relative flex flex-col justify-between space-y-3 ${
                  isActive
                    ? "bg-slate-950 border-indigo-500/60 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10"
                    : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Top Badge & Index */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isActive
                          ? "bg-emerald-400 animate-ping"
                          : item.status === "rate_limited"
                          ? "bg-amber-400"
                          : item.status === "error"
                          ? "bg-rose-400"
                          : "bg-slate-600"
                      }`}
                    />
                    <span className="text-xs font-extrabold text-white font-mono">
                      Key #{idx + 1} (Index {idx})
                    </span>
                  </div>

                  {isActive ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse">
                      ACTIVE CURRENT
                    </span>
                  ) : item.status === "rate_limited" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      RATE LIMITED (429)
                    </span>
                  ) : item.status === "error" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      ERROR
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400">
                      STANDBY
                    </span>
                  )}
                </div>

                {/* Key Masked String */}
                <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-300 truncate select-all">{item.maskedKey}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.maskedKey, item.id)}
                    className="text-slate-400 hover:text-slate-200 ml-2 shrink-0 p-1"
                    title="Copy masked key"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-900">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Requests</span>
                    <span className="text-slate-200 font-mono font-bold">{item.requestCount}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-900">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Latency</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {item.latencyMs ? `${item.latencyMs}ms` : "—"}
                    </span>
                  </div>
                </div>

                {/* Last Error if any */}
                {item.lastError && (
                  <div className="text-[10px] text-rose-300/90 bg-rose-950/30 p-2 rounded-lg border border-rose-900/40 truncate">
                    ⚠️ {item.lastError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
                  <span className="text-slate-500">
                    {item.lastUsed ? `Used: ${new Date(item.lastUsed).toLocaleTimeString()}` : "Not used yet"}
                  </span>
                  {pool.keys.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteKey(idx)}
                      className="text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1 p-1"
                      title="Remove key from pool"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info & Guide Note */}
      <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-200">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-100 block">
            How the API Key Pool & Infinite Round-Robin Cycle Works:
          </span>
          <p className="text-slate-300 leading-relaxed">
            All outbound AI calls (WhatsApp automated responses in 3 languages, PPRC/PVC sanitary cost estimation, and multi-branch inventory forecasting) query the pool. If any key hits Google Gemini's 429 quota or rate limits, the system instantly rotates to the next key without failing the customer's request. Adding 3 to 6 keys ensures 24/7 continuous uninterrupted uptime across all branches.
          </p>
        </div>
      </div>

      {/* Add New Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Add Gemini API Key to Pool</h4>
                  <p className="text-[11px] text-slate-400">Expands your multi-key failover and rate-limit safety</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setAddError("");
                }}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddKey} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Gemini API Key (Format: AIzaSy...)
                </label>
                <input
                  type="password"
                  value={newKeyInput}
                  onChange={(e) => setNewKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Obtained from Google AI Studio. Will be stored securely in the server round-robin loop.
                </p>
              </div>

              {addError && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddError("");
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding || !newKeyInput.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  {isAdding ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add Key to Pool</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
