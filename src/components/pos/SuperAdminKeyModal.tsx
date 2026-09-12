import React, { useState } from "react";
import { KeyRound, X } from "lucide-react";

interface Props {
  onUnlock: () => void;
}

export function SuperAdminKeyModal({ onUnlock }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple key check
    if (pin === "786") {
      onUnlock();
    } else {
      setError("Invalid Access Key");
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/20 rounded-2xl">
            <KeyRound className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-lg">Secure Access Required</h3>
            <p className="text-xs text-slate-400">Enter Admin Command Key</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-slate-100 focus:outline-none focus:border-amber-500"
            placeholder="Enter Key"
            autoFocus
          />
          {error && <p className="text-rose-400 text-xs text-center font-bold">{error}</p>}
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
