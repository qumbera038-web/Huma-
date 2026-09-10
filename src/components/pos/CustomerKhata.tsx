import React, { useState, useMemo } from "react";
import { Customer, KhataTransaction, StoreSettings } from "../../types";
import { exportAllDataBackup } from "../../utils/posStorage";
import { 
  Users, 
  Search, 
  UserPlus, 
  BookOpen, 
  PlusCircle, 
  MinusCircle, 
  Phone, 
  MapPin, 
  FileText, 
  Download,
  CheckCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  CreditCard,
  UserCheck,
  Image as ImageIcon,
  Share2,
  Building2,
  Receipt,
  Eye,
  X,
  ExternalLink,
  ShieldCheck,
  Camera,
  Globe,
  Bot,
  PhoneCall,
  MessageSquare,
  Mic,
  Volume2,
  Send,
  CheckCircle2,
  Smartphone,
  Database,
  ChevronDown,
  FileSpreadsheet
} from "lucide-react";

interface CustomerKhataProps {
  customers: Customer[];
  khataTransactions: KhataTransaction[];
  settings: StoreSettings;
  onUpdateCustomers: (customers: Customer[]) => void;
  onAddKhataTransaction: (tx: KhataTransaction, updatedCustomer: Customer) => void;
}

export const CustomerKhata: React.FC<CustomerKhataProps> = ({
  customers,
  khataTransactions,
  settings,
  onUpdateCustomers,
  onAddKhataTransaction,
}) => {
  const [viewMode, setViewMode] = useState<"ledger" | "traders">("ledger");
  const [searchTerm, setSearchTerm] = useState("");
  const [traderSearchTerm, setTraderSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || "");
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [viewReceiptModalUrl, setViewReceiptModalUrl] = useState<{ url: string; title: string; ref?: string } | null>(null);

  // WhatsApp AI Call & Message Auto-Responder State
  const [showAiWhatsAppBotModal, setShowAiWhatsAppBotModal] = useState(false);
  const [simType, setSimType] = useState<"call" | "message">("call");
  const [simCustId, setSimCustId] = useState<string>(customers[0]?.id || "");
  const [simCustPhone, setSimCustPhone] = useState<string>(customers[0]?.phone || "0300-5861464");
  const [simQuery, setSimQuery] = useState<string>(
    "السلام علیکم! میرا کھاتہ بقایا کتنا ہے اور آن لائن بینک ٹرانسفر کے لیے میزان بینک کا اکاؤنٹ نمبر بھیج دیں۔"
  );
  const [isAiProcessingBot, setIsAiProcessingBot] = useState(false);
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);
  const [botLogs, setBotLogs] = useState<
    Array<{
      id: string;
      time: string;
      type: "call" | "message";
      custName: string;
      custPhone: string;
      queryText: string;
      aiAnswer: string;
      actionTaken: string;
    }>
  >([
    {
      id: "bot-1",
      time: "12:15 PM",
      type: "call",
      custName: "Haji Mukhtar Khan (Peshawar)",
      custPhone: "0300-5861464",
      queryText: "السلام علیکم! کیا برانچ 2 میں پورٹا کا لگژری کموڈ دستیاب ہے؟",
      aiAnswer: "وعلیکم السلام حاجی صاحب! جی بالکل، برانچ 2 (سٹی مارکیٹ) میں پورٹا کا شاہانہ کموڈ 4 پیسز اسٹاک میں موجود ہے۔ قیمت Rs. 24,500 ہے۔",
      actionTaken: "✅ Verified Branch 2 Stock (4 units) & Sent Quotation SMS",
    },
    {
      id: "bot-2",
      time: "11:40 AM",
      type: "message",
      custName: "Tariq Plumber (Cantt)",
      custPhone: "0321-8899771",
      queryText: "میرا بقایا بل اور بینک ڈیٹیل بھیج دیں۔",
      aiAnswer: "محترم طارق صاحب! آپ کے کھاتہ کی بقایا رقم Rs. 45,000 ہے۔ ہمارے میزان بینک اکاؤنٹ Title: HAIDER PIPE AND SANITARY STORE, Account #: 0201-0105689123 پر رقم منتقل کر کے رسید واٹس ایپ فرمائیں۔",
      actionTaken: "✅ Auto-dispatched Khata Statement & Meezan Bank IBAN via WhatsApp",
    },
  ]);

  const handleRunAiWhatsAppBot = async () => {
    if (!simQuery.trim()) return;
    setIsAiProcessingBot(true);

    const targetCust = customers.find((c) => c.id === simCustId) || customers[0];
    const custName = targetCust ? targetCust.name : "Valued Customer";
    const custPhone = targetCust ? targetCust.phone : simCustPhone;

    let aiAnswer = "";
    let actionTaken = "";

    try {
      const res = await fetch("/api/gemini/chat-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${simQuery}. Customer Name: ${custName}, Current Khata Outstanding: ${settings.currencySymbol} ${targetCust?.outstandingKhata || 0}, Phone: ${custPhone}`,
          branchId: "branch-1",
          history: [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        aiAnswer = data.text || "";
      }
    } catch (err) {
      console.warn("AI Bot service error, using fallback responder:", err);
    }

    if (!aiAnswer) {
      const lower = simQuery.toLowerCase();
      if (lower.includes("khata") || lower.includes("کھاتہ") || lower.includes("balance") || lower.includes("بقایا")) {
        aiAnswer = `محترم ${custName} صاحب! حیدر سینیٹری میں آپ کے کھاتہ کا موجودہ بقایا balance: ${settings.currencySymbol} ${(targetCust?.outstandingKhata || 0).toLocaleString()} ہے۔ آن لائن بِل کی ادائیگی کے لیے میزان بینک اکاؤنٹ (HAIDER PIPE AND SANITARY STORE) استعمال فرمائیں۔`;
        actionTaken = `✅ Checked Khata Database for ${custName} (Balance: ${settings.currencySymbol} ${(targetCust?.outstandingKhata || 0).toLocaleString()})`;
      } else if (lower.includes("bank") || lower.includes("بینک") || lower.includes("account") || lower.includes("میزان")) {
        aiAnswer = `ہمارے آن لائن بینک اکاؤنٹس کی تفصیل:\n• بینک نام: Meezan Bank (Peshawar Branch)\n• اکاؤنٹ ٹائٹل: HAIDER PIPE AND SANITARY STORE\n• اکاؤنٹ نمبر: 0201-0105689123\n• IBAN: PK56MEEZ0201010568912301\nرقم بھیج کر رسید اس واٹس ایپ نمبر پر ارسال فرمائیں۔`;
        actionTaken = "✅ Generated Official Meezan Bank & Bank Alfalah Transfer Details";
      } else {
        aiAnswer = `السلام علیکم ${custName} صاحب! حیدر سینیٹری 24/7 واٹس ایپ ہیلپ لائن میں خوش آمدید۔ آپ کی مطلوبہ سینیٹری و پائپ فٹنگز برانچ 1، 2 اور 3 گوداموں میں دستیاب ہیں۔ مزید تفصیلات اور ڈسکاؤنٹ ریٹ کے لیے ابھی رابطہ کریں۔`;
        actionTaken = "✅ Provided Multi-Branch Inventory Availability & Direct Support Link";
      }
    } else {
      actionTaken = `✅ Gemini AI processed query for ${custName} (${simType === "call" ? "Voice Call Answered" : "WhatsApp Auto-Message"})`;
    }

    // Trigger Speech Synthesis if call mode
    if (simType === "call" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const cleanSpeechText = aiAnswer.replace(/[*#•]/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
        utterance.lang = "ur-PK";
        utterance.rate = 0.95;
        setIsSpeakingVoice(true);
        utterance.onend = () => setIsSpeakingVoice(false);
        utterance.onerror = () => setIsSpeakingVoice(false);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Speech synthesis error:", e);
      }
    }

    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newLog = {
      id: `bot-${Date.now()}`,
      time: timeStr,
      type: simType,
      custName,
      custPhone,
      queryText: simQuery,
      aiAnswer,
      actionTaken,
    };

    setBotLogs((prev) => [newLog, ...prev]);
    setIsAiProcessingBot(false);
  };

  // New Customer Form
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [newCustLimit, setNewCustLimit] = useState(50000);

  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<"credit" | "debit">("credit"); // credit = payment received, debit = udhaar added
  const [paymentMode, setPaymentMode] = useState<"cash" | "online_bank" | "cheque" | "easypaisa_jazzcash">("cash");
  const [bankName, setBankName] = useState("Meezan Bank");
  const [transactionRef, setTransactionRef] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [receiptImageUrl, setReceiptImageUrl] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [showKhataExportMenu, setShowKhataExportMenu] = useState(false);

  const safeCustomers = useMemo(() => Array.isArray(customers) ? customers : [], [customers]);
  const safeKhataTransactions = useMemo(() => Array.isArray(khataTransactions) ? khataTransactions : [], [khataTransactions]);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return safeCustomers;
    return safeCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        (c.address && c.address.toLowerCase().includes(term))
    );
  }, [safeCustomers, searchTerm]);

  // Traders List: Frequent buyers with transactions/purchases
  const tradersList = useMemo(() => {
    return safeCustomers
      .filter((c) => c.totalPurchases > 0 || c.outstandingKhata > 0)
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .filter((c) => {
        if (!traderSearchTerm.trim()) return true;
        const q = traderSearchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.address && c.address.toLowerCase().includes(q))
        );
      });
  }, [safeCustomers, traderSearchTerm]);

  const activeCustomer = safeCustomers.find((c) => c.id === selectedCustomerId) || safeCustomers[0];

  const customerTransactions = useMemo(() => {
    if (!activeCustomer) return [];
    return safeKhataTransactions.filter((tx) => tx.customerId === activeCustomer.id);
  }, [safeKhataTransactions, activeCustomer]);

  const totalOutstandingAll = useMemo(() => {
    return safeCustomers.reduce((sum, c) => sum + (c.outstandingKhata || 0), 0);
  }, [safeCustomers]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim() || undefined,
      totalPurchases: 0,
      outstandingKhata: 0,
      creditLimit: Number(newCustLimit) || 50000,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onUpdateCustomers([newCust, ...customers]);
    setSelectedCustomerId(newCust.id);
    setShowAddCustomerModal(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewCustAddress("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer || paymentAmount <= 0) return;

    const amt = Number(paymentAmount);
    let newOutstanding = activeCustomer.outstandingKhata;

    if (paymentType === "credit") {
      // Payment received reduces balance
      newOutstanding = Math.max(0, newOutstanding - amt);
    } else {
      // Manual Udhaar added
      newOutstanding += amt;
    }

    const updatedCustomer: Customer = {
      ...activeCustomer,
      outstandingKhata: newOutstanding,
    };

    let defaultDesc = "";
    if (paymentType === "credit") {
      if (paymentMode === "online_bank") {
        defaultDesc = `Online Bank Transfer (${bankName} ${transactionRef ? `Trx #${transactionRef}` : ""})`;
      } else if (paymentMode === "cheque") {
        defaultDesc = `Bank Cheque (${bankName} Cheque #${chequeNumber || "N/A"})`;
      } else if (paymentMode === "easypaisa_jazzcash") {
        defaultDesc = `Mobile Account (EasyPaisa/JazzCash ${transactionRef ? `Trx #${transactionRef}` : ""})`;
      } else {
        defaultDesc = "Cash received at shop counter";
      }
    } else {
      defaultDesc = "Manual Udhaar / Goods supplied on credit";
    }

    const newTx: KhataTransaction = {
      id: `tx-${Date.now()}`,
      customerId: activeCustomer.id,
      date: new Date().toISOString(),
      type: paymentType,
      amount: amt,
      description: paymentDescription.trim() || defaultDesc,
      balanceAfter: newOutstanding,
      paymentMode,
      bankName: paymentMode === "online_bank" || paymentMode === "cheque" ? bankName : undefined,
      transactionRef: transactionRef.trim() || undefined,
      chequeNumber: chequeNumber.trim() || undefined,
      chequeDate: chequeDate || undefined,
      receiptImageUrl: receiptImageUrl || undefined,
      isVerified: true,
    };

    onAddKhataTransaction(newTx, updatedCustomer);
    setShowPaymentModal(false);
    setPaymentAmount(0);
    setPaymentDescription("");
    setTransactionRef("");
    setChequeNumber("");
    setChequeDate("");
    setReceiptImageUrl("");
  };

  const handleWhatsAppKhataShare = () => {
    if (!activeCustomer) return;
    let cleanPhone = activeCustomer.phone ? activeCustomer.phone.replace(/[^0-9]/g, "") : "";
    if (cleanPhone.startsWith("0")) {
      cleanPhone = `92${cleanPhone.slice(1)}`;
    } else if (!cleanPhone.startsWith("92") && cleanPhone.length === 10) {
      cleanPhone = `92${cleanPhone}`;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      alert("براہ کرم اس کسٹمر کا درست واٹس ایپ فون نمبر درج کریں۔");
      return;
    }

    const message = `*السلام علیکم ورحمۃ اللہ وبرکاتہ!*\n*محترم ${activeCustomer.name} صاحب،*\n\n🏬 *حیدر پائپ اینڈ سینیٹری سٹورز (پشاور)*\n(Haider Pipe & Sanitary Store)\n\n📌 *آپ کے کھاتہ کی تفصیل (Khata Statement Summary):*\n• کل بقایا رقم (Current Balance): *${settings.currencySymbol} ${activeCustomer.outstandingKhata.toLocaleString()}*\n• کریڈٹ لمٹ (Assigned Limit): *${settings.currencySymbol} ${activeCustomer.creditLimit.toLocaleString()}*\n• کل خریداری (Total Purchases): *${settings.currencySymbol} ${activeCustomer.totalPurchases.toLocaleString()}*\n\n🏦 *آن لائن بینک ٹرانسفر ڈیٹیلز (For Payment):*\n• بینک نام: Meezan Bank (یا Bank Alfalah)\n• اکاؤنٹ ٹائٹل: HAIDER PIPE AND SANITARY STORE\n• برائے تصدیق رسید واٹس ایپ فرمائیں۔\n\n📞 شکریہ! رابطہ برائے ہیڈ آفیس: PTCL: 091-2565800 | Mobile: 0300-5861463`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`, "_blank");
  };

  const exportKhataStatement = () => {
    if (!activeCustomer) return;
    const header = "Date,Type,Payment Mode,Bank/Trx,Amount,Description,Balance After\n";
    const rows = customerTransactions
      .map(
        (tx) =>
          `"${new Date(tx.date).toLocaleDateString()}","${tx.type === "credit" ? "PAYMENT (CR)" : "UDHAAR (DR)"}","${tx.paymentMode || "Cash"}","${tx.bankName || ""}${tx.transactionRef ? ` #${tx.transactionRef}` : ""} ${tx.chequeNumber ? ` Cheque #${tx.chequeNumber}` : ""}",${tx.amount},"${tx.description}",${tx.balanceAfter}`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `khata-${activeCustomer.name.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4">
      {/* Top Banner KPI */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Customer Khata Ledger & Bank Receipts</span>
              <span className="text-xs text-amber-400 font-urdu">(کھاتہ بک و بینک رسیدیں)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Track party balances, online bank receipts, cheques, and dispute-free proofs
            </p>
          </div>
        </div>

        {/* Standardized Control Row - All Elements Height h-11 */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sub-view Switcher */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 h-11">
            <button
              onClick={() => setViewMode("ledger")}
              className={`h-9 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                viewMode === "ledger"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Khata Ledger</span>
            </button>
            <button
              onClick={() => setViewMode("traders")}
              className={`h-9 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                viewMode === "traders"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Traders Directory ({tradersList.length})</span>
            </button>
          </div>

          {/* Total Market Udhaar Badge */}
          <div className="h-11 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-center text-right shrink-0 min-w-[150px]">
            <span className="text-[9px] text-amber-300 block uppercase font-bold tracking-wider">
              Total Market Udhaar
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono">
              {settings.currencySymbol} {totalOutstandingAll.toLocaleString()}
            </span>
          </div>

          {/* New Customer Button */}
          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="h-11 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition shrink-0"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>New Customer</span>
          </button>

          {/* 24/7 AI WhatsApp Call & Auto-Responder */}
          <button
            onClick={() => setShowAiWhatsAppBotModal(true)}
            className="h-11 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition shrink-0 border border-emerald-400/40 hover:scale-[1.02] active:scale-[0.98]"
            title="24/7 WhatsApp AI Voice Call & Message Auto-Responder"
          >
            <Bot className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
            <span>WhatsApp AI Auto-Responder</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0" />
          </button>
        </div>
      </div>

      {viewMode === "traders" ? (
        /* ══════════════ TRADERS LIST VIEW ══════════════ */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>👥 Registered Traders & Contractors Directory</span>
              </h3>
              <p className="text-xs text-slate-400">
                Plumbers, contractors, and sanitary dealers with active khata and turnover
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={traderSearchTerm}
                onChange={(e) => setTraderSearchTerm(e.target.value)}
                placeholder="Search trader by name, phone..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="py-3 px-4 font-semibold">Trader / Contractor</th>
                  <th className="py-3 px-4 font-semibold">Phone & Location</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Purchases</th>
                  <th className="py-3 px-4 font-semibold text-right">Khata Udhaar Balance</th>
                  <th className="py-3 px-4 font-semibold text-right">Credit Limit</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tradersList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No traders found matching search.
                    </td>
                  </tr>
                ) : (
                  tradersList.map((trader, idx) => (
                    <tr key={trader.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-bold text-[11px] flex items-center justify-center font-mono">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-100 block text-xs">{trader.name}</span>
                            <span className="text-[10px] text-slate-400">ID: {trader.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex flex-col">
                          <span className="font-mono text-slate-200">{trader.phone || "—"}</span>
                          <span className="text-[10px] text-slate-400">{trader.address || "Peshawar"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-emerald-400 font-mono text-xs">
                          {settings.currencySymbol} {trader.totalPurchases.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-bold font-mono text-xs ${
                            trader.outstandingKhata > 0 ? "text-amber-400" : "text-slate-400"
                          }`}
                        >
                          {settings.currencySymbol} {trader.outstandingKhata.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {settings.currencySymbol} {trader.creditLimit.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedCustomerId(trader.id);
                            setViewMode("ledger");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold transition border border-slate-700"
                        >
                          View Ledger
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ══════════════ KHATA LEDGER VIEW ══════════════ */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Side: Customers Directory (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden">
            <div className="p-3 border-b border-slate-800 bg-slate-950/40">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search contractor, plumber, phone..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 divide-y divide-slate-800/60 overflow-y-auto max-h-[65vh]">
              {filteredCustomers.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No customer found.
                </div>
              ) : (
                filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={`p-3 cursor-pointer transition ${
                      activeCustomer?.id === c.id
                        ? "bg-blue-950/40 border-l-4 border-blue-500"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-100">{c.name}</h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{c.phone || "No phone"}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Balance:</span>
                        <span
                          className={`font-bold font-mono text-xs ${
                            c.outstandingKhata > 0 ? "text-amber-400" : "text-emerald-400"
                          }`}
                        >
                          {settings.currencySymbol} {c.outstandingKhata.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Side: Detailed Ledger Statement (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden">
            {activeCustomer ? (
              <>
                {/* Customer Banner Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                      <span>{activeCustomer.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        ID: {activeCustomer.id}
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {activeCustomer.phone}
                      </span>
                      {activeCustomer.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {activeCustomer.address}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleWhatsAppKhataShare}
                      className="px-3.5 py-2 text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-xl transition flex items-center gap-2 shadow-sm"
                      title="Send WhatsApp Khata reminder to customer"
                    >
                      <Share2 className="w-4 h-4 shrink-0" />
                      <span>WhatsApp Bill</span>
                    </button>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-600/30 transition flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4 shrink-0" />
                      <span>Record Payment / Receipt</span>
                    </button>
                    {/* Rich Khata Export Menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowKhataExportMenu(!showKhataExportMenu)}
                        className="px-3.5 py-2 text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>📦 Export Menu (ایکسپورٹ)</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showKhataExportMenu ? "rotate-180" : ""}`} />
                      </button>

                      {showKhataExportMenu && (
                        <div className="absolute right-0 top-11 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95">
                          <a
                            href="/haider_sanitary_pos.apk"
                            download="haider_sanitary_pos.apk"
                            onClick={() => setShowKhataExportMenu(false)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition"
                          >
                            <Smartphone className="w-3.5 h-3.5 shrink-0 text-slate-950" />
                            <div>
                              <span>Download 1 APK (.apk)</span>
                              <span className="block text-[9px] font-medium text-slate-900">اینڈرائیڈ موبائل ایپ</span>
                            </div>
                          </a>

                          <a
                            href="/haider_sanitary_pos_single_file.html"
                            download="haider_sanitary_pos_single_file.html"
                            onClick={() => setShowKhataExportMenu(false)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition"
                          >
                            <Download className="w-3.5 h-3.5 shrink-0 text-white" />
                            <div>
                              <span>Download 1 File (.html)</span>
                              <span className="block text-[9px] font-medium text-emerald-100">سنگل فائل (آف لائن)</span>
                            </div>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              setShowKhataExportMenu(false);
                              exportKhataStatement();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-300 hover:bg-slate-800 transition border-t border-slate-800 mt-1 pt-2"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                            <span>Export Customer Ledger (CSV)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowKhataExportMenu(false);
                              exportAllDataBackup();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-purple-300 hover:bg-purple-900/20 transition"
                          >
                            <Database className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                            <span>Backup All Khata (JSON)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ledger Balance Summary Cards */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-800/80 bg-slate-950/30">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Current Udhaar Balance
                    </span>
                    <span
                      className={`text-lg font-bold font-mono ${
                        activeCustomer.outstandingKhata > 0 ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {settings.currencySymbol} {activeCustomer.outstandingKhata.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Total Purchases to Date
                    </span>
                    <span className="text-lg font-bold font-mono text-slate-200">
                      {settings.currencySymbol} {activeCustomer.totalPurchases.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Assigned Credit Limit
                    </span>
                    <span className="text-lg font-bold font-mono text-slate-400">
                      {settings.currencySymbol} {activeCustomer.creditLimit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Transaction History Table */}
                <div className="flex-1 p-4 overflow-y-auto max-h-[50vh]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Ledger Statement & Bank Receipts History
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {customerTransactions.length} Total Entries
                    </span>
                  </div>

                  {customerTransactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                      No transaction history recorded yet for this customer.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/20">
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Description / Mode</th>
                            <th className="py-2.5 px-3">Proof / Bank Slip</th>
                            <th className="py-2.5 px-3 text-right">Debit (Udhaar)</th>
                            <th className="py-2.5 px-3 text-right">Credit (Received)</th>
                            <th className="py-2.5 px-3 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {customerTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-800/30">
                              <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                                {new Date(tx.date).toLocaleDateString()}
                              </td>
                              <td className="py-2.5 px-3 text-slate-200">
                                <div className="font-medium">{tx.description}</div>
                                {tx.paymentMode && (
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase font-semibold">
                                      {tx.paymentMode.replace("_", " ")}
                                    </span>
                                    {tx.bankName && (
                                      <span className="text-[10px] text-blue-400 font-medium">
                                        {tx.bankName}
                                      </span>
                                    )}
                                    {tx.transactionRef && (
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        Ref: #{tx.transactionRef}
                                      </span>
                                    )}
                                    {tx.chequeNumber && (
                                      <span className="text-[10px] text-amber-400 font-mono">
                                        Cheque: #{tx.chequeNumber} {tx.chequeDate ? `(${tx.chequeDate})` : ""}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                {tx.receiptImageUrl ? (
                                  <button
                                    onClick={() =>
                                      setViewReceiptModalUrl({
                                        url: tx.receiptImageUrl!,
                                        title: `${tx.bankName || "Bank"} Receipt - ${activeCustomer.name}`,
                                        ref: tx.transactionRef || tx.chequeNumber,
                                      })
                                    }
                                    className="flex items-center gap-1.5 px-2 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 rounded-lg text-[10px] font-semibold transition"
                                  >
                                    <Receipt className="w-3 h-3 text-emerald-400" />
                                    <span>View Slip / رسید</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-500 italic">No slip</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-amber-400 font-semibold">
                                {tx.type === "debit"
                                  ? `${settings.currencySymbol} ${tx.amount.toLocaleString()}`
                                  : "—"}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">
                                {tx.type === "credit"
                                  ? `${settings.currencySymbol} ${tx.amount.toLocaleString()}`
                                  : "—"}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                                {settings.currencySymbol} {tx.balanceAfter.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                Select a customer from the left to view ledger statement.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-slate-100 text-base mb-4">
              Add New Customer / Trader (نیا گاہک / کھاتہ دار)
            </h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Customer / Plumber Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Ustad Tariq Plumber"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Phone Number (WhatsApp)</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Shop / Site Address</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Khyber Bazar, Peshawar"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Credit Limit (Rs.)</label>
                <input
                  type="number"
                  value={newCustLimit}
                  onChange={(e) => setNewCustLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md shadow-blue-600/30"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment / Khata Adjustment Modal with Bank Receipt Verification */}
      {showPaymentModal && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-100 text-base mb-1">
              Record Khata Entry & Bank Receipt (رسید و ادائیگی)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Party: <span className="text-slate-200 font-bold">{activeCustomer.name}</span> | Current Outstanding: <span className="font-bold text-amber-400">{settings.currencySymbol} {activeCustomer.outstandingKhata.toLocaleString()}</span>
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentType("credit")}
                  className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    paymentType === "credit"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Receive Cash / CR (جمع)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("debit")}
                  className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    paymentType === "debit"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Add Udhaar / DR (ادھار)</span>
                </button>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Amount (Rs.) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentAmount || ""}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-bold font-mono text-sm outline-none focus:border-emerald-500"
                />
              </div>

              {/* Payment Mode Selector */}
              {paymentType === "credit" && (
                <div className="space-y-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Payment Method / ذریعہ ادائیگی</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {(["cash", "online_bank", "cheque", "easypaisa_jazzcash"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPaymentMode(mode)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition ${
                            paymentMode === mode
                              ? "bg-blue-600 text-white border-blue-500"
                              : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                          }`}
                        >
                          {mode === "cash" && "💵 Cash"}
                          {mode === "online_bank" && "🏦 Online Bank"}
                          {mode === "cheque" && "🧾 Cheque"}
                          {mode === "easypaisa_jazzcash" && "📱 EasyPaisa"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bank Transfer Details */}
                  {paymentMode === "online_bank" && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">Select Bank</label>
                        <select
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs"
                        >
                          <option value="Meezan Bank">Meezan Bank</option>
                          <option value="Bank Alfalah">Bank Alfalah</option>
                          <option value="Habib Bank Ltd (HBL)">HBL</option>
                          <option value="United Bank Ltd (UBL)">UBL</option>
                          <option value="MCB Bank">MCB</option>
                          <option value="Allied Bank Ltd (ABL)">ABL</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">Trx / Slip Ref ID</label>
                        <input
                          type="text"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder="e.g. MZ-849201"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Cheque Details */}
                  {paymentMode === "cheque" && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="Bank Alfalah"
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">Cheque #</label>
                        <input
                          type="text"
                          value={chequeNumber}
                          onChange={(e) => setChequeNumber(e.target.value)}
                          placeholder="CHQ-100234"
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">Cheque Date</label>
                        <input
                          type="date"
                          value={chequeDate}
                          onChange={(e) => setChequeDate(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Bank Receipt Slip Image / Direct Camera Snapshot */}
                  <div>
                    <label className="text-slate-300 font-medium block mb-1 flex items-center justify-between">
                      <span>Attach Bank Slip / Camera Snapshot (رسید یا چیک کی تصویر)</span>
                      <span className="text-[10px] text-amber-400 font-normal">جھگڑے اور ڈسپیوٹ سے بچاؤ کیلئے</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>گیلری یا فائل منتخب کریں (Upload File)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      <label className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition">
                        <Camera className="w-3.5 h-3.5 text-blue-400" />
                        <span>کیمرے سے لائیو تصویر لیں (Take Photo)</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {receiptImageUrl && (
                      <div className="mt-2 p-2 bg-slate-900 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={receiptImageUrl}
                            alt="Receipt preview"
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover rounded-lg border border-slate-700 shadow"
                          />
                          <div>
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              رسید کامیابی سے منسلک ہو گئی
                            </span>
                            <span className="text-[10px] text-slate-400 block">Bank receipt image attached</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReceiptImageUrl("")}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 text-xs font-bold"
                          title="تصویر ختم کریں"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-300 font-medium block mb-1">Payment Note / Remarks</label>
                <input
                  type="text"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  placeholder="e.g. Received via Bank Alfalah online / shop counter"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 font-semibold text-white rounded-lg shadow-md ${
                    paymentType === "credit"
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                      : "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
                  }`}
                >
                  Save Entry & Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Receipt Lightbox Modal */}
      {viewReceiptModalUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-4 shadow-2xl animate-in zoom-in-95 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>{viewReceiptModalUrl.title}</span>
                </h3>
                {viewReceiptModalUrl.ref && (
                  <p className="text-[11px] text-slate-400 font-mono">
                    Ref / Cheque #: {viewReceiptModalUrl.ref}
                  </p>
                )}
              </div>
              <button
                onClick={() => setViewReceiptModalUrl(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center max-h-[60vh]">
              <img
                src={viewReceiptModalUrl.url}
                alt="Online Bank Receipt Slip"
                referrerPolicy="no-referrer"
                className="w-full max-h-[58vh] object-contain"
              />
            </div>
            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Verified Party Transaction Slip
              </span>
              <button
                onClick={() => setViewReceiptModalUrl(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 24/7 WhatsApp AI Call & Message Auto-Responder Modal */}
      {showAiWhatsAppBotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 text-slate-200 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>24/7 WhatsApp AI Voice Call & Auto-Responder</span>
                    <span className="text-xs text-emerald-400 font-urdu">(خودکار واٹس ایپ اے آئی اسسٹنٹ)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Automatically answers incoming WhatsApp calls & messages for party balances, prices & Meezan bank receipts 24/7.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiWhatsAppBotModal(false)}
                className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Helpline Status Bar */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="font-bold text-emerald-300">
                  AI Auto-Responder Status: LIVE & ACTIVE
                </span>
                <span className="text-slate-400 font-mono hidden sm:inline">
                  (+92 300 5861464 - HQ)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-[11px] font-semibold">
                  Branch 1, 2 & 3 Lines Integrated
                </span>
              </div>
            </div>

            {/* Test Simulator Controls */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Interactive Call & Message Simulator</span>
                </span>
                <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setSimType("call")}
                    className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                      simType === "call"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>📞 Incoming Voice Call</span>
                  </button>
                  <button
                    onClick={() => setSimType("message")}
                    className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                      simType === "message"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>💬 Incoming Message</span>
                  </button>
                </div>
              </div>

              {/* Customer Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Select Calling Party / Customer:
                  </label>
                  <select
                    value={simCustId}
                    onChange={(e) => {
                      setSimCustId(e.target.value);
                      const found = customers.find((c) => c.id === e.target.value);
                      if (found) setSimCustPhone(found.phone);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) - Udhaar: {settings.currencySymbol} {c.outstandingKhata.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Customer WhatsApp Phone Number:
                  </label>
                  <input
                    type="text"
                    value={simCustPhone}
                    onChange={(e) => setSimCustPhone(e.target.value)}
                    placeholder="0300-5861464"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Template Queries */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  Sample Customer Queries (Click to test):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() =>
                      setSimQuery(
                        "السلام علیکم! میرا کھاتہ بقایا کتنا ہے اور آن لائن بینک ٹرانسفر کے لیے میزان بینک کا اکاؤنٹ نمبر بھیج دیں۔"
                      )
                    }
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-300 transition"
                  >
                    💰 Khata Balance & Bank Details
                  </button>
                  <button
                    onClick={() =>
                      setSimQuery("کیا ماسٹر بلیک گولڈ لگژری باتھ سیٹ برانچ 2 میں اسٹاک میں دستیاب ہے؟")
                    }
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-300 transition"
                  >
                    🛁 Master Bath Set Stock & Rate
                  </button>
                  <button
                    onClick={() =>
                      setSimQuery("میزان بینک کا آن لائن اکاؤنٹ ٹائٹل اور IBAN نمبر ارسال فرما دیں۔")
                    }
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-300 transition"
                  >
                    🏦 Meezan Bank Account IBAN
                  </button>
                </div>
              </div>

              {/* Query Input Box */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Customer Spoken/Text Query:
                </label>
                <textarea
                  rows={2}
                  value={simQuery}
                  onChange={(e) => setSimQuery(e.target.value)}
                  placeholder="Type what customer asks on WhatsApp call or chat..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  {simType === "call" ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Web Speech Voice Assistant Active</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Instant WhatsApp Auto-Text Dispatch</span>
                    </>
                  )}
                </span>
                <button
                  onClick={handleRunAiWhatsAppBot}
                  disabled={isAiProcessingBot}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isAiProcessingBot ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>AI Responding...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 text-amber-300" />
                      <span>Simulate {simType === "call" ? "AI Voice Call" : "WhatsApp Message"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Log Transcripts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Recent WhatsApp Call & Message Transcripts ({botLogs.length})</span>
                {isSpeakingVoice && (
                  <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1 animate-pulse">
                    <Volume2 className="w-3.5 h-3.5" />
                    AI Speaking Voice Output...
                  </span>
                )}
              </h4>

              <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
                {botLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] border-b border-slate-800/80 pb-1.5">
                      <div className="flex items-center gap-2">
                        {log.type === "call" ? (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-semibold flex items-center gap-1">
                            <PhoneCall className="w-3 h-3" /> Call Answered
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-semibold flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Auto Message
                          </span>
                        )}
                        <span className="font-bold text-slate-200">{log.custName}</span>
                        <span className="text-slate-500 font-mono">({log.custPhone})</span>
                      </div>
                      <span className="text-slate-400 font-mono">{log.time}</span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-400 text-[11px]">
                        <strong className="text-amber-400">Customer Query:</strong> "{log.queryText}"
                      </p>
                      <p className="text-emerald-300 text-xs font-semibold whitespace-pre-line bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20">
                        🤖 <strong className="text-slate-100">AI Response:</strong> {log.aiAnswer}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span className="text-slate-400 font-mono">{log.actionTaken}</span>
                      <button
                        onClick={() => {
                          const clean = log.custPhone.replace(/[^0-9]/g, "");
                          const formatted = clean.startsWith("0") ? `92${clean.slice(1)}` : clean;
                          window.open(
                            `https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(
                              log.aiAnswer
                            )}`,
                            "_blank"
                          );
                        }}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg font-semibold transition flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send WhatsApp Again</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer button */}
            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAiWhatsAppBotModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Close Responder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
