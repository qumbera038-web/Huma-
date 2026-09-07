import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { StoreSettings, UserAccount } from "../../types";
import { 
  Settings, 
  Store, 
  Users, 
  Save, 
  ShieldCheck, 
  Download, 
  RotateCcw, 
  Key, 
  Check, 
  Plus, 
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit2,
  X,
  Camera,
  Layers,
  Code2,
  Copy,
  FileCode,
  FolderTree,
  Database,
  KeyRound,
  Globe,
  Palette,
  Smartphone,
  Laptop,
  FileText,
  Printer
} from "lucide-react";
import { exportAllDataBackup, resetAllData, AppTheme } from "../../utils/posStorage";
import { AVATAR_PRESETS } from "../../data/posData";

interface PosSettingsProps {
  settings: StoreSettings;
  users: UserAccount[];
  activeUser: UserAccount;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  onUpdateUsers: (newUsers: UserAccount[]) => void;
  currentTheme?: AppTheme;
  onThemeChange?: (theme: AppTheme) => void;
}

export const PosSettings: React.FC<PosSettingsProps> = ({
  settings,
  users,
  activeUser,
  onUpdateSettings,
  onUpdateUsers,
  currentTheme = "slate",
  onThemeChange,
}) => {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [ntn, setNtn] = useState(settings.ntn || "");
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // User management
  const { language, setLanguage } = useLanguage();
  const [manualLang, setManualLang] = useState<"en" | "ur" | "ps">(language === "ps" ? "ps" : (language === "en" ? "en" : "ur"));
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Add User Form State
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "cashier" | "manager">("cashier");
  const [newUserPin, setNewUserPin] = useState("1234");
  const [newUserHasPassword, setNewUserHasPassword] = useState(true);
  const [newUserShowPin, setNewUserShowPin] = useState(false);
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserAvatar, setNewUserAvatar] = useState(AVATAR_PRESETS[0].url);
  const [newUserCounter, setNewUserCounter] = useState("Counter #1 (Main Terminal)");

  // Edit User Form State
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "cashier" | "manager">("cashier");
  const [editPin, setEditPin] = useState("");
  const [editHasPassword, setEditHasPassword] = useState(true);
  const [editShowPin, setEditShowPin] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editCounter, setEditCounter] = useState("");

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoreSettings = {
      ...settings,
      storeName: storeName.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      phone: phone.trim(),
      ntn: ntn.trim() || undefined,
      currencySymbol: currencySymbol.trim(),
      receiptFooter: receiptFooter.trim(),
    };
    onUpdateSettings(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      role: newUserRole,
      pin: newUserHasPassword ? newUserPin.trim() : "",
      hasPassword: newUserHasPassword,
      avatarUrl: newUserAvatar,
      counterStation: newUserCounter,
      phone: newUserPhone.trim() || undefined,
    };

    onUpdateUsers([...users, newUser]);
    setShowAddUserModal(false);
    setNewUserName("");
    setNewUserPin("1234");
    setNewUserHasPassword(true);
    setNewUserPhone("");
  };

  const openEditUser = (u: UserAccount) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditRole(u.role);
    setEditPin(u.pin || "1234");
    setEditHasPassword(u.hasPassword !== false && !!u.pin);
    setEditShowPin(false);
    setEditPhone(u.phone || "");
    setEditAvatar(u.avatarUrl || AVATAR_PRESETS[0].url);
    setEditCounter(u.counterStation || "Counter #1 (Main Terminal)");
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName.trim()) return;

    const updatedUsers = users.map((u) => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          name: editName.trim(),
          role: editRole,
          pin: editHasPassword ? editPin.trim() : "",
          hasPassword: editHasPassword,
          avatarUrl: editAvatar,
          counterStation: editCounter,
          phone: editPhone.trim() || undefined,
        };
      }
      return u;
    });

    onUpdateUsers(updatedUsers);
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (users.length <= 1) {
      alert("At least one user account must remain active.");
      return;
    }
    if (window.confirm("Are you sure you want to remove this staff user?")) {
      onUpdateUsers(users.filter((u) => u.id !== id));
    }
  };

  // Google-like toggle to instantly remove/add password for a user
  const handleTogglePasswordForUser = (user: UserAccount) => {
    const willHavePassword = user.hasPassword === false || !user.pin;
    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          hasPassword: willHavePassword,
          pin: willHavePassword ? (u.pin || "1234") : "",
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
  };

  const handleResetSystem = () => {
    if (
      window.confirm(
        "WARNING: This will reset all inventory, customers, and invoices to initial store defaults. Proceed?"
      )
    ) {
      resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs">
      {/* Header */}
      <div className="bg-glass border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-md">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Store Configuration & Multi-User Staff</span>
          </h2>
          <p className="text-xs text-slate-400">
            Customize bill receipt header, cashier profile pictures, counter stations, and Google-style PIN security
          </p>
        </div>

        <button
          onClick={exportAllDataBackup}
          className="flex items-center gap-1.5 px-4 py-2 font-semibold bg-white/5 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition shadow-sm"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Backup All Data (JSON)</span>
        </button>
      </div>

      {/* Staff PWA/App Installation Guide Card */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-blue-950/40 border border-blue-500/20 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Smartphone className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">
              سٹاف ممبرز کے موبائل اور کمپیوٹر میں ایپ انسٹال کرنے کا گائیڈ (One-Click Mobile App Installation)
            </h3>
            <p className="text-[11px] text-slate-400">
              یہ ویب سائٹ اب ایک مکمل ایپ (PWA) ہے جسے آپ کا سٹاف بغیر پلے سٹور کے اپنے فون پر انسٹال کر سکتا ہے:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Column 1: Android Setup */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>Android (سیمسنگ/انفینکس/ویوو)</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[11px]">
              <li>اپنے موبائل پر <span className="text-emerald-400 font-bold">Chrome Browser</span> کھولیں اور اس ویب سائٹ پر جائیں۔</li>
              <li>اوپر دائیں کونے میں <span className="font-bold text-white">Three Dots (تین نقطے)</span> پر کلک کریں۔</li>
              <li>منیو میں <span className="text-blue-400 font-bold">"Add to Home screen"</span> یا <span className="text-blue-400 font-bold">"Install app"</span> کو منتخب کریں۔</li>
              <li>آپ کے موبائل کی ہوم سکرین پر <span className="font-bold text-emerald-400">Haider Sanitary</span> کا آئیکن آ جائے گا!</li>
            </ol>
          </div>

          {/* Column 2: iPhone / Safari Setup */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>iPhone / iOS (آئی فون)</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[11px]">
              <li>آئی فون میں صرف <span className="text-sky-400 font-bold">Safari Browser</span> کے ذریعے اس لنک کو کھولیں۔</li>
              <li>نیچے موجود <span className="font-bold text-white">"Share" (شیئر والے تیر کے نشان)</span> بٹن پر کلک کریں۔</li>
              <li>نیچے سکرول کریں اور <span className="text-blue-400 font-bold">"Add to Home Screen"</span> پر کلک کریں۔</li>
              <li>اب یہ ایپ آپ کے آئی فون میں بالکل عام ایپس کی طرح چلنے لگے گی!</li>
            </ol>
          </div>

          {/* Column 3: PC / Laptop Setup */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Laptop className="w-4 h-4" />
              <span>PC / Laptop (کمپیوٹر/ٹیبلیٹ)</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[11px]">
              <li>کمپیوٹر پر <span className="text-indigo-400 font-bold">Chrome</span> یا <span className="text-indigo-400 font-bold">Edge Browser</span> میں لنک کھولیں۔</li>
              <li>ایڈریس بار میں دائیں طرف <span className="text-indigo-400 font-bold">Install (مانیٹر کا آئیکن)</span> نظر آئے گا۔</li>
              <li>اس پر کلک کر کے <span className="font-bold text-white">"Install"</span> منتخب کریں۔</li>
              <li>کمپیوٹر کے ڈیسک ٹاپ پر پکا شارٹ کٹ بن جائے گا اور یہ سمارٹ اسکرین میں کھلے گا!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 📄 PDF User Guide & Complete Software Manual Card */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-emerald-950/40 border border-emerald-500/25 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <FileText className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-sm">
              مکمل سسٹم یوزر مینول اور گائیڈ فائل (Download Complete System User Manual & Guide PDF)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              اپنے سٹاف کی ٹریننگ، بلنگ گائیڈ لائنز، کھاتہ لیجر اور انوینٹری کنٹرول کے مکمل طریقہ کار کی آفیشل پی ڈی ایف فائل ڈاؤن لوڈ کریں۔
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowManualModal(true)}
          className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/15 cursor-pointer active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>اوپن اور پرنٹ پی ڈی ایف (Print/Save PDF Guide)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Form: Store Profile (7 cols) */}
        <div className="lg:col-span-7 bg-glass border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="font-bold text-slate-100 text-sm mb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-400" />
            <span>Shop Profile & Receipt Settings</span>
          </h3>

          <form onSubmit={handleSaveStore} className="space-y-3.5">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Store / Business Name *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Business Tagline / Subtitle</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Store Phone / Helpline *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">NTN / Tax Registration #</label>
                <input
                  type="text"
                  value={ntn}
                  onChange={(e) => setNtn(e.target.value)}
                  placeholder="e.g. 7483920-1"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Shop Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-28 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Thermal Receipt Footer Message</label>
              <textarea
                rows={2}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {savedNotice ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Store Profile Updated Successfully!</span>
                </div>
              ) : (
                <span />
              )}

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Store Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Section: Multi-User Staff & Theme & Danger Zone (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Background Theme Card */}
          <div className="bg-glass border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-400" />
                <span>سسٹم کا بیک گراؤنڈ تھیم (Background Theme)</span>
              </h3>
              <span className="text-[10px] text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                6 Themes
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              دکان کی لائٹنگ اور اپنے آرام کے مطابق کسی بھی وقت بیک گراؤنڈ کا رنگ تبدیل کریں:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "slate", name: "Dark Slate Pro", urdu: "ڈارک سلیٹ", bg: "bg-slate-950", border: "border-slate-700", dot: "bg-slate-500" },
                { id: "light", name: "Clean Light", urdu: "روشن سفید", bg: "bg-slate-100 text-slate-900", border: "border-slate-300", dot: "bg-blue-600" },
                { id: "navy", name: "Royal Navy", urdu: "شاہی نیوی", bg: "bg-[#0b1329]", border: "border-blue-800", dot: "bg-blue-500" },
                { id: "emerald", name: "Emerald Green", urdu: "زمرد سبز", bg: "bg-[#061e18]", border: "border-emerald-800", dot: "bg-emerald-500" },
                { id: "black", name: "OLED Black", urdu: "خالص سیاہ", bg: "bg-black", border: "border-neutral-800", dot: "bg-neutral-400" },
                { id: "amber", name: "Warm Amber", urdu: "وارم امبر", bg: "bg-[#1c1917]", border: "border-amber-800", dot: "bg-amber-500" },
              ].map((t) => {
                const isSelected = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onThemeChange && onThemeChange(t.id as AppTheme)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition ${t.bg} ${t.border} ${
                      isSelected
                        ? "ring-2 ring-blue-500 shadow-md font-bold"
                        : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-3 h-3 rounded-full ${t.dot} shrink-0`} />
                      <div className="truncate">
                        <span className="text-[11px] block leading-tight truncate">{t.name}</span>
                        <span className="text-[9px] opacity-70 block">{t.urdu}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Staff Accounts */}
          <div className="bg-glass border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Cashiers & Counter Operators ({users.length})</span>
                </h3>
                <p className="text-[11px] text-slate-400">Photos & Counter Stations on Bill</p>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-slate-700 text-purple-300 border border-slate-700 rounded-lg font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Staff</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {users.map((u) => {
                const hasNoPassword = u.hasPassword === false || !u.pin;

                return (
                  <div
                    key={u.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition ${
                      activeUser.id === u.id
                        ? "bg-blue-950/40 border-blue-500/40 ring-1 ring-blue-500/20"
                        : "bg-slate-950/60 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={u.avatarUrl || AVATAR_PRESETS[0].url}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-slate-600 shadow-sm"
                        />
                        {activeUser.id === u.id && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-100 truncate">{u.name}</span>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/5 text-slate-300">
                            {u.role}
                          </span>
                          {activeUser.id === u.id && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold text-[9px]">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                          {u.counterStation || "Counter #1 (Main Terminal)"}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] mt-0.5">
                          {hasNoPassword ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                              <Unlock className="w-2.5 h-2.5" /> No Password (Quick Login)
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> PIN: ••••
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Quick Google-style toggle password button */}
                      <button
                        onClick={() => handleTogglePasswordForUser(u)}
                        className={`p-1.5 rounded-lg border transition ${
                          hasNoPassword
                            ? "bg-white/5/80 border-slate-700 text-slate-400 hover:text-blue-300"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20"
                        }`}
                        title={hasNoPassword ? "Add PIN Password" : "Remove Password (پاسورڈ ختم کریں)"}
                      >
                        {hasNoPassword ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit User Button */}
                      <button
                        onClick={() => openEditUser(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/5 transition"
                        title="Edit User & Picture"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete User Button */}
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition"
                        title="Remove Staff User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset & Maintenance */}
          <div className="bg-glass border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2 text-rose-400">
              <RotateCcw className="w-4 h-4" />
              <span>System Data Maintenance</span>
            </h3>
            <p className="text-slate-400 text-xs mb-3">
              Reset store inventory and ledger to initial sample items or clear local storage cache.
            </p>

            <button
              onClick={handleResetSystem}
              className="w-full py-2.5 rounded-xl border border-rose-500/40 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 font-semibold transition"
            >
              Reset to Factory Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* Complete System Codes, Paths, Passwords & Domain Master Card */}
      <div className="bg-glass border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                سافٹ ویئر پاتھز، ڈومین، ایڈمن پاسورڈز اور ڈیٹا بیس کوڈز (System Architecture & Credentials)
              </h3>
              <p className="text-[11px] text-slate-400">
                تمام اہم پاسورڈز، فائل پاتھز، لوکل سٹوریج کیز اور فیوچر مینٹیننس کی مکمل گائیڈ
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              handleCopyText(
                `Domain: Haider Pipe And Sanitary Store\nSuper Admin: Haider Ali (PIN: 1234)\nBranch 2 Manager: Hamza Ali (PIN: 2345)\nBranch 3 Manager: Asad Ali (PIN: 3456)\nBranch 1 Cashiers: Ahmad (PIN: 1122), Bilal (PIN: 3344)`,
                "all-creds"
              )
            }
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            {copiedSection === "all-creds" ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === "all-creds" ? "Copied Credentials!" : "Copy All Credentials"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Domain & Super Admin */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Globe className="w-4 h-4" />
              <span>1. Domain & Super Admin</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Domain / Account:</span>
                <span className="font-bold text-slate-200 font-mono">Haider Pipe And Sanitary Store</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Super Admin User:</span>
                <span className="font-bold text-emerald-400">Haider Ali (Owner)</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Admin PIN / Password:</span>
                <span className="font-bold text-amber-400 font-mono">1234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Access Level:</span>
                <span className="text-blue-300 font-semibold">Full Central Control (3 Branches)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Branch Heads & Staff Passwords */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Users className="w-4 h-4" />
              <span>2. Branch Heads & Passwords</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Branch 2 (چھوٹا بھائی):</span>
                <span className="font-bold text-slate-200 font-mono">PIN: 2345 (Hamza Ali)</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Branch 3 (کزن حسد):</span>
                <span className="font-bold text-slate-200 font-mono">PIN: 3456 (Asad Ali)</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Branch 1 Cashier 1:</span>
                <span className="font-bold text-slate-200 font-mono">PIN: 1122 (Ahmad)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Branch 1 Cashier 2:</span>
                <span className="font-bold text-slate-200 font-mono">PIN: 3344 (Bilal)</span>
              </div>
            </div>
          </div>

          {/* Card 3: Storage Keys & File Architecture */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Database className="w-4 h-4" />
              <span>3. Database Storage Keys (LocalStorage)</span>
            </div>
            <div className="space-y-1 text-[10px] font-mono text-slate-300">
              <div className="truncate"><span className="text-slate-500">Products:</span> hps_pos_products_v3</div>
              <div className="truncate"><span className="text-slate-500">Invoices:</span> hps_pos_invoices_v3</div>
              <div className="truncate"><span className="text-slate-500">Khata/Receipts:</span> hps_pos_khata_v3</div>
              <div className="truncate"><span className="text-slate-500">Attendance:</span> hps_pos_attendance_logs_v3</div>
              <div className="truncate"><span className="text-slate-500">WhatsApp:</span> hps_pos_whatsapp_orders_v3</div>
              <div className="truncate"><span className="text-slate-500">Branches:</span> hps_pos_branches_v3</div>
            </div>
          </div>
        </div>

        {/* Source File Tree & Architecture Map */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-bold text-xs">
            <div className="flex items-center gap-2 text-sky-400">
              <FolderTree className="w-4 h-4" />
              <span>System Source Code & Component Directory (پاتھز اور فائل سٹرکچر)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-normal">React 18 + Vite + TypeScript</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px] font-mono">
            <div className="p-2 bg-glass rounded border border-slate-800 text-slate-300">
              <span className="text-blue-400 block font-bold">/src/components/pos/BillingCounter.tsx</span>
              <span className="text-slate-500 text-[9px]">POS Billing & Cash Desk</span>
            </div>
            <div className="p-2 bg-glass rounded border border-slate-800 text-slate-300">
              <span className="text-emerald-400 block font-bold">/src/components/pos/CustomerKhata.tsx</span>
              <span className="text-slate-500 text-[9px]">Party Ledger & Bank Slips</span>
            </div>
            <div className="p-2 bg-glass rounded border border-slate-800 text-slate-300">
              <span className="text-purple-400 block font-bold">/src/components/pos/BranchNetworkManager.tsx</span>
              <span className="text-slate-500 text-[9px]">3 Branches & CCTV Cams</span>
            </div>
            <div className="p-2 bg-glass rounded border border-slate-800 text-slate-300">
              <span className="text-amber-400 block font-bold">/src/components/pos/WhatsAppHub.tsx</span>
              <span className="text-slate-500 text-[9px]">3 WhatsApp Numbers & Orders</span>
            </div>
            <div className="p-2 bg-glass rounded border border-slate-800 text-slate-300">
              <span className="text-indigo-400 block font-bold">/src/components/pos/StaffAttendanceTracker.tsx</span>
              <span className="text-slate-500 text-[9px]">Shop Opening & Login Times</span>
            </div>
            <div className="p-2 bg-glass rounded border border-slate-800 text-slate-300">
              <span className="text-rose-400 block font-bold">/src/components/pos/InvoiceReceiptModal.tsx</span>
              <span className="text-slate-500 text-[9px]">Thermal Bill (No photo, clean header)</span>
            </div>
            <div className="p-2 bg-glass rounded border border-slate-800 text-slate-300">
              <span className="text-cyan-400 block font-bold">/src/utils/posStorage.ts</span>
              <span className="text-slate-500 text-[9px]">Offline Persistence Engine</span>
            </div>
            <div className="p-2 bg-glass rounded border border-slate-800 text-slate-300">
              <span className="text-pink-400 block font-bold">/src/data/posData.ts</span>
              <span className="text-slate-500 text-[9px]">Initial Store & Product Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-slate-100 text-base">Add Counter Operator / Staff</h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              {/* Avatar Selector Gallery */}
              <div>
                <label className="text-slate-300 font-medium block mb-2">Select Staff Picture / Avatar:</label>
                <div className="grid grid-cols-5 gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setNewUserAvatar(preset.url)}
                      className={`relative p-1 rounded-lg transition ${
                        newUserAvatar === preset.url
                          ? "ring-2 ring-blue-500 bg-blue-950/60"
                          : "hover:bg-white/5 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover mx-auto"
                      />
                      <span className="text-[8px] text-center block text-slate-300 truncate mt-0.5">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Staff Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Asif Raza"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                  >
                    <option value="cashier">Cashier (Billing Only)</option>
                    <option value="manager">Manager (Billing & Stock)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Counter Station</label>
                  <input
                    type="text"
                    value={newUserCounter}
                    onChange={(e) => setNewUserCounter(e.target.value)}
                    placeholder="e.g. Counter #1 (Main)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                  />
                </div>
              </div>

              {/* Google-Style Password Option */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserHasPassword}
                      onChange={(e) => setNewUserHasPassword(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-glass border-slate-700 focus:ring-0"
                    />
                    <span className="font-semibold text-slate-200">Require PIN Password (پاسورڈ تحفظ)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {newUserHasPassword ? "Protected" : "No PIN (Direct Login)"}
                  </span>
                </div>

                {newUserHasPassword && (
                  <div>
                    <label className="text-slate-300 text-[11px] block mb-1">4-Digit Security PIN *</label>
                    <div className="relative">
                      <input
                        type={newUserShowPin ? "text" : "password"}
                        required={newUserHasPassword}
                        maxLength={6}
                        value={newUserPin}
                        onChange={(e) => setNewUserPin(e.target.value)}
                        placeholder="e.g. 5566"
                        className="w-full px-3 py-2 bg-glass border border-slate-700 rounded-lg text-slate-100 text-center font-mono text-base tracking-widest outline-none focus:border-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setNewUserShowPin(!newUserShowPin)}
                        className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-200"
                        title={newUserShowPin ? "Hide PIN" : "Show PIN"}
                      >
                        {newUserShowPin ? <EyeOff className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Mobile Phone (Optional)</label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md shadow-blue-600/30"
                >
                  Save & Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-slate-100 text-base">Edit Staff User ({editingUser.name})</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3.5">
              {/* Avatar Selector Gallery */}
              <div>
                <label className="text-slate-300 font-medium block mb-2">Change Profile Picture / Avatar:</label>
                <div className="grid grid-cols-5 gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setEditAvatar(preset.url)}
                      className={`relative p-1 rounded-lg transition ${
                        editAvatar === preset.url
                          ? "ring-2 ring-blue-500 bg-blue-950/60"
                          : "hover:bg-white/5 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover mx-auto"
                      />
                      <span className="text-[8px] text-center block text-slate-300 truncate mt-0.5">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Staff Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                  >
                    <option value="cashier">Cashier (Billing Only)</option>
                    <option value="manager">Manager (Billing & Stock)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Counter Station</label>
                  <input
                    type="text"
                    value={editCounter}
                    onChange={(e) => setEditCounter(e.target.value)}
                    placeholder="e.g. Counter #1"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                  />
                </div>
              </div>

              {/* Google-Style Password Option */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editHasPassword}
                      onChange={(e) => setEditHasPassword(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-glass border-slate-700 focus:ring-0"
                    />
                    <span className="font-semibold text-slate-200">Require PIN Password (پاسورڈ تحفظ)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {editHasPassword ? "PIN Required" : "Password Removed (Quick Login)"}
                  </span>
                </div>

                {editHasPassword && (
                  <div>
                    <label className="text-slate-300 text-[11px] block mb-1">Security PIN *</label>
                    <div className="relative">
                      <input
                        type={editShowPin ? "text" : "password"}
                        required={editHasPassword}
                        maxLength={6}
                        value={editPin}
                        onChange={(e) => setEditPin(e.target.value)}
                        placeholder="e.g. 1234"
                        className="w-full px-3 py-2 bg-glass border border-slate-700 rounded-lg text-slate-100 text-center font-mono text-base tracking-widest outline-none focus:border-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setEditShowPin(!editShowPin)}
                        className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-200"
                        title={editShowPin ? "Hide PIN" : "Show PIN"}
                      >
                        {editShowPin ? <EyeOff className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Mobile Phone (Optional)</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md shadow-blue-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📄 Elegant Complete System User Manual & PDF Printer Modal */}
      {showManualModal && (() => {
        const manualTranslations = {
          ur: {
            title: "حیدر پائپ اینڈ سینیٹری سٹور - آفیشل یوزر دستی گائیڈ",
            subtitle: "خیبر بازار، سیکارنو اسکوائر، پشاور کینٹ | فون: 091-2565800",
            tag1: "ملٹی برانچ نیٹ ورک (3 برانچز)",
            tag2: "ہول سیل اور ریٹیل بلنگ سسٹم",
            introTitle: "تعارف اور سافٹ ویئر کی معلومات",
            introDesc: "یہ سافٹ ویئر حیدر پائپ اینڈ سینیٹری سٹور (پشاور کینٹ) کی روزمرہ بلنگ، تھوک و پرچون سیلز، کسٹمرز کے ادھار کھاتوں اور تمام برانچز کے نیٹ ورک کو سنبھالنے کے لیے ڈیزائن کیا گیا ہے۔ یہ مکمل آف لائن صلاحیت (PWA) رکھتا ہے اور آپ کے فون پر ایپ کی طرح انسٹال ہو جاتا ہے۔",
            sec1Title: "1. روزانہ بلنگ اور سیلز کاؤنٹر",
            sec1Desc1: "طریقہ کار (بل کیسے بنائیں):",
            sec1Steps1: [
              "کاؤنٹر پر بلنگ کیبن منتخب کریں یا لاگ ان کریں۔",
              "سرچ بار میں آئٹم کا نام یا کیٹیگری (PPRC, CP Fittings, Pipe) ٹائپ کریں۔",
              "کارٹ میں آئٹم ایڈ کر کے کوانٹٹی اور رعایت (Discount) درج کریں۔",
              "کسٹمر کا نام، موبائل نمبر اور منتخب برانچ درج کریں۔"
            ],
            sec1Desc2: "ادائیگی کے طریقے:",
            sec1Steps2: [
              "اگر گاہک نقد رقم دے تو Cash Payment پر کلک کریں۔",
              "اگر گاہک بینک یا ایزی پیسہ کے ذریعے آن لائن ادائیگی کرے تو سلپ چیک کریں۔",
              "ادھار کی صورت میں بل خود بخود اس کسٹمر کے کھاتہ لیجر میں منتقل ہو جائے گا۔"
            ],
            sec2Title: "2. سٹاک کنٹرول اور لو-سٹاک الرٹ",
            sec2Desc: "انوینٹری مینیجر میں جاکر آپ نیا سامان شامل کر سکتے ہیں۔ جب بھی کسی سینیٹری آئٹم کا سٹاک اس کی تھریش ہولڈ لمٹ سے کم ہوگا، سافٹ ویئر کے بلنگ پیج کے اوپر خود بخود سرخ رنگ کا الرٹ نظر آئے گا تاکہ نیا مال وقت پر آرڈر کیا جا سکے۔",
            sec2Table: ["رعایت اور تھوک قیمت", "پرچون قیمت", "سٹاک لمٹ الرٹ", "بلک بائنگ پر خود بخود لاگو ہوتی ہے۔", "عام گاہکوں کے لیے سنگل بلنگ ریٹ۔", "سٹاک 10-15 سے کم ہونے پر الرٹ۔"],
            sec3Title: "3. کسٹمر کھاتہ لیجر اور ادھار بک",
            sec3Desc: "حیدر پائپ اینڈ سینیٹری سافٹ ویئر میں تمام گاہکوں کا الگ الگ کھاتہ محفوظ رہتا ہے:",
            sec3Steps: [
              "کسٹمر ٹیب پر جا کر نیا کھاتہ کھولیں اور اس کی ادھار کی لمٹ مقرر کریں۔",
              "جب بھی کوئی بل ادھار پر بنے گا، گاہک کا ٹوٹل بیلنس خود بخود بڑھ جائے گا۔",
              "جب گاہک ادائیگی جمع کروائے، تو کھاتہ میں جا کر ایڈ پیمنٹ کریں اور رسید کی تصویر اپ لوڈ کریں۔",
              "بغیر کسی اضافی چارجز کے کسٹمر کے واٹس ایپ پر لائیو کھاتہ رپورٹ شیئر کریں۔"
            ],
            sec4Title: "4. واٹس ایپ آرڈرنگ ہب",
            sec4Desc: "جب بھی آپ کسی برانچ یا بڑے کسٹمر کے لیے بل تیار کریں گے، آپ ون کلک کے ساتھ کسٹمر کے واٹس ایپ نمبر پر پی ٹی سی ایل ایڈریس اور تمام پروڈکٹس کی لسٹ معہ ٹوٹل بل بھیج سکتے ہیں۔ کسٹمرز بھی براہ راست اپنے واٹس ایپ کے ذریعے انکوائری اور کوٹیشن حاصل کر سکتے ہیں۔",
            sec5Title: "5. برانچ نیٹ ورک اور ڈیٹا بیک اپ تحفظ",
            sec5Steps: [
              "بیک اپ کے تحفظ کے لیے روزانہ کام ختم ہونے پر Settings میں جا کر Export Data Backup پر کلک کریں۔",
              "یہ پورا ڈیٹا ڈیوائس میں محفوظ ہو جائے گا اور کسی بھی دوسری ڈیوائس میں Import کیا جا سکتا ہے۔",
              "تمام 3 برانچز (حیدر علی برانچ، چھوٹا بھائی برانچ اور عباس برانچ) کا ڈیٹا ایک ہی سسٹم سے ٹریک کیا جا سکتا ہے۔"
            ],
            footer: "حیدر پائپ اینڈ سینیٹری سٹور - آفیشل سٹینڈرڈ آپریٹنگ پروسیجرز (SOPs)"
          },
          en: {
            title: "Haider Pipe & Sanitary Store - Official Software Manual & PDF Guide",
            subtitle: "Khyber Bazar, Seikarno Square, Peshawar Cantt | PTCL: 091-2565800",
            tag1: "Multi-Branch Network (3 Branches)",
            tag2: "Wholesale & Retail POS System",
            introTitle: "Introduction & Software Specifications",
            introDesc: "This software is custom designed for Haider Pipe & Sanitary Store (Peshawar Cantt) to manage daily billing, wholesale & retail sales, customer khata ledger balances, and multi-branch network synchronization. It features full offline capability (PWA) and installs on your device instantly.",
            sec1Title: "1. Daily Billing & POS Sales Counter",
            sec1Desc1: "Billing Workflow (How to create an invoice):",
            sec1Steps1: [
              "Select your active billing counter/terminal or sign in.",
              "Search or type items (e.g. PPRC, CP Fittings, PVC Pipes) in the search bar.",
              "Add items to cart, specify quantities, and apply special item-wise discounts.",
              "Enter customer details (name, phone) and select the specific checkout branch."
            ],
            sec1Desc2: "Supported Payment Terms:",
            sec1Steps2: [
              "Cash Payments: Process cash transactions with automatic change calculation.",
              "Bank Transfers / EasyPaisa: Verify receipts using the built-in Online Slip Verifier.",
              "Credit / Udhaar: Balance automatically posts to the customer's active Khata Ledger."
            ],
            sec2Title: "2. Inventory Management & Low-Stock Alerts",
            sec2Desc: "You can seamlessly add, edit or import inventory items inside the Inventory Manager tab. When any item quantity falls below its custom threshold limit, a bright red 'Low Stock Alert' banner appears globally in real-time to prevent supply depletion.",
            sec2Table: ["Wholesale Pricing", "Retail Pricing", "Stock Alert Threshold", "Applied automatically for bulk & contractor orders.", "Standard rate for single client walk-ins.", "Global alert when stock falls below 10-15 pieces."],
            sec3Title: "3. Customer Khata Ledger & Credit Accounts",
            sec3Desc: "Provides direct, robust multi-branch credit accounting for your permanent clients:",
            sec3Steps: [
              "Go to the Customers tab, open a new Khata Account, and specify credit limits.",
              "Whenever a bill is processed under Credit terms, their ledger balance posts instantly.",
              "When a client makes a payment, click 'Add Transaction (Credit Payment)' and upload receipt images.",
              "Share ledger statements instantly to the client's WhatsApp without any cost."
            ],
            sec4Title: "4. Integrated WhatsApp Order Hub",
            sec4Desc: "When an invoice is generated for any contractor or branch, click the 'Send WhatsApp Receipt' button to instantly transmit a fully detailed list of pipes/fittings along with store address, branch number, and total payable amount.",
            sec5Title: "5. Multi-Branch Operations & Local Backups",
            sec5Steps: [
              "To guarantee 100% data preservation, navigate to Settings and tap 'Export Data Backup' daily.",
              "The generated JSON backup is saved locally and can be imported to any other device or tablet.",
              "Manage all 3 retail branches (Haider Ali, Chota Bhai, and Abbas Branch) from one unified platform."
            ],
            footer: "Haider Pipe & Sanitary Store - Official Standard Operating Procedures (SOPs)"
          },
          ps: {
            title: "حیدر پائپ اینڈ سینیٹری سټور - د کارولو رسمي لارښود او پی ډی ایف فایل",
            subtitle: "خیبر بازار، سیکارنو چوک، پیښور کینټ | تلیفون: 091-2565800",
            tag1: "د څو برانچونو شبکه (3 څانګې)",
            tag2: "د عمده او پرچون پلور POS سیسټم",
            introTitle: "پیژندنه او د سافټویر معلومات",
            introDesc: "دا سافټویر په ځانګړي ډول د حیدر پائپ اینڈ سینیٹری سټور (پیښور کینټ) لپاره ډیزاین شوی ترڅو د دایمي بلونو جوړولو، عمده او پرچون پلور، د پورونو حسابونو (کھاتہ) او د ټولو څانګو شبکه په اسانۍ سره تنظیم کړي. دا په موبایل او کمپیوټر کې د اپلیکیشن په څیر انسټال کیږي.",
            sec1Title: "۱. ورځنۍ بلونه او د پلور کاونټر",
            sec1Desc1: "د بل جوړولو طریقه (د بل جوړولو ګامونه):",
            sec1Steps1: [
              "کاونټر غوره کړئ یا خپل حساب ته ننوځئ.",
              "د لټون په ځای کې د توکي نوم یا کټګوري (PPRC, CP Fittings, Pipe) ولیکئ.",
              "په کارټ کې توکي اضافه کړئ، تعداد او تخفیف (Discount) درج کړئ.",
              "د پیرودونکي نوم، موبایل شمیره او اړونده څانګه غوره کړئ."
            ],
            sec1Desc2: "د تادیې طریقې (Payment Terms):",
            sec1Steps2: [
              "که پیرودونکی نغدي پیسې ورکوي نو Cash Payment غوره کړئ.",
              "که تادیه د بانک یا ایزی پیسه له لارې وي، د سلپ تایید کونکی (Online Slip Verifier) وکاروئ.",
              "د پور په حالت کې، بل به په اتوماتیک ډول د پیرودونکي کھاتہ لیجر ته لاړ شي."
            ],
            sec2Title: "۲. د سټاک کنټرول او کم سټاک خبرداری",
            sec2Desc: "تاسو کولی شئ د انوینټري په مدیر کې نوي توکي اضافه کړئ. کله چې هم د کوم توکي مقدار له ټاکلې کچې څخه کم شي، په پاڼه کې په اتوماتیک ډول د سور رنګ خبرداری څرګندیږي ترڅو نوي توکي په وخت واخیستل شي.",
            sec2Table: ["عمده بیه", "پرچون بیه", "د سټاک د کمښت خبرداری", "په عمده یا لوی پیرود باندې پخپله پلي کیږي.", "د عام پیرودونکي لپاره ځانګړی ریټ.", "کله چې د توکو شمیر د ۱۰-۱۵ څخه کم شي الرټ ورکوي."],
            sec3Title: "۳. د پیرودونکو پورونه او د کھاتہ کتاب",
            sec3Desc: "د حیدر پائپ اینڈ سینیٹری سافټویر کې د هر پیرودونکي لپاره جلا حساب خوندي کیږي:",
            sec3Steps: [
              "د Customers په برخه کې نوی حساب پرانیزئ او د پور حد (Credit Limit) وټاکئ.",
              "هرکله چې بل په پور باندې جوړ شي، د پیرودونکي حساب په اتوماتیک ډول اپډیٹ کیږي.",
              "کله چې پیرودونکی پیسې ورکړي، نو 'Add Transaction' باندې کلیک وکړئ او د رسید عکس اپلوډ کړئ.",
              "د پور حساب راپور په وړیا توګه د پیرودونکي واټساپ ته ولیږئ."
            ],
            sec4Title: "۴. د واټساپ د فرمایشونو مرکز",
            sec4Desc: "کله چې تاسو د کوم قراردادي یا څانګې لپاره بل جوړ کړئ، د واټساپ له لارې د ټولو توکو لیست، د سټور پته او ټوله تادیه پدې کلیک سره لیږلی شئ.",
            sec5Title: "۵. د څانګو شبکه او د معلوماتو خوندي کول",
            sec5Steps: [
              "د ډیټا د خوندي کولو لپاره هره ورځ په Settings کې د 'Export Data Backup' څخه کار واخلئ.",
              "دا ډیټا په موبایل یا کمپیوټر کې خوندي کیږي او بل هر وسیله کې اپلوډ کیدی شي.",
              "تاسو کولی شئ د ټولو ۳ برانچونو معلومات له یو ځای څخه وګورئ او کنټرول کړئ."
            ],
            footer: "حیدر پائپ اینڈ سینیٹری سټور - د کار رسمي طریقه او اصول (SOPs)"
          }
        };

        const currentManual = manualTranslations[manualLang] || manualTranslations.ur;

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-8">
              {/* Modal Header with Language Selector inside */}
              <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-slate-100 text-sm">
                    {currentManual.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Interactive Language Selector Pills */}
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                      onClick={() => setManualLang("ur")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${manualLang === 'ur' ? 'bg-emerald-600 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      اردو (Urdu)
                    </button>
                    <button
                      onClick={() => setManualLang("en")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${manualLang === 'en' ? 'bg-emerald-600 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setManualLang("ps")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${manualLang === 'ps' ? 'bg-emerald-600 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      پښتو (Pashto)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print / Save PDF</span>
                    </button>
                    <button
                      onClick={() => setShowManualModal(false)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Scrollable Content / Printable Guide */}
              <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6 printable-manual text-slate-300">
                {/* CSS Print Rules Injected */}
                <style dangerouslySetInnerHTML={{__html: `
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    .printable-manual, .printable-manual * {
                      visibility: visible !important;
                    }
                    .printable-manual {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      color: #000000 !important;
                      background: #ffffff !important;
                      font-family: Arial, sans-serif !important;
                      padding: 0 !important;
                      margin: 0 !important;
                    }
                    .print-card {
                      background: #ffffff !important;
                      border: 1px solid #000000 !important;
                      color: #000000 !important;
                      page-break-inside: avoid !important;
                      margin-bottom: 20px !important;
                      border-radius: 4px !important;
                      padding: 15px !important;
                    }
                    .print-header {
                      border-bottom: 3px double #000000 !important;
                      padding-bottom: 15px !important;
                      margin-bottom: 25px !important;
                    }
                    .print-badge {
                      background: #f1f5f9 !important;
                      border: 1px solid #cbd5e1 !important;
                      color: #000000 !important;
                    }
                    .text-indigo-400, .text-emerald-400, .text-blue-400 {
                      color: #1e3a8a !important;
                      font-weight: bold !important;
                    }
                    h1, h2, h3, h4 {
                      color: #000000 !important;
                    }
                  }
                `}} />

                {/* Title Section */}
                <div className="print-header text-center border-b border-slate-800 pb-5 space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-50 tracking-tight uppercase">
                    {storeName || "HAIDER PIPE AND SANITARY STORE"}
                  </h1>
                  <p className="text-xs text-slate-400 font-semibold tracking-wider">
                    {currentManual.subtitle}
                  </p>
                  <div className="inline-flex gap-2 justify-center pt-2">
                    <span className="print-badge px-3 py-1 bg-blue-900/40 border border-blue-500/20 text-blue-300 font-bold rounded-lg text-[10px]">
                      {currentManual.tag1}
                    </span>
                    <span className="print-badge px-3 py-1 bg-emerald-900/40 border border-emerald-500/20 text-emerald-300 font-bold rounded-lg text-[10px]">
                      {currentManual.tag2}
                    </span>
                  </div>
                </div>

                {/* Guide Contents */}
                <div className="space-y-6">
                  {/* Intro Section */}
                  <div className="print-card bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h2 className="text-base font-bold text-slate-200">
                      {currentManual.introTitle}
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentManual.introDesc}
                    </p>
                  </div>

                  {/* Section 1: Billing */}
                  <div className="print-card bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h3 className="text-sm font-black text-blue-400 flex items-center gap-1">
                      {currentManual.sec1Title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-200">{currentManual.sec1Desc1}</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {currentManual.sec1Steps1.map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-200">{currentManual.sec1Desc2}</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {currentManual.sec1Steps2.map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Inventory */}
                  <div className="print-card bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h3 className="text-sm font-black text-amber-400 flex items-center gap-1">
                      {currentManual.sec2Title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentManual.sec2Desc}
                    </p>
                    <table className="w-full text-left text-[11px] border-collapse border border-slate-800">
                      <thead>
                        <tr className="bg-slate-950/80">
                          <th className="p-1.5 border border-slate-800 text-slate-200">{currentManual.sec2Table[0]}</th>
                          <th className="p-1.5 border border-slate-800 text-slate-200">{currentManual.sec2Table[1]}</th>
                          <th className="p-1.5 border border-slate-800 text-slate-200">{currentManual.sec2Table[2]}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-1.5 border border-slate-800 text-slate-300">{currentManual.sec2Table[3]}</td>
                          <td className="p-1.5 border border-slate-800 text-slate-300">{currentManual.sec2Table[4]}</td>
                          <td className="p-1.5 border border-slate-800 text-slate-300">{currentManual.sec2Table[5]}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section 3: Khata */}
                  <div className="print-card bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h3 className="text-sm font-black text-purple-400 flex items-center gap-1">
                      {currentManual.sec3Title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentManual.sec3Desc}
                    </p>
                    <ul className="list-decimal pl-5 text-xs text-slate-300 space-y-1">
                      {currentManual.sec3Steps.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 4: WhatsApp Hub */}
                  <div className="print-card bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h3 className="text-sm font-black text-emerald-400 flex items-center gap-1">
                      {currentManual.sec4Title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentManual.sec4Desc}
                    </p>
                  </div>

                  {/* Section 5: Security and Backup */}
                  <div className="print-card bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h3 className="text-sm font-black text-indigo-400 flex items-center gap-1">
                      {currentManual.sec5Title}
                    </h3>
                    <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                      {currentManual.sec5Steps.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Document Footer */}
                <div className="pt-6 border-t border-slate-800 text-center text-[10px] text-slate-500 font-bold">
                  <p>{currentManual.footer}</p>
                  <p className="mt-0.5">Printed on: {new Date().toLocaleDateString()} | System Engine Powered by Antigravity OS</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
