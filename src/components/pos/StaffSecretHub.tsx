import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  ShieldCheck, 
  User, 
  Users, 
  Search, 
  Mic, 
  Image as ImageIcon, 
  FileText, 
  Lock, 
  Wifi, 
  Clock, 
  CheckCheck,
  Smartphone,
  MapPin,
  ArrowLeft,
  X,
  Volume2,
  MicOff,
  VideoOff,
  PhoneOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserAccount, 
  StaffMessage, 
  StaffPresence, 
  UserRole, 
  MessageType, 
  Branch, 
  StoreSettings 
} from "../../types";

interface StaffSecretHubProps {
  activeUser: UserAccount;
  allUsers: UserAccount[];
  messages: StaffMessage[];
  branches: Branch[];
  onSendMessage: (msg: Omit<StaffMessage, "id" | "timestamp">) => void;
}

export const StaffSecretHub: React.FC<StaffSecretHubProps> = ({
  activeUser,
  allUsers,
  messages,
  branches,
  onSendMessage
}) => {
  const [inputText, setInputText] = useState("");
  const [activeChat, setActiveChat] = useState<"group" | string>("group"); // "group" or userId
  const [showMemberInfo, setShowMemberInfo] = useState(false);
  const [callingState, setCallingState] = useState<{
    isActive: boolean;
    type: "voice" | "video";
    target: UserAccount | null;
    status: "calling" | "connected" | "ended";
    duration: number;
  }>({
    isActive: false,
    type: "voice",
    target: null,
    status: "calling",
    duration: 0
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  // Handle call duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callingState.status === "connected") {
      timer = setInterval(() => {
        setCallingState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callingState.status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    onSendMessage({
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      text: inputText,
      type: "text",
      branchId: activeUser.branchId || "branch-1",
      isSecret: true
    });

    setInputText("");
  };

  const startCall = (target: UserAccount, type: "voice" | "video") => {
    setCallingState({
      isActive: true,
      type,
      target,
      status: "calling",
      duration: 0
    });

    // Simulate answer after 2 seconds
    setTimeout(() => {
      setCallingState(prev => ({ ...prev, status: "connected" }));
    }, 2500);
  };

  const endCall = () => {
    setCallingState(prev => ({ ...prev, status: "ended" }));
    setTimeout(() => {
      setCallingState({
        isActive: false,
        type: "voice",
        target: null,
        status: "calling",
        duration: 0
      });
    }, 1500);
  };

  const filteredMessages = activeChat === "group" 
    ? messages 
    : messages.filter(m => (m.senderId === activeUser.id && m.text.includes(`@${activeChat}`)) || (m.senderId === activeChat));

  const getRoleBadge = (role: UserRole) => {
    const roles: Record<string, { label: string; color: string }> = {
      branch_owner: { label: "برانچ اونر", color: "bg-red-500/20 text-red-400 border-red-500/40" },
      manager: { label: "مینجر", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40" },
      bill_maker: { label: "بل میکر", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
      cashier: { label: "کیشیئر", color: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
      stock_manager: { label: "اسٹاک مینجر", color: "bg-blue-500/20 text-blue-400 border-blue-500/40" },
      driver: { label: "ڈرائیور", color: "bg-slate-500/20 text-slate-400 border-slate-500/40" },
      helper: { label: "ہیلپر", color: "bg-gray-500/20 text-gray-400 border-gray-500/40" },
      admin: { label: "ایڈمن", color: "bg-purple-500/20 text-purple-400 border-purple-500/40" }
    };

    const config = roles[role] || { label: role, color: "bg-slate-500/20 text-slate-400 border-slate-500/40" };
    return <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${config.color}`}>{config.label}</span>;
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-slate-950 text-slate-200 overflow-hidden rounded-2xl border border-slate-800 shadow-2xl relative">
      
      {/* 📱 Calling Overlay */}
      <AnimatePresence>
        {callingState.isActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-between py-20 px-6 overflow-hidden"
          >
            {/* Background blur effect */}
            <div className="absolute inset-0 opacity-20">
              <img 
                src={callingState.target?.avatarUrl} 
                className="w-full h-full object-cover blur-3xl scale-150" 
                alt="blur"
              />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
                <img 
                  src={callingState.target?.avatarUrl} 
                  className="w-32 h-32 rounded-full border-4 border-indigo-500/30 object-cover shadow-2xl" 
                  alt="Caller"
                />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-1">{callingState.target?.name}</h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {getRoleBadge(callingState.target?.role || "helper")}
                  <span className="text-slate-400 text-sm">{callingState.target?.branchName}</span>
                </div>
                <p className="text-indigo-400 font-medium animate-pulse">
                  {callingState.status === "calling" ? "رابطہ ہو رہا ہے (Calling...)" : callingState.status === "connected" ? formatDuration(callingState.duration) : "کال ختم ہو گئی (Call Ended)"}
                </p>
              </div>
            </div>

            {callingState.type === "video" && callingState.status === "connected" && (
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1512428559087-560ad51ba42b?w=800&auto=format&fit=crop&q=80" 
                  className="w-full h-full object-cover opacity-60" 
                  alt="Video Feed"
                />
                <div className="absolute bottom-32 right-6 w-32 h-44 rounded-xl border-2 border-white/20 bg-slate-800 overflow-hidden shadow-2xl">
                   {/* Self Preview */}
                   <img 
                    src={activeUser.avatarUrl} 
                    className="w-full h-full object-cover" 
                    alt="Self"
                  />
                </div>
              </div>
            )}

            <div className="relative z-10 flex items-center gap-8">
              <button className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors">
                <MicOff className="w-6 h-6" />
              </button>
              <button 
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-500 transition-all shadow-xl shadow-red-600/30 active:scale-95"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
              <button className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors">
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🗄️ Sidebar - Members List */}
      <div className="w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>اسٹاف سیکرٹ ہب</span>
            </h2>
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
               <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Secure</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="اسٹاف ممبر تلاش کریں..." 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Main Group Chat */}
          <button 
            onClick={() => setActiveChat("group")}
            className={`w-full p-4 flex items-center gap-3 border-b border-slate-800 transition-colors ${activeChat === "group" ? "bg-indigo-500/10 border-l-4 border-l-indigo-500" : "hover:bg-slate-800/50"}`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-sm text-slate-100">مین اسٹاف گروپ</span>
                <span className="text-[10px] text-slate-500 font-mono">LIVE</span>
              </div>
              <p className="text-xs text-slate-400 truncate">تمام برانچز کا خفیہ رابطہ مرکز</p>
            </div>
          </button>

          {/* Members by Branch */}
          {branches.map(branch => (
            <div key={branch.id} className="mt-4">
              <div className="px-4 py-2 bg-slate-800/30 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>{branch.shortName}</span>
              </div>
              {allUsers.filter(u => u.branchId === branch.id).map(user => (
                <button 
                  key={user.id}
                  onClick={() => setActiveChat(user.id)}
                  className={`w-full p-3 flex items-center gap-3 transition-colors ${activeChat === user.id ? "bg-indigo-500/10 border-l-4 border-l-indigo-500" : "hover:bg-slate-800/50"}`}
                >
                  <div className="relative">
                    <img src={user.avatarUrl} className="w-10 h-10 rounded-full border border-slate-700 object-cover" alt={user.name} />
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${Math.random() > 0.3 ? "bg-emerald-500" : "bg-slate-500"}`} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[13px] text-slate-200 truncate">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Current User Info Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <img src={activeUser.avatarUrl} className="w-10 h-10 rounded-full border border-indigo-500/40" alt={activeUser.name} />
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-white truncate">{activeUser.name}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Online & Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 💬 Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950 relative">
        
        {/* Chat Header */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {activeChat === "group" ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">تمام اسٹاف گروپ (خفیہ چیٹ)</h3>
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>END-TO-END ENCRYPTED</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <img 
                  src={allUsers.find(u => u.id === activeChat)?.avatarUrl} 
                  className="w-10 h-10 rounded-full border border-slate-700" 
                  alt="Chat"
                />
                <div>
                  <h3 className="font-bold text-slate-100">{allUsers.find(u => u.id === activeChat)?.name}</h3>
                  <p className="text-[10px] text-slate-400">گزشتہ ظہور: 5 منٹ پہلے</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => {
                const target = activeChat === "group" ? allUsers[0] : allUsers.find(u => u.id === activeChat);
                if (target) startCall(target, "voice");
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button 
               onClick={() => {
                const target = activeChat === "group" ? allUsers[0] : allUsers.find(u => u.id === activeChat);
                if (target) startCall(target, "video");
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Video className="w-5 h-5" />
            </button>
            <div className="w-[1px] h-6 bg-slate-800 mx-2" />
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          <div className="flex justify-center">
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-4 py-1.5 flex items-center gap-2">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">یہ چیٹ مکمل طور پر محفوظ اور خفیہ ہے</span>
            </div>
          </div>

          {filteredMessages.map((msg, idx) => {
            const isMe = msg.senderId === activeUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {!isMe && (
                    <img 
                      src={allUsers.find(u => u.id === msg.senderId)?.avatarUrl} 
                      className="w-8 h-8 rounded-full border border-slate-700 shrink-0 mt-1" 
                      alt="Avatar"
                    />
                  )}
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-400">{msg.senderName}</span>
                        {getRoleBadge(msg.senderRole)}
                      </div>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl shadow-lg relative ${
                      isMe 
                        ? "bg-indigo-600 text-white rounded-tr-none" 
                        : "bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                        <span className="text-[9px] opacity-60 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <CheckCheck className="w-3 h-3 opacity-60" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800">
          <div className="max-w-4xl mx-auto flex items-end gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-xl">
            <div className="flex items-center gap-1 pb-1 pl-1">
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <Mic className="w-5 h-5" />
              </button>
            </div>
            
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="پیغام لکھیں..."
              rows={1}
              className="flex-1 bg-transparent border-none text-slate-100 text-sm focus:ring-0 resize-none py-2 px-2 custom-scrollbar max-h-32 text-right"
              style={{ direction: 'rtl' }}
            />

            <div className="flex items-center gap-1 pb-1 pr-1">
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  inputText.trim() 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-100 active:scale-90" 
                    : "bg-slate-800 text-slate-500 scale-95"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              تمام ڈیٹا حیدر سینیٹری برانچز کے درمیان اینڈ-ٹو-اینڈ اینکرپٹڈ ہے
            </span>
          </div>
        </div>
      </div>

      {/* CSS for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

// Internal utility component for Plus icon (was missing from lucide-react imports in my head)
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
