import React, { useEffect, useState } from "react";
import { X, Camera, Keyboard, Search, ScanLine } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useLanguage } from "../../context/LanguageContext";

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const { t } = useLanguage();
  const [manualCode, setManualCode] = useState("");
  const [mode, setMode] = useState<"camera" | "manual">("camera");

  useEffect(() => {
    if (!isOpen || mode !== "camera") return;
    
    // We use a timeout to ensure the "reader" div is mounted
    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 150 } },
        false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          onScan(decodedText);
          onClose();
        },
        (error) => {
          // ignore continuous scanning errors
        }
      );

      return () => {
        try {
          scanner.clear();
        } catch (e) {
          console.error(e);
        }
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, mode, onClose, onScan]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-slate-100">Scan or Search Item</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-4 flex gap-2">
          <button
            onClick={() => setMode("camera")}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition ${
              mode === "camera" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Camera className="w-4 h-4" />
            Camera Scanner
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition ${
              mode === "manual" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual / Hardware Scanner
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 bg-slate-950/50 min-h-[300px] flex flex-col items-center justify-center">
          {mode === "camera" ? (
            <div className="w-full bg-black rounded-xl overflow-hidden border border-slate-800">
              {/* html5-qrcode injects UI here */}
              <div id="reader" className="w-full"></div>
              <style dangerouslySetInnerHTML={{__html: `
                #reader button {
                  background: #2563eb !important;
                  color: white !important;
                  border: none !important;
                  padding: 8px 16px !important;
                  border-radius: 8px !important;
                  font-size: 14px !important;
                  margin: 10px !important;
                  cursor: pointer !important;
                }
                #reader select {
                  background: #1e293b !important;
                  color: white !important;
                  border: 1px solid #334155 !important;
                  padding: 8px !important;
                  border-radius: 8px !important;
                  margin: 10px !important;
                }
                #reader a { color: #60a5fa !important; }
              `}} />
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="w-full flex flex-col gap-4">
              <div className="text-center space-y-1 mb-4">
                <p className="text-slate-300 text-sm">Type item code or use a physical Barcode Scanner.</p>
                <p className="text-slate-500 text-xs">(Hardware scanners will automatically press Enter)</p>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Scan or type barcode..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-blue-500/50 focus:border-blue-500 rounded-xl text-white outline-none shadow-inner text-lg"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition"
              >
                Search Item
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
