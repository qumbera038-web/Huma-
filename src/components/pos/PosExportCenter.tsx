import React, { useState } from "react";
import { 
  Download, 
  Smartphone, 
  Package, 
  Database, 
  CheckCircle2, 
  Printer, 
  FileDown, 
  QrCode, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  HardDrive, 
  Wifi, 
  Sparkles,
  Layers,
  Globe
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { exportAllDataBackup, getLastDataSaveTime } from "../../utils/posStorage";
import { StoreSettings } from "../../types";

interface PosExportCenterProps {
  settings: StoreSettings;
  onOpenInstallModal?: () => void;
}

export const PosExportCenter: React.FC<PosExportCenterProps> = ({ settings, onOpenInstallModal }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const appUrl = typeof window !== "undefined" ? window.location.href : "https://ais-pre-gkemaqvfv3wdjnmzokoxzv-266806882346.asia-southeast1.run.app";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleTriggerDownload = (fileName: string) => {
    setDownloadSuccess(fileName);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-sans">
      {/* 🚀 MASTER 1-CLICK BUNDLE (Requested by User for "Easy" experience) */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-800 p-6 rounded-3xl shadow-2xl border-4 border-white/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute -top-10 -start-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -end-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-start">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-1 flex items-center justify-center sm:justify-start gap-3">
              <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
              <span>ماسٹر ڈائریکٹ انسٹال (1-Click)</span>
            </h2>
            <p className="text-sm sm:text-base text-blue-100 font-bold leading-tight">
              اسی ایک بٹن سے سب کچھ ڈاؤن لوڈ اور انسٹال کریں — آسان اور تیز ترین طریقہ!
            </p>
            <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white/80 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Android APK + Code + Manual
              </span>
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white/80 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Latest Stable Version
              </span>
            </div>
          </div>

          <a
            href="/download/bundle"
            download="haider_sanitary_master_bundle.tar.gz"
            onClick={() => handleTriggerDownload("Master Bundle (APK + Code + Manual)")}
            className="w-full sm:w-auto px-10 py-5 bg-white text-blue-800 hover:bg-amber-400 hover:text-slate-900 font-black text-lg rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-900/40 active:scale-95 group-hover:scale-105"
          >
            <Download className="w-7 h-7" />
            <div className="text-start">
              <div className="text-[10px] uppercase font-black opacity-70 leading-none mb-1">Direct Install</div>
              <div className="leading-none">ڈاؤن لوڈ کریں</div>
            </div>
          </a>
        </div>
      </div>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/40 p-4 sm:p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 end-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20 font-black shrink-0">
              <Download className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Export & Downloads Hub
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30">
                  ایکسپورٹ اور ڈاؤن لوڈ سینٹر
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                QumberSanitary POS • Direct 1-File Standalone App, 1 Android APK, Full Source & Khata Backups
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                exportAllDataBackup();
                handleTriggerDownload("All Store Data Backup (JSON)");
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-2 transition shadow-sm"
            >
              <Database className="w-4 h-4 text-purple-400" />
              <span>Backup Store Data (JSON)</span>
            </button>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center gap-2.5 shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>✅ Download started for <strong>{downloadSuccess}</strong>! Check your mobile downloads.</span>
        </div>
      )}

      {/* Main 2 Highlighted Cards: 1 APK & 1 Single-File */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: 1 Android APK Package */}
        <div className="bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="absolute top-3 end-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 uppercase tracking-wider shadow-md">
              Android APK 📱
            </span>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>1. Android APK Package</span>
              </h2>
              <span className="text-xs font-mono text-amber-400 font-bold block mt-0.5">
                📁 haider_sanitary_pos.apk (~1.4 MB)
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              اینڈرائیڈ موبائل اور ٹیبلٹ کے لیے تیار شدہ مکمل انسٹالیشن فائل۔ اس میں کیمرہ بارکوڈ سکینر، تھرمل پرنٹر اور زیرو ڈیٹا لاس انجن شامل ہے۔
            </p>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Zero Data Loss (ڈیٹا ہمیشہ فون کی میموری میں محفوظ رہتا ہے)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Offline Support (انٹرنیٹ بند ہونے پر بھی چلے گا)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Thermal Printer & Barcode Scanner Ready</span>
              </div>
            </div>
          </div>

          <div className="pt-5 space-y-2">
            {onOpenInstallModal && (
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 transition shadow-xl shadow-amber-500/30 active:scale-98 cursor-pointer animate-pulse"
              >
                <Smartphone className="w-5 h-5 text-slate-950" />
                <span>📲 فون میں ڈائریکٹ انسٹال کریں (1-Click Install)</span>
              </button>
            )}

            <a
              href="/download/apk"
              onClick={() => handleTriggerDownload("haider_sanitary_pos.apk")}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition border border-amber-500/30 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>یا APK فائل ڈاؤن لوڈ کریں (.apk)</span>
            </a>
          </div>
        </div>

        {/* Card 2: 1 Single Standalone Offline HTML File */}
        <div className="bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="absolute top-3 end-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 uppercase tracking-wider shadow-md">
              1-File Standalone ⚡
            </span>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg">
              <Download className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>2. Single Standalone File</span>
              </h2>
              <span className="text-xs font-mono text-emerald-400 font-bold block mt-0.5">
                📁 haider_sanitary_pos_single_file.html (~2.9 MB)
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ایک ہی سنگل فائل میں مکمل POS سسٹم (ساری اسٹائلنگ، سکرپٹس، آئیکونز اور لوکل ڈیٹا بیس) بند ہے۔ کمپیوٹر یا موبائل کے کسی بھی براؤزر میں ڈبل کلک کر کے چلائیں۔
            </p>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>No Web Server Needed (سرور یا نوڈ کی کوئی ضرورت نہیں)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>100% Offline (بغیر وائی فائی یا انٹرنیٹ کے چلے گا)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Works on Windows, Mac, Android & Tablets</span>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <a
              href="/download/single-file"
              onClick={() => handleTriggerDownload("haider_sanitary_pos_single_file.html")}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 transition shadow-xl shadow-emerald-900/40 active:scale-98 cursor-pointer"
            >
              <Download className="w-5 h-5 text-white" />
              <span>Download 1 File Standalone (.html)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Secondary Row: Full Source ZIP, PDF Guide, Summary & Chrome WebAPK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Full Source Code ZIP */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm">3. Source Code (Archive)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                مکمل سورس کوڈ محفوظ آرکائیو۔
              </p>
              <span className="text-[10px] text-blue-400 font-mono mt-1 block">
                📁 haider_sanitary_pos_source.tar.gz (~4.3 MB)
              </span>
            </div>
          </div>

          <a
            href="/download/source-zip"
            onClick={() => handleTriggerDownload("haider_sanitary_pos_source.tar.gz")}
            className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Download Source (.tar.gz)</span>
          </a>
        </div>

        {/* Complete PDF Manual Card */}
        <div className="bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/40 p-4 rounded-3xl shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm">4. مکمل PDF کتابچہ (0 سے آج تک)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                مکمل کوڈ، آرکیٹیکچر، انسٹالیشن اور ہوسٹنگ گائیڈ کا پرنٹ ایبل پی ڈی ایف۔
              </p>
              <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                📄 haider_sanitary_complete_documentation.pdf
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <a
              href="/download/docs"
              onClick={() => handleTriggerDownload("haider_sanitary_complete_documentation.pdf")}
              className="w-full py-2 px-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-rose-900/30 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF (.pdf)</span>
            </a>

            <a
              href="/haider_sanitary_master_manual_printable.html"
              target="_blank"
              rel="noreferrer"
              className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 transition border border-rose-500/30"
            >
              <Printer className="w-3 h-3 text-rose-400" />
              <span>براؤزر پرنٹ بک (Printable HTML)</span>
            </a>
          </div>
        </div>

        {/* Master Day 0 Till Today Code Book File */}
        <div className="bg-slate-900/90 border border-amber-500/30 p-4 rounded-3xl shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm">5. شروع تا آج مکمل کوڈ بک</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ہر ماڈیول اور کوڈ کی لائن بہ لائن تشریح اردو و انگلش میں۔
              </p>
              <span className="text-[10px] text-amber-400 font-mono mt-1 block">
                📄 MASTER_CODE_DAY_0_TO_TODAY.md
              </span>
            </div>
          </div>

          <a
            href="/download/master-book"
            onClick={() => handleTriggerDownload("HAIDER_SANITARY_COMPLETE_CODE_FROM_DAY_0_TILL_TODAY.md")}
            className="w-full py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-amber-500/40"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download Master Book (.md)</span>
          </a>
        </div>

        {/* Chrome Direct Install Method */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm">6. Chrome WebAPK (1-Click)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                کروم کے ۳ نقطوں پر کلک کر کے <strong>"Install app"</strong> دبائیں۔
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-300 select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg transition shrink-0 flex items-center gap-1"
            >
              {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUrl ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code and Mobile Scanner Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-start">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 justify-center sm:justify-start">
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>موبائل سے کیو آر کوڈ اسکین کریں (Scan to Open on Android)</span>
          </h3>
          <p className="text-xs text-slate-400">
            اپنے فون کے کیمرے سے یہ کوڈ اسکین کر کے فوراً QumberSanitary POS کھولیں اور انسٹال کریں۔
          </p>
        </div>

        <div className="p-2.5 bg-white rounded-2xl shadow-xl shrink-0">
          <QRCodeSVG value={appUrl} size={110} />
        </div>
      </div>

      {/* Dedicated Hosting & Custom Domain Hub */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-blue-500/40 p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>🌐 مفت ہوسٹنگ اور کسٹم ڈومین (Custom URL & Free Hosting)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">Ready to Deploy</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                پروجیکٹ میں Vercel اور Netlify کی تمام تیار فائلیں شامل ہیں
              </p>
            </div>
          </div>

          <a
            href="/download/hosting-guide"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ڈومین گائیڈ ڈاؤن لوڈ کریں (.md)</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 text-xs">
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 text-xs">⚡ Vercel (مفت و تیز ترین)</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md font-bold">Free 24/7</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              `vercel.json` فائل تیار ہے۔ صرف پروجیکٹ امپورٹ کریں اور ۱ منٹ میں لائیو۔
            </p>
            <span className="text-[10px] text-slate-400 font-mono block">
              haidersanitary.vercel.app
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-400 text-xs">🚀 Netlify (ڈریگ اینڈ ڈراپ)</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-teal-500/20 text-teal-400 rounded-md font-bold">Drag & Drop</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              `dist` فولڈر کو Netlify پر ڈراپ کریں اور ویب سائٹ فوراً چل پڑے گی۔
            </p>
            <span className="text-[10px] text-slate-400 font-mono block">
              haidersanitary.netlify.app
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-400 text-xs">🏷️ اپنی ڈاٹ کام ڈومین</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-md font-bold">Custom URL</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              `haidersanitary.com` یا `haidersanitary.pk` کو 2 منٹ میں DNS سے جوڑیں۔
            </p>
            <span className="text-[10px] text-emerald-400 font-mono block">
              CNAME: cname.vercel-dns.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
