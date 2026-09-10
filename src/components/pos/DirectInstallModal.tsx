import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Share2, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight
} from "lucide-react";

interface DirectInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onPromptTriggered?: () => void;
}

export const DirectInstallModal: React.FC<DirectInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onPromptTriggered
}) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [installStep, setInstallStep] = useState<"ready" | "prompted" | "guide">("ready");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running as installed standalone app
    const checkStandalone = () => {
      const isPWA = window.matchMedia("(display-mode: standalone)").matches || 
                    (window.navigator as any).standalone === true;
      setIsStandalone(isPWA);
    };
    checkStandalone();
  }, []);

  if (!isOpen) return null;

  const handleTriggerNativeInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          setIsInstalled(true);
          setInstallStep("prompted");
        }
        if (onPromptTriggered) onPromptTriggered();
      } catch (err) {
        setInstallStep("guide");
      }
    } else {
      // Show direct guide
      setInstallStep("guide");
    }
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Glowing Accent */}
        <div className="bg-gradient-to-r from-amber-600/30 via-slate-900 to-emerald-600/30 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 font-black">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <span>موبائل میں براہِ راست انسٹال کریں</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">1-Click Auto Install</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Directly install QumberSanitary POS on your Android Phone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status Banner */}
          {isStandalone ? (
            <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-xs">مبارک ہو! یہ ایپ پہلے ہی انسٹال شدہ ہے</p>
                <p className="text-[10px] text-emerald-400/80">آپ اسے بغیر انٹرنیٹ کے لائف ٹائم استعمال کر سکتے ہیں۔</p>
              </div>
            </div>
          ) : null}

          {/* Primary Action Card: 1-Click Native Android Install */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900/90 border border-amber-500/50 p-4 rounded-2xl shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                طریقہ نمبر ۱: ڈائریکٹ ون کلک انسٹالیشن
              </span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                بہترین طریقہ ⚡
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              نیچے دیے گئے بٹن پر کلک کرنے پر آپ کے موبائل کی سکرین پر <strong>"Install"</strong> کا آپشن آئے گا، بس اسے دبائیں اور ایپ موبائل کی ہوم سکرین پر لگ جائے گی:
            </p>

            <button
              onClick={handleTriggerNativeInstall}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition transform active:scale-98 cursor-pointer"
            >
              <Smartphone className="w-5 h-5 text-slate-950" />
              <span>فون میں ابھی انسٹال کریں (Install to Phone Now)</span>
            </button>
          </div>

          {/* Visual Step-by-Step Guide for Chrome / Android */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>طریقہ نمبر ۲: گوگل کروم مینو سے (۲ سیکنڈ کا طریقہ)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col items-center text-center space-y-1">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">1</span>
                <span className="font-bold text-slate-200 text-xs">اوپر ۳ نقطے دبائیں</span>
                <span className="text-[10px] text-slate-400">کروم میں اوپر کونے میں <strong>(⋮)</strong> دبائیں</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col items-center text-center space-y-1">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">2</span>
                <span className="font-bold text-slate-200 text-xs">"Install app" دبائیں</span>
                <span className="text-[10px] text-slate-400">مینو میں <strong>"Install app"</strong> پر کلک کریں</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col items-center text-center space-y-1">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">3</span>
                <span className="font-bold text-slate-200 text-xs">موبائل میں محفوظ</span>
                <span className="text-[10px] text-slate-400">ایپ ہوم سکرین پر بن جائے گی</span>
              </div>
            </div>

            {/* If inside preview iframe button */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400">اگر اوپر دیا گیا بٹن کام نہ کرے تو نئی ونڈو میں کھولیں:</span>
              <button
                onClick={handleOpenInNewTab}
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-blue-500/30 transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Full Browser (نئی ونڈو میں کھولیں)</span>
              </button>
            </div>
          </div>

          {/* Direct APK Installation Note */}
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-200 text-xs">
                ڈاؤن لوڈ شدہ APK فائل کو انسٹال کرنے کا طریقہ:
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                جب آپ نے <strong>`haider_sanitary_pos.apk`</strong> ڈاؤن لوڈ کر لی ہے، تو فون کے نوٹیفکیشن میں <strong>"Open"</strong> پر کلک کریں، اور سکرین پر آنے والے <strong>"Install"</strong> کے بٹن کو دبا دیں۔
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>۱۰۰٪ ڈیٹا تحفظ - فون میں ہمیشہ کے لیے محفوظ</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
          >
            بند کریں (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
