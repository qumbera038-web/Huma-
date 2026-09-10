import React, { useState } from "react";
import { WhatsAppOrder, Branch, StoreSettings, UserAccount } from "../../types";
import {
  MessageSquare,
  Send,
  Phone,
  Building2,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  Share2,
  Globe,
  Youtube,
  Instagram,
  Facebook,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  UserCheck,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Lock,
  RefreshCw
} from "lucide-react";

interface WhatsAppHubProps {
  branches: Branch[];
  activeBranchId: string;
  whatsappOrders: WhatsAppOrder[];
  onUpdateOrders: (orders: WhatsAppOrder[]) => void;
  settings: StoreSettings;
  activeUser: UserAccount;
}

export const WhatsAppHub: React.FC<WhatsAppHubProps> = ({
  branches,
  activeBranchId,
  whatsappOrders,
  onUpdateOrders,
  settings,
  activeUser,
}) => {
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewOrderModal, setShowNewOrderModal] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // New Order Form State
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [targetBranchId, setTargetBranchId] = useState(branches[0]?.id || "branch-1");
  const [orderItemsText, setOrderItemsText] = useState("");
  const [orderEstTotal, setOrderEstTotal] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState("");

  // Secret Staff Group Chat States
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    senderName: string;
    senderRole: string;
    message: string;
    time: string;
    branchName: string;
    isSelf?: boolean;
  }>>([
    {
      id: "m1",
      senderName: "Hamza Ali (چھوٹا بھائی)",
      senderRole: "Branch 2 Manager",
      message: "السلام علیکم بھائی! برانچ 2 کے گودام میں 3-inch اور 4-inch کے PPRC نپل اور البو بالکل فریش اسٹاک میں موجود ہیں۔",
      time: "10:30 AM",
      branchName: "Branch 2 - City Market Outlet"
    },
    {
      id: "m2",
      senderName: "Asad Ali (کزن)",
      senderRole: "Branch 3 Manager",
      message: "جی برانچ 3 میں بھی پورٹا کا کموڈ اور فینسی فٹنگز کے 5 سیٹ دستیاب ہیں، اگر کسی کو ارجنٹ ضرورت ہو تو بتا دیں۔ کسٹمر کو شک نہیں ہونا چاہیے! 👍",
      time: "11:15 AM",
      branchName: "Branch 3 - Highway Bypass"
    },
  ]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingSender, setTypingSender] = useState("");

  const handleSendGroupMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const userMsg = {
      id: `msg-${Date.now()}`,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      message: newMessageText.trim(),
      time: timeStr,
      branchName: "Branch 1 - Main Head Office",
      isSelf: true
    };

    setChatMessages(prev => [...prev, userMsg]);
    const originalQuery = newMessageText.trim();
    setNewMessageText("");

    // Simulate smart auto-reply
    setIsTyping(true);
    setTypingSender(Math.random() > 0.5 ? "Hamza Ali (Branch 2)" : "Asad Ali (Branch 3)");

    setTimeout(() => {
      let replyMsg = "جی بھائی! ہمارے پاس یہ آئٹم ابھی اسٹاک میں دستیاب ہے۔ آپ کسٹمر کو بٹھائیں، میں فورا اپنے بائیک سوار (Rider) کے ہاتھ چپکے سے بھجواتا ہوں تاکہ کسٹمر کو پتا نہ چلے۔ 🤫🏍️";
      
      const lowerQuery = originalQuery.toLowerCase();
      if (lowerQuery.includes("pipe") || lowerQuery.includes("پائپ") || lowerQuery.includes("fittings") || lowerQuery.includes("فٹنگ")) {
        replyMsg = "جی بالکل بھائی! پائپ اور فینسی فٹنگز کا سارا سامان برانچ 2 کے گودام میں موجود ہے۔ میں فورا اپنے لڑکے کے ہاتھ بھجوا رہا ہوں، کسٹمر کو بولیں 'گودام سے مال لوڈ ہو رہا ہے'۔ 😉";
      } else if (lowerQuery.includes("commode") || lowerQuery.includes("کموڈ") || lowerQuery.includes("porta") || lowerQuery.includes("پورٹا")) {
        replyMsg = "برانچ 3 (Bypass) میں پورٹا کا لگژری وائٹ کموڈ ابھی دستیاب ہے! میں فورا کارگو یا رکشہ کروا کر 10 منٹ میں بھجواتا ہوں، آپ بل بنا لیں کسٹمر کا۔ کسٹمر کو بولیں گودام سے آ رہا ہے۔";
      } else if (lowerQuery.includes("sanitary") || lowerQuery.includes("سینیٹری")) {
        replyMsg = "سینیٹری مکسر سیٹ اور سنک مکسر برانچ 2 میں موجود ہیں۔ کسٹمر کو پتا نہ چلے، میں سادے ڈبے میں بند کر کے لڑکے کو روانہ کر رہا ہوں۔ 👍";
      }

      const botMsg = {
        id: `msg-bot-${Date.now()}`,
        senderName: Math.random() > 0.5 ? "Hamza Ali (چھوٹا بھائی)" : "Asad Ali (کزن)",
        senderRole: Math.random() > 0.5 ? "Branch 2 Manager" : "Branch 3 Manager",
        message: replyMsg,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
        branchName: Math.random() > 0.5 ? "Branch 2 - City Market" : "Branch 3 - Highway Bypass"
      };

      setChatMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 2000);
  };

  // Branch WhatsApp Numbers configuration
  const branchWhatsAppNumbers = [
    {
      branchId: "branch-1",
      branchName: "Branch 1 - Main Head Office (حیدر علی)",
      shortName: "Branch 1 (Head HQ)",
      number: "+92 300 5861464",
      cleanNumber: "923005861464",
      manager: "Qumber Ali Shah (Owner & Super Admin)",
      badge: "Main HQ Master",
      color: "blue",
    },
    {
      branchId: "branch-2",
      branchName: "Branch 2 - City Market (چھوٹا بھائی حمزہ)",
      shortName: "Branch 2 (City Outlet)",
      number: "+92 321 8899771",
      cleanNumber: "923218899771",
      manager: "Hamza Ali (چھوٹا بھائی)",
      badge: "Branch 2 Direct",
      color: "amber",
    },
    {
      branchId: "branch-3",
      branchName: "Branch 3 - Highway Bypass (کزن حسد / اسد)",
      shortName: "Branch 3 (Highway Outlet)",
      number: "+92 333 7744112",
      cleanNumber: "923337744112",
      manager: "Asad / Hasad (کزن)",
      badge: "Branch 3 Direct",
      color: "purple",
    },
  ];

  const safeWhatsAppOrders = Array.isArray(whatsappOrders) ? whatsappOrders : [];

  // Filtered orders
  const filteredOrders = safeWhatsAppOrders.filter((order) => {
    if (selectedBranchFilter !== "all" && order.branchId !== selectedBranchFilter) return false;
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      const matchItems = order.itemsText.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchItems) return false;
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) return;

    const matchedBranch = branches.find((b) => b.id === targetBranchId);
    const newOrder: WhatsAppOrder = {
      id: `wa-${Date.now()}`,
      customerName: custName.trim(),
      customerPhone: custPhone.trim(),
      branchId: targetBranchId,
      branchName: matchedBranch ? matchedBranch.name : "Branch 1 - Main Head Office",
      itemsText: orderItemsText.trim() || "Sanitary Ware & Plumbing Pipes order inquiry",
      estimatedTotal: Number(orderEstTotal) || 0,
      date: new Date().toISOString(),
      status: "new",
      notes: orderNotes.trim() || undefined,
    };

    onUpdateOrders([newOrder, ...whatsappOrders]);
    setShowNewOrderModal(false);
    setCustName("");
    setCustPhone("");
    setOrderItemsText("");
    setOrderEstTotal(0);
    setOrderNotes("");
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: WhatsAppOrder["status"]) => {
    const updated = whatsappOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    onUpdateOrders(updated);
  };

  // Helper to trigger direct WhatsApp message
  const sendWhatsAppDirect = (phone: string, message: string) => {
    let cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
    if (cleanPhone.startsWith("0")) {
      cleanPhone = `92${cleanPhone.slice(1)}`;
    } else if (!cleanPhone.startsWith("92") && cleanPhone.length === 10) {
      cleanPhone = `92${cleanPhone}`;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      alert("Please enter a valid WhatsApp phone number.");
      return;
    }

    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-4 max-w-[1700px] mx-auto space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-bold text-slate-100">
                واٹس ایپ اور سوشل میڈیا ملٹی برانچ ہب (WhatsApp & Social Media Orders)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Head Office Master Visibility</span>
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-0.5">
              تینوں برانچوں کے 3 الگ واٹس ایپ نمبرز + ہیڈ آفس کو تمام آنے والے آرڈرز کا لائیو کنٹرول
            </p>
          </div>
        </div>

        {/* Quick Add Order Button */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>نیا واٹس ایپ آرڈر درج کریں (New Order)</span>
          </button>
        </div>
      </div>

      {/* 🤫 100% SECRET STAFF INTER-BRANCH HOTLINE & WHATSAPP BRIDGE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900/50 to-slate-900 px-4 py-3 border-b border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-100 text-sm">
                  شاخوں اور اسٹاف کا خفیہ نیٹ ورک (Secret Inter-Branch Staff Hotline)
                </h3>
                <span className="animate-pulse flex h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[10px] text-emerald-300 font-semibold mt-0.5">
                🤫 کسٹمر کے سامنے دکان کی عزت برقرار رکھنے اور دوسری برانچوں سے خاموشی سے مال منگوانے کے لیے خاص گروپ!
              </p>
            </div>
          </div>
          <div className="text-[10px] bg-slate-950/80 border border-slate-800 text-slate-300 px-3 py-1 rounded-lg self-start sm:self-auto font-semibold">
            حکمتِ عملی: کسٹمر کو بٹھائیں اور بولیں <span className="text-emerald-400">"گودام سے لوڈ ہو رہا ہے"</span> اور نیچے سے مال منگوائیں!
          </div>
        </div>

        {/* Content body split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* LEFT COLUMN: INTERACTIVE WHATSAPP GROUP CHAT (8 Cols) */}
          <div className="lg:col-span-7 flex flex-col h-[380px] bg-slate-950/45">
            {/* Group Header */}
            <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-extrabold text-[10px] tracking-wider">
                  HPSG
                </div>
                <div>
                  <span className="font-bold text-slate-100 block text-xs">Haider Sanitary Staff & Branches (خفیہ گروپ)</span>
                  <span className="text-[9px] text-emerald-400 font-medium">Asad, Hussnain, Qumber, You are active</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full font-mono">
                Active Hotline
              </span>
            </div>

            {/* Chat Messages Board (Scrollable) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${msg.isSelf ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[9px] text-slate-400">
                    <span className="font-bold text-slate-300">{msg.senderName}</span>
                    <span>•</span>
                    <span className="px-1.5 py-0.1 bg-slate-800 rounded text-blue-300 text-[8px] font-semibold">{msg.branchName}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-md ${
                      msg.isSelf
                        ? "bg-emerald-600 text-white rounded-tr-none"
                        : "bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none"
                    }`}
                  >
                    {msg.message}
                    <span className="block text-[8px] text-right text-slate-300/80 mt-1 font-mono">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {/* Bot typing simulator */}
              {isTyping && (
                <div className="flex flex-col mr-auto max-w-[85%] items-start animate-pulse">
                  <span className="text-[9px] text-slate-400 mb-1 font-bold">{typingSender} typing...</span>
                  <div className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-150" />
                    <span>آوازِ برانچ آ رہی ہے...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Composer Box */}
            <form onSubmit={handleSendGroupMessage} className="p-2.5 bg-slate-900/95 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="دوسری شاخوں سے پوچھیں... (مثال: بھائی 3 انچ کا پائپ برانچ 2 میں ہے؟)"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 text-xs outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!newMessageText.trim()}
                className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: 1-CLICK SECRET CODES & QUICK CONTACTS (5 Cols) */}
          <div className="lg:col-span-5 p-4 space-y-4 bg-slate-900/30">
            <div>
              <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1 mb-1">
                <span>🤫 کسٹمر کے سامنے خفیہ کوڈ پیغامات</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">1-Click</span>
              </h4>
              <p className="text-[10px] text-slate-400">
                اگر کاؤنٹر پر کسٹمر بیٹھا ہے، تو نیچے کسی بھی خفیہ بٹن پر کلک کریں۔ یہ پیغام کاپی ہو جائے گا، آپ اسے فورا اصلی واٹس ایپ گروپ پر اپنے اسٹاف کو بھیج سکتے ہیں۔
              </p>
            </div>

            <div className="space-y-2">
              {/* Code Template 1 */}
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/30 rounded-xl transition flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[9px] font-extrabold text-amber-400 block mb-0.5">⚠️ ارجنٹ اسٹاک انکوائری (Secret Check)</span>
                  <p className="text-slate-200 text-xs font-semibold truncate leading-tight">
                    "کاؤنٹر پر کسٹمر کھڑا ہے۔ کیا [آئٹم] دستیاب ہے؟ کسٹمر کو پتا نہ چلے!"
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      const msg = "السلام علیکم! کاؤنٹر پر کسٹمر کھڑا ہے۔ کیا ہمارے پاس فینسی سینیٹری فٹنگز / متعلقہ پائپ برانچ 2 یا 3 کے اسٹاک میں موجود ہیں؟ گاہک کو پتا نہ چلے، فورا بتائیں۔";
                      navigator.clipboard.writeText(msg);
                      setCopiedText("secret-code-1");
                      setTimeout(() => setCopiedText(null), 2000);
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-slate-300 transition"
                    title="Copy Secret Code Text"
                  >
                    {copiedText === "secret-code-1" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => sendWhatsAppDirect("923218899771", "السلام علیکم! کاؤنٹر پر کسٹمر کھڑا ہے۔ کیا ہمارے پاس متعلقہ پائپ یا سینیٹری سامان برانچ 2 یا 3 کے پاس موجود ہے؟ فورا بتاؤ کسٹمر کو شک نہ ہو۔")}
                    className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition"
                    title="Send Directly to Hamza"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Code Template 2 */}
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/30 rounded-xl transition flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[9px] font-extrabold text-blue-400 block mb-0.5">🛵 موٹر سائیکل رائیڈر الرٹ (Rider Dispatch)</span>
                  <p className="text-slate-200 text-xs font-semibold truncate leading-tight">
                    "کسٹمر بل بنا رہا ہے۔ فورا بائیک سوار کے ہاتھ مال خفیہ بھجوائیں۔"
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      const msg = "بھائی کسٹمر بل بنا رہا ہے اور راضی ہو گیا ہے۔ فورا بائیک سوار (Rider) کے ہاتھ چپکے سے مال بھجوا دیں، کسٹمر کو بولیں گے گودام سے آ رہا ہے۔ جلدی کریں!";
                      navigator.clipboard.writeText(msg);
                      setCopiedText("secret-code-2");
                      setTimeout(() => setCopiedText(null), 2000);
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-slate-300 transition"
                    title="Copy Secret Code Text"
                  >
                    {copiedText === "secret-code-2" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => sendWhatsAppDirect("923337744112", "بھائی کسٹمر بل بنا رہا ہے اور راضی ہو گیا ہے۔ فورا بائیک سوار (Rider) کے ہاتھ چپکے سے مال بھجوا دیں، کسٹمر کو بولیں گے گودام سے آ رہا ہے۔ جلدی کریں!")}
                    className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition"
                    title="Send Directly to Asad"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Code Template 3 */}
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/30 rounded-xl transition flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[9px] font-extrabold text-rose-400 block mb-0.5">📞 خفیہ کال کی درخواست (Urgent Hotline Call)</span>
                  <p className="text-slate-200 text-xs font-semibold truncate leading-tight">
                    "کسٹمر کے سامنے فورا مجھے کال کریں اور بولیں ریٹ کم نہیں ہو سکتا۔"
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      const msg = "بھائی فورا کسٹمر کے سامنے مجھے کال کریں اور بولیں کہ ہیڈ آفس سے ریٹ لاک ہے، اس سے کم ریٹ نہیں ہو سکتا۔ تاکہ کسٹمر زیادہ بحث نہ کرے۔ جلدی کریں!";
                      navigator.clipboard.writeText(msg);
                      setCopiedText("secret-code-3");
                      setTimeout(() => setCopiedText(null), 2000);
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-slate-300 transition"
                    title="Copy Secret Code Text"
                  >
                    {copiedText === "secret-code-3" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => sendWhatsAppDirect("923005861464", "بھائی فورا کسٹمر کے سامنے مجھے کال کریں اور بولیں کہ ہیڈ آفس سے ریٹ لاک ہے، اس سے کم ریٹ نہیں ہو سکتا۔")}
                    className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition"
                    title="Send Directly to Qumber"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Dial Contacts Grid */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-2 font-bold">مینیجرز کے خفیہ واٹس ایپ نمبرز (Direct Links)</span>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href="https://wa.me/923005861464"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-950 border border-slate-800 hover:border-blue-500/40 rounded-xl text-center block transition"
                >
                  <span className="font-bold text-[10px] text-slate-200 block truncate">حیدر علی (HQ)</span>
                  <span className="text-[8px] font-mono text-blue-400 block mt-0.5">0300-5861464</span>
                </a>
                <a
                  href="https://wa.me/923218899771"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl text-center block transition"
                >
                  <span className="font-bold text-[10px] text-slate-200 block truncate">حمزہ (Branch 2)</span>
                  <span className="text-[8px] font-mono text-amber-400 block mt-0.5">0321-8899771</span>
                </a>
                <a
                  href="https://wa.me/923337744112"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-xl text-center block transition"
                >
                  <span className="font-bold text-[10px] text-slate-200 block truncate">اسد (Branch 3)</span>
                  <span className="text-[8px] font-mono text-purple-400 block mt-0.5">0333-7744112</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3 Dedicated Branch WhatsApp Numbers & Head Office Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branchWhatsAppNumbers.map((b) => {
          const isMain = b.branchId === "branch-1";
          const countOrders = safeWhatsAppOrders.filter((o) => o.branchId === b.branchId).length;
          const pendingCount = safeWhatsAppOrders.filter((o) => o.branchId === b.branchId && (o.status === "new" || o.status === "confirmed")).length;

          return (
            <div
              key={b.branchId}
              className={`p-4 rounded-2xl border transition relative overflow-hidden shadow-lg ${
                isMain
                  ? "bg-slate-900/90 border-blue-500/50 ring-1 ring-blue-500/20"
                  : "bg-slate-900/80 border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{b.shortName}</h3>
                    <p className="text-[11px] text-slate-400">{b.manager}</p>
                  </div>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isMain
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {b.badge}
                </span>
              </div>

              {/* Number Display with 1-Click WhatsApp Button */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">WhatsApp Official Number:</span>
                  <button
                    onClick={() => handleCopy(b.number, b.branchId)}
                    className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    {copiedText === b.branchId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === b.branchId ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold text-emerald-400 font-mono tracking-wider">{b.number}</span>
                  <a
                    href={`https://wa.me/${b.cleanNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>Open Chat</span>
                  </a>
                </div>
              </div>

              {/* Live Order Stats for Branch */}
              <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">Total Orders</span>
                  <span className="font-bold text-slate-200 text-xs">{countOrders}</span>
                </div>
                <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">Pending Orders</span>
                  <span className="font-bold text-amber-400 text-xs">{pendingCount} Active</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Social Media Channels Integration Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-slate-100 text-sm">سوشل میڈیا اور برانڈنگ چینلز (Social Media & Online Presence)</h3>
          </div>
          <span className="text-slate-400 text-[11px]">
            Domain / Account: <strong className="text-slate-200 font-mono">Haider Pipe And Sanitary Store</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Facebook */}
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Facebook className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-200 block text-xs">Facebook Page</span>
                <span className="text-[10px] text-slate-400">@HaiderSanitaryPeshawar</span>
              </div>
            </div>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition"
              title="Open Facebook Page"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Instagram */}
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-200 block text-xs">Instagram Catalog</span>
                <span className="text-[10px] text-slate-400">@haider_sanitary_pk</span>
              </div>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Open Instagram"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* YouTube Channel */}
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
                <Youtube className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-200 block text-xs">YouTube Channel</span>
                <span className="text-[10px] text-slate-400">Plumbing & Fittings Guides</span>
              </div>
            </div>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
              title="Open YouTube"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Google Maps Location */}
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-200 block text-xs">Google Maps (3 Branches)</span>
                <span className="text-[10px] text-slate-400">Peshawar Cantt & Ring Road</span>
              </div>
            </div>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
              title="Open Google Maps"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* WhatsApp Orders Central Command & Status Tracker */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search customer, phone, item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs outline-none focus:border-emerald-500 w-56 sm:w-64"
              />
            </div>

            {/* Branch Filter */}
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs outline-none"
            >
              <option value="all">All Branches (ہیڈ آفس ماسٹر ویو)</option>
              <option value="branch-1">Branch 1 - Main Head Office</option>
              <option value="branch-2">Branch 2 - City Market Outlet</option>
              <option value="branch-3">Branch 3 - Highway Bypass</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="new">New (نیا انکوائری)</option>
              <option value="confirmed">Confirmed (تصدیق شدہ)</option>
              <option value="dispatched">Dispatched (روانہ ہو چکا)</option>
              <option value="completed">Completed (مکمل)</option>
            </select>
          </div>

          <span className="text-slate-400 text-xs">
            Showing <strong>{filteredOrders.length}</strong> WhatsApp orders
          </span>
        </div>

        {/* Orders List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Date / ID</th>
                <th className="py-2.5 px-3">Customer & Phone</th>
                <th className="py-2.5 px-3">Assigned Branch</th>
                <th className="py-2.5 px-3">Order Items & Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">WhatsApp Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((order) => {
                const isNew = order.status === "new";
                const isConfirmed = order.status === "confirmed";
                const isDispatched = order.status === "dispatched";
                const isCompleted = order.status === "completed";

                const defaultMsg = `السلام علیکم ${order.customerName} صاحب! حیدر پائپ اینڈ سینیٹری سٹورز (${order.branchName}) کی جانب سے آپ کا واٹس ایپ آرڈر موصول ہوا ہے۔ تخمینہ کل رقم: Rs. ${order.estimatedTotal.toLocaleString()}۔ کیا ہم مال روانہ کر دیں؟ شکریہ!`;

                return (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <span className="font-mono text-slate-300 block">{order.id}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-200 block">{order.customerName}</span>
                      <span className="text-emerald-400 font-mono text-[11px]">{order.customerPhone}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-[10px]">
                        {order.branchName}
                      </span>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <p className="text-slate-300 text-[11px] truncate font-medium">{order.itemsText}</p>
                      <span className="text-emerald-400 font-bold font-mono">
                        {settings.currencySymbol} {order.estimatedTotal.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border outline-none cursor-pointer ${
                          isNew
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : isConfirmed
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                            : isDispatched
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                            : isCompleted
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        <option value="new">🟡 New Inquiry</option>
                        <option value="confirmed">🔵 Confirmed</option>
                        <option value="ready">🟠 Ready for Dispatch</option>
                        <option value="dispatched">🟣 Dispatched (روانہ)</option>
                        <option value="completed">🟢 Completed (مکمل)</option>
                        <option value="cancelled">🔴 Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => sendWhatsAppDirect(order.customerPhone, defaultMsg)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm transition"
                          title="Direct WhatsApp Message to Customer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send Message</span>
                        </button>

                        <button
                          onClick={() => handleCopy(defaultMsg, `msg-${order.id}`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Copy Message Text"
                        >
                          {copiedText === `msg-${order.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-base">نیا واٹس ایپ آرڈر درج کریں (Add WhatsApp Order)</h3>
              </div>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3.5">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Customer Name (گاہک کا نام) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haji Munir Sahib / Engineer Usman"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Customer WhatsApp / Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0300-1234567"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Assign to Branch (متعلقہ برانچ)</label>
                <select
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                >
                  <option value="branch-1">Branch 1 - Main Head Office (حیدر علی - مین ہیڈ)</option>
                  <option value="branch-2">Branch 2 - City Market Outlet (چھوٹا بھائی حمزہ)</option>
                  <option value="branch-3">Branch 3 - Highway Bypass Outlet (کزن حسد / اسد)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Order Items Details (سامان کی تفصیل)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. 20x PPRC Pipes 32mm, 5x Master Gate Valves, 1x Porta Luxury Commode"
                  value={orderItemsText}
                  onChange={(e) => setOrderItemsText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Estimated Total Amount (Rs.)</label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={orderEstTotal || ""}
                  onChange={(e) => setOrderEstTotal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-3 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md shadow-emerald-600/30 transition"
                >
                  Save & Notify via WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
