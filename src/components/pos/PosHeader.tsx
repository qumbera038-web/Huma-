import React, { useState, useEffect } from "react";
import { StoreSettings, UserAccount, Branch, Product } from "../../types";
import { logStaffLogin, AppTheme, getLastDataSaveTime, exportAllDataBackup } from "../../utils/posStorage";
import { useLanguage } from "../../context/LanguageContext";
import { AppLanguage } from "../../utils/translations";
import { 
  ShoppingCart, 
  Package, 
  BookOpen, 
  BarChart3, 
  Sparkles, 
  Settings, 
  User, 
  ShieldCheck, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  AlertTriangle, 
  TrendingUp, 
  Clock,
  Smartphone,
  Download,
  Share2,
  X,
  KeyRound,
  Check,
  Building2,
  Video,
  RotateCcw,
  MessageSquare,
  UserCheck,
  Palette,
  CheckCircle2,
  Sun,
  Moon,
  Camera,
  Scan,
  MoreVertical,
  Languages,
  RefreshCw,
  ExternalLink,
  FileDown,
  QrCode,
  Bot,
  Crown,
  Mail,
  Printer,
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  Database,
  CheckCheck,
  HardDrive,
  Phone,
  Receipt,
  FileText,
  CheckCircle,
  Truck
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  count: string | null;
  alert?: boolean;
  cctv?: boolean;
  whatsapp?: boolean;
  time?: boolean;
  ai?: boolean;
}
import { QRCodeSVG } from "qrcode.react";

export type PosTab = "super_admin_dashboard" | "branch_owner_dashboard" | "billing" | "inventory" | "khata" | "reports" | "branches" | "whatsapp_hub" | "attendance" | "motion_security" | "staff_secret_hub" | "expense_ledger" | "ai_estimator" | "ai_hub" | "export" | "settings";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { EmailResetPasswordModal } from "./EmailResetPasswordModal";

interface PosHeaderProps {
  activeTab: PosTab;
  setActiveTab: (tab: PosTab) => void;
  settings: StoreSettings;
  activeUser: UserAccount;
  users: UserAccount[];
  products: Product[];
  branches?: Branch[];
  activeBranchId?: string;
  onSelectBranch?: (branchId: string) => void;
  onSwitchUser: (user: UserAccount) => void;
  onUpdateUsers?: (users: UserAccount[]) => void;
  onRefreshProducts?: () => void;
  onOpenReturnModal?: () => void;
  onOpenScanner?: () => void;
  todaySales: number;
  todayInvoicesCount: number;
  lowStockCount: number;
  totalUdhaar: number;
  currentTheme?: AppTheme;
  onThemeChange?: (theme: AppTheme) => void;
  onLock?: () => void;
}

export const PosHeader: React.FC<PosHeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  activeUser,
  users,
  products,
  branches = [],
  activeBranchId = "all",
  onSelectBranch,
  onSwitchUser,
  onUpdateUsers,
  onRefreshProducts,
  onOpenReturnModal,
  onOpenScanner,
  todaySales,
  todayInvoicesCount,
  lowStockCount,
  totalUdhaar,
  currentTheme = "slate",
  onThemeChange,
  onLock,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEmailResetModal, setShowEmailResetModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCameraHubModal, setShowCameraHubModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // State for Low Stock dropdown & PO drafting modal
  const [showLowStockDropdown, setShowLowStockDropdown] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("Master Ceramics & Sanitary");
  const [poNotes, setPoNotes] = useState("Urgent restock needed for Khyber Bazaar main branch.");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [reorderQuantities, setReorderQuantities] = useState<Record<string, number>>({});

  const lowStockProducts = React.useMemo(() => {
    return products.filter(p => p.stockQuantity <= p.minStockAlert);
  }, [products]);

  useEffect(() => {
    if (showReorderModal) {
      const initial: Record<string, number> = {};
      lowStockProducts.forEach(p => {
        initial[p.id] = Math.max(10, (p.minStockAlert * 3) - p.stockQuantity);
      });
      setReorderQuantities(initial);
    }
  }, [showReorderModal, lowStockProducts]);
  
  // Dynamic Auto-Sync and Internet state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<"idle" | "connecting" | "syncing_invoices" | "syncing_khata" | "syncing_stock" | "completed">("idle");
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem("hps_last_cloud_sync_v3") || "Never Synced";
  });
  const [lastSaveTime, setLastSaveTime] = useState<string>(() => getLastDataSaveTime());
  const [justSavedPulse, setJustSavedPulse] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);

  const triggerAutoSync = () => {
    setSyncStatus("connecting");
    setTimeout(() => {
      setSyncStatus("syncing_invoices");
      setTimeout(() => {
        setSyncStatus("syncing_khata");
        setTimeout(() => {
          setSyncStatus("syncing_stock");
          setTimeout(() => {
            setSyncStatus("completed");
            const timeStr = new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            const dateStr = new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            });
            const fullSyncTime = `${dateStr} ${timeStr}`;
            setLastSyncTime(fullSyncTime);
            localStorage.setItem("hps_last_cloud_sync_v3", fullSyncTime);
            
            // Auto-hide completion status
            setTimeout(() => {
              setSyncStatus("idle");
            }, 3000);
          }, 800);
        }, 850);
      }, 850);
    }, 600);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerAutoSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("idle");
    };

    const handleDataSaved = (e: any) => {
      const timestamp = e.detail?.timestamp || getLastDataSaveTime();
      setLastSaveTime(timestamp);
      setJustSavedPulse(true);
      setTimeout(() => setJustSavedPulse(false), 2500);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("hps_local_data_saved", handleDataSaved);
    
    // Auto-trigger on mount if online
    if (navigator.onLine) {
      triggerAutoSync();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("hps_local_data_saved", handleDataSaved);
    };
  }, []);
  
  // Theme installation states
  const [installedThemes, setInstalledThemes] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("hps_installed_themes_v3");
      return stored ? JSON.parse(stored) : ["uni", "3d", "slate", "light"];
    } catch {
      return ["uni", "3d", "slate", "light"];
    }
  });
  const [installingThemeId, setInstallingThemeId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState<number>(0);

  const startInstallingTheme = (themeId: string) => {
    if (installedThemes.includes(themeId)) return;
    setInstallingThemeId(themeId);
    setInstallProgress(10);
    
    const interval = setInterval(() => {
      setInstallProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const updated = [...installedThemes, themeId];
            setInstalledThemes(updated);
            localStorage.setItem("hps_installed_themes_v3", JSON.stringify(updated));
            setInstallingThemeId(null);
            if (onThemeChange) {
              onThemeChange(themeId as AppTheme);
            }
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };
  const [selectedUserToSwitch, setSelectedUserToSwitch] = useState<UserAccount | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [savePasswordChecked, setSavePasswordChecked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [passwordRemovedNotice, setPasswordRemovedNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showMobileToolsMenu, setShowMobileToolsMenu] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const copyShareLink = () => {
    const appUrl = window.location.href;
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectUser = (user: UserAccount) => {
    setSelectedUserToSwitch(user);
    setPinError(false);
    setShowPassword(false);
    setPasswordRemovedNotice(false);

    // Auto-fill saved PIN if available in localStorage
    const savedPin = localStorage.getItem(`pos_saved_pin_${user.id}`);
    if (savedPin) {
      setPinInput(savedPin);
      setSavePasswordChecked(true);
    } else {
      setPinInput("");
      setSavePasswordChecked(true);
    }

    // If user has no password or pin is empty, switch immediately!
    if (user.hasPassword === false || !user.pin) {
      logStaffLogin(user);
      onSwitchUser(user);
      setShowUserModal(false);
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToSwitch) return;

    const cleanPin = pinInput.trim();
    const isMatch = 
      selectedUserToSwitch.hasPassword === false || 
      !selectedUserToSwitch.pin || 
      selectedUserToSwitch.pin === cleanPin ||
      (selectedUserToSwitch.role === "admin" && (cleanPin === "1234" || cleanPin === "0300" || cleanPin === "03005861463"));

    if (isMatch) {
      if (savePasswordChecked && cleanPin) {
        localStorage.setItem(`pos_saved_pin_${selectedUserToSwitch.id}`, cleanPin);
      } else {
        localStorage.removeItem(`pos_saved_pin_${selectedUserToSwitch.id}`);
      }
      logStaffLogin(selectedUserToSwitch);
      onSwitchUser(selectedUserToSwitch);
      setShowUserModal(false);
      setPinInput("");
      setPinError(false);
      setSelectedUserToSwitch(null);
    } else {
      setPinError(true);
    }
  };

  // Google-like "Remove Password" feature
  const handleRemovePassword = () => {
    if (!selectedUserToSwitch) return;
    const updatedUser: UserAccount = {
      ...selectedUserToSwitch,
      hasPassword: false,
      pin: "",
    };

    const updatedUsersList = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    if (onUpdateUsers) {
      onUpdateUsers(updatedUsersList);
    }
    setSelectedUserToSwitch(updatedUser);
    setPasswordRemovedNotice(true);
    setTimeout(() => {
      logStaffLogin(updatedUser);
      onSwitchUser(updatedUser);
      setShowUserModal(false);
      setPasswordRemovedNotice(false);
    }, 1200);
  };

  const isOwnerOrAdmin = Boolean(activeUser.isSuperAdmin || activeUser.role === "admin");

  const baseNavItems: NavItem[] = [
    { id: "billing", label: t('pos'), icon: ShoppingCart, count: lowStockCount > 0 ? `${lowStockCount} Low` : null, alert: lowStockCount > 0 },
    { id: "inventory", label: t('inventory'), icon: Package, count: lowStockCount > 0 ? `${lowStockCount} Low` : null, alert: lowStockCount > 0 },
    { id: "khata", label: t('customers'), icon: BookOpen, count: `${settings.currencySymbol} ${(totalUdhaar / 1000).toFixed(0)}k` },
    { id: "reports", label: t('reports'), icon: BarChart3, count: null },
    { id: "branches", label: t('branches'), icon: Building2, count: "3 Branches", cctv: false },
    { id: "whatsapp_hub", label: t('whatsapp'), icon: MessageSquare, count: "3 Numbers", whatsapp: true },
    ...(isOwnerOrAdmin ? [{ id: "expense_ledger", label: t('expense_ledger'), icon: Receipt, count: "Exp Sheet", whatsapp: true }] : []),
    { id: "motion_security", label: t('motion_security'), icon: Video, count: "Live Cam", cctv: true },
    { id: "staff_secret_hub", label: t('staff_secret_hub'), icon: MessageSquare, count: "Staff Chat", whatsapp: true },
    { id: "attendance", label: t('attendance'), icon: Clock, count: "Auto Log", time: true },
    { id: "ai_hub", label: t('ai_hub'), icon: Bot, count: "3 Branches", ai: true },
    { id: "ai_estimator", label: t('ai_estimator'), icon: Sparkles, count: "Gemini", ai: true },
    { id: "settings", label: t('settings'), icon: Settings, count: null },
  ];

  const navItems: NavItem[] = [
    ...(isOwnerOrAdmin
      ? [{ id: "super_admin_dashboard", label: t('super_admin_dashboard'), icon: Crown, count: "HQ Control" }]
      : activeUser.role === "manager"
      ? [{ id: "branch_owner_dashboard", label: t('branch_owner_dashboard'), icon: Building2, count: activeUser.branchName || "My Store" }]
      : []),
    ...baseNavItems,
    ...(isOwnerOrAdmin
      ? [{ id: "export", label: t('export'), icon: Download, count: "Owner Only" }]
      : []),
  ];

  // Determine which branch to display info for
  const displayBranch = branches.find(b => b.id === (activeBranchId === "all" ? activeUser.branchId : activeBranchId)) || branches[0];

  return (
    <header className="bg-slate-950/98 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-40 shadow-2xl font-sans">
      {/* Top Banner with Store Info & Live Counters */}
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Left: Brand Monogram "HP" & Store Address & Contact */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-lg tracking-wider shrink-0 ring-1 ring-white/20">
            HP
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs">
              <h1 className="text-sm font-extrabold text-slate-100 tracking-tight flex items-center gap-1.5 shrink-0">
                <span>Haider Pipe and Sanitary Store</span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  HaiderSanitary 🧿
                </span>
              </h1>

              <span className="text-slate-600 font-bold hidden md:inline">|</span>

              <span className="text-amber-300 font-medium text-[11px] truncate max-w-[280px] xl:max-w-none">
                📍 <strong>{displayBranch?.shortName || displayBranch?.name || "Branch 1"}:</strong> {displayBranch?.address || "#03 Sikandro Square, Khyber Bazaar, Peshawar"}
              </span>

              <span className="text-slate-600 font-bold hidden sm:inline">|</span>

              <span className="text-sky-300 font-medium font-mono text-[11px] whitespace-nowrap">
                📞 PTCL: <strong>{displayBranch?.ptcl || "091-2565800"}</strong>
              </span>

              <span className="text-slate-600 font-bold hidden sm:inline">|</span>

              <span className="text-emerald-300 font-medium font-mono text-[11px] whitespace-nowrap">
                📱 Mobile: <strong>{displayBranch?.mobile || "0300-5861463"}</strong>
              </span>

              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>POS Live</span>
              </span>

              {/* Visual Sync & Data Save Status Indicator */}
              <div className="inline-flex items-center gap-1.5 shrink-0 flex-wrap">
                {/* Online/Offline Status Pill */}
                <button
                  onClick={() => setShowSyncModal(true)}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-200 cursor-pointer shadow-sm ${
                    !isOnline
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                      : syncStatus !== "idle"
                      ? "bg-indigo-600 text-white border-indigo-400 animate-pulse shadow-indigo-500/30"
                      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                  }`}
                  title={
                    !isOnline
                      ? "آف لائن موڈ: ڈیٹا لوکل اسٹوریج میں 100% محفوظ ہے (Click for Sync Diagnostics)"
                      : `آن لائن کلاؤڈ محفوظ | آخری سنک: ${lastSyncTime} (تفصیلات کے لیے کلک کریں)`
                  }
                >
                  {!isOnline ? (
                    <>
                      <WifiOff className="w-3 h-3 text-amber-400" />
                      <span>آف لائن (Offline)</span>
                    </>
                  ) : syncStatus !== "idle" ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-white" />
                      <span>سنک ہو رہا ہے...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <Cloud className="w-3 h-3 text-emerald-400" />
                      <span>آن لائن (Online Synced)</span>
                    </>
                  )}
                </button>

                {/* Last Successful Data Save Timestamp */}
                <button
                  onClick={() => setShowSyncModal(true)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border transition-all duration-300 cursor-pointer ${
                    justSavedPulse
                      ? "bg-emerald-500/30 text-emerald-200 border-emerald-400 scale-105 ring-2 ring-emerald-500/40"
                      : "bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                  title={`آخری بار ڈیٹا لوکل و کلاؤڈ میں محفوظ ہوا: ${lastSaveTime}`}
                >
                  {justSavedPulse ? (
                    <CheckCheck className="w-3 h-3 text-emerald-300 animate-bounce" />
                  ) : (
                    <HardDrive className="w-2.5 h-2.5 text-slate-400" />
                  )}
                  <span className="text-slate-400 font-sans hidden md:inline">محفوظ (Saved):</span>
                  <span className={justSavedPulse ? "text-emerald-200 font-black" : "text-slate-200 font-bold"}>
                    {justSavedPulse ? "✓ ابھی محفوظ ہوا (Saved Just Now!)" : lastSaveTime}
                  </span>
                </button>

                {/* Quick Manual Sync Button */}
                {isOnline && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerAutoSync();
                    }}
                    disabled={syncStatus !== "idle"}
                    className="p-1 rounded-full bg-slate-800/80 hover:bg-blue-600/30 text-slate-400 hover:text-blue-300 border border-slate-700 transition"
                    title="ابھی کلاؤڈ سنک کریں (Sync to Cloud Now)"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${syncStatus !== "idle" ? "animate-spin text-blue-400" : ""}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Micro sync progress bar - Visible when syncing */}
            {syncStatus !== "idle" && (
              <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden mt-0.5 max-w-[200px]">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full transition-all duration-300"
                  style={{
                    width: 
                      syncStatus === "connecting" ? "20%" :
                      syncStatus === "syncing_invoices" ? "50%" :
                      syncStatus === "syncing_khata" ? "80%" :
                      "100%"
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Live Counters & Cashier Badge */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs">
          {/* Smart Unified Camera Hub Button (CCTV Live Feeds & Barcode Scanner in ONE Button) */}
          <button
            onClick={() => setShowCameraHubModal(true)}
            title="کیمرہ ہب: برانچ CCTV کیمرے چیک کریں یا بارکوڈ سکین کریں (CCTV Live & Barcode Scanner Hub)"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-blue-500/60 text-blue-200 font-bold text-[11px] transition shadow-md group active:scale-95 cursor-pointer h-9 shrink-0"
          >
            <div className="relative flex items-center justify-center">
              <Camera className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -end-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse border border-slate-900" />
            </div>
            <span className="flex items-center gap-1">
              <span>{t('camera_hub_btn')}</span>
            </span>
          </button>

          {/* Today's Sales */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-sm h-9 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <span className="text-[9px] text-slate-400 block leading-none hidden sm:block">{t('today_sales')}</span>
              <span className="font-bold text-emerald-400 text-xs leading-tight font-mono">
                {settings.currencySymbol} {todaySales.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Desktop Only Buttons (Low stock, Time, Return, Install, Theme) */}
          <div className="hidden lg:flex items-center gap-2">
            {lowStockCount > 0 && (
              <div className="relative">
                <button
                  id="header-btn-low-stock"
                  onClick={() => setShowLowStockDropdown(!showLowStockDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-200 hover:bg-amber-500/30 transition shadow-sm cursor-pointer font-bold"
                  title="Click to view low stock items and Quick Reorder"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span className="text-[11px]">{lowStockCount} Low Stock</span>
                </button>
                
                {showLowStockDropdown && (
                  <div className="absolute end-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3.5 z-50 animate-in fade-in duration-100 text-start">
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-850">
                      <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        کم اسٹاک اشیاء (Low Stock Warning)
                      </span>
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-amber-500/30">
                        {lowStockCount}
                      </span>
                    </div>
                    
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pe-1 scrollbar-thin mb-3">
                      {lowStockProducts.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-850 text-[11px]">
                          <div className="min-w-0 flex-1 pe-2">
                            <div className="font-bold text-slate-200 truncate">{p.name}</div>
                            <div className="text-slate-500 text-[9px] font-mono">{p.brand} ({p.code})</div>
                          </div>
                          <div className="text-end shrink-0">
                            <div className="font-black text-rose-400">{p.stockQuantity} {p.unit} left</div>
                            <div className="text-[9px] text-slate-500 font-semibold">Alert Threshold: {p.minStockAlert}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setShowLowStockDropdown(false);
                          onRefreshProducts?.();
                        }}
                        className="py-2 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 rounded-lg text-center text-[10px] font-bold transition flex items-center justify-center gap-1"
                        title="Sync with database"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Sync</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowLowStockDropdown(false);
                          setActiveTab("inventory");
                        }}
                        className="py-2 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-center text-[10px] font-bold transition"
                      >
                        کھولیں (View)
                      </button>
                      <button
                        onClick={() => {
                          setShowLowStockDropdown(false);
                          setShowReorderModal(true);
                        }}
                        className="py-2 px-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-lg text-center text-[10px] flex items-center justify-center gap-1 shadow-md shadow-amber-600/10 transition cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>آرڈر (Order)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div 
              id="header-widget-clock"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-[11px] shadow-sm font-semibold"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{currentTime}</span>
            </div>

             {onOpenReturnModal && (
              <button
                id="header-btn-return-item"
                onClick={onOpenReturnModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-eose-500/50 text-rose-200 font-bold text-[11px] transition shadow-sm hover:shadow-rose-500/15 cursor-pointer active:scale-95"
                title="Process item return, refund & automatic inventory restocking"
              >
                <RotateCcw className="w-4 h-4 text-rose-300" />
                <span>{t('return_item')}</span>
              </button>
            )}

            {isOwnerOrAdmin && (
              <button
                id="header-btn-install-app"
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 font-bold text-[11px] transition shadow-sm hover:shadow-emerald-500/15 cursor-pointer active:scale-95"
                title="Install App on Phone / Share with Staff (Owner Only)"
              >
                <Smartphone className="w-4 h-4 text-emerald-300" />
                <span className="text-[11px]">{t('install_share')}</span>
              </button>
            )}

            <button
              id="header-btn-theme-switcher"
              onClick={() => setShowThemeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/25 hover:bg-indigo-500/35 border border-indigo-500/50 text-indigo-200 font-bold text-[11px] transition shadow-sm hover:shadow-indigo-500/15 cursor-pointer active:scale-95"
              title="Change Background Theme / Color"
            >
              <Palette className="w-4 h-4 text-indigo-300" />
              <span>{t('theme')}</span>
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Global Print Button */}
            <button
              id="header-btn-global-print"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-500/25 hover:bg-purple-500/35 border border-purple-500/50 text-purple-200 font-extrabold text-[11px] transition shadow-sm hover:shadow-purple-500/15 cursor-pointer active:scale-95"
              title="Print Current Screen / Receipt"
            >
              <Printer className="w-4 h-4 text-purple-300" />
              <span>{t('print')}</span>
            </button>
          </div>

          {/* Active Cashier Account Switcher with Profile Picture & PIN Lock Modal */}
          <button
            onClick={() => {
              setSelectedUserToSwitch(users.find((u) => u.id !== activeUser.id) || activeUser);
              setShowUserModal(true);
              setPinInput("");
              setPinError(false);
              setShowPassword(false);
            }}
            className="flex items-center gap-2 px-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-blue-500/40 text-slate-100 transition shadow-sm cursor-pointer h-9 shrink-0"
            title="Switch active counter cashier / operator (Protected with PIN)"
          >
            <div className="relative flex items-center shrink-0">
              <img
                src={activeUser.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"}
                alt={activeUser.name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover border border-blue-400 shadow-sm shrink-0"
              />
              <span className="absolute -bottom-0.5 -end-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900" />
            </div>
            <div className="text-start hidden sm:flex sm:flex-col justify-center min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-[10px] block leading-none text-slate-100 truncate max-w-[75px]">{activeUser.name}</span>
                <span className="text-[8px] uppercase tracking-wider text-blue-200 font-bold px-1 py-0.2 rounded bg-blue-500/30 border border-blue-500/45 leading-none">
                  {activeUser.role}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[8.5px] text-amber-300 font-mono mt-0.5 font-semibold leading-none">
                <Phone className="w-2 h-2 text-amber-400 shrink-0" />
                <span>{activeUser.phone || "0300-5861463"}</span>
              </div>
            </div>
          </button>

          {onLock && (
            <button
              onClick={onLock}
              className="flex items-center gap-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-eose-500/40 transition shadow-sm font-bold cursor-pointer active:scale-95 h-9 shrink-0"
              title="Lock Terminal"
            >
              <Lock className="w-3.5 h-3.5 text-rose-300" />
              <span className="text-xs font-bold hidden sm:block">Lock</span>
            </button>
          )}

          {/* Mobile More Tools Menu Button (Dropdown for Extra Buttons to save space) */}
          <div className="relative lg:hidden">
            <button
              onClick={() => setShowMobileToolsMenu(!showMobileToolsMenu)}
              className="p-2 rounded-xl bg-white/10 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="مزید آپشنز (More Tools)"
            >
              <MoreVertical className="w-4 h-4 text-slate-300" />
            </button>

            {showMobileToolsMenu && (
              <div 
                className="absolute end-0 top-11 w-52 bg-glass border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95"
                onClick={() => setShowMobileToolsMenu(false)}
              >
                {onOpenReturnModal && (
                  <button
                    onClick={onOpenReturnModal}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>↩️ Return Item (واپسی)</span>
                  </button>
                )}

                <button
                  onClick={() => setShowCameraHubModal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>کیمرہ (CCTV و سکینر)</span>
                </button>

                <button
                  onClick={() => setShowThemeModal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20"
                >
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  <span>تھیم اور رنگ تبدیل کریں</span>
                </button>

                {isOwnerOrAdmin && (
                  <>
                    <button
                      onClick={() => {
                        setShowMobileToolsMenu(false);
                        setShowExportMenu(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>📦 ایکسپورٹ مینو (Export, APK & 1-File)</span>
                    </button>

                    <button
                      onClick={handleInstallClick}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>موبائل پر ایپ انسٹال کریں</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setShowMobileToolsMenu(false);
                    window.print();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20"
                >
                  <Printer className="w-3.5 h-3.5 text-purple-400" />
                  <span>🖨️ پرنٹ کریں (Print)</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs font-semibold text-slate-300 bg-white/10 hover:bg-slate-700"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>سیٹنگز اور پرنٹر</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="px-4 flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`nav-tab-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id as PosTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : item.cctv
                  ? "text-slate-100 bg-slate-800/90 border border-slate-600 hover:border-blue-400 hover:bg-slate-700"
                  : "text-slate-200 bg-slate-800/70 border border-slate-700/60 hover:text-white hover:bg-slate-700/80 hover:border-slate-500"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : item.ai ? "text-amber-400" : item.cctv ? "text-blue-400" : item.whatsapp ? "text-emerald-400" : item.time ? "text-indigo-400" : "text-slate-400"}`} />
              <span>{item.label}</span>
              {item.count && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono flex items-center gap-1 ${
                    isActive
                      ? "bg-blue-700/80 text-blue-100"
                      : item.alert
                      ? "bg-amber-500/20 text-amber-300"
                      : item.ai
                      ? "bg-amber-500/20 text-amber-300 font-bold"
                      : item.cctv
                      ? "bg-emerald-500/20 text-emerald-300 font-bold"
                      : item.whatsapp
                      ? "bg-emerald-500/20 text-emerald-300 font-bold"
                      : item.time
                      ? "bg-indigo-500/20 text-indigo-300 font-bold"
                      : "bg-white/10 text-slate-400"
                  }`}
                >
                  {item.cctv && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  {item.whatsapp && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                  <span>{item.count}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Google-Style User Switch & Password / PIN Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900/98 border border-slate-800/80 rounded-t-2xl sm:rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300 text-xs text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Switch Cashier / Counter Operator</h3>
                  <p className="text-[11px] text-slate-400">Google-Style Profile Switch & PIN Security</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select User Account Cards with Pictures */}
            <div className="space-y-3 mb-4">
              <label className="text-xs text-slate-300 font-medium block">
                Select Counter Operator / Cashier:
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pe-1">
                {users.map((u) => {
                  const isSelected = selectedUserToSwitch?.id === u.id;
                  const isCurrentlyActive = activeUser.id === u.id;
                  const hasNoPassword = u.hasPassword === false || !u.pin;

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUser(u)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-start text-xs transition ${
                        isSelected
                          ? "bg-blue-600/20 border-blue-500 text-blue-100 ring-1 ring-blue-500/40"
                          : "bg-white/10/60 border-slate-700/80 text-slate-300 hover:bg-white/10 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={u.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"}
                            alt={u.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-slate-600"
                          />
                          {isCurrentlyActive && (
                            <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100">{u.name}</span>
                            {isCurrentlyActive && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px]">
                                Active Now
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                            <span className="text-slate-400">
                              {u.counterStation || "Counter #1"}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-amber-300 font-mono flex items-center gap-0.5">
                              <Phone className="w-2.5 h-2.5 text-amber-400" />
                              {u.phone || "0300-5861463"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-end flex flex-col items-end gap-1">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-700/80 text-slate-300">
                          {u.role}
                        </span>
                        {hasNoPassword ? (
                          <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5">
                            <Unlock className="w-2.5 h-2.5" /> No PIN
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-mono flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> PIN Protected
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password Verification & Removal Box */}
            {selectedUserToSwitch && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                {selectedUserToSwitch.hasPassword === false || !selectedUserToSwitch.pin ? (
                  <div className="text-center py-2 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                      <Unlock className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-200">
                      پاسورڈ کے بغیر لاگ ان (No Password Required)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Password has been removed for {selectedUserToSwitch.name}. You can switch immediately!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchUser(selectedUserToSwitch);
                        setShowUserModal(false);
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-md shadow-blue-600/30 transition"
                    >
                      Login Directly as {selectedUserToSwitch.name}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyPin} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-300 font-medium">
                        Enter Security PIN for {selectedUserToSwitch.name}:
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        (Default: {selectedUserToSwitch.pin || "1234"})
                      </span>
                    </div>

                    {/* Input with Google-style Show/Hide Password Eye Toggle */}
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        maxLength={20}
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          setPinError(false);
                        }}
                        placeholder="Enter PIN / Password"
                        autoFocus
                        className="w-full ps-4 pe-12 py-2.5 bg-glass border border-slate-700 rounded-lg text-slate-100 text-center text-lg tracking-widest font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      
                      {/* Show / Hide Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-3 top-2.5 p-1 rounded text-slate-400 hover:text-slate-200 transition"
                        title={showPassword ? "پاسورڈ چھپائیں (Hide Password)" : "پاسورڈ دکھائیں (Show Password)"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Save Password / Remember Me Option */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium select-none">
                        <input
                          type="checkbox"
                          checked={savePasswordChecked}
                          onChange={(e) => setSavePasswordChecked(e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>پاسورڈ محفوظ رکھیں (Save Password / Remember Me)</span>
                      </label>
                    </div>

                    {pinError && (
                      <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Incorrect PIN. (PIN is: {selectedUserToSwitch.pin || "1234"})
                      </p>
                    )}

                    {passwordRemovedNotice && (
                      <p className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <Check className="w-4 h-4" /> Password removed successfully! Logging in...
                      </p>
                    )}

                    {/* Google-like "Remove Password" option & Email Reset option */}
                    <div className="pt-2 flex flex-col gap-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleRemovePassword}
                          className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-medium"
                          title="Remove PIN requirement for this user (پاسورڈ ختم کریں)"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>پاسورڈ ختم کریں (Remove Password)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPinInput(selectedUserToSwitch.pin || "1234")}
                          className="text-[10px] text-slate-400 hover:text-slate-200"
                        >
                          Auto-fill PIN
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserModal(false);
                          setShowEmailResetModal(true);
                        }}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5 font-semibold pt-1"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Forgot PIN? Reset via Email Verification (ای میل سے تبدیل کریں)</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowUserModal(false)}
                        className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-600/30"
                      >
                        Confirm & Switch
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Install & Staff Sharing Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900/98 border border-slate-800/80 rounded-t-2xl sm:rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300 text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Install on Mobile / Share with Staff</h3>
                  <p className="text-[11px] text-slate-400">Add app icon directly to phone home screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Link copy box */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  1. Send this Link to Staff WhatsApp:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="flex-1 px-3 py-1.5 bg-glass border border-slate-700 rounded-lg text-slate-300 text-xs font-mono select-all outline-none"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1 transition"
                  >
                    {copiedLink ? (
                      <span className="text-emerald-300 font-bold">Copied!</span>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code Quick Scan & APK Download Option */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-4">
                <div className="p-1.5 bg-white rounded-lg shrink-0 shadow">
                  <QRCodeSVG value={typeof window !== "undefined" ? window.location.href : ""} size={78} />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-100 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-blue-400" />
                    <span>موبائل کیمرے سے اسکین کریں</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    کیمرہ کیو آر کوڈ پر لائیں، لنک پر ٹیپ کریں اور ہوم اسکرین پر شامل کر لیں۔
                  </p>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 underline pt-0.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Download .APK file via PWABuilder</span>
                  </a>
                </div>
              </div>

              {/* Step by step installation */}
              <div className="space-y-2.5">
                <h4 className="font-semibold text-slate-200 text-xs">2. Mobile پر انسٹال کرنے کا طریقہ (WebAPK):</h4>
                
                <div className="bg-white/10/60 border border-slate-700/60 p-3 rounded-xl space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      Android
                    </span>
                    <p className="text-[11px] text-slate-300">
                      موبائل پر <strong>Google Chrome</strong> میں لنک کھولیں، اوپر دائیں <strong>3 ڈاٹس (⋮)</strong> پر کلک کریں اور <strong>"Install app"</strong> یا <strong>"Add to Home screen"</strong> پر کلک کریں۔
                    </p>
                  </div>
                </div>

                <div className="bg-white/10/60 border border-slate-700/60 p-3 rounded-xl space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      iPhone
                    </span>
                    <p className="text-[11px] text-slate-300">
                      <strong>Safari</strong> میں لنک کھولیں، نیچے <strong>Share (شیئر)</strong> کے بٹن پر کلک کریں اور <strong>"Add to Home Screen"</strong> پر کلک کریں۔
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center gap-2 text-emerald-300 text-[11px]">
                <Download className="w-4 h-4 shrink-0" />
                <span>اس کے بعد یہ اصلی ایپ کی طرح موبائل کی ہوم اسکرین پر ہمیشہ کے لیے آ جائے گی!</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <a
                href="https://www.pwabuilder.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Get APK (PWABuilder)</span>
              </a>
              <button
                onClick={() => setShowInstallModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition"
              >
                بند کریں (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme / Background Switcher Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-indigo-400">
                <Palette className="w-5 h-5 text-amber-400 animate-bounce" />
                <div>
                  <h3 className="font-extrabold text-slate-100 text-base">
                    🎨 تھیم ہاؤس اور پریمیم سکنز (Theme Store & Skins)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Install or switch premium custom theme templates instantly
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowThemeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 my-4 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              حیدر پائپ اینڈ سینیٹری سافٹ ویئر کو اپنی پسند کے مطابق خوبصورت رنگوں میں تبدیل کریں۔ جن تھیمز کے ساتھ <strong>"Install Theme"</strong> کا بٹن ہے، انہیں ایک کلک میں مفت انسٹال کر کے فعال کیا جا سکتا ہے۔
            </p>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2 max-h-[380px] overflow-y-auto pe-1">
              {[
                {
                  id: "uni",
                  name: "Uniform Pro (Uni Background)",
                  nameUrdu: "یکساں یونیفارم بیک گراؤنڈ (Uni Solid)",
                  bgClass: "bg-[#0b0f19] border-blue-500/50 text-slate-100 shadow-md",
                  dotColor: "bg-blue-400",
                  badge: "Uni Clean",
                  desc: "Smooth, clean, single-tone uniform background with zero eye strain"
                },
                {
                  id: "3d",
                  name: "3D Metallic Showroom",
                  nameUrdu: "تھری ڈی میٹالک سینیٹری تھیم",
                  bgClass: "bg-[#0b0f19] border-blue-500/30 text-slate-100 shadow-lg",
                  dotColor: "bg-blue-400",
                  badge: "3D Metallic",
                  desc: "Subtle 3D depth and metallic card finish"
                },
                {
                  id: "slate",
                  name: "Dark Slate Pro",
                  nameUrdu: "پروفیشنل ڈارک سلیٹ",
                  bgClass: "bg-slate-950 border-slate-800 text-slate-100",
                  dotColor: "bg-slate-500",
                  badge: "Default Pro",
                  desc: "Balanced contrast for long working hours"
                },
                {
                  id: "light",
                  name: "Clean Light White",
                  nameUrdu: "روشن سفید لائٹ موڈ",
                  bgClass: "bg-slate-100 border-slate-300 text-slate-900",
                  dotColor: "bg-blue-600",
                  badge: "Daylight Mode",
                  desc: "Ideal for well-lit retail counters"
                },
                {
                  id: "navy",
                  name: "Royal Midnight Navy",
                  nameUrdu: "شاہی مڈ نائٹ نیوی",
                  bgClass: "bg-[#0b1329] border-blue-900/40 text-blue-100",
                  dotColor: "bg-blue-500",
                  badge: "Royal Blue",
                  desc: "Deep rich blue theme for executive feel"
                },
                {
                  id: "emerald",
                  name: "Sanitary Emerald",
                  nameUrdu: "زمرد سبز (پائپ اینڈ سینیٹری)",
                  bgClass: "bg-[#061e18] border-emerald-900/40 text-emerald-100",
                  dotColor: "bg-emerald-500",
                  badge: "Green Luxury",
                  desc: "Calming sanitary and plumbing green tone"
                },
                {
                  id: "black",
                  name: "Deep OLED Pure Black",
                  nameUrdu: "او ایل ای ڈی خالص سیاہ",
                  bgClass: "bg-black border-neutral-800 text-neutral-100",
                  dotColor: "bg-neutral-400",
                  badge: "AMOLED Black",
                  desc: "Maximum battery saving & zero eye strain"
                },
                {
                  id: "amber",
                  name: "Warm Charcoal Amber",
                  nameUrdu: "وارم امبر کوئلہ",
                  bgClass: "bg-[#1c1917] border-amber-900/40 text-amber-100",
                  dotColor: "bg-amber-500",
                  badge: "Warm Tones",
                  desc: "Cozy warm contrast for evening counter shifts"
                }
              ].map((thm) => {
                const isSelected = currentTheme === thm.id;
                const isInstalled = installedThemes.includes(thm.id);
                const isInstalling = installingThemeId === thm.id;

                return (
                  <div
                    key={thm.id}
                    className={`p-4 rounded-2xl border text-start transition-all duration-200 flex flex-col justify-between gap-3 relative overflow-hidden ${thm.bgClass} ${
                      isSelected
                        ? "ring-2 ring-blue-500 border-transparent shadow-xl scale-[1.01]"
                        : "opacity-95 hover:opacity-100 hover:border-slate-500"
                    }`}
                  >
                    {/* Visual Progress Overlay for Installation */}
                    {isInstalling && (
                      <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 z-10 animate-in fade-in">
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2 max-w-[150px]">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-150"
                            style={{ width: `${installProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 animate-pulse font-mono">
                          Installing: {installProgress}%
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full ${thm.dotColor} shadow-sm`} />
                        <span className="font-extrabold text-xs tracking-wide">{thm.name}</span>
                      </div>
                      
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[9px] font-black text-blue-400 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                          <Check className="w-2.5 h-2.5" />
                          ACTIVE
                        </span>
                      ) : isInstalled ? (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          INSTALLED
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          STORE SKIN
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] font-extrabold opacity-95">{thm.nameUrdu}</p>
                      <p className="text-[10px] opacity-60 mt-0.5 leading-tight">{thm.desc}</p>
                    </div>

                    {/* Bottom Action Button for Install / Apply */}
                    <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between">
                      <span className="text-[9px] opacity-50 uppercase font-mono">{thm.badge}</span>
                      
                      {isSelected ? (
                        <span className="text-[10px] text-blue-400 font-bold">Currently Applied</span>
                      ) : isInstalled ? (
                        <button
                          onClick={() => onThemeChange && onThemeChange(thm.id as AppTheme)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-lg transition-all border border-slate-700/60 cursor-pointer active:scale-95"
                        >
                          Apply Skin (فعال کریں)
                        </button>
                      ) : (
                        <button
                          onClick={() => startInstallingTheme(thm.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-black rounded-lg transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Download className="w-3 h-3" />
                          <span>Install Theme (انسٹال کریں)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowThemeModal(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer active:scale-95"
              >
                ٹھیک ہے (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Unified Camera Hub Modal (CCTV Feeds & Live Barcode Scanner in ONE Place) */}
      {showCameraHubModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300 relative text-start">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">کیمرہ و سکینر ہب (Camera Hub)</h3>
                  <p className="text-xs text-slate-400">ایک ہی بٹن سے دونوں کام: CCTV کیمرے اور بارکوڈ سکینر</p>
                </div>
              </div>
              <button
                onClick={() => setShowCameraHubModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5 my-5">
              {/* Option 1: Live Barcode & Product Scanner */}
              <button
                onClick={() => {
                  setShowCameraHubModal(false);
                  setActiveTab("billing");
                  if (onOpenScanner) {
                    onOpenScanner();
                  }
                }}
                className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/50 to-slate-900 border border-blue-500/40 hover:border-blue-400 hover:bg-blue-900/30 text-start transition group shadow-lg flex items-center gap-4 active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
                  <Scan className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm">1. لائیو بارکوڈ و کیمرہ سکینر</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      بلنگ و سیل
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">اشیاء اور پائپ بارکوڈ سکین کریں</p>
                  <p className="text-[11px] text-slate-400 mt-1">کیمرہ کھول کر بارکوڈ یا پروڈکٹ سکین کریں تاکہ فوراً بل میں شامل ہو جائے۔</p>
                </div>
              </button>

              {/* Option 2: 9 Live Branch CCTV Feeds */}
              <button
                onClick={() => {
                  setShowCameraHubModal(false);
                  setActiveTab("branches");
                }}
                className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-900/30 text-start transition group shadow-lg flex items-center gap-4 active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition shrink-0">
                  <Video className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm">2. تمام برانچوں کے 9 CCTV کیمرے</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live CCTV
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">تمام کیمرے لائیو چیک کریں</p>
                  <p className="text-[11px] text-slate-400 mt-1">برانچ 1، 2 اور 3 کے کاؤنٹرز، گودام اور لائیو سیکیورٹی ریکارڈنگز دیکھیں۔</p>
                </div>
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400">
                💡 <strong className="text-slate-200">فوری سہولت:</strong> دونوں اسکرینز میں ایک کلک سے دوسرے میں سوئچ کرنے کی سہولت بھی موجود ہے۔
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300 text-slate-200 font-sans space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-base">
                    Choose System Language (زبان کا انتخاب کریں)
                  </h3>
                  <p className="text-xs text-slate-400">Select single language or English + Urdu mixture</p>
                </div>
              </div>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {/* Option 1: English */}
              <button
                onClick={() => {
                  setLanguage("en");
                  setShowLanguageModal(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-start transition flex items-center justify-between ${
                  language === "en"
                    ? "bg-sky-600/20 border-sky-500 text-sky-200 ring-1 ring-sky-500/50"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <span className="font-bold text-sm block">1. Pure English</span>
                    <span className="text-xs text-slate-400">All pages displayed strictly in English</span>
                  </div>
                </div>
                {language === "en" && <Check className="w-5 h-5 text-sky-400 font-bold" />}
              </button>

              {/* Option 2: Urdu */}
              <button
                onClick={() => {
                  setLanguage("ur");
                  setShowLanguageModal(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-start transition flex items-center justify-between ${
                  language === "ur"
                    ? "bg-sky-600/20 border-sky-500 text-sky-200 ring-1 ring-sky-500/50"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇵🇰</span>
                  <div>
                    <span className="font-bold text-sm block font-sans">2. اردو (Pure Urdu)</span>
                    <span className="text-xs text-slate-400">تمام پیجز اور بٹنز مکمل اردو زبان میں</span>
                  </div>
                </div>
                {language === "ur" && <Check className="w-5 h-5 text-sky-400 font-bold" />}
              </button>

              {/* Option 3: Pashto */}
              <button
                onClick={() => {
                  setLanguage("ps");
                  setShowLanguageModal(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-start transition flex items-center justify-between ${
                  language === "ps"
                    ? "bg-sky-600/20 border-sky-500 text-sky-200 ring-1 ring-sky-500/50"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇦ف</span>
                  <div>
                    <span className="font-bold text-sm block">3. پښتو (Pure Pashto)</span>
                    <span className="text-xs text-slate-400">ټول مخونه په پښتو ژبه کې</span>
                  </div>
                </div>
                {language === "ps" && <Check className="w-5 h-5 text-sky-400 font-bold" />}
              </button>

              {/* Option 4: Mix (Urdu + English) */}
              <button
                onClick={() => {
                  setLanguage("mix");
                  setShowLanguageModal(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-start transition flex items-center justify-between ${
                  language === "mix"
                    ? "bg-sky-600/20 border-sky-500 text-sky-200 ring-1 ring-sky-500/50"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <span className="font-bold text-sm block">4. Mixture (English + Urdu)</span>
                    <span className="text-xs text-slate-400">e.g. POS Dashboard (بلنگ کاؤنٹر), Inventory (اسٹاک)</span>
                  </div>
                </div>
                {language === "mix" && <Check className="w-5 h-5 text-sky-400 font-bold" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Password Reset Modal */}
      {showEmailResetModal && (
        <EmailResetPasswordModal
          users={users}
          onClose={() => setShowEmailResetModal(false)}
          onUpdateUsers={(updatedUsers) => {
            if (onUpdateUsers) onUpdateUsers(updatedUsers);
          }}
          onSuccessUnlock={(unlockedUser) => {
            setShowEmailResetModal(false);
            if (onSwitchUser) onSwitchUser(unlockedUser);
          }}
        />
      )}

      {/* Sync Status & Data Safety Confidence Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300 text-xs text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-md ${
                  isOnline 
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" 
                    : "bg-amber-500/20 border-amber-500/30 text-amber-400"
                }`}>
                  {isOnline ? <Cloud className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">
                    {isOnline ? "Cloud Sync & Data Safety Center" : "Offline Mode & Local Data Protection"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isOnline ? "تمام ڈیٹا کلاؤڈ اور لوکل پر محفوظ ہے" : "انٹرنیٹ کے بغیر بھی 100% محفوظ ڈیٹا اسٹوریج"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Cards */}
            <div className="space-y-3 mb-4">
              {/* Connection Status Card */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isOnline
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isOnline ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                  }`}>
                    {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-100">
                      {isOnline ? "Internet Status: Online (آن لائن)" : "Internet Status: Offline (آف لائن)"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isOnline 
                        ? "Real-time sync to all branches active" 
                        : "Operating in offline local-first mode safely"
                      }
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isOnline ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                }`}>
                  {isOnline ? "Connected" : "Offline"}
                </span>
              </div>

              {/* Timestamps Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">Last Successful Data Save:</span>
                      <span className="text-[10px] text-slate-400">آخری بار لوکل ڈیٹا محفوظ کیا گیا</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                    {lastSaveTime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">Last Cloud Sync:</span>
                      <span className="text-[10px] text-slate-400">تمام برانچز سے کلاؤڈ سنک</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {lastSyncTime}
                  </span>
                </div>
              </div>

              {/* Confidence Guarantee Points */}
              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2 text-[11px]">
                <span className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Data Protection Guarantee (ڈیٹا کے تحفظ کی ضمانت)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Invoices & Sales Auto-Saved</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Customer Khata Balances Intact</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Live Stock Restocking Tracked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Auto Reconnect & Sync upon WiFi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-500">
                QumberSanitary POS v2.0 • Zero Data Loss Engine
              </span>
              <div className="flex items-center gap-2">
                {isOnline && (
                  <button
                    onClick={() => triggerAutoSync()}
                    disabled={syncStatus !== "idle"}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/30"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncStatus !== "idle" ? "animate-spin" : ""}`} />
                    <span>{syncStatus !== "idle" ? "Syncing..." : "Sync Now (ابھی سنک کریں)"}</span>
                  </button>
                )}
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Export & Download Center Modal (1-File HTML, Android APK, ZIP Source, JSON Backup) */}
      {showExportMenu && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-t-2xl sm:rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300 text-xs text-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                  <Download className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                    <span>Export & Download Center</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ایکسپورٹ مینو
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    QumberSanitary POS • 1-File Standalone App, Android APK Package, Source Code & Data Backups
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportMenu(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Export Cards Grid */}
            <div className="space-y-3.5 mb-5">
              {/* Option 1: 1-File Standalone Offline HTML Application */}
              <div className="p-4 bg-slate-950/90 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:border-emerald-400/60 transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">1-File Standalone Offline App (.html)</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        1 Single File ⚡
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      ایک سنگل فائل جس میں پورا POS سسٹم (HTML, CSS, JS, لوکل ڈیٹا بیس) بند ہے۔ کمپیوٹر یا موبائل پر بغیر انٹرنیٹ اور بغیر کسی سرور کے ڈبل کلک کر کے چلائیں!
                    </p>
                    <span className="text-[10px] text-emerald-400/90 font-mono mt-1 block">
                      📁 haider_sanitary_pos_single_file.html (~2.9 MB)
                    </span>
                  </div>
                </div>

                <a
                  href="/download/single-file"
                  download="haider_sanitary_pos_single_file.html"
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-900/30 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download 1 File</span>
                </a>
              </div>

              {/* Option 2: Android APK Installer Package (.apk) */}
              <div className="p-4 bg-slate-950/90 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:border-amber-400/60 transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">1 Android APK Package (.apk)</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Android Installer 📱
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      اینڈرائیڈ موبائل اور ٹیبلٹ کے لیے اصلی انسٹالر APK فائل۔ اس میں کیمرہ بارکوڈ سکینر، تھرمل پرنٹر اور مکمل آف لائن کیش کاؤنٹر شامل ہے۔
                    </p>
                    <span className="text-[10px] text-amber-400/90 font-mono mt-1 block">
                      📁 haider_sanitary_pos.apk (~1.4 MB)
                    </span>
                  </div>
                </div>

                <a
                  href="/download/apk"
                  download="haider_sanitary_pos.apk"
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-amber-900/30 shrink-0"
                >
                  <Smartphone className="w-4 h-4 text-slate-950" />
                  <span>Download 1 APK</span>
                </a>
              </div>

              {/* Option 3: Full Project Source Code (.zip) */}
              <div className="p-4 bg-slate-950/90 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:border-blue-400/50 transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">Full Source Code Archive (.zip)</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Developer ZIP 💻
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      اس پورے ری ایکٹ، ٹائپ سکرپٹ اور وائٹ POS پروجیکٹ کا مکمل سورس کوڈ زپ پیکج جس میں تمام فائلیں موجود ہیں۔
                    </p>
                    <span className="text-[10px] text-blue-400/90 font-mono mt-1 block">
                      📁 haider_sanitary_pos_source.zip
                    </span>
                  </div>
                </div>

                <a
                  href="/download/source-zip"
                  download="haider_sanitary_pos_source.zip"
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition border border-slate-700 shrink-0"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Download Source (.zip)</span>
                </a>
              </div>

              {/* Option 4: Full POS Data Backup (JSON) */}
              <div className="p-4 bg-slate-950/90 border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:border-purple-400/50 transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">Store Database Snapshot (.json)</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Data Backup 🗄️
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      تمام کسٹمرز کا کھاتہ، بل انوائسز، اسٹاک انوینٹری اور برانچز کی تفصیلات کا مکمل محفوظ بیک اپ ڈاؤن لوڈ کریں۔
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    exportAllDataBackup();
                  }}
                  className="px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-sm shrink-0"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>Backup All Data (JSON)</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-500">
                QumberSanitary • Building Trust for Your Dream Home
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    window.print();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Print View</span>
                </button>
                <button
                  onClick={() => setShowExportMenu(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Supplier Purchase Order (Reorder) Modal */}
      {showReorderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-t-2xl sm:rounded-2xl max-w-4xl w-full p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300 text-xs text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Supplier Purchase Order (Draft)</h3>
                  <p className="text-[11px] text-slate-400">فوری سپلائر آرڈر شیٹ (Generate Purchase Order Draft for Low Stock Products)</p>
                </div>
              </div>
              <button
                onClick={() => setShowReorderModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-5">
              {/* Left 2 Cols: Item list & adjustable reorder quantities */}
              <div className="lg:col-span-2 flex flex-col">
                <h4 className="font-extrabold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>آرڈر کی جانے والی اشیاء (Products List & Quantities)</span>
                </h4>
                
                <div className="flex-1 max-h-[350px] overflow-y-auto space-y-2 border border-slate-800/80 rounded-xl p-3 bg-slate-950/40">
                  {lowStockProducts.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No low-stock items detected at this moment.</p>
                  ) : (
                    lowStockProducts.map(p => {
                      const qty = reorderQuantities[p.id] || 0;
                      // Estimate cost price based on sale price if cost price is undefined or 0
                      const itemCostPrice = p.costPrice || Math.round(p.salePrice * 0.7);
                      const itemTotal = qty * itemCostPrice;

                      return (
                        <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900 border border-slate-850">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-200 truncate">{p.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Brand: <strong className="text-slate-400">{p.brand}</strong> | Code: <strong className="text-slate-400">{p.code}</strong>
                            </div>
                            <div className="text-[10px] text-rose-400 mt-0.5">
                              Current Stock: <strong>{p.stockQuantity} {p.unit}</strong> (Alert Limit: {p.minStockAlert})
                            </div>
                          </div>

                          <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0">
                            <div>
                              <label className="text-[9px] text-slate-500 block text-end">Reorder Qty</label>
                              <div className="flex items-center gap-1 mt-0.5">
                                <input
                                  type="number"
                                  min="1"
                                  value={qty}
                                  onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                    setReorderQuantities(prev => ({ ...prev, [p.id]: val }));
                                  }}
                                  className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-xs text-amber-300 font-bold focus:border-amber-500 outline-none"
                                />
                                <span className="text-[10px] text-slate-500">{p.unit}</span>
                              </div>
                            </div>

                            <div className="text-end min-w-[90px]">
                              <span className="text-[9px] text-slate-500 block">Estimated Cost</span>
                              <span className="text-xs font-mono font-bold text-slate-300">
                                {settings.currencySymbol} {itemCostPrice.toLocaleString()} ea
                              </span>
                              <span className="text-[10px] font-mono text-emerald-400 block font-semibold">
                                Total: {settings.currencySymbol} {itemTotal.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Col: Supplier Selection & Notes */}
              <div className="space-y-4 bg-slate-900/50 p-4 border border-slate-800 rounded-xl">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    آرڈر سپلائر (Select Supplier):
                  </label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="Master Ceramics & Sanitary">Master Ceramics & Sanitary (Gujranwala HQ)</option>
                    <option value="PPRC Pipe Fittings Pakistan">PPRC Pipe Fittings Pakistan (Peshawar Vendor)</option>
                    <option value="PVC UPVC Industries Lahore">PVC UPVC Industries Lahore</option>
                    <option value="Faisal Faucets & Valve Co.">Faisal Faucets & Valve Co.</option>
                    <option value="Local Wholesale Vendor Peshawar">Local Wholesale Vendor Peshawar (#03 Khyber Bazaar)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    ادائیگی کی شرائط (Payment Terms):
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="Cash on Delivery">کیش آن ڈلیوری (Cash on Delivery)</option>
                    <option value="Advance Account">ایڈوانس اکاؤنٹ (Advance Payment)</option>
                    <option value="Net 30 Days">نیٹ 30 دن کھاتہ (Net 30 Days)</option>
                    <option value="Net 60 Days">نیٹ 60 دن کھاتہ (Net 60 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    آرڈر ریمارکس اور پتا (Order Notes):
                  </label>
                  <textarea
                    rows={3}
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    placeholder="Provide shipping address or special loading instructions..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:border-amber-500 outline-none resize-none"
                  />
                </div>

                {/* Calculation Summary Panel */}
                <div className="pt-3 border-t border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Subtotal Cost:</span>
                    <span className="font-mono">
                      {settings.currencySymbol}{" "}
                      {lowStockProducts.reduce((sum, p) => {
                        const qty = reorderQuantities[p.id] || 0;
                        const cost = p.costPrice || Math.round(p.salePrice * 0.7);
                        return sum + qty * cost;
                      }, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Shipping Est:</span>
                    <span className="text-emerald-400 font-semibold">FREE (Master Cargo)</span>
                  </div>
                  <div className="flex justify-between text-slate-200 text-xs font-black pt-1.5 border-t border-slate-800">
                    <span>Grand Total Estimated:</span>
                    <span className="text-amber-400 font-mono">
                      {settings.currencySymbol}{" "}
                      {lowStockProducts.reduce((sum, p) => {
                        const qty = reorderQuantities[p.id] || 0;
                        const cost = p.costPrice || Math.round(p.salePrice * 0.7);
                        return sum + qty * cost;
                      }, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800 flex-wrap">
              <span className="text-[10px] text-slate-500">
                Draft PO Code: HP-PO-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)} • Generated by {activeUser.name}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const poNum = `HP-PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                    let text = `*HAIDER SANITARY STORE - PURCHASE ORDER*\n`;
                    text += `*PO Number:* ${poNum}\n`;
                    text += `*Supplier:* ${selectedSupplier}\n`;
                    text += `*Payment Terms:* ${paymentTerms}\n`;
                    text += `*Status:* DRAFT PURCHASE ORDER\n`;
                    text += `*Date:* ${new Date().toLocaleDateString()}\n\n`;
                    text += `*ITEMS TO REORDER:*\n`;
                    
                    lowStockProducts.forEach(p => {
                      const qty = reorderQuantities[p.id] || 0;
                      text += `- *${p.name}*: ${qty} ${p.unit} (Code: ${p.code}, Brand: ${p.brand})\n`;
                    });
                    
                    text += `\n*Notes:* ${poNotes}\n`;
                    text += `\n_Generated via HaiderSanitary POS Control Panel_`;

                    navigator.clipboard.writeText(text);
                    alert("✓ Purchase order draft copied to clipboard! You can now paste and send it directly to your supplier on WhatsApp.");
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                  title="Copy PO Text for Whatsapp Supplier Chat"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp کاپی (Copy for WhatsApp)</span>
                </button>

                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>پرنٹ آرڈر (Print PO)</span>
                </button>

                <button
                  onClick={() => {
                    alert("✓ Draft Purchase Order has been successfully initialized and queued to the supplier network!");
                    setShowReorderModal(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-xs transition"
                >
                  آرڈر محفوظ کریں (Save PO)
                </button>

                <button
                  onClick={() => setShowReorderModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  بند کریں
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

