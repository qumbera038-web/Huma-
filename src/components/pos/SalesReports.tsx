import React, { useMemo, useState } from "react";
import { Invoice, StoreSettings, UserAccount } from "../../types";
import { exportAllDataBackup } from "../../utils/posStorage";
import { 
  BarChart3, 
  TrendingUp, 
  Receipt, 
  Banknote, 
  BookOpen, 
  Download, 
  Search, 
  Calendar,
  Eye,
  CreditCard,
  Users,
  Award,
  Clock,
  Printer,
  FileCheck,
  Ban,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Trash2,
  QrCode,
  Copy,
  Check,
  X,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Smartphone,
  ChevronDown,
  Database,
  FileSpreadsheet
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { InvoiceReceiptModal } from "./InvoiceReceiptModal";

interface SalesReportsProps {
  invoices: Invoice[];
  settings: StoreSettings;
  users?: UserAccount[];
  activeUser?: UserAccount;
  onCancelInvoice?: (invoiceId: string, reason: string) => void;
}

export const SalesReports: React.FC<SalesReportsProps> = ({ 
  invoices, 
  settings, 
  users = [],
  activeUser,
  onCancelInvoice
}) => {
  const [reportTab, setReportTab] = useState<"invoices" | "performance" | "shift">("invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>("all");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [selectedQrInvoice, setSelectedQrInvoice] = useState<Invoice | null>(null);
  const [copiedQrData, setCopiedQrData] = useState(false);

  // Antigravity Agent State
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentResult, setAgentResult] = useState<string | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showReportsExportMenu, setShowReportsExportMenu] = useState(false);

  const runFinancialAnalystAgent = async () => {
    setIsAgentRunning(true);
    setAgentResult(null);
    setShowAgentModal(true);

    try {
      // Compress data for the agent
      const salesData = invoices.map(i => ({
        dt: i.date,
        b: i.branchId,
        c: i.cashierName,
        p: i.paymentMethod,
        tot: i.grandTotal
      }));

      const res = await fetch("/api/gemini/financial-analyst-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: settings.storeName,
          salesData
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setAgentResult(data.text);
    } catch (err: any) {
      setAgentResult(`**Agent Execution Failed:**\n\n${err.message}\n\n*Note: Antigravity agents require the backend to be connected with a valid GEMINI_API_KEY that supports the Interactions API and remote environment execution.*`);
    } finally {
      setIsAgentRunning(false);
    }
  };

  // Cancellation Modal state
  const [cancelTargetInvoice, setCancelTargetInvoice] = useState<Invoice | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState<string>("Customer returned goods (گاہک نے سامان واپس کر دیا)");
  const [customReasonText, setCustomReasonText] = useState<string>("");

  // Shift Sheet State
  const [shiftDate, setShiftDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [shiftCashier, setShiftCashier] = useState<string>("all");

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchPayment =
        selectedPaymentFilter === "all" || inv.paymentMethod === selectedPaymentFilter;
      const matchBranch =
        selectedBranchFilter === "all" || 
        (selectedBranchFilter === "branch-1" ? (inv.branchId === "branch-1" || !inv.branchId) : inv.branchId === selectedBranchFilter);
      
      const isCancelled = inv.status === "cancelled";
      const matchStatus = 
        selectedStatusFilter === "all" ||
        (selectedStatusFilter === "active" && !isCancelled) ||
        (selectedStatusFilter === "cancelled" && isCancelled);

      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchPayment && matchBranch && matchStatus;

      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(term) ||
        inv.customerName.toLowerCase().includes(term) ||
        (inv.customerPhone && inv.customerPhone.includes(term)) ||
        (inv.branchName && inv.branchName.toLowerCase().includes(term)) ||
        inv.cashierName.toLowerCase().includes(term) ||
        (inv.cancelledReason && inv.cancelledReason.toLowerCase().includes(term));

      return matchPayment && matchBranch && matchStatus && matchSearch;
    });
  }, [invoices, selectedPaymentFilter, selectedBranchFilter, selectedStatusFilter, searchTerm]);

  // Calculations (Excluding cancelled bills for accurate financial accounting)
  const activeInvoices = useMemo(() => invoices.filter((i) => i.status !== "cancelled"), [invoices]);
  const cancelledInvoicesList = useMemo(() => invoices.filter((i) => i.status === "cancelled"), [invoices]);

  const totalSalesRevenue = useMemo(() => {
    return activeInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [activeInvoices]);

  const totalCashCollected = useMemo(() => {
    return activeInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  }, [activeInvoices]);

  const totalUdhaarPending = useMemo(() => {
    return activeInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  }, [activeInvoices]);

  const totalCancelledAmount = useMemo(() => {
    return cancelledInvoicesList.reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [cancelledInvoicesList]);

  // Handle Cancel Bill Confirmation
  const handleConfirmCancelInvoice = () => {
    if (!cancelTargetInvoice || !onCancelInvoice) return;
    const finalReason = cancelReasonPreset === "Custom Reason (دیگر وجہ)" ? (customReasonText.trim() || "Manual cancellation by cashier") : cancelReasonPreset;
    onCancelInvoice(cancelTargetInvoice.id, finalReason);
    setCancelTargetInvoice(null);
    setCustomReasonText("");
  };

  const totalItemsSold = useMemo(() => {
    return invoices.reduce(
      (sum, inv) => sum + inv.items.reduce((s, item) => s + item.quantity, 0),
      0
    );
  }, [invoices]);

  // Worker Performance calculation
  const workerPerformance = useMemo(() => {
    const map = new Map<string, {
      cashierName: string;
      cashierId?: string;
      cashierAvatar?: string;
      cashierRole?: string;
      branchName?: string;
      billsCount: number;
      totalRevenue: number;
      cashCollected: number;
      lastBillTime: string;
    }>();

    invoices.forEach((inv) => {
      const key = inv.cashierName || "Unknown Staff";
      const existing = map.get(key) || {
        cashierName: inv.cashierName,
        cashierId: inv.cashierId,
        cashierAvatar: inv.cashierAvatar,
        cashierRole: inv.cashierRole || "Staff",
        branchName: inv.branchName || "Main HQ",
        billsCount: 0,
        totalRevenue: 0,
        cashCollected: 0,
        lastBillTime: inv.date,
      };

      existing.billsCount += 1;
      existing.totalRevenue += inv.grandTotal;
      existing.cashCollected += inv.amountPaid;
      if (new Date(inv.date) > new Date(existing.lastBillTime)) {
        existing.lastBillTime = inv.date;
      }
      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [invoices]);

  // Shift Sheet calculation
  const shiftInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const invDate = new Date(inv.date).toISOString().slice(0, 10);
      const matchDate = invDate === shiftDate;
      const matchCashier = shiftCashier === "all" || inv.cashierName === shiftCashier;
      return matchDate && matchCashier;
    });
  }, [invoices, shiftDate, shiftCashier]);

  const shiftCashTotal = useMemo(() => {
    return shiftInvoices.filter((i) => i.paymentMethod === "cash").reduce((s, i) => s + i.amountPaid, 0);
  }, [shiftInvoices]);

  const shiftBankTotal = useMemo(() => {
    return shiftInvoices.filter((i) => i.paymentMethod === "bank_transfer" || i.paymentMethod === "card").reduce((s, i) => s + i.amountPaid, 0);
  }, [shiftInvoices]);

  const shiftCreditTotal = useMemo(() => {
    return shiftInvoices.reduce((s, i) => s + i.balanceDue, 0);
  }, [shiftInvoices]);

  const shiftGrandTotal = useMemo(() => {
    return shiftInvoices.reduce((s, i) => s + i.grandTotal, 0);
  }, [shiftInvoices]);

  const exportInvoicesCSV = () => {
    const header = "Invoice Number,Date,Customer,Payment Mode,Items Count,Subtotal,Discount,Grand Total,Paid,Due,Cashier\n";
    const rows = invoices
      .map((inv) =>
        `"${inv.invoiceNumber}","${new Date(inv.date).toLocaleDateString()}","${inv.customerName}","${inv.paymentMethod}",${inv.items.length},${inv.subtotal},${inv.discount},${inv.grandTotal},${inv.amountPaid},${inv.balanceDue},"${inv.cashierName}"`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `haider-sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printShiftSheet = () => {
    window.print();
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Sales Analytics, Staff Performance & Shift Sheet</span>
          </h2>
          <p className="text-xs text-slate-400">
            Total {invoices.length} invoices generated • Track cashier revenue, daily shift balances & receipts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setReportTab("invoices")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                reportTab === "invoices"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Receipt className="w-4 h-4 shrink-0" />
              <span>All Invoices</span>
            </button>
            <button
              onClick={() => setReportTab("performance")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                reportTab === "performance"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Award className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Performance</span>
            </button>
            <button
              onClick={() => setReportTab("shift")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                reportTab === "shift"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Shift Sheet</span>
            </button>
          </div>

          <button
            onClick={runFinancialAnalystAgent}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/30"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Generate PDF Report (AI)</span>
          </button>
          
          {/* Rich Sales Reports Export Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowReportsExportMenu(!showReportsExportMenu)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl transition shadow-sm"
            >
              <Download className="w-4 h-4 shrink-0 text-amber-400" />
              <span>📦 Export Menu (ایکسپورٹ)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showReportsExportMenu ? "rotate-180" : ""}`} />
            </button>

            {showReportsExportMenu && (
              <div className="absolute end-0 top-11 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95">
                <a
                  href="/haider_sanitary_pos.apk"
                  download="haider_sanitary_pos.apk"
                  onClick={() => setShowReportsExportMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition"
                >
                  <Smartphone className="w-3.5 h-3.5 shrink-0 text-slate-950" />
                  <div>
                    <span>Download 1 APK (.apk)</span>
                    <span className="block text-[9px] font-medium text-slate-900">اینڈرائیڈ موبائل ایپ انسٹالر</span>
                  </div>
                </a>

                <a
                  href="/haider_sanitary_pos_single_file.html"
                  download="haider_sanitary_pos_single_file.html"
                  onClick={() => setShowReportsExportMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition"
                >
                  <Download className="w-3.5 h-3.5 shrink-0 text-white" />
                  <div>
                    <span>Download 1 File (.html)</span>
                    <span className="block text-[9px] font-medium text-emerald-100">سنگل فائل (آف لائن)</span>
                  </div>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setShowReportsExportMenu(false);
                    exportInvoicesCSV();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs font-semibold text-slate-300 hover:bg-slate-800 transition border-t border-slate-800 mt-1 pt-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span>Export Invoices Report (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowReportsExportMenu(false);
                    exportAllDataBackup();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs font-semibold text-purple-300 hover:bg-purple-900/20 transition"
                >
                  <Database className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                  <span>Backup All Sales & Store (JSON)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Valid Sales Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 font-mono">
            {settings.currencySymbol} {totalSalesRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">{activeInvoices.length} active bills</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Cash Collected</span>
            <Banknote className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-blue-400 font-mono">
            {settings.currencySymbol} {totalCashCollected.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">In-drawer cash</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Pending Khata Balance</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-amber-400 font-mono">
            {settings.currencySymbol} {totalUdhaarPending.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Credit receivables</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Units Sold</span>
            <Receipt className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-purple-300 font-mono">
            {totalItemsSold.toLocaleString()} Pcs
          </p>
          <span className="text-[10px] text-slate-500">Pipes & fittings</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>منسوخ شدہ بل (Cancelled)</span>
            <Ban className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-bold text-rose-400 font-mono">
            {settings.currencySymbol} {totalCancelledAmount.toLocaleString()}
          </p>
          <span className="text-[10px] text-rose-400/80">{cancelledInvoicesList.length} voided bills</span>
        </div>
      </div>

      {reportTab === "performance" ? (
        /* ══════════════ WORKER PERFORMANCE VIEW ══════════════ */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>📈 Cashier & Staff Performance Leaderboard</span>
              </h3>
              <p className="text-xs text-slate-400">
                Rankings by sales volume, invoices handled, cash collected, and branch assignment
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="py-3 px-4 font-semibold">Staff Member</th>
                  <th className="py-3 px-4 font-semibold">Role & Station</th>
                  <th className="py-3 px-4 font-semibold text-center">Bills Created</th>
                  <th className="py-3 px-4 font-semibold text-end">Total Sales Revenue</th>
                  <th className="py-3 px-4 font-semibold text-end">Cash Collected</th>
                  <th className="py-3 px-4 font-semibold text-end">Last Bill Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {workerPerformance.map((worker, idx) => (
                  <tr key={worker.cashierName} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-bold text-[11px] flex items-center justify-center font-mono">
                          #{idx + 1}
                        </span>
                        <img
                          src={worker.cashierAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"}
                          alt={worker.cashierName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <span className="font-bold text-slate-100 block text-xs">{worker.cashierName}</span>
                          <span className="text-[10px] text-blue-400">{worker.branchName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                        {worker.cashierRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-200">
                      {worker.billsCount} Bills
                    </td>
                    <td className="py-3.5 px-4 text-end">
                      <span className="font-black text-emerald-400 font-mono text-xs">
                        {settings.currencySymbol} {worker.totalRevenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-end">
                      <span className="font-bold text-blue-400 font-mono text-xs">
                        {settings.currencySymbol} {worker.cashCollected.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-end text-slate-400 text-[11px] font-mono">
                      {new Date(worker.lastBillTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(worker.lastBillTime).toLocaleDateString()})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : reportTab === "shift" ? (
        /* ══════════════ SHIFT SHEET GENERATOR ══════════════ */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <span>📋 Daily Shift Closing & Reconciliation Sheet</span>
              </h3>
              <p className="text-xs text-slate-400">
                Filter by date and cashier to verify drawer cash and daily totals
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs outline-none"
              />
              <select
                value={shiftCashier}
                onChange={(e) => setShiftCashier(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs outline-none"
              >
                <option value="all">All Cashiers</option>
                {workerPerformance.map((w) => (
                  <option key={w.cashierName} value={w.cashierName}>
                    {w.cashierName}
                  </option>
                ))}
              </select>
              <button
                onClick={printShiftSheet}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 transition shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sheet</span>
              </button>
            </div>
          </div>

          {/* Shift Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Shift Cash in Drawer</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {settings.currencySymbol} {shiftCashTotal.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bank / Online Transfers</span>
              <span className="text-lg font-bold text-blue-400 font-mono">
                {settings.currencySymbol} {shiftBankTotal.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Khata / Credit Given</span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                {settings.currencySymbol} {shiftCreditTotal.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Shift Sales ({shiftInvoices.length} Bills)</span>
              <span className="text-lg font-bold text-purple-300 font-mono">
                {settings.currencySymbol} {shiftGrandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Shift Invoices Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="py-2.5 px-3 font-semibold">Bill #</th>
                  <th className="py-2.5 px-3 font-semibold">Time</th>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Cashier</th>
                  <th className="py-2.5 px-3 font-semibold">Payment Mode</th>
                  <th className="py-2.5 px-3 font-semibold text-end">Grand Total</th>
                  <th className="py-2.5 px-3 font-semibold text-end">Cash Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shiftInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No invoices recorded for selected date & cashier filter.
                    </td>
                  </tr>
                ) : (
                  shiftInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {new Date(inv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 text-slate-200">{inv.customerName}</td>
                      <td className="py-2.5 px-3 text-slate-300">{inv.cashierName}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-end font-mono font-bold text-slate-100">
                        {settings.currencySymbol} {inv.grandTotal.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-end font-mono font-bold text-emerald-400">
                        {settings.currencySymbol} {inv.amountPaid.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ══════════════ INVOICES LIST VIEW ══════════════ */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950/40">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute start-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search invoice #, customer, cashier, phone, reason..."
                  className="w-full ps-9 pe-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 outline-none"
              >
                <option value="all">All Invoices (تمام بل)</option>
                <option value="active">Active Valid Bills (درست بل)</option>
                <option value="cancelled">Cancelled Bills (منسوخ شدہ بل)</option>
              </select>

              <select
                value={selectedPaymentFilter}
                onChange={(e) => setSelectedPaymentFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 outline-none"
              >
                <option value="all">All Payment Types</option>
                <option value="cash">Cash Only</option>
                <option value="khata_credit">Khata (Udhaar)</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card Payment</option>
              </select>

              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 outline-none"
              >
                <option value="all">All Branches</option>
                <option value="branch-1">Branch 1 (Main HQ - Qumber Ali Shah)</option>
                <option value="branch-2">Branch 2 (City Outlet - Brother)</option>
                <option value="branch-3">Branch 3 (Bypass Outlet - Cousin)</option>
              </select>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                  <th className="py-3 px-4 font-semibold">Invoice #</th>
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold">Branch & Station</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Cashier / Operator</th>
                  <th className="py-3 px-4 font-semibold text-center">Items</th>
                  <th className="py-3 px-4 font-semibold text-end">Grand Total</th>
                  <th className="py-3 px-4 font-semibold text-end">Paid</th>
                  <th className="py-3 px-4 font-semibold text-end">Due (Khata)</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      No invoices found matching current search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isCancelled = inv.status === "cancelled";
                    return (
                      <tr 
                        key={inv.id} 
                        className={`transition ${
                          isCancelled 
                            ? "bg-rose-950/10 hover:bg-rose-950/20 text-slate-400" 
                            : "hover:bg-slate-800/40"
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold">
                          <div className="flex flex-col gap-1">
                            <span className={isCancelled ? "text-rose-400 line-through" : "text-blue-400"}>
                              {inv.invoiceNumber}
                            </span>
                            {isCancelled && (
                              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-sans font-bold border border-rose-500/30 w-fit">
                                <Ban className="w-2.5 h-2.5" />
                                منسوخ شدہ (Cancelled)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <div className="flex flex-col">
                            <span>{new Date(inv.date).toLocaleDateString()}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(inv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200">
                              {inv.branchName || "Branch 1 (Main HQ)"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {inv.counterStation || "Counter #1"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold block ${isCancelled ? "text-slate-400" : "text-slate-100"}`}>
                            {inv.customerName}
                          </span>
                          {inv.customerPhone && (
                            <span className="text-[10px] text-slate-400 font-mono">{inv.customerPhone}</span>
                          )}
                          {isCancelled && inv.cancelledReason && (
                            <span className="text-[10px] text-rose-400 block italic mt-0.5">
                              وجہ: {inv.cancelledReason}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <div className="flex items-center gap-2">
                            {inv.cashierAvatar && (
                              <img
                                src={inv.cashierAvatar}
                                alt={inv.cashierName}
                                referrerPolicy="no-referrer"
                                className="w-5 h-5 rounded-full object-cover border border-slate-700"
                              />
                            )}
                            <div>
                              <span className="font-medium text-slate-200 block text-xs">{inv.cashierName}</span>
                              {inv.printedBy && (
                                <span className="text-[9px] text-slate-500">Printed: {inv.printedBy}</span>
                              )}
                              {isCancelled && inv.cancelledBy && (
                                <span className="text-[9px] text-rose-400 block">
                                  Cancelled by: {inv.cancelledBy}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-300">
                          {inv.items.reduce((s, i) => s + i.quantity, 0)} Pcs
                        </td>
                        <td className="py-3 px-4 text-end font-mono font-bold">
                          <span className={isCancelled ? "text-rose-400 line-through" : "text-slate-100"}>
                            {settings.currencySymbol} {inv.grandTotal.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end font-mono font-bold text-emerald-400">
                          <span className={isCancelled ? "text-emerald-500/60 line-through" : "text-emerald-400"}>
                            {settings.currencySymbol} {inv.amountPaid.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end font-mono font-bold">
                          {inv.balanceDue > 0 ? (
                            <span className={isCancelled ? "text-amber-500/50 line-through" : "text-amber-400"}>
                              {settings.currencySymbol} {inv.balanceDue.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedQrInvoice(inv);
                                setCopiedQrData(false);
                              }}
                              className="px-2 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition flex items-center gap-1"
                              title="Invoice QR Code for Mobile Verification & Scanning"
                            >
                              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                              <span>QR</span>
                            </button>

                            <button
                              onClick={() => setViewInvoice(inv)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                                isCancelled
                                  ? "bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30"
                                  : "bg-slate-800 hover:bg-slate-700 text-blue-400"
                              }`}
                              title={isCancelled ? "View Cancelled Receipt" : "View & Print Receipt"}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isCancelled ? "Void Bill" : "Receipt"}</span>
                            </button>

                            {!isCancelled && onCancelInvoice && (
                              <button
                                onClick={() => setCancelTargetInvoice(inv)}
                                className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center gap-1"
                                title="Cancel this bill (منسوخ کریں)"
                              >
                                <Ban className="w-3.5 h-3.5 text-rose-400" />
                                <span>Cancel</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel Invoice Confirmation Modal */}
      {cancelTargetInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/30">
                <Ban className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">بل منسوخ کریں؟ (Cancel / Void Bill)</h3>
                <p className="text-xs text-rose-300">Invoice #{cancelTargetInvoice.invoiceNumber}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 my-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Customer:</span>
                <span className="font-semibold text-slate-100">{cancelTargetInvoice.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Items:</span>
                <span className="font-bold text-slate-100 font-mono">
                  {cancelTargetInvoice.items.length} items ({cancelTargetInvoice.items.reduce((s, i) => s + i.quantity, 0)} pcs)
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Grand Total (رقم):</span>
                <span className="font-bold text-rose-400 font-mono">
                  {settings.currencySymbol} {cancelTargetInvoice.grandTotal.toLocaleString()}
                </span>
              </div>
              {cancelTargetInvoice.balanceDue > 0 && (
                <div className="flex justify-between text-amber-300 bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                  <span>Khata Reversal (کھاتہ واپسی):</span>
                  <span className="font-bold font-mono">
                    - {settings.currencySymbol} {cancelTargetInvoice.balanceDue.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Select Reason */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-semibold text-slate-300 block">
                منسوخی کی وجہ منتخب کریں (Select Reason for Cancellation):
              </label>
              <select
                value={cancelReasonPreset}
                onChange={(e) => setCancelReasonPreset(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-rose-500 outline-none"
              >
                <option value="Customer returned goods (گاہک نے سامان واپس کر دیا)">
                  Customer returned goods (گاہک نے سامان واپس کر دیا)
                </option>
                <option value="Wrong items / rate punched by cashier (غلط آئٹم یا ریٹ درج ہو گیا)">
                  Wrong items / rate punched by cashier (غلط آئٹم یا ریٹ درج ہو گیا)
                </option>
                <option value="Duplicate bill generated by mistake (ڈپلیکیٹ بل بن گیا تھا)">
                  Duplicate bill generated by mistake (ڈپلیکیٹ بل بن گیا تھا)
                </option>
                <option value="Customer cancelled before taking delivery (گاہک نے سودا ختم کر دیا)">
                  Customer cancelled before taking delivery (گاہک نے سودا ختم کر دیا)
                </option>
                <option value="Custom Reason (دیگر وجہ)">
                  Custom Reason (دیگر وجہ درج کریں)
                </option>
              </select>

              {cancelReasonPreset === "Custom Reason (دیگر وجہ)" && (
                <textarea
                  value={customReasonText}
                  onChange={(e) => setCustomReasonText(e.target.value)}
                  placeholder="منسوخی کی تفصیلی وجہ یہاں لکھیں..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-rose-500 outline-none resize-none"
                />
              )}

              <p className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                ✓ بل کینسل کرنے سے تمام اشیاء کا سٹاک خودبخود بحال ہو جائے گا اور کھاتہ ایڈجسٹ ہو جائے گا۔
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCancelTargetInvoice(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 transition"
              >
                نہیں، واپس جائیں (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelInvoice}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ہاں، بل منسوخ کریں (Confirm Void)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {viewInvoice && (
        <InvoiceReceiptModal
          invoice={viewInvoice}
          settings={settings}
          onClose={() => setViewInvoice(null)}
        />
      )}

      {/* Invoice QR Code Verification Modal */}
      {selectedQrInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-1.5">
                    <span>Invoice QR Verification</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      بل تصدیقی کوڈ
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedQrInvoice.invoiceNumber} • {new Date(selectedQrInvoice.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedQrInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code Display Canvas */}
            <div className="my-5 flex flex-col items-center justify-center">
              <div className="p-3.5 bg-white rounded-2xl shadow-xl border-4 border-indigo-500/20">
                <QRCodeSVG
                  value={JSON.stringify({
                    store: "Haider Pipe & Sanitary Store",
                    invoice: selectedQrInvoice.invoiceNumber,
                    date: selectedQrInvoice.date,
                    customer: selectedQrInvoice.customerName,
                    phone: selectedQrInvoice.customerPhone || "N/A",
                    total: selectedQrInvoice.grandTotal,
                    paid: selectedQrInvoice.amountPaid,
                    due: selectedQrInvoice.balanceDue,
                    status: selectedQrInvoice.status || "active",
                    branch: selectedQrInvoice.branchName || "Main Branch",
                    verifyUrl: typeof window !== "undefined" ? `${window.location.origin}/?inv=${selectedQrInvoice.invoiceNumber}` : ""
                  })}
                  size={160}
                  level="M"
                />
              </div>
              <div className="mt-2.5 text-center">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Official Verified Bill • Qumber Sanitary</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  موبائل کیمرے یا کسی بھی بارکوڈ ریڈر سے اسکین کر کے بل کی اصلیت چیک کریں
                </p>
              </div>
            </div>

            {/* Invoice Summary Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Customer (کسٹمر):</span>
                <span className="font-bold text-slate-100">{selectedQrInvoice.customerName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Grand Total (کل بل):</span>
                <span className="font-mono font-bold text-slate-100">
                  {settings.currencySymbol} {selectedQrInvoice.grandTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Amount Paid (وصول شدہ):</span>
                <span className="font-mono font-bold text-emerald-400">
                  {settings.currencySymbol} {selectedQrInvoice.amountPaid.toLocaleString()}
                </span>
              </div>
              {selectedQrInvoice.balanceDue > 0 && (
                <div className="flex justify-between items-center text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                  <span>Khata Due (بقایا ادھار):</span>
                  <span className="font-mono font-bold">
                    {settings.currencySymbol} {selectedQrInvoice.balanceDue.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                <span>Cashier & Branch:</span>
                <span className="font-medium text-slate-300">
                  {selectedQrInvoice.cashierName} • {selectedQrInvoice.branchName || "Main HQ"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const verificationText = `Qumber Sanitary Verified Invoice #${selectedQrInvoice.invoiceNumber}\nCustomer: ${selectedQrInvoice.customerName}\nDate: ${new Date(selectedQrInvoice.date).toLocaleDateString()}\nTotal: ${settings.currencySymbol} ${selectedQrInvoice.grandTotal}\nPaid: ${settings.currencySymbol} ${selectedQrInvoice.amountPaid}\nDue: ${settings.currencySymbol} ${selectedQrInvoice.balanceDue}`;
                  navigator.clipboard.writeText(verificationText);
                  setCopiedQrData(true);
                  setTimeout(() => setCopiedQrData(false), 2500);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedQrData ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Info</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewInvoice(selectedQrInvoice);
                    setSelectedQrInvoice(null);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQrInvoice(null)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  بند کریں
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Antigravity Agent Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm">Qumber Financial Analyst Agent</h3>
                  <p className="text-[10px] text-slate-400">Powered by Gemini 2.5 Flash & Antigravity</p>
                </div>
              </div>
              <button
                onClick={() => setShowAgentModal(false)}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="py-6 min-h-[300px] flex flex-col justify-center">
              {isAgentRunning ? (
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div>
                    <h4 className="font-bold text-slate-200">Analyzing Sales & Generating PDF...</h4>
                    <p className="text-xs text-slate-400 mt-1">The Antigravity agent is writing Python code, plotting charts with matplotlib, and compiling the PDF report in a sandboxed environment.</p>
                  </div>
                </div>
              ) : agentResult ? (
                <div className="text-sm text-slate-300 space-y-3 max-h-[60vh] overflow-y-auto whitespace-pre-wrap font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {agentResult}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
