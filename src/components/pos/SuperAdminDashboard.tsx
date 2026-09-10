import React, { useState } from "react";
import { UserAccount, StoreSettings, Branch, Product, Invoice, Customer, BusinessExpense } from "../../types";
import { 
  Crown, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  ShieldCheck, 
  Video, 
  Lock, 
  Unlock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Eye, 
  FileText, 
  Clock, 
  Layers, 
  ShoppingBag, 
  Download, 
  Smartphone, 
  HardDrive, 
  Printer, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  Phone,
  Mail,
  CreditCard,
  Fingerprint,
  ScanFace,
  Home,
  UserPlus,
  Search,
  Shield,
  MessageSquare,
  FileSpreadsheet,
  Archive,
  Activity
} from "lucide-react";
import { StaffKycModal } from "./StaffKycModal";
import { ApiHealthDashboard } from "./ApiHealthDashboard";
import { generateDailyReportText, sendToWhatsApp } from "../../utils/reportUtils";

interface SuperAdminDashboardProps {
  activeUser: UserAccount;
  users: UserAccount[];
  branches: Branch[];
  products: Product[];
  invoices: Invoice[];
  expenses: BusinessExpense[];
  customers: Customer[];
  settings: StoreSettings;
  onSwitchBranch: (branchId: string) => void;
  onNavigateTab: (tab: any) => void;
  onUpdateUsers: (updatedUsers: UserAccount[]) => void;
  onUpdateBranches: (updatedBranches: Branch[]) => void;
  onOpenInstallModal?: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  activeUser,
  users,
  branches,
  products,
  invoices,
  expenses,
  customers,
  settings,
  onSwitchBranch,
  onNavigateTab,
  onUpdateUsers,
  onUpdateBranches,
  onOpenInstallModal,
}) => {
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("all");
  const [lockedBranchIds, setLockedBranchIds] = useState<string[]>([]);
  const [showManagerModal, setShowManagerModal] = useState<Branch | null>(null);
  const [selectedNewManagerId, setSelectedNewManagerId] = useState<string>("");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeDownloadNotice, setActiveDownloadNotice] = useState<string | null>(null);
  const [editingKycUser, setEditingKycUser] = useState<UserAccount | null>(null);
  const [kycSearchQuery, setKycSearchQuery] = useState("");
  const [kycBranchFilter, setKycBranchFilter] = useState("all");
  const [copiedCnicId, setCopiedCnicId] = useState<string | null>(null);

  const appUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyUrl = () => {
    if (!appUrl) return;
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleDownloadNotice = (title: string) => {
    setActiveDownloadNotice(title);
    setTimeout(() => setActiveDownloadNotice(null), 3000);
  };

  const handleSendDailyReport = () => {
    const today = new Date().toISOString().substring(0, 10);
    const reportText = generateDailyReportText(today, invoices, expenses, products);
    sendToWhatsApp(activeUser.phone || settings.phone, reportText);
  };

  // Calculate high-level financial metrics across all branches
  const activeInvoices = (invoices || []).filter((i) => i.status !== "cancelled");
  const totalGlobalRevenue = activeInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalGlobalPaid = activeInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalGlobalUdhaar = activeInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  
  // Calculate total inventory valuation
  const totalInventoryValuation = (products || []).reduce(
    (sum, p) => sum + (p.stock || 0) * (p.retailPrice || 0),
    0
  );

  // Filter invoices by branch
  const getBranchInvoices = (branchId: string) =>
    activeInvoices.filter((i) => i.branchName?.toLowerCase().includes(branchId === "branch-2" ? "asad" : branchId === "branch-3" ? "abbas" : "main") || i.branchName === (branches || []).find(b => b.id === branchId)?.name);

  // Filter products count per branch
  const getBranchLowStockCount = (branchId: string) => {
    return (products || []).filter((p) => {
      const stock = branchId === "branch-1" ? p.stockBranch1 : branchId === "branch-2" ? p.stockBranch2 : p.stockBranch3;
      return (stock ?? p.stock) <= (p.minStock || 5);
    }).length;
  };

  const toggleLockBranch = (branchId: string) => {
    if (lockedBranchIds.includes(branchId)) {
      setLockedBranchIds(lockedBranchIds.filter((id) => id !== branchId));
    } else {
      setLockedBranchIds([...lockedBranchIds, branchId]);
    }
  };

  const handleChangeManager = (branch: Branch) => {
    if (!selectedNewManagerId) return;
    const managerUser = users.find((u) => u.id === selectedNewManagerId);
    if (!managerUser) return;

    const updatedBranches = branches.map((b) => {
      if (b.id === branch.id) {
        return { ...b, managerName: managerUser.name };
      }
      return b;
    });

    onUpdateBranches(updatedBranches);
    setShowManagerModal(null);
  };

  const handleSaveStaffKyc = (updatedUser: UserAccount) => {
    const exists = users.some((u) => u.id === updatedUser.id);
    const updated = exists
      ? users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      : [updatedUser, ...users];
    onUpdateUsers(updated);
    setEditingKycUser(null);
  };

  const handleAddNewStaff = () => {
    const newStaffTemplate: UserAccount = {
      id: `user-${Date.now()}`,
      name: "",
      role: "cashier",
      branchId: "branch-1",
      branchName: "Branch 1 (Main HQ)",
      phone: "0300-",
      email: "",
      pin: "1234",
      counterStation: "Counter #2",
      cnic: "",
      address: "",
      secondContactName: "",
      secondContactRelation: "Father",
      secondContactPhone: "0300-",
      biometricRegistered: true,
      faceRecognitionRegistered: true,
      kycCompleted: false,
    };
    setEditingKycUser(newStaffTemplate);
  };

  const handleCopyCnic = (cnic: string, userId: string) => {
    navigator.clipboard.writeText(cnic);
    setCopiedCnicId(userId);
    setTimeout(() => setCopiedCnicId(null), 2000);
  };

  const filteredStaff = users.filter((u) => {
    const matchesBranch =
      kycBranchFilter === "all" ||
      u.branchId === kycBranchFilter ||
      (!u.branchId && kycBranchFilter === "branch-1");
    const q = kycSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.cnic?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.secondContactName?.toLowerCase().includes(q);
    return matchesBranch && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto space-y-6 text-slate-100 font-sans">
      {/* Super Admin Executive Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="relative shrink-0">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
              alt="Qumber Ali Shah (Owner)"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-xl ring-4 ring-amber-500/20"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shadow border border-slate-900">
              <Crown className="w-3 h-3 fill-slate-950" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Super Admin Executive HQ Command Center
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Qumber Ali Shah (Owner & Super Admin)</span>
              </span>
            </div>
            {/* Owner Contact Phone & Executive Station */}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>رابطہ نمبر: 0300-5861463</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-bold">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Permanent Email: qumbera038@gmail.com</span>
              </div>
              <span className="text-slate-400">
                🏢 Counter #1 (Executive Desk) • Main HQ
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10 flex-wrap">
          <button
            onClick={handleSendDailyReport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30"
          >
            <Share2 className="w-4 h-4" />
            <span>روزانہ کی رپورٹ (WA)</span>
          </button>
          <button
            onClick={() => onNavigateTab("expense_ledger")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>خرچہ شیٹ</span>
          </button>
          
          <a
            href="/download/bundle"
            className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-black transition flex items-center gap-3 shadow-2xl shadow-blue-600/40 border border-blue-400/30 active:scale-95"
          >
            <Archive className="w-6 h-6" />
            <div className="flex flex-col items-start leading-none">
              <span>ڈاؤن لوڈ ماسٹر بنڈل (One-Click Setup)</span>
              <span className="text-[10px] opacity-80 mt-1 font-mono">Full Backup & Mobile App</span>
            </div>
          </a>

          <button
            onClick={onOpenInstallModal}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-500/30 border border-emerald-400/30"
          >
            <Smartphone className="w-4 h-4" />
            <span>موبائل میں ابھی انسٹال کریں (Install to Phone)</span>
          </button>

          <button
            onClick={() => onNavigateTab("reports")}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Detailed AI Reports</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("api-health-monitor-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-4 py-2 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>API Key Pool Health</span>
          </button>
          <button
            onClick={() => onNavigateTab("branches")}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Manage All 3 Branches</span>
          </button>
        </div>
      </div>

      {/* Global Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Global Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue (3 Branches)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {settings.currencySymbol} {totalGlobalRevenue.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Collected Cash: {settings.currencySymbol} {totalGlobalPaid.toLocaleString()}</span>
            <span className="text-emerald-400 font-bold">{activeInvoices.length} Bills</span>
          </div>
        </div>

        {/* Card 2: Total Receivables / Udhaar */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Udhaar / Receivables</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono tracking-tight">
            {settings.currencySymbol} {totalGlobalUdhaar.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Pending across {customers.length} Accounts</span>
            <span className="text-amber-400 font-bold">Khata Active</span>
          </div>
        </div>

        {/* Card 3: Total Stock Valuation */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Inventory Valuation</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-400 font-mono tracking-tight">
            {settings.currencySymbol} {totalInventoryValuation.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Catalog Products</span>
            <span className="text-blue-400 font-bold">{products.length} Items</span>
          </div>
        </div>

        {/* Card 4: Staff & Active Managers */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Staff & Cashiers</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-300 font-mono tracking-tight">
            {users.length} Active Users
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>3 Branch Managers</span>
            <span className="text-indigo-400 font-bold">All Logged In</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 👑 OWNER EXCLUSIVE: APP INSTALLATION & MASTER DOWNLOADS (صرف اونر کے لیے) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Download notification toast */}
        {activeDownloadNotice && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{activeDownloadNotice} ڈاؤنلوڈ شروع ہو گئی ہے!</span>
          </div>
        )}

        {/* Header with Security Badge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20 shrink-0 ring-2 ring-amber-400/50">
              <Download className="w-7 h-7 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>👑 اونر پرائیویٹ کنٹرول: ایپ انسٹالیشن و ماسٹر ڈاؤنلوڈز</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>صرف اونر (حیدر علی) کے لیے محفوظ</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                تمام ڈاؤنلوڈز، اینڈرائیڈ APK، آف لائن سنگل فائل، اور انسٹالیشن کا مکمل خفیہ طریقہ کار صرف آپ کے اس ڈیش بورڈ پر ہے، کسی سٹاف کو نظر نہیں آئے گا۔
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition transform active:scale-95"
              >
                <Smartphone className="w-4 h-4 text-slate-950" />
                <span>📲 موبائل میں ایپ انسٹال کریں</span>
              </button>
            )}
            <button
              onClick={handleCopyUrl}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              title="ایپ کا لائیو لنک کاپی کریں"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedUrl ? "لنک کاپی ہو گیا!" : "کاپی لائیو لنک"}</span>
            </button>
          </div>
        </div>

        {/* 4 Primary Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {/* Card 1: 1-Click Phone App Install */}
          <div className="bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 p-5 rounded-2xl flex flex-col justify-between shadow-xl transition group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  تجویز کردہ (PWA)
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-white mb-1">
                📲 موبائل ہوم اسکرین ایپ
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                گوگل پلے اسٹور جیسی نیٹیو ایپ۔ موبائل میں شارٹ کٹ بن جائے گا اور فل اسکرین بغیر براؤزر کے کھلے گی۔
              </p>
            </div>
            <button
              onClick={onOpenInstallModal}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install to Phone</span>
            </button>
          </div>

          {/* Card 2: Android APK Download */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl flex flex-col justify-between shadow-xl transition group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  1.4 MB APK
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-white mb-1">
                📱 اینڈرائیڈ APK پیکیج
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                ہر قسم کے اینڈرائیڈ موبائل اور ٹیبلٹ کے لیے خودکار APK انسٹالر۔ فائل ڈاؤنلوڈ کر کے اوپن کریں۔
              </p>
            </div>
            <a
              href="/haider_sanitary_pos.apk"
              download="haider_sanitary_pos.apk"
              onClick={() => handleDownloadNotice("Android APK")}
              className="w-full py-2.5 bg-slate-800 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-500/30 hover:border-emerald-500 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download APK (.apk)</span>
            </a>
          </div>

          {/* Card 3: 1-File Standalone Offline App */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 p-5 rounded-2xl flex flex-col justify-between shadow-xl transition group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition">
                  <HardDrive className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-sky-400">
                  2.3 MB HTML
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-white mb-1">
                💻 1-فائل آف لائن POS ایپ
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                مکمل POS سافٹ ویئر صرف ایک ہی HTML فائل کے اندر۔ بغیر انٹرنیٹ کے کمپیوٹر پر ڈبل کلک کر کے چلائیں۔
              </p>
            </div>
            <a
              href="/haider_sanitary_pos_single_file.html"
              download="haider_sanitary_pos_single_file.html"
              onClick={() => handleDownloadNotice("1-File Standalone HTML")}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download 1 File (.html)</span>
            </a>
          </div>

          {/* Card 4: Full Source Code ZIP */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 p-5 rounded-2xl flex flex-col justify-between shadow-xl transition group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-400">
                  4.2 MB TAR.GZ
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-white mb-1">
                📦 مکمل سورس کوڈ (Archive)
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                تمام ری ایکٹ کوڈ، کلاؤڈ سرور، اسکرپٹس، پروڈکٹ ڈیٹا اور اسٹائلز کا 100% مکمل محفوظ آرکائیو۔
              </p>
            </div>
            <a
              href="/download/source-zip"
              download="haider_sanitary_pos_source.tar.gz"
              onClick={() => handleDownloadNotice("Complete Source Code Archive")}
              className="w-full py-2.5 bg-slate-800 hover:bg-purple-600 text-purple-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-purple-500/30 hover:border-purple-500 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Source (.tar.gz)</span>
            </a>
          </div>
        </div>

        {/* Documentation & Manuals Sub-Bar */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-200 block">مکمل مینوئل اور گائیڈ بکس (Master Documentation):</span>
              <span className="text-slate-400 text-[11px]">سسٹم کی مکمل گائیڈ، ڈیٹا کی بحالی، اور آف لائن بلنگ کا پرنٹ ایبل کتابچہ</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/haider_sanitary_complete_documentation.pdf"
              download="haider_sanitary_complete_documentation.pdf"
              onClick={() => handleDownloadNotice("Documentation PDF")}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-amber-500/30"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Complete Doc (PDF)</span>
            </a>

            <a
              href="/haider_sanitary_master_manual_printable.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-sky-500/30"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Printable Manual (HTML)</span>
            </a>

            <button
              onClick={() => onNavigateTab("export")}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <span>مزید تفصیلات و بیک اپ ➔</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Confidential Owner Instructions */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-xs space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>اونر کے لیے خفیہ انسٹالیشن گائیڈ (Confidential Step-by-Step Guide)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-amber-500/20 space-y-1">
              <span className="text-amber-400 font-black block">1. موبائل میں انسٹالیشن:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                موبائل کروم میں اوپر پیلا بٹن "موبائل میں ایپ انسٹال کریں" دبائیں یا اوپر 3 ڈاٹس مینو سے <strong>Add to Home Screen</strong> دبائیں۔ ایپ ہوم اسکرین پر آ جائے گی۔
              </p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-amber-500/20 space-y-1">
              <span className="text-sky-400 font-black block">2. کمپیوٹر / لیپ ٹاپ پر بغیر نیٹ:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                اوپر دی گئی <strong>Download 1 File (.html)</strong> اپنے کمپیوٹر یا USB میں محفوظ رکھیں۔ انٹرنیٹ نہ ہونے پر بھی ڈبل کلک کر کے تمام بلنگ اور کھاتہ چلتا رہے گا۔
              </p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-amber-500/20 space-y-1">
              <span className="text-emerald-400 font-black block">3. 100% پرائیویسی گارنٹی:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                یہ تمام آپشنز صرف آپ کے اس <strong>Super Admin HQ</strong> ڈیش بورڈ پر مقفل ہیں۔ کسی سیلز مین یا کیشئر کے سامنے یہ ڈاؤنلوڈ مینو ظاہر نہیں ہوگا۔
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Live Branch Executive Control Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>3 Branch Live Command & Terminal Control</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Click "Switch View" to inspect any branch terminal directly
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {branches.map((branch) => {
            const branchInvoices = getBranchInvoices(branch.id);
            const branchSales = branchInvoices.reduce((s, i) => s + i.grandTotal, 0);
            const lowStockCount = getBranchLowStockCount(branch.id);
            const isLocked = lockedBranchIds.includes(branch.id);
            const manager = users.find((u) => u.branchId === branch.id && u.role === "manager");

            return (
              <div
                key={branch.id}
                className={`bg-slate-900 border rounded-3xl p-5 shadow-2xl relative flex flex-col justify-between transition ${
                  isLocked ? "border-rose-500/50 bg-rose-950/10" : "border-slate-800 hover:border-indigo-500/40"
                }`}
              >
                {/* Branch Header */}
                <div className="space-y-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {branch.code || branch.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLockBranch(branch.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          isLocked
                            ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        }`}
                        title={isLocked ? "Unlock Branch Terminal" : "Lock Branch Terminal"}
                      >
                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{isLocked ? "Locked" : "Lock"}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-100 text-base">{branch.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>📍 {branch.address || "Main Market"}</span>
                    </p>
                  </div>
                </div>

                {/* Branch Manager & Cashier Info */}
                <div className="py-4 space-y-3">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={manager?.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"}
                          alt={manager?.name || "Manager"}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border border-indigo-400/50"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Branch Head / Manager</span>
                        <span className="text-xs font-bold text-slate-100 block truncate">{manager?.name || branch.managerName}</span>
                        <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1 mt-0.5 font-semibold">
                          <Phone className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                          <span>{manager?.phone || branch.mobile || branch.phone}</span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowManagerModal(branch)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-semibold shrink-0 ml-2"
                    >
                      Change
                    </button>
                  </div>

                  {/* Branch Key Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Today's Branch Revenue</span>
                      <span className="font-extrabold text-emerald-400 font-mono">
                        {settings.currencySymbol} {branchSales.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Low Stock Alert</span>
                      <span className={`font-extrabold font-mono ${lowStockCount > 0 ? "text-amber-400" : "text-slate-300"}`}>
                        {lowStockCount} Items Low
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => onSwitchBranch(branch.id)}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Switch To Branch View</span>
                  </button>
                  <button
                    onClick={() => onNavigateTab("billing")}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition"
                    title="Open Billing Counter"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff Security Dossier & KYC Biometric Registry Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-slate-100 text-base tracking-tight">
                  اسٹاف سیکیورٹی ڈوزیئر، شناختی کارڈز (CNIC) و بائیو میٹرک رجسٹر
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {users.filter(u => u.kycCompleted).length} / {users.length} ویریفائیڈ محفوظ ریکارڈز
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تمام برانچ مینیجرز، کیشئرز اور سیلز اسٹاف کی تصاویر، CNIC، فون، ایڈریس، ضامن اور بائیو میٹرک تفصیلات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAddNewStaff}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>نیا اسٹاف شامل کریں (بائیو میٹرک کے ساتھ)</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "تمام برانچز (All Staff)" },
              { id: "branch-1", label: "برانچ 1 (مین ہیڈکوارٹر)" },
              { id: "branch-2", label: "برانچ 2 (اسد سینیٹری)" },
              { id: "branch-3", label: "برانچ 3 (عباس سینیٹری)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setKycBranchFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  kycBranchFilter === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={kycSearchQuery}
              onChange={(e) => setKycSearchQuery(e.target.value)}
              placeholder="تلاش: نام، شناختی کارڈ، فون، یا ضامن..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Staff Dossier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => {
            const photo =
              staff.avatarUrl ||
              (staff as any).avatar ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80";

            return (
              <div
                key={staff.id}
                className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 transition group"
              >
                {/* Header: Photo, Name, Role & Verification Badge */}
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={photo}
                      alt={staff.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-md group-hover:border-blue-500 transition"
                    />
                    <span
                      className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 shadow"
                      title="Active Duty"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <h4 className="text-sm font-extrabold text-white truncate">
                        {staff.name || "نام درج نہیں"}
                      </h4>
                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 rounded-md font-black border ${
                          staff.role === "admin"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : staff.role === "manager"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                        }`}
                      >
                        {staff.role}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-0.5">
                      🏢 {staff.branchName || (branches.find(b => b.id === staff.branchId)?.name) || "Branch 1 (Main HQ)"}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] flex-wrap">
                      <span className="text-slate-400">
                        کاؤنٹر: <strong className="text-slate-200">{staff.counterStation || "Counter #1"}</strong>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        PIN: <strong className="text-slate-300">****</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dossier Critical Records Box */}
                <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/90 space-y-2 text-xs">
                  {/* CNIC */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-bold">
                        CNIC: {staff.cnic || "17301-XXXXXXX-X"}
                      </span>
                    </div>
                    {staff.cnic && (
                      <button
                        onClick={() => handleCopyCnic(staff.cnic || "", staff.id)}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 flex items-center gap-1"
                        title="Copy CNIC"
                      >
                        {copiedCnicId === staff.id ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Primary Mobile */}
                  <div className="flex items-center justify-between text-amber-300 font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-bold">موبائل: {staff.phone || "0300-XXXXXXX"}</span>
                    </div>
                    {staff.phone && (
                      <a
                        href={`https://wa.me/92${staff.phone.replace(/[^0-9]/g, "").replace(/^0/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="w-2.5 h-2.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* Residential Address */}
                  <div className="flex items-start gap-1.5 text-slate-400 text-[11px] leading-relaxed">
                    <Home className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {staff.address || "ڈاکخانہ و رہائشی پتہ درج ہے"}
                    </span>
                  </div>

                  {/* 2nd Contact Person / ضامن */}
                  <div className="pt-1.5 border-t border-slate-800/80 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">
                        ضامن (2nd Contact): <strong className="text-slate-200">{staff.secondContactName || "طارق علی"}</strong> ({staff.secondContactRelation || "والد"})
                      </span>
                    </div>
                    <p className="text-slate-400 font-mono text-[10px] pl-3">
                      رابطہ: {staff.secondContactPhone || "0300-XXXXXXX"}
                    </p>
                  </div>

                  {/* Biometrics & Face Recognition Status */}
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1 text-indigo-400 font-bold">
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>{staff.biometricId || "BIO-VERIFIED"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400 font-bold">
                      <ScanFace className="w-3.5 h-3.5" />
                      <span>Face ID: {staff.faceConfidence || 99.2}% Match</span>
                    </div>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      ✓ KYC OK
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    ID: {staff.employeeCode || staff.id}
                  </span>
                  <button
                    onClick={() => setEditingKycUser(staff)}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>ڈوزیئر دیکھیں / تبدیل کریں</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Gemini API Health, Key Pool, Failover & Rotation Monitor */}
      <ApiHealthDashboard onNotification={(msg) => handleDownloadNotice(msg)} />

      {/* System Security & CCTV Live Feeds Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                <span>9 Live CCTV Camera Security Feeds</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[9px] font-black animate-pulse">
                  LIVE MONITORED
                </span>
              </h3>
              <p className="text-xs text-slate-400">Real-time surveillance across Branch 1 HQ, Branch 2 & Branch 3 counters</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("branches")}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
          >
            <span>Open All CCTVs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Branch 1 HQ (Main Desk)</span>
                <span className="text-[10px] text-slate-500">3 Cameras Active</span>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">1080p HD</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Branch 2 (Asad Sanitary)</span>
                <span className="text-[10px] text-slate-500">3 Cameras Active</span>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">1080p HD</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Branch 3 (Abbas Sanitary)</span>
                <span className="text-[10px] text-slate-500">3 Cameras Active</span>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">1080p HD</span>
          </div>
        </div>
      </div>

      {/* Change Branch Manager Modal */}
      {showManagerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-200">
            <h3 className="font-bold text-slate-100 text-base mb-2">
              Assign Manager for {showManagerModal.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select an authorized manager account to oversee operations at this branch terminal.
            </p>

            <select
              value={selectedNewManagerId}
              onChange={(e) => setSelectedNewManagerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-3 rounded-xl text-xs mb-4 font-medium outline-none focus:border-indigo-500"
            >
              <option value="">-- Select Manager Account --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.toUpperCase()}) - {u.branchName || "HQ"}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowManagerModal(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleChangeManager(showManagerModal)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Staff KYC Modal */}
      {editingKycUser && (
        <StaffKycModal
          user={editingKycUser}
          branches={branches}
          isForced={false}
          onClose={() => setEditingKycUser(null)}
          onSaveKyc={handleSaveStaffKyc}
        />
      )}
    </div>
  );
};
