import React, { useState } from 'react';
import { Volume2, Settings } from 'lucide-react';

export const BranchCommunicationHub = ({ 
  isEnabled, 
  onTrigger 
}: { 
  isEnabled: boolean; 
  onTrigger?: () => void; 
}) => {
  const [greeting, setGreeting] = useState("Welcome to Haider Sanitary. خوش آمدید، حیدر سینیٹری میں آپ کی کیا مدد کر سکتے ہیں؟");

  const triggerGreeting = () => {
    if (!isEnabled) return;
    const utterance = new SpeechSynthesisUtterance(greeting);
    utterance.lang = "ur-PK";
    window.speechSynthesis.speak(utterance);
    if (onTrigger) onTrigger();
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-3">
      <div className="flex items-center gap-2 text-slate-300">
        <Volume2 className="w-4 h-4" />
        <h3 className="font-bold text-sm">Automated Voice Greeting</h3>
      </div>
      
      <div className="space-y-1">
        <label className="text-xs text-slate-500 font-medium">Custom Greeting Message</label>
        <textarea
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm outline-none focus:border-blue-500"
          rows={2}
        />
      </div>

      <button
        onClick={triggerGreeting}
        disabled={!isEnabled}
        className={`w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition ${
          isEnabled
            ? "bg-blue-600 text-white hover:bg-blue-500"
            : "bg-slate-800 text-slate-500 cursor-not-allowed"
        }`}
      >
        <Volume2 className="w-4 h-4" />
        <span>Test Greeting</span>
      </button>
    </div>
  );
};
