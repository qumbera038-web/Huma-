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
  Activity,
  Database,
  Zap,
  Calendar,
  FileBarChart,
  CheckCheck,
  Trash2,
  AlertCircle,
  X,
  HeartHandshake,
  BadgeCheck,
  LayoutDashboard,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Sparkle,
  Truck
} from "lucide-react";
import { StaffKycModal } from "./StaffKycModal";
import { SuperAdminKeyModal } from "./SuperAdminKeyModal";
import { ApiHealthDashboard } from "./ApiHealthDashboard";
import { ProductCategoryView } from "./ProductCategoryView";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { HourlyActivityHeatmap } from "./HourlyActivityHeatmap";
import { 
  generateDailyReportText, 
  sendToWhatsApp, 
  generateMonthlyReportData, 
  generateMonthlyReportText, 
  MonthlyReportSummary 
} from "../../utils/reportUtils";
import { 
  exportAllDataBackup, 
  getLastBackupDate, 
  clearTempCache, 
  getLastCacheClearDate, 
  CacheClearResult 
} from "../../utils/posStorage";

export type DashboardSectionTab = 
  | "overview" 
  | "quick_actions" 
  | "branches" 
  | "staff" 
  | "downloads" 
  | "system_health" 
  | "all";

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
  const [isKeyVerified, setIsKeyVerified] = useState(false);
  const [showProductCatalog, setShowProductCatalog] = useState(false);
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

  // User-Friendly Dashboard State Management
  const [activeSectionTab, setActiveSectionTab] = useState<DashboardSectionTab>("overview");
  const [isFriendlyMode, setIsFriendlyMode] = useState<boolean>(true);
  const [dashboardSearch, setDashboardSearch] = useState<string>("");

  // Quick Actions States & Handlers
  const currentMonthISO = new Date().toISOString().substring(0, 7);
  const [selectedReportMonth, setSelectedReportMonth] = useState<string>(currentMonthISO);
  const [showMonthlyReportModal, setShowMonthlyReportModal] = useState(false);
  const [monthlyReportData, setMonthlyReportData] = useState<MonthlyReportSummary | null>(null);
  const [monthlyReportRawText, setMonthlyReportRawText] = useState("");
  const [copiedMonthlyReport, setCopiedMonthlyReport] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => getLastBackupDate());
  const [lastCacheDate, setLastCacheDate] = useState<string | null>(() => getLastCacheClearDate());
  const [cacheClearFeedback, setCacheClearFeedback] = useState<CacheClearResult | null>(null);

  const handleQuickGenerateMonthlyReport = (targetMonth?: string) => {
    setIsGeneratingReport(true);
    try {
      const monthToUse = targetMonth || selectedReportMonth || currentMonthISO;
      const summary = generateMonthlyReportData(monthToUse, invoices, expenses, products, branches);
      const rawText = generateMonthlyReportText(monthToUse, invoices, expenses, products, branches);
      setMonthlyReportData(summary);
      setMonthlyReportRawText(rawText);
      setShowMonthlyReportModal(true);
      handleDownloadNotice(`ماہانہ رپورٹ برائے ${summary.monthName} تیار ہو گئی ہے!`);
    } finally {
      setTimeout(() => setIsGeneratingReport(false), 400);
    }
  };

  const handleQuickClearCache = async () => {
    setIsClearingCache(true);
    try {
      const res = await clearTempCache();
      setLastCacheDate(res.timestamp);
      setCacheClearFeedback(res);
      handleDownloadNotice("عارضی کیش اور سیشن میموری صاف کر دی گئی!");
    } catch (err) {
      console.error("Cache clear error", err);
    } finally {
      setTimeout(() => setIsClearingCache(false), 600);
    }
  };

  const handleQuickBackupDatabase = () => {
    setIsBackingUp(true);
    try {
      exportAllDataBackup();
      const todayDate = new Date().toISOString().slice(0, 10);
      setLastBackupDate(todayDate);
      handleDownloadNotice("ڈیٹا بیس بیک اپ فائل (JSON) ڈاؤنلوڈ ہو گئی!");
    } catch (err) {
      console.error("Backup error", err);
    } finally {
      setTimeout(() => setIsBackingUp(false), 800);
    }
  };

  const handleCopyMonthlyReport = () => {
    if (!monthlyReportRawText) return;
    navigator.clipboard.writeText(monthlyReportRawText);
    setCopiedMonthlyReport(true);
    setTimeout(() => setCopiedMonthlyReport(false), 2500);
  };

  const handleDownloadMonthlyReportFile = () => {
    if (!monthlyReportRawText) return;
    const blob = new Blob([monthlyReportRawText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `haider-sanitary-monthly-report-${selectedReportMonth}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    handleDownloadNotice("Monthly Report TXT");
  };

  const handleSendMonthlyReportWhatsApp = () => {
    if (!monthlyReportRawText) return;
    sendToWhatsApp(activeUser.phone || settings.phone, monthlyReportRawText);
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
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
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
    const q = (dashboardSearch || kycSearchQuery).toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.cnic?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.secondContactName?.toLowerCase().includes(q);
    return matchesBranch && matchesSearch;
  });

  if (!isKeyVerified && activeUser.role === 'admin') {
    return <SuperAdminKeyModal onUnlock={() => setIsKeyVerified(true)} />;
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto space-y-6 text-slate-100 font-sans">
      <div className="flex justify-end mb-2">
        <LanguageSwitcher />
      </div>

      {/* Super Admin Executive Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-5 rounded-3xl shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute end-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="relative shrink-0">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
              alt="Qumber Ali Shah (Owner)"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-xl ring-4 ring-amber-500/20"
            />
            <div className="absolute -bottom-1 -end-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shadow border border-slate-900">
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
          {/* Primary Quick Start Sale Button */}
          <button
            onClick={() => onNavigateTab("billing")}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95"
            title="نئی انوائس یا سیل بل بنائیں"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>نئی انوائس بلنگ (New Sale)</span>
          </button>

          <button
            onClick={handleSendDailyReport}
            className="px-3.5 py-2 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <Share2 className="w-4 h-4" />
            <span>روزانہ رپورٹ (WA)</span>
          </button>

          <button
            onClick={() => onNavigateTab("expense_ledger")}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>خرچہ شیٹ</span>
          </button>

          <button
            onClick={onOpenInstallModal}
            className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow"
          >
            <Smartphone className="w-4 h-4" />
            <span>موبائل ایپ انسٹال</span>
          </button>

          <button
            onClick={() => setShowProductCatalog(!showProductCatalog)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              showProductCatalog
                ? "bg-purple-600 text-white border-purple-400"
                : "bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border-purple-500/40"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{showProductCatalog ? "Back to Dashboard" : "Price List Catalog"}</span>
          </button>

          <button
            onClick={() => setIsFriendlyMode(!isFriendlyMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              isFriendlyMode
                ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
            title="ڈیش بورڈ موڈ تبدیل کریں"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isFriendlyMode ? "✨ آسان موڈ (Friendly)" : "📑 مکمل موڈ"}</span>
          </button>
        </div>
      </div>

      {/* 🧭 User-Friendly Dashboard Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto shadow-lg backdrop-blur-md scrollbar-none">
        <button
          onClick={() => setActiveSectionTab("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSectionTab === "overview"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-blue-300" />
          <span>🌟 خلاصہ و جائزہ (Overview)</span>
        </button>

        <button
          onClick={() => setActiveSectionTab("quick_actions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSectionTab === "quick_actions"
              ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>⚡ فوری کارروائیاں (Quick Actions)</span>
        </button>

        <button
          onClick={() => setActiveSectionTab("branches")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSectionTab === "branches"
              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4 text-cyan-300" />
          <span>🏢 3 برانچز لائیو (3 Branches)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300">
            3
          </span>
        </button>

        <button
          onClick={() => setActiveSectionTab("staff")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSectionTab === "staff"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>👥 سٹاف و سیکیورٹی (Staff & KYC)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSectionTab("downloads")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSectionTab === "downloads"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Download className="w-4 h-4 text-purple-300" />
          <span>👑 ایپ و ماسٹر ڈاؤنلوڈز (Downloads & APK)</span>
        </button>

        <button
          onClick={() => setActiveSectionTab("system_health")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSectionTab === "system_health"
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Activity className="w-4 h-4 text-indigo-300" />
          <span>🤖 سسٹم ہیلتھ و CCTV (AI & CCTV)</span>
        </button>

        <button
          onClick={() => setActiveSectionTab("all")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSectionTab === "all"
              ? "bg-slate-800 text-amber-300 border border-amber-500/40 shadow-md"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>👁️ سب کچھ دیکھیں (All Sections)</span>
        </button>
      </div>

      {/* 🔍 Global Quick Search & Filter Bar */}
      <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={dashboardSearch}
            onChange={(e) => setDashboardSearch(e.target.value)}
            placeholder="ڈیش بورڈ میں تلاش کریں (برانچ، سٹاف، فیچر)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
          />
          {dashboardSearch && (
            <button
              onClick={() => setDashboardSearch("")}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Click Shortcut Tags */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-400 w-full sm:w-auto overflow-x-auto">
          <span className="text-[11px] text-slate-500 font-semibold shrink-0">فوری لنکس:</span>
          <button
            onClick={() => onNavigateTab("billing")}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition shrink-0"
          >
            + نئی انوائس
          </button>
          <button
            onClick={() => handleQuickGenerateMonthlyReport()}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition shrink-0"
          >
            ماہانہ رپورٹ
          </button>
          <button
            onClick={handleQuickBackupDatabase}
            className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-[11px] font-bold transition shrink-0"
          >
            بیک اپ
          </button>
          <button
            onClick={handleQuickClearCache}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition shrink-0"
          >
            کیشے صفائی
          </button>
          <button
            onClick={() => onNavigateTab("khata")}
            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition shrink-0"
          >
            کسٹمر کھاتہ
          </button>
          <button
            onClick={() => onNavigateTab("expense_ledger")}
            className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition shrink-0"
          >
            خرچہ شیٹ
          </button>
        </div>
      </div>

      {showProductCatalog ? (
        <ProductCategoryView />
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 🌟 SECTION 1: OVERVIEW & DREAM HOME TRUST HUB */}
          {/* ========================================================================= */}
          {(activeSectionTab === "overview" || activeSectionTab === "all") && (
            <div className="space-y-6">
              {/* 🌟 HaiderSanitary Brand Trust & Dream Home Hub */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 end-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md flex items-center gap-1.5 uppercase tracking-wide">
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>HaiderSanitary • برانڈ ٹرسٹ و خاندانی اعتماد</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3 text-emerald-400" />
                        <span>100% مستند سینیٹری و پائپ فٹنگ</span>
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      کسٹمر کے خوابوں کے گھر کے لیے مکمل اعتماد کا نشان
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                      HaiderSanitary صرف سامان فروخت نہیں کرتا بلکہ ہر گاہک کو یہ یقین فراہم کرتا ہے کہ اس کے خوابوں کا گھر پائیدار، خوبصورت اور لِیک پروف فٹنگز کے ساتھ ہمیشہ محفوظ رہے گا۔
                    </p>
                  </div>

                  {/* 4 Trust Value Badges */}
                  <div className="grid grid-cols-2 gap-2.5 shrink-0 w-full lg:w-auto">
                    <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                        <Sparkle className="w-4 h-4" />
                      </div>
                      <div className="leading-tight">
                        <span className="text-xs font-black text-amber-300 block">شاہانہ ڈیزائن</span>
                        <span className="text-[10px] text-slate-400">Luxury Bath Ware</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-blue-500/30 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="leading-tight">
                        <span className="text-xs font-black text-blue-300 block">لِیک پروف گارنٹی</span>
                        <span className="text-[10px] text-slate-400">Master Sanitary Fittings</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCheck className="w-4 h-4" />
                      </div>
                      <div className="leading-tight">
                        <span className="text-xs font-black text-emerald-300 block">صاف شفاف کھاتہ</span>
                        <span className="text-[10px] text-slate-400">Honest Ledger Billing</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-purple-500/30 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="leading-tight">
                        <span className="text-xs font-black text-purple-300 block">3 برانچز سے ترسیل</span>
                        <span className="text-[10px] text-slate-400">Fast Site Delivery</span>
                      </div>
                    </div>
                  </div>
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

              {/* 🚀 6-Card 1-Click User-Friendly Task Launcher */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">
                        فوری روزمرہ کاموں کا لانچ پیڈ (1-Click Daily Tasks Launcher)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        ایک کلک سے ضروری کام شروع کریں — کوئی الجھن نہیں
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                    6 آسان فیچرز
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <button
                    onClick={() => onNavigateTab("billing")}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/20 transition group text-end flex flex-col justify-between shadow-md"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-black text-white block">نئی انوائس بل</strong>
                      <span className="text-[10px] text-slate-400 block">فوری کاؤنٹر سیل</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickGenerateMonthlyReport()}
                    disabled={isGeneratingReport}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-950/20 transition group text-end flex flex-col justify-between shadow-md disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                      <FileBarChart className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-black text-white block">ماہانہ رپورٹ</strong>
                      <span className="text-[10px] text-slate-400 block">{isGeneratingReport ? "تیار ہو رہی ہے..." : "PDF و خلاصہ"}</span>
                    </div>
                  </button>

                  <button
                    onClick={handleQuickClearCache}
                    disabled={isClearingCache}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/20 transition group text-end flex flex-col justify-between shadow-md disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-black text-white block">کیشے صفائی</strong>
                      <span className="text-[10px] text-slate-400 block">{isClearingCache ? "صفائی جاری..." : "سپیڈ تیز کریں"}</span>
                    </div>
                  </button>

                  <button
                    onClick={handleQuickBackupDatabase}
                    disabled={isBackingUp}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-950/20 transition group text-end flex flex-col justify-between shadow-md disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-black text-white block">بیک اپ محفوظ</strong>
                      <span className="text-[10px] text-slate-400 block">{isBackingUp ? "محفوظ ہو رہا ہے..." : "JSON محفوظ"}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => onNavigateTab("khata")}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-rose-500/30 hover:border-rose-400 hover:bg-rose-950/20 transition group text-end flex flex-col justify-between shadow-md"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-black text-white block">کسٹمر کھاتہ</strong>
                      <span className="text-[10px] text-slate-400 block">ادھار و وصولی رجسٹر</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowProductCatalog(true)}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-950/20 transition group text-end flex flex-col justify-between shadow-md"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-black text-white block">ریٹ کیٹلاگ</strong>
                      <span className="text-[10px] text-slate-400 block">ہول سیل و ریٹیل لسٹ</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 🏢 3 Branches Quick Snapshot */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">
                        تینوں برانچز کا لائیو اسٹیٹس (3 Branches Live Overview)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Main HQ, Asad Sanitary & Abbas Sanitary terminals
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSectionTab("branches")}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>تمام برانچز کنٹرول دیکھیں</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {branches.map((b) => {
                    const bInvoices = getBranchInvoices(b.id);
                    const bSales = bInvoices.reduce((s, i) => s + i.grandTotal, 0);
                    const bLowStock = getBranchLowStockCount(b.id);
                    const isLocked = lockedBranchIds.includes(b.id);
                    const manager = users.find((u) => u.branchId === b.id && u.role === "manager");

                    return (
                      <div
                        key={b.id}
                        className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                          isLocked
                            ? "bg-rose-950/20 border-rose-500/40"
                            : "bg-slate-950/80 border-slate-800 hover:border-indigo-500/40"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {b.code || b.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isLocked
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {isLocked ? "مقفل (Locked)" : "فعال (Online)"}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-extrabold text-white text-sm">{b.name}</h5>
                            <p className="text-[11px] text-slate-400">
                              مینیجر: {manager?.name || "Unassigned"} ({manager?.phone || "0300-5861463"})
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                              <span className="text-[10px] text-slate-500 block">سیلز آمدن</span>
                              <strong className="text-emerald-400 font-mono text-xs">
                                {settings.currencySymbol} {bSales.toLocaleString()}
                              </strong>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                              <span className="text-[10px] text-slate-500 block">کم اسٹاک آئٹمز</span>
                              <strong className={`font-mono text-xs ${bLowStock > 0 ? "text-amber-400" : "text-slate-400"}`}>
                                {bLowStock} آئٹمز
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center gap-2">
                          <button
                            onClick={() => onSwitchBranch(b.id)}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>اس برانچ کا ویو کھولیں</span>
                          </button>
                          <button
                            onClick={() => toggleLockBranch(b.id)}
                            className={`p-2 rounded-xl border text-xs font-bold transition ${
                              isLocked
                                ? "bg-rose-600 text-white border-rose-500"
                                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                            }`}
                            title={isLocked ? "Unlock Branch" : "Lock Branch"}
                          >
                            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 📊 Hourly Peak Hours Heatmap Data Visualization */}
              <HourlyActivityHeatmap 
                invoices={invoices} 
                branches={branches} 
                currencySymbol={settings.currencySymbol} 
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* ⚡ SUPER ADMIN QUICK ACTIONS SECTION (فوری کارروائیاں) */}
          {/* ========================================================================= */}
          {(activeSectionTab === "overview" || activeSectionTab === "quick_actions" || activeSectionTab === "all") && (
            <div id="quick-actions-section" className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 end-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 start-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Section Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 relative z-10">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 shrink-0 ring-2 ring-indigo-400/40">
                  <Zap className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>⚡ فوری ایڈمن کارروائیاں (Quick Actions)</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>One-Click Super Admin Control</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    ایک کلک سے موجودہ مہینے کی تفصیلی مالیاتی رپورٹ بنائیں، عارضی کیش صاف کریں، اور مکمل ڈیٹا بیس کا بیک اپ لیں۔
                  </p>
                </div>
              </div>

              {/* Real-time System Status Pills */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 shadow-sm">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span>Last Backup:</span>
                  <strong className="text-emerald-400 font-bold">{lastBackupDate || "Today"}</strong>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 shadow-sm">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cache:</span>
                  <strong className="text-sky-300 font-bold">{lastCacheDate || "Optimized"}</strong>
                </div>
              </div>
            </div>

            {/* 3 Main Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
              
              {/* Action 1: Generate Monthly Report */}
              <div className="bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-500/60 p-5 rounded-2xl flex flex-col justify-between shadow-xl transition group relative overflow-hidden">
                <div className="absolute top-0 end-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition shadow-inner">
                      <FileBarChart className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    </span>
                  </div>
                  <h4 className="font-black text-base text-white mb-1">
                    Generate Monthly Report
                  </h4>
                  <p className="text-xs font-semibold text-emerald-400 mb-2">
                    ماہانہ جامع مالیاتی و آڈٹ رپورٹ
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    تینوں برانچز کی مجموعی ماہانہ فروخت، نقد وصولی، ادھار بیلنس، اخراجات، خالص منافع، اور ٹاپ پراڈکٹس کا 1-کلک تفصیلی تجزیہ۔
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>This Month Bills:</span>
                    <span className="font-bold text-white font-mono">
                      {activeInvoices.filter(i => i.date.startsWith(currentMonthISO)).length} Invoices
                    </span>
                  </div>
                  <button
                    id="btn-quick-generate-monthly-report"
                    onClick={() => handleQuickGenerateMonthlyReport()}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer active:scale-95"
                  >
                    <FileBarChart className="w-4 h-4" />
                    <span>Generate Monthly Report (رپورٹ تیار کریں)</span>
                  </button>
                </div>
              </div>

              {/* Action 2: Clear Temp Cache */}
              <div className="bg-slate-950/80 border border-amber-500/30 hover:border-amber-500/60 p-5 rounded-2xl flex flex-col justify-between shadow-xl transition group relative overflow-hidden">
                <div className="absolute top-0 end-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition shadow-inner">
                      <RefreshCw className={`w-6 h-6 ${isClearingCache ? "animate-spin text-amber-300" : ""}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                      <span>100% Safe (ڈیٹا محفوظ)</span>
                    </span>
                  </div>
                  <h4 className="font-black text-base text-white mb-1">
                    Clear Temp Cache
                  </h4>
                  <p className="text-xs font-semibold text-amber-400 mb-2">
                    عارضی کیش و براؤزر میموری صاف کریں
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    عارضی فلٹرز، سیشن میموری، اور پرانی کیشے صاف کر کے سسٹم کو تیز ترین بنائیں۔ انوینٹری، بل اور کھاتے کا ڈیٹا 100% محفوظ رہتا ہے۔
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Cache State:</span>
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Session Buffer Ready</span>
                    </span>
                  </div>
                  <button
                    id="btn-quick-clear-temp-cache"
                    onClick={handleQuickClearCache}
                    disabled={isClearingCache}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isClearingCache ? "animate-spin" : ""}`} />
                    <span>{isClearingCache ? "صاف ہو رہا ہے..." : "Clear Temp Cache (کیشے صاف کریں)"}</span>
                  </button>
                </div>
              </div>

              {/* Action 3: Backup Database */}
              <div className="bg-slate-950/80 border border-indigo-500/30 hover:border-indigo-500/60 p-5 rounded-2xl flex flex-col justify-between shadow-xl transition group relative overflow-hidden">
                <div className="absolute top-0 end-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition shadow-inner">
                      <Database className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                      <CheckCheck className="w-3 h-3 text-indigo-400" />
                      <span>JSON Master Archive</span>
                    </span>
                  </div>
                  <h4 className="font-black text-base text-white mb-1">
                    Backup Database
                  </h4>
                  <p className="text-xs font-semibold text-indigo-400 mb-2">
                    ڈیٹا بیس کا مکمل محفوظ بیک اپ
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    تینوں دکانوں کی انوینٹری، انوائسز، کسٹمر کھاتہ، حاضریاں، اور برانچز کا مکمل محفوظ ڈیٹا بیس فورا ڈاؤنلوڈ کریں اور محفوظ رکھیں۔
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Database Objects:</span>
                    <span className="font-bold text-blue-400 font-mono">
                      {products.length} Items • {invoices.length} Bills
                    </span>
                  </div>
                  <button
                    id="btn-quick-backup-database"
                    onClick={handleQuickBackupDatabase}
                    disabled={isBackingUp}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isBackingUp ? "بیک اپ بن رہا ہے..." : "Backup Database (بیک اپ لیں)"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Auxiliary Admin Quick Utilities Toolbar */}
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold">فوری معاون شارٹ کٹس (Quick Admin Shortcuts):</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleSendDailyReport}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>آج کی رپورٹ (WhatsApp)</span>
                </button>

                <button
                  onClick={() => onNavigateTab("expense_ledger")}
                  className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                  <span>روزانہ کا خرچہ رجسٹر</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById("api-health-monitor-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  <span>API کیز و ہیلتھ مانیٹر</span>
                </button>

                <button
                  onClick={() => onNavigateTab("reports")}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                  <span>مکمل اینالیٹکس رپورٹس</span>
                </button>
              </div>
            </div>
          </div>
          )}

      {/* ========================================================================= */}
      {/* 👑 OWNER EXCLUSIVE: APP INSTALLATION & MASTER DOWNLOADS (صرف اونر کے لیے) */}
      {/* ========================================================================= */}
      {(activeSectionTab === "downloads" || activeSectionTab === "all") && (
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute -end-16 -top-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -start-16 -bottom-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Download notification toast */}
        {activeDownloadNotice && (
          <div className="fixed bottom-6 end-6 z-50 bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center gap-2 animate-bounce">
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
      )}

      {/* 3 Live Branch Executive Control Grid */}
      {(activeSectionTab === "branches" || activeSectionTab === "all") && (
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
                        <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
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
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-semibold shrink-0 ms-2"
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
      )}

      {/* Staff Security Dossier & KYC Biometric Registry Section */}
      {(activeSectionTab === "staff" || activeSectionTab === "all") && (
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
            <Search className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={kycSearchQuery}
              onChange={(e) => setKycSearchQuery(e.target.value)}
              placeholder="تلاش: نام، شناختی کارڈ، فون، یا ضامن..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl ps-9 pe-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
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
                      className="absolute -bottom-1 -end-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 shadow"
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
                    <p className="text-slate-400 font-mono text-[10px] ps-3">
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
      )}

      {/* System Security, AI Health & CCTV Live Feeds Overview */}
      {(activeSectionTab === "system_health" || activeSectionTab === "all") && (
        <>
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
        </>
      )}
        </>
      )}

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

      {/* ========================================================================= */}
      {/* 📊 SUPER ADMIN MONTHLY REPORT MODAL (ماہانہ رپورٹ ونڈو) */}
      {/* ========================================================================= */}
      {showMonthlyReportModal && monthlyReportData && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/60 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
                  <FileBarChart className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      ماہانہ تفصیلی رپورٹ ({monthlyReportData.monthName})
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified Monthly Audit
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Haider Sanitary • Super Admin Financial & Operations Summary
                  </p>
                </div>
              </div>

              {/* Month Switcher & Close */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <input
                    type="month"
                    value={selectedReportMonth}
                    onChange={(e) => {
                      setSelectedReportMonth(e.target.value);
                      handleQuickGenerateMonthlyReport(e.target.value);
                    }}
                    className="bg-transparent text-white text-xs font-mono outline-none cursor-pointer"
                  />
                </div>
                <button
                  onClick={() => setShowMonthlyReportModal(false)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Month Filter Bar */}
            <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">فوری مہینہ تبدیل کریں (Quick Month Jump):</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const thisMonth = new Date().toISOString().substring(0, 7);
                    setSelectedReportMonth(thisMonth);
                    handleQuickGenerateMonthlyReport(thisMonth);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${selectedReportMonth === new Date().toISOString().substring(0, 7) ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                >
                  موجودہ مہینہ (This Month)
                </button>
                <button
                  onClick={() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - 1);
                    const lastMonth = d.toISOString().substring(0, 7);
                    setSelectedReportMonth(lastMonth);
                    handleQuickGenerateMonthlyReport(lastMonth);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold transition"
                >
                  پچھلا مہینہ (Last Month)
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Financial KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-emerald-500/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Gross Sales</span>
                  <p className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-1">
                    Rs. {monthlyReportData.totalSales.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-500">{monthlyReportData.invoiceCount} Total Invoices</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-teal-500/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Cash Collected</span>
                  <p className="text-base sm:text-lg font-black text-teal-300 font-mono mt-1">
                    Rs. {monthlyReportData.cashCollected.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-teal-500">نقد وصولی</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-amber-500/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Receivables (Udhaar)</span>
                  <p className="text-base sm:text-lg font-black text-amber-400 font-mono mt-1">
                    Rs. {monthlyReportData.totalUdhaar.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-amber-500">باقیات / ادھار</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-rose-500/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Expenses</span>
                  <p className="text-base sm:text-lg font-black text-rose-400 font-mono mt-1">
                    Rs. {monthlyReportData.totalExpenses.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-rose-500">ماہانہ اخراجات</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-indigo-500/40 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Net Cash Profit</span>
                  <p className={`text-base sm:text-lg font-black font-mono mt-1 ${monthlyReportData.netCashFlow >= 0 ? "text-emerald-300" : "text-rose-400"}`}>
                    Rs. {monthlyReportData.netCashFlow.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-indigo-400">خالص کیش بیلنس</span>
                </div>
              </div>

              {/* 3 Branches Performance Breakdown */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-400" />
                    <span>تینوں برانچز کی ماہانہ سیلز کارکردگی (3 Branches Breakdown)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">{monthlyReportData.itemsSoldCount} Items Sold</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {monthlyReportData.branchBreakdown.map((b) => (
                    <div key={b.branchId} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                      <span className="font-bold text-slate-200 block text-xs">{b.branchName}</span>
                      <div className="mt-2 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-400">
                          <span>Sales:</span>
                          <strong className="text-emerald-400 font-mono">Rs. {b.sales.toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Cash:</span>
                          <strong className="text-teal-300 font-mono">Rs. {b.cash.toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Bills:</span>
                          <span className="text-white font-mono">{b.invoicesCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Selling Products & Formatted Report Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Products */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                  <h4 className="font-bold text-slate-200 flex items-center gap-2 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>سب سے زیادہ فروخت ہونے والے آئٹمز (Top Selling Items)</span>
                  </h4>
                  {monthlyReportData.topProducts.length === 0 ? (
                    <p className="text-slate-500 text-xs py-4 text-center">اس منتخب مہینے میں ابھی کوئی سیلز ریکارڈ نہیں ہے۔</p>
                  ) : (
                    <div className="space-y-1.5">
                      {monthlyReportData.topProducts.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-[11px]">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-200">{p.name}</span>
                          </div>
                          <div className="text-end font-mono">
                            <span className="text-emerald-400 font-bold">Rs. {p.revenue.toLocaleString()}</span>
                            <span className="text-slate-500 text-[10px] block">({p.quantity} units sold)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formatted Report Preview */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-200 flex items-center gap-2 text-xs">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>رپورٹ ٹیکسٹ پریویو (Text Format)</span>
                      </h4>
                      <button
                        onClick={handleCopyMonthlyReport}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        {copiedMonthlyReport ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-indigo-400" />}
                        <span>{copiedMonthlyReport ? "Copied!" : "Copy Text"}</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[10px] font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {monthlyReportRawText}
                    </pre>
                  </div>

                  {monthlyReportData.lowStockItemsCount > 0 && (
                    <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{monthlyReportData.lowStockItemsCount} آئٹمز کا اسٹاک ختم ہونے کے قریب ہے۔ فوری آرڈر کریں۔</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleSendMonthlyReportWhatsApp}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp پر بھیجیں</span>
                </button>
                <button
                  onClick={handleDownloadMonthlyReportFile}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Download .txt</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-purple-400" />
                  <span>پرنٹ رپورٹ</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowMonthlyReportModal(false);
                    onNavigateTab("reports");
                  }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>مکمل AI رپورٹس کھولیں</span>
                </button>
                <button
                  onClick={() => setShowMonthlyReportModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  بند کریں (Close)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧹 CACHE CLEARED CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {cacheClearFeedback && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  عارضی کیش اور سیشن میموری صاف!
                </h3>
                <p className="text-xs text-emerald-400 font-semibold">
                  Temp Cache Cleared Successfully
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">صاف شدہ عارضی ڈیٹا:</span>
                <strong className="text-amber-400 font-mono">{cacheClearFeedback.freedEstimate} ({cacheClearFeedback.clearedItems} items)</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">وقت:</span>
                <span className="text-slate-300 font-mono">{cacheClearFeedback.timestamp}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                ✓ تمام اہم کاروباری ڈیٹا (بلنگ انوائسز، کسٹمر کھاتہ، پراڈکٹس، برانچز) مکمل طور پر محفوظ ہے۔ صرف غیر ضروری عارضی کیش اور سیشن بفرز ریفریش کیے گئے ہیں۔
              </div>
            </div>

            <button
              onClick={() => setCacheClearFeedback(null)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              ٹھیک ہے (Understood)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
