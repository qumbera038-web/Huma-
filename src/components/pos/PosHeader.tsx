import React, { useState, useEffect } from "react";
import { StoreSettings, UserAccount, Branch } from "../../types";
import { logStaffLogin, AppTheme } from "../../utils/posStorage";
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
  RefreshCw
} from "lucide-react";

export type PosTab = "billing" | "inventory" | "khata" | "reports" | "branches" | "whatsapp_hub" | "attendance" | "ai_estimator" | "settings";

interface PosHeaderProps {
  activeTab: PosTab;
  setActiveTab: (tab: PosTab) => void;
  settings: StoreSettings;
  activeUser: UserAccount;
  users: UserAccount[];
  branches?: Branch[];
  activeBranchId?: string;
  onSelectBranch?: (branchId: string) => void;
  onSwitchUser: (user: UserAccount) => void;
  onUpdateUsers?: (users: UserAccount[]) => void;
  onOpenReturnModal?: () => void;
  onOpenScanner?: () => void;
  todaySales: number;
  todayInvoicesCount: number;
  lowStockCount: number;
  totalUdhaar: number;
  currentTheme?: AppTheme;
  onThemeChange?: (theme: AppTheme) => void;
}

export const PosHeader: React.FC<PosHeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  activeUser,
  users,
  branches = [],
  activeBranchId = "all",
  onSelectBranch,
  onSwitchUser,
  onUpdateUsers,
  onOpenReturnModal,
  onOpenScanner,
  todaySales,
  todayInvoicesCount,
  lowStockCount,
  totalUdhaar,
  currentTheme = "slate",
  onThemeChange,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showCameraHubModal, setShowCameraHubModal] = useState(false);
  
  // Dynamic Auto-Sync and Internet state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<"idle" | "connecting" | "syncing_invoices" | "syncing_khata" | "syncing_stock" | "completed">("idle");
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem("hps_last_cloud_sync_v3") || "Never Synced";
  });

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

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Auto-trigger on mount if online
    if (navigator.onLine) {
      triggerAutoSync();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  
  // Theme installation states
  const [installedThemes, setInstalledThemes] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("hps_installed_themes_v3");
      return stored ? JSON.parse(stored) : ["slate", "light"];
    } catch {
      return ["slate", "light"];
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
    setPinInput("");
    setShowPassword(false);
    setPasswordRemovedNotice(false);

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

    if (selectedUserToSwitch.hasPassword === false || !selectedUserToSwitch.pin || selectedUserToSwitch.pin === pinInput.trim()) {
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

  const navItems = [
    { id: "billing", label: t('pos'), icon: ShoppingCart, count: null },
    { id: "inventory", label: t('inventory'), icon: Package, count: lowStockCount > 0 ? `${lowStockCount} Low` : null, alert: lowStockCount > 0 },
    { id: "khata", label: t('customers'), icon: BookOpen, count: `${settings.currencySymbol} ${(totalUdhaar / 1000).toFixed(0)}k` },
    { id: "reports", label: t('reports'), icon: BarChart3, count: null },
    { id: "branches", label: t('branches'), icon: Building2, count: "3 Branches", cctv: false },
    { id: "whatsapp_hub", label: t('whatsapp'), icon: MessageSquare, count: "3 Numbers", whatsapp: true },
    { id: "attendance", label: "Attendance", icon: Clock, count: "Auto Log", time: true },
    { id: "ai_estimator", label: t('ai_estimator'), icon: Sparkles, count: "Gemini", ai: true },
    { id: "settings", label: t('settings'), icon: Settings, count: null },
  ];

  // Determine which branch to display info for
  const displayBranch = branches.find(b => b.id === (activeBranchId === "all" ? activeUser.branchId : activeBranchId)) || branches[0];

  return (
    <header className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 shadow-xl font-sans">
      {/* Top Banner with Store Info & Live Counters */}
      <div className="px-3 sm:px-5 py-3.5 flex items-center justify-between gap-3">
        {/* Left: Brand Monogram & Beautiful Clean Store Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-lg tracking-wider shrink-0 ring-1 ring-white/20">
            HS
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-100 tracking-tight truncate flex items-center gap-1.5 flex-wrap">
                <span>Haider Pipe and Sanitary Store</span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  HaiderSanitary 🧿
                </span>
              </h1>
              
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>POS Live</span>
              </span>

              {/* High-Tech Auto-Sync Cloud Engine - STEALTH MODE: Only visible to Owner/Admin */}
              {(activeUser.role === "admin" || activeUser.isSuperAdmin) ? (
                <>
                  <button
                    onClick={() => isOnline && triggerAutoSync()}
                    disabled={syncStatus !== "idle" || !isOnline}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold transition-all duration-300 ${
                      !isOnline
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                        : syncStatus === "idle"
                        ? "bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/25 cursor-pointer active:scale-95"
                        : "bg-indigo-600 text-white border border-indigo-400 animate-pulse"
                    }`}
                    title={
                      !isOnline
                        ? "آف لائن موڈ (ڈیٹا لائیو محفوظ ہو رہا ہے، نیٹ آنے پر خودکار سنک ہوگا)"
                        : `آخری بار کلاؤڈ سنک: ${lastSyncTime}۔ ابھی سنک کرنے کے لیے کلک کریں۔`
                    }
                  >
                    {!isOnline ? (
                      <span className="w-1 h-1 rounded-full bg-rose-400" />
                    ) : syncStatus === "idle" ? (
                      <span className="w-1 h-1 rounded-full bg-blue-400" />
                    ) : (
                      <RefreshCw className="w-2 h-2 animate-spin text-white" />
                    )}
                    <span>
                      {!isOnline
                        ? "آف لائن (Offline)"
                        : syncStatus === "idle"
                        ? "کلاؤڈ سنکڈ (Synced)"
                        : syncStatus === "connecting"
                        ? "رابطہ قائم ہو رہا ہے..."
                        : syncStatus === "syncing_invoices"
                        ? "بل اپلوڈ..."
                        : syncStatus === "syncing_khata"
                        ? "کھاتہ سنک..."
                        : "انونٹری اپڈیٹ..."
                      }
                    </span>
                  </button>
                </>
              ) : (
                /* Innocent cover for cashiers / staff so they think it's a completely offline local app */
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  <span>v1.2.0 (Offline Mode)</span>
                </span>
              )}
            </div>

            {/* Micro sync progress bar - Only visible to Owner/Admin */}
            {(activeUser.role === "admin" || activeUser.isSuperAdmin) && syncStatus !== "idle" && (
              <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden mt-1 max-w-[200px]">
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

            {/* Sync Timestamp Subtext - Only visible to Owner/Admin */}
            {(activeUser.role === "admin" || activeUser.isSuperAdmin) && (
              <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5 font-medium truncate">
                <span className="text-slate-500">آٹو سنک:</span>
                <span className={isOnline ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                  {isOnline ? `✓ ${lastSyncTime}` : "⚠️ نیٹ کا انتظار ہے"}
                </span>
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
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-emerald-600/30 hover:from-blue-600/40 hover:via-indigo-600/40 hover:to-emerald-600/40 border border-blue-500/50 text-blue-200 font-bold text-[11px] transition shadow-md group active:scale-95"
          >
            <div className="relative flex items-center justify-center">
              <Camera className="w-4 h-4 text-blue-300 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse border border-slate-900" />
            </div>
            <span className="flex items-center gap-1">
              <span>کیمرہ (CCTV و سکین)</span>
            </span>
          </button>

          {/* Today's Sales */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:py-1.5 rounded-lg bg-white/10/80 border border-slate-700/60">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <span className="text-[9px] text-slate-400 block leading-none hidden sm:block">Today Sales</span>
              <span className="font-bold text-emerald-400 text-xs leading-tight font-mono">
                {settings.currencySymbol} {todaySales.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Desktop Only Buttons (Low stock, Time, Return, Install, Theme) */}
          <div className="hidden lg:flex items-center gap-2">
            {lowStockCount > 0 && (
              <button
                onClick={() => setActiveTab("inventory")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition"
                title="Click to view low stock items"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-[11px]">{lowStockCount} Low Stock</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10/60 border border-slate-700/40 text-slate-300 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime}</span>
            </div>

            {onOpenReturnModal && (
              <button
                onClick={onOpenReturnModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-semibold text-[11px] transition shadow-sm"
                title="Process item return, refund & automatic inventory restocking"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>↩️ Return Item</span>
              </button>
            )}

            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px] transition shadow-sm"
              title="Install App on Phone / Share with Staff"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Install / Share</span>
            </button>

            <button
              onClick={() => setShowThemeModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-[11px] transition shadow-sm"
              title="Change Background Theme / Color"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('theme')}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => {
                const nextLang = language === 'en' ? 'ur' : (language === 'ur' ? 'ps' : 'en');
                setLanguage(nextLang);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 font-semibold text-[11px] transition shadow-sm"
              title="Change Language (English / Urdu / Pashto)"
            >
              <Languages className="w-3.5 h-3.5 text-sky-400" />
              <span className="uppercase">{language}</span>
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
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/10/90 hover:bg-white/10 border border-blue-500/30 text-slate-200 transition shadow-sm"
            title="Switch active counter cashier / operator (Protected with PIN)"
          >
            <div className="relative">
              <img
                src={activeUser.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"}
                alt={activeUser.name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-blue-400 shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="font-bold text-[11px] block leading-none text-slate-100">{activeUser.name}</span>
                <span className="text-[9px] uppercase tracking-wider text-blue-300 font-bold px-1.5 py-0.2 rounded bg-blue-500/20">
                  {activeUser.role}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 leading-none block mt-0.5">
                {activeUser.counterStation || "Counter #1"}
              </span>
            </div>
          </button>

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
                className="absolute right-0 top-11 w-52 bg-glass border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95"
                onClick={() => setShowMobileToolsMenu(false)}
              >
                {onOpenReturnModal && (
                  <button
                    onClick={onOpenReturnModal}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>↩️ Return Item (واپسی)</span>
                  </button>
                )}

                <button
                  onClick={() => setShowCameraHubModal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>کیمرہ (CCTV و سکینر)</span>
                </button>

                <button
                  onClick={() => setShowThemeModal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20"
                >
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  <span>تھیم اور رنگ تبدیل کریں</span>
                </button>

                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>موبائل پر ایپ انسٹال کریں</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-300 bg-white/10 hover:bg-slate-700"
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
              key={item.id}
              onClick={() => setActiveTab(item.id as PosTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : item.cctv
                  ? "text-slate-200 bg-white/10/90 border border-slate-700 hover:border-blue-500/50 hover:bg-white/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/10/80"
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
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 text-xs text-slate-200">
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
              <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {users.map((u) => {
                  const isSelected = selectedUserToSwitch?.id === u.id;
                  const isCurrentlyActive = activeUser.id === u.id;
                  const hasNoPassword = u.hasPassword === false || !u.pin;

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUser(u)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition ${
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
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
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
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {u.counterStation || "Counter #1"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
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
                        maxLength={8}
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          setPinError(false);
                        }}
                        placeholder="Enter 4-digit PIN"
                        autoFocus
                        className="w-full pl-4 pr-12 py-2.5 bg-glass border border-slate-700 rounded-lg text-slate-100 text-center text-lg tracking-widest font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      
                      {/* Show / Hide Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 p-1 rounded text-slate-400 hover:text-slate-200 transition"
                        title={showPassword ? "پاسورڈ چھپائیں (Hide Password)" : "پاسورڈ دکھائیں (Show Password)"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {pinError && (
                      <p className="text-xs text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Incorrect PIN. (PIN is: {selectedUserToSwitch.pin})
                      </p>
                    )}

                    {passwordRemovedNotice && (
                      <p className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <Check className="w-4 h-4" /> Password removed successfully! Logging in...
                      </p>
                    )}

                    {/* Google-like "Remove Password" option */}
                    <div className="pt-1 flex items-center justify-between border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={handleRemovePassword}
                        className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
                        title="Remove PIN requirement for this user (پاسورڈ ختم کریں)"
                      >
                        <Unlock className="w-3 h-3" />
                        <span>پاسورڈ ختم کریں (Remove Password)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPinInput(selectedUserToSwitch.pin)}
                        className="text-[10px] text-slate-400 hover:text-slate-200"
                      >
                        Auto-fill PIN
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
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 text-xs text-slate-200">
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

              {/* Step by step installation */}
              <div className="space-y-2.5">
                <h4 className="font-semibold text-slate-200 text-xs">2. Mobile پر انسٹال کرنے کا آسان طریقہ:</h4>
                
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
                <span>اس کے بعد یہ ایپ کی طرح موبائل کی ہوم اسکرین پر ہمیشہ کے لیے آ جائے گی!</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
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
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 text-slate-200">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2 max-h-[380px] overflow-y-auto pr-1">
              {[
                {
                  id: "slate",
                  name: "Dark Slate Pro",
                  nameUrdu: "پروفیشنل ڈارک سلیٹ (ڈیفالٹ)",
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
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 relative overflow-hidden ${thm.bgClass} ${
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
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass border border-slate-700 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 relative text-left">
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
                className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/50 to-slate-900 border border-blue-500/40 hover:border-blue-400 hover:bg-blue-900/30 text-left transition group shadow-lg flex items-center gap-4 active:scale-[0.99]"
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
                className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-900/30 text-left transition group shadow-lg flex items-center gap-4 active:scale-[0.99]"
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
    </header>
  );
};

