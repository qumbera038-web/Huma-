import React, { useState } from "react";
import { UserAccount, StoreSettings, Branch, Product, Invoice, Customer, BusinessExpense } from "../../types";
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Receipt, 
  ShoppingBag, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  MessageSquare, 
  Sparkles, 
  ChevronRight, 
  Send, 
  ShieldCheck,
  Calendar,
  Layers,
  PhoneCall,
  Phone,
  Mail,
  UserCheck,
  CreditCard,
  Fingerprint,
  ScanFace,
  Video,
  Shield,
  Home,
  FileSpreadsheet,
  Share2,
  Smartphone
} from "lucide-react";
import { StaffKycModal } from "./StaffKycModal";
import { DEFAULT_USERS, DEFAULT_BRANCHES } from "../../data/posData";
import { generateDailyReportText, sendToWhatsApp } from "../../utils/reportUtils";

interface BranchOwnerDashboardProps {
  activeUser: UserAccount;
  activeBranch: Branch;
  products: Product[];
  invoices: Invoice[];
  expenses: BusinessExpense[];
  customers: Customer[];
  settings: StoreSettings;
  branches?: Branch[];
  users?: UserAccount[];
  onUpdateUsers?: (updatedUsers: UserAccount[]) => void;
  onNavigateTab: (tab: any) => void;
  onOpenInstallModal?: () => void;
}

export const BranchOwnerDashboard: React.FC<BranchOwnerDashboardProps> = ({
  activeUser,
  activeBranch,
  products,
  invoices,
  expenses,
  customers,
  settings,
  branches = DEFAULT_BRANCHES,
  users = DEFAULT_USERS,
  onUpdateUsers,
  onNavigateTab,
  onOpenInstallModal,
}) => {
  const [stockRefillRequested, setStockRefillRequested] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [editingKycUser, setEditingKycUser] = useState<UserAccount | null>(null);

  const handleSendDailyReport = () => {
    const today = new Date().toISOString().substring(0, 10);
    const reportText = generateDailyReportText(today, invoices, expenses, products, activeBranch.id);
    sendToWhatsApp(activeUser.phone || settings.phone, reportText);
  };

  // Filter invoices strictly for this branch
  const branchInvoices = (invoices || []).filter(
    (i) =>
      i.status !== "cancelled" &&
      (i.branchName === activeBranch.name ||
        i.branchName?.toLowerCase().includes(activeBranch.id === "branch-2" ? "asad" : activeBranch.id === "branch-3" ? "abbas" : "main"))
  );

  const todayBranchRevenue = branchInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const todayBranchCash = branchInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const todayBranchUdhaar = branchInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  // Branch Low Stock items
  const branchLowStockItems = (products || []).filter((p) => {
    const stock = activeBranch.id === "branch-1" ? p.stockBranch1 : activeBranch.id === "branch-2" ? p.stockBranch2 : p.stockBranch3;
    return (stock ?? p.stock) <= (p.minStock || 5);
  });

  // Branch staff members
  const branchStaff = (users || []).filter(
    (u) => u.branchId === activeBranch.id || (!u.branchId && activeBranch.id === "branch-1")
  );

  const handleRequestHQRefill = () => {
    setStockRefillRequested(true);
    setTimeout(() => {
      setStockRefillRequested(false);
    }, 4000);
  };

  const handleSaveStaffKyc = (updatedUser: UserAccount) => {
    if (onUpdateUsers) {
      const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      onUpdateUsers(updated);
    }
    setEditingKycUser(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto space-y-6 text-slate-100 font-sans">
      {/* Branch Head Top Banner with Full KYC & Security Details */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 p-5 rounded-3xl shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 z-10">
          <div className="relative shrink-0">
            <img
              src={
                activeUser.avatarUrl ||
                (activeUser as any).avatar ||
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
              }
              alt={activeUser.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-400 shadow-xl ring-4 ring-blue-500/20"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow" title="Active on Duty" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {activeBranch.name} — Branch Control Dashboard
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>{activeUser.name} ({activeUser.role === "admin" ? "Super Admin" : "Branch Head / Manager"})</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>KYC Verified & Registered</span>
              </span>
            </div>
            
            {/* Staff Full KYC Attributes: CNIC, Phone, 2nd Contact, Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs pt-1">
              <div className="flex items-center gap-1.5 text-emerald-300 font-mono">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bold">CNIC: {activeUser.cnic || "17301-2244668-3"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300 font-mono">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-bold">رابطہ نمبر: {activeUser.phone || activeBranch.mobile || "0321-8899771"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">ضامن / 2nd Contact: <strong>{activeUser.secondContactName || "Saeed Ahmed Ali"}</strong> ({activeUser.secondContactRelation || "Father"}) • {activeUser.secondContactPhone || "0300-8811223"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Home className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{activeUser.address || activeBranch.address}</span>
              </div>
            </div>

            {/* Biometrics and Station */}
            <div className="flex items-center gap-3 pt-1 flex-wrap text-xs">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 text-[11px]">
                <Fingerprint className="w-3 h-3 text-indigo-400" />
                <span>فنگر پرنٹ ID: {activeUser.biometricId || "BIO-MGR-02"}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 text-[11px]">
                <ScanFace className="w-3 h-3 text-blue-400" />
                <span>Face ID: {activeUser.faceConfidence || 99.2}% Match</span>
              </span>
              <span className="text-slate-400 text-[11px]">
                🏢 {activeUser.counterStation || "Counter #1"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 z-10 flex-wrap shrink-0">
          <button
            onClick={() => setEditingKycUser(activeUser)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            title="اپنا سیکیورٹی ڈوزیئر دیکھیں یا تبدیل کریں"
          >
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>میرا ڈوزیئر و بائیو میٹرک</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenInstallModal}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-500/30 border border-emerald-400/30"
              title="موبائل میں ابھی انسٹال کریں"
            >
              <Smartphone className="w-4 h-4" />
              <span>موبائل انسٹال</span>
            </button>
            <button
              onClick={handleSendDailyReport}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              title="واٹس ایپ پر روزانہ کی رپورٹ بھیجیں"
            >
              <Share2 className="w-4 h-4" />
              <span>واٹس ایپ رپورٹ</span>
            </button>
            <button
              onClick={() => onNavigateTab("expense_ledger")}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              title="کاروباری اخراجات کی شیٹ دیکھیں"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>خرچہ شیٹ</span>
            </button>
            <button
              onClick={() => onNavigateTab("billing")}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Open Billing Counter</span>
            </button>
            <button
              onClick={() => onNavigateTab("inventory")}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Package className="w-4 h-4 text-sky-400" />
              <span>Inventory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Branch Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Branch Sales */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Branch Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {settings.currencySymbol} {todayBranchRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">{branchInvoices.length} Total Branch Invoices</span>
        </div>

        {/* Drawer Cash Collected */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Drawer Cash Balance</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-400 font-mono tracking-tight">
            {settings.currencySymbol} {todayBranchCash.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">Available in Branch Drawer</span>
        </div>

        {/* Branch Udhaar / Credit */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Branch Receivables (Udhaar)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono tracking-tight">
            {settings.currencySymbol} {todayBranchUdhaar.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">Pending Local Customer Credit</span>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Items</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono tracking-tight">
            {branchLowStockItems.length} Products
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">Needs Refill from HQ</span>
        </div>
      </div>

      {/* Main Content Grid: Stock Refill Request & Recent Branch Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Branch Stock & HQ Refill Request */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                <span>HQ Stock Refill Desk</span>
              </h3>
              <p className="text-[11px] text-slate-400">Request PPRC/PVC pipe fittings directly from Main HQ</p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">
              Low Stock Items in {activeBranch.name}:
            </span>

            {branchLowStockItems.length === 0 ? (
              <p className="text-xs text-emerald-400 font-semibold py-2">
                ✅ All PPRC/PVC stock levels are healthy in this branch!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {branchLowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="font-medium text-slate-200 truncate max-w-[150px]">{item.name}</span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleRequestHQRefill}
              disabled={stockRefillRequested}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              {stockRefillRequested ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Refill Request Sent to HQ!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Stock Dispatch Request to Main HQ</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Contact HQ */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-slate-200 block">Main HQ Helpline</span>
                <span className="text-[10px] text-slate-400 font-mono">0300-5861463</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab("whatsapp_hub")}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px]"
            >
              WhatsApp HQ
            </button>
          </div>
        </div>

        {/* Right Column: Recent Branch Invoices */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Recent Invoices Issued at {activeBranch.name}</span>
              </h3>
              <p className="text-[11px] text-slate-400">Live sales log generated by cashiers at this branch</p>
            </div>
            <button
              onClick={() => onNavigateTab("reports")}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              <span>View All Reports</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {branchInvoices.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No invoices generated at this branch today yet. Open Billing Counter to issue receipts!
              </p>
            ) : (
              branchInvoices.slice(0, 6).map((inv) => (
                <div
                  key={inv.id}
                  className="bg-slate-950 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between hover:border-slate-700 transition text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                      #
                    </div>
                    <div>
                      <span className="font-bold text-slate-100 block font-mono">{inv.invoiceNumber}</span>
                      <span className="text-[10px] text-slate-400">{inv.customerName} • {new Date(inv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-slate-100 font-mono block">
                      {settings.currencySymbol} {inv.grandTotal.toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-bold ${inv.balanceDue > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                      {inv.balanceDue > 0 ? `Udhaar: ${settings.currencySymbol}${inv.balanceDue}` : "Fully Paid"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Branch Staff On Duty Dossier Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                <span>Branch Staff Security Dossier ({activeBranch.name})</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[9px] font-black">
                  {branchStaff.length} ممبران رجسٹرڈ
                </span>
              </h3>
              <p className="text-xs text-slate-400">تمام حاضر عملے کی تصاویر، شناختی کارڈ، رابطہ نمبر، ضامن اور بائیو میٹرک تصدیق</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branchStaff.map((staff) => {
            const photo = staff.avatarUrl || (staff as any).avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80";
            return (
              <div
                key={staff.id}
                className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={photo}
                      alt={staff.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-indigo-400/40"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border border-slate-950" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-white truncate">{staff.name}</h4>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-black">
                        {staff.role}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-emerald-400 font-semibold mt-0.5">
                      CNIC: {staff.cnic || "17301-XXXXXXX-X"}
                    </p>
                    <p className="text-[11px] font-mono text-amber-300 flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-amber-400" />
                      <span>{staff.phone || "0300-5861463"}</span>
                    </p>
                  </div>
                </div>

                {/* 2nd Contact & Biometrics */}
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
                  <p className="text-slate-300 truncate">
                    ضامن: <strong className="text-slate-100">{staff.secondContactName || "Tariq Ali"}</strong> ({staff.secondContactRelation || "Relative"})
                  </p>
                  <p className="text-slate-400 font-mono text-[10px]">
                    رابطہ: {staff.secondContactPhone || "0301-XXXXXXX"}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                    <span className="text-indigo-400 font-bold flex items-center gap-1">
                      <Fingerprint className="w-3 h-3" />
                      <span>Fingerprint Verified</span>
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-blue-400 font-bold flex items-center gap-1">
                      <ScanFace className="w-3 h-3" />
                      <span>Face ID Active</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    🏢 {staff.counterStation || "Counter #1"}
                  </span>
                  <button
                    onClick={() => setEditingKycUser(staff)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5"
                  >
                    <span>تفصیلات دیکھیں / اپ ڈیٹ</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Branch CCTV Security Feeds */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                <span>Live CCTV Security Surveillance — {activeBranch.name}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[9px] font-black animate-pulse">
                  LIVE 1080P
                </span>
              </h3>
              <p className="text-xs text-slate-400">3 لائیو کیمرے کیش کاؤنٹر، گوڈاؤن اور یارڈ گیٹ کی مسلسل ریکارڈنگ</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("branches")}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
          >
            <span>All Branch CCTVs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(activeBranch.cameras || [
            { id: "cam-1", name: "Billing Counter Cam", status: "active", location: "Cash Counter" },
            { id: "cam-2", name: "Showroom / Godown Cam", status: "active", location: "Main Warehouse" },
            { id: "cam-3", name: "Yard & Delivery Gate Cam", status: "active", location: "Gate Entrance" }
          ]).map((cam, idx) => (
            <div key={cam.id || idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2 relative overflow-hidden">
              <div className="h-32 bg-slate-900 rounded-xl flex flex-col items-center justify-center relative border border-slate-800/80">
                <Video className="w-8 h-8 text-slate-600 mb-1" />
                <span className="text-[11px] font-mono text-slate-400">Camera Feed #{idx + 1}</span>
                <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] text-emerald-400 font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>REC</span>
                </div>
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] text-slate-400 font-mono">
                  1080p • 30fps
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{cam.name}</span>
                <span className="text-[10px] text-emerald-400 font-semibold">{cam.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff KYC Dossier Edit Modal */}
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
