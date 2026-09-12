import React, { useState, useEffect } from "react";
import { Mic, MicOff, Camera, Plus, Calculator, ScanLine, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { PosTab } from "./PosHeader";

interface GlobalVoiceCommandProps {
  setActiveTab: (tab: PosTab) => void;
  showToast: (msg: string) => void;
}

export const GlobalVoiceCommand: React.FC<GlobalVoiceCommandProps> = ({
  setActiveTab,
  showToast,
}) => {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let recognition: any = null;
    
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      
      const langMap: Record<string, string> = {
        'en': 'en-US',
        'ur': 'ur-PK',
        'ps': 'ps-AF'
      };
      recognition.lang = langMap[language] || 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Voice Command Received: ", transcript);

        // Comprehensive Tab Navigation Routing Logic
        if (transcript.includes("inventory") || transcript.includes("stock") || transcript.includes("products") || transcript.includes("اسٹاک") || transcript.includes("انوینٹری")) {
          setActiveTab("inventory");
          showToast("🎙️ Navigating to Inventory");
        } 
        else if (transcript.includes("billing") || transcript.includes("invoice") || transcript.includes("cart") || transcript.includes("bill") || transcript.includes("بل") || transcript.includes("نئی رسید")) {
          setActiveTab("billing");
          showToast("🎙️ Navigating to Billing Counter");
        }
        else if (transcript.includes("report") || transcript.includes("sales") || transcript.includes("analytics") || transcript.includes("رپورٹ") || transcript.includes("سیلز")) {
          setActiveTab("reports");
          showToast("🎙️ Navigating to Sales Reports");
        }
        else if (transcript.includes("khata") || transcript.includes("customer") || transcript.includes("ledger") || transcript.includes("udhaar") || transcript.includes("کھاتہ") || transcript.includes("گاہک") || transcript.includes("ادھار")) {
          setActiveTab("khata");
          showToast("🎙️ Navigating to Customer Khata");
        }
        else if (transcript.includes("whatsapp") || transcript.includes("chat") || transcript.includes("واٹس ایپ")) {
          setActiveTab("whatsapp_hub");
          showToast("🎙️ Navigating to WhatsApp Hub");
        }
        else if (transcript.includes("attendance") || transcript.includes("staff") || transcript.includes("حاضری") || transcript.includes("اسٹاف")) {
          setActiveTab("attendance");
          showToast("🎙️ Navigating to Staff Attendance");
        }
        else if (transcript.includes("estimator") || transcript.includes("plumbing") || transcript.includes("calculator") || transcript.includes("AI تخمینہ")) {
          setActiveTab("ai_estimator");
          showToast("🎙️ Navigating to AI Estimator");
        }
        else if (transcript.includes("ai hub") || transcript.includes("gemini") || transcript.includes("smart assistant")) {
          setActiveTab("ai_hub");
          showToast("🎙️ Navigating to AI Hub");
        }
        else if (transcript.includes("export") || transcript.includes("download") || transcript.includes("backup") || transcript.includes("ایکسپورٹ") || transcript.includes("ڈاؤن لوڈ")) {
          setActiveTab("export");
          showToast("🎙️ Navigating to Export Center");
        }
        else if (transcript.includes("expense") || transcript.includes("kharcha") || transcript.includes("خرچہ") || transcript.includes("اخراجات")) {
          setActiveTab("expense_ledger");
          showToast("🎙️ Navigating to Expense Ledger");
        }
        else if (transcript.includes("branch") || transcript.includes("store network") || transcript.includes("برانچ")) {
          setActiveTab("branches");
          showToast("🎙️ Navigating to Branch Network");
        }
        else if (transcript.includes("security") || transcript.includes("motion") || transcript.includes("cctv") || transcript.includes("سیکیورٹی")) {
          setActiveTab("motion_security");
          showToast("🎙️ Navigating to Motion Security");
        }
        else if (transcript.includes("super admin") || transcript.includes("admin dashboard")) {
          setActiveTab("super_admin_dashboard");
          showToast("🎙️ Navigating to Super Admin Dashboard");
        }
        else if (transcript.includes("setting") || transcript.includes("config") || transcript.includes("سیٹنگ")) {
          setActiveTab("settings");
          showToast("🎙️ Navigating to Settings");
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };
    }

    if (isListening && recognition) {
      try {
        recognition.start();
        showToast("🎙️ Voice Assistant Active. Say 'Go to Inventory' or 'New Invoice'");
      } catch (e) {
        console.error(e);
      }
    } else if (!isListening && recognition) {
      try {
        recognition.stop();
      } catch (e) {
        console.error(e);
      }
    }

    return () => {
      if (recognition) {
        recognition.onend = null;
        try {
          recognition.stop();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [isListening, language, setActiveTab, showToast]);

  const toggleListen = () => {
    setIsListening(!isListening);
    if (!isListening) setIsExpanded(false); // Auto-close dock when starting voice
  };

  return (
    <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 flex flex-col-reverse items-center gap-3">
      {/* Main Unified Button */}
      <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-1.5 rounded-full shadow-2xl shadow-blue-900/20">
        
        {/* Scanner / Camera Action */}
        <button
          onClick={() => {
            if (window.location.pathname !== "/inventory" && window.location.pathname !== "/billing") {
              setActiveTab("billing");
            }
            // Add a tiny delay to allow tab switch
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('OPEN_SCANNER'));
            }, 50);
            setIsExpanded(false);
          }}
          className="p-3 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-all group relative"
          title="Scan Barcode"
        >
          <ScanLine className="w-5 h-5" />
          <span className="absolute -top-10 start-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">Scan</span>
        </button>

        {/* Voice Assistant Action (Center Prominent) */}
        <button
          onClick={toggleListen}
          className={`p-3.5 rounded-full transition-all relative ${
            isListening 
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/50 animate-pulse scale-105" 
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40"
          }`}
          title={isListening ? "Stop Voice Assistant" : "Voice Assistant"}
        >
          {isListening ? <Mic className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          
          {isListening && (
            <span className="absolute -top-1 -end-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          )}
        </button>

        {/* Expand Tools / Quick Add Action */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-3 rounded-full transition-all group relative ${isExpanded ? "bg-slate-800 text-white" : "hover:bg-slate-800 text-slate-300 hover:text-white"}`}
          title="More Actions"
        >
          {isExpanded ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span className="absolute -top-10 start-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">Tools</span>
        </button>
      </div>

      {/* Expanded Tools Menu */}
      {isExpanded && (
        <div className="flex bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-2 rounded-2xl shadow-2xl shadow-blue-900/20 gap-2 animate-in slide-in-from-bottom-5">
          <button
            onClick={() => {
              setActiveTab("ai_estimator");
              setIsExpanded(false);
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition min-w-[72px]"
          >
            <Calculator className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-semibold tracking-wide">Estimator</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab("billing");
              setIsExpanded(false);
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition min-w-[72px]"
          >
            <Plus className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-semibold tracking-wide">New Bill</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("inventory");
              setIsExpanded(false);
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition min-w-[72px]"
          >
            <Camera className="w-5 h-5 text-purple-400" />
            <span className="text-[10px] font-semibold tracking-wide">Add Item</span>
          </button>
        </div>
      )}
    </div>
  );
};
