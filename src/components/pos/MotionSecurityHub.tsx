import React, { useState, useRef, useEffect } from "react";
import { 
  MotionSnapshot, 
  SnapshotCategory, 
  Branch, 
  Invoice, 
  UserAccount, 
  StoreSettings 
} from "../../types";
import { 
  Camera, 
  Video, 
  ShieldAlert, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Printer, 
  Share2, 
  Download, 
  User, 
  Phone, 
  Clock, 
  Calendar, 
  Plus, 
  Eye, 
  X, 
  Maximize2, 
  Sparkles, 
  FileText, 
  Building2,
  RefreshCw,
  Zap,
  Info
} from "lucide-react";

interface MotionSecurityHubProps {
  snapshots: MotionSnapshot[];
  invoices: Invoice[];
  branches: Branch[];
  activeBranch: Branch;
  activeUser: UserAccount;
  settings: StoreSettings;
  onAddSnapshot: (snapshot: Omit<MotionSnapshot, "id" | "timestamp" | "timeFormatted" | "dateFormatted">) => void;
  onUpdateInvoice?: (updatedInvoice: Invoice) => void;
}

export const MotionSecurityHub: React.FC<MotionSecurityHubProps> = ({
  snapshots,
  invoices,
  branches,
  activeBranch,
  activeUser,
  settings,
  onAddSnapshot,
  onUpdateInvoice,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSnapshot, setSelectedSnapshot] = useState<MotionSnapshot | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [showLiveCaptureModal, setShowLiveCaptureModal] = useState<boolean>(false);
  const [simulatedMotionActive, setSimulatedMotionActive] = useState<boolean>(false);

  // Dispatch Pass Form State
  const [dispatchInvoiceId, setDispatchInvoiceId] = useState<string>("");
  const [dispatchReceiverName, setDispatchReceiverName] = useState<string>("");
  const [dispatchReceiverPhone, setDispatchReceiverPhone] = useState<string>("");
  const [dispatchVehicleNumber, setDispatchVehicleNumber] = useState<string>("سوزوکی پک اپ (Suzuki Ravi)");
  const [dispatchItemsSummary, setDispatchItemsSummary] = useState<string>("");
  const [dispatchImageUrl, setDispatchImageUrl] = useState<string>(
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80"
  );

  // Quick preset dispatch photo choices
  const DISPATCH_PRESET_IMAGES = [
    { label: "سوزوکی لوڈنگ (Suzuki Loading)", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80" },
    { label: "ڈرائیور گیٹ پاس (Driver Handover)", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80" },
    { label: "رکشہ ڈسپیچ (Rickshaw Cargo)", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80" },
    { label: "گاہک بائے ہینڈ (Customer Hand Carry)", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=80" },
  ];

  const UNKNOWN_MOTION_PRESET_IMAGES = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80",
  ];

  // Auto-fill items summary if an invoice is picked in dispatch modal
  useEffect(() => {
    if (dispatchInvoiceId) {
      const inv = invoices.find((i) => i.id === dispatchInvoiceId);
      if (inv) {
        if (!dispatchReceiverName) setDispatchReceiverName(inv.customerName);
        if (!dispatchReceiverPhone && inv.customerPhone) setDispatchReceiverPhone(inv.customerPhone);
        const summary = (inv.items || []).map((it) => `${it.quantity}x ${it.product?.name || "Item"}`).join(", ");
        setDispatchItemsSummary(summary || "Sanitary Ware & Pipes");
      }
    }
  }, [dispatchInvoiceId, invoices]);

  // Filter snapshots
  const filteredSnapshots = snapshots.filter((snap) => {
    const matchesCategory = activeCategory === "all" || snap.category === activeCategory;
    const matchesBranch = selectedBranchId === "all" || snap.branchId === selectedBranchId;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      snap.title.toLowerCase().includes(q) ||
      snap.cameraName.toLowerCase().includes(q) ||
      snap.customerName?.toLowerCase().includes(q) ||
      snap.receiverName?.toLowerCase().includes(q) ||
      snap.invoiceNumber?.toLowerCase().includes(q) ||
      snap.vehicleNumber?.toLowerCase().includes(q);

    return matchesCategory && matchesBranch && matchesQuery;
  });

  const countMotion = snapshots.filter((s) => s.category === "motion_unknown").length;
  const countPayment = snapshots.filter((s) => s.category === "payment_counter").length;
  const countDispatch = snapshots.filter((s) => s.category === "goods_dispatch").length;

  // Handle manual trigger of motion detection snapshot
  const handleTriggerSimulatedMotion = () => {
    setSimulatedMotionActive(true);
    setTimeout(() => {
      const randomImg = UNKNOWN_MOTION_PRESET_IMAGES[Math.floor(Math.random() * UNKNOWN_MOTION_PRESET_IMAGES.length)];
      const targetBranch = branches.find((b) => b.id === activeBranch.id) || branches[0];
      
      onAddSnapshot({
        branchId: targetBranch.id,
        branchName: targetBranch.name,
        cameraName: "Main Entrance Motion AI Cam #1",
        category: "motion_unknown",
        imageUrl: randomImg,
        title: "غیر متعلقہ شخص کی موشن کیمرے پر فوری شناخت",
        description: "موشن سینسر نے شو روم کے داخلی دروازے پر نیا چہرہ مانیٹر کر کے فوری تصویر کھینچی۔",
        isStaffRecognized: false,
        threatLevel: "normal",
        visitorType: "customer_entry",
      });
      setSimulatedMotionActive(false);
    }, 1200);
  };

  // Submit Goods Dispatch Pass
  const handleCreateDispatchPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchReceiverName) return;

    const targetBranch = branches.find((b) => b.id === activeBranch.id) || branches[0];
    const pickedInv = invoices.find((i) => i.id === dispatchInvoiceId);

    onAddSnapshot({
      branchId: targetBranch.id,
      branchName: targetBranch.name,
      cameraName: "Yard Loading & Gate Exit Cam",
      category: "goods_dispatch",
      imageUrl: dispatchImageUrl,
      title: `${dispatchReceiverName} - سامان ڈسپیچ تصویری گیٹ پاس (${pickedInv ? pickedInv.invoiceNumber : "Gate Exit"})`,
      description: `سامان دکان یا گودام سے اٹھاتے وقت گاڑی اور ڈرائیور کا تصویری ثبوت محفوظ کیا گیا۔`,
      invoiceId: pickedInv?.id,
      invoiceNumber: pickedInv?.invoiceNumber,
      receiverName: dispatchReceiverName,
      receiverPhone: dispatchReceiverPhone,
      vehicleNumber: dispatchVehicleNumber,
      itemsSummary: dispatchItemsSummary || "PPRC / PVC Pipes and Fittings",
      gateOfficerName: activeUser.name,
    });

    // Update invoice status if provided
    if (pickedInv && onUpdateInvoice) {
      onUpdateInvoice({
        ...pickedInv,
        dispatchStatus: "dispatched_verified",
        dispatchedAt: new Date().toISOString(),
        dispatchedToName: dispatchReceiverName,
        vehicleNumber: dispatchVehicleNumber,
        dispatchProofSnapshot: dispatchImageUrl,
      });
    }

    // Reset & Close
    setDispatchInvoiceId("");
    setDispatchReceiverName("");
    setDispatchReceiverPhone("");
    setDispatchItemsSummary("");
    setShowDispatchModal(false);
  };

  const handlePrintPass = (snap: MotionSnapshot) => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto space-y-6 text-slate-100 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-5 rounded-3xl shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border-2 border-indigo-400 flex items-center justify-center text-indigo-300 shadow-xl shrink-0">
            <Camera className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                AI موشن و سیکیورٹی کیمرہ سنیپ شاٹ حب (Smart CCTV Surveillance)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Motion Detection Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              <strong>حیدر سینیٹری 3 برانچز:</strong> موشن سینسر کیمرے عملے کے علاوہ کسی بھی غیر متعلقہ شخص کی فوری تصویر محفوظ کرتے ہیں، کاؤنٹر پر بل و ادائیگی کے وقت خریدار کی تصویر لیتے ہیں، اور سامان اٹھاتے وقت گاڑی و ڈرائیور کا تصویری گیٹ پاس بناتے ہیں۔
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 z-10 flex-wrap">
          <button
            onClick={handleTriggerSimulatedMotion}
            disabled={simulatedMotionActive}
            className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/10"
            title="موشن کیمرے کے سامنے کسی شخص کی آمد کا ٹیسٹ سنیپ شاٹ لیں"
          >
            <Zap className={`w-4 h-4 text-amber-400 ${simulatedMotionActive ? "animate-spin" : ""}`} />
            <span>{simulatedMotionActive ? "چہرہ مانیٹر ہو رہا ہے..." : "ٹیسٹ موشن الرٹ (نیا وزٹر)"}</span>
          </button>

          <button
            onClick={() => setShowDispatchModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Truck className="w-4 h-4" />
            <span>+ نیا سامان گیٹ پاس / ڈسپیچ تصویر</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Unknown Motion */}
        <div 
          onClick={() => setActiveCategory("motion_unknown")}
          className={`cursor-pointer p-4 rounded-2xl border transition relative overflow-hidden ${
            activeCategory === "motion_unknown"
              ? "bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-500/10"
              : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>غیر متعلقہ افراد / موشن الرٹس</span>
            </span>
            <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
              {countMotion} سنیپ شاٹس
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            عملے کے علاوہ کسی بھی نامعلوم شخص کے دکان یا گودام میں آنے پر آٹو تصویر
          </p>
        </div>

        {/* Card 2: Payment Counter */}
        <div 
          onClick={() => setActiveCategory("payment_counter")}
          className={`cursor-pointer p-4 rounded-2xl border transition relative overflow-hidden ${
            activeCategory === "payment_counter"
              ? "bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
              : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>ادائیگی و بلنگ سنیپ شاٹس</span>
            </span>
            <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
              {countPayment} ادائیگیاں
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            کاؤنٹر پر بل بناتے اور رقم ادا کرتے وقت خریدار کا تصویری ثبوت برائے رسید
          </p>
        </div>

        {/* Card 3: Goods Dispatch */}
        <div 
          onClick={() => setActiveCategory("goods_dispatch")}
          className={`cursor-pointer p-4 rounded-2xl border transition relative overflow-hidden ${
            activeCategory === "goods_dispatch"
              ? "bg-blue-950/40 border-blue-500/50 shadow-lg shadow-blue-500/10"
              : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>سامان لے جانے کا تصویری گیٹ پاس</span>
            </span>
            <span className="text-xs font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
              {countDispatch} روانگیاں
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            گاڑی، رکشہ یا گاہک کے سامان (پائپ، مکسرز) لے جانے پر گیٹ سے نکلتے وقت تصویر
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "تمام کیمرہ سنیپ شاٹس (All)" },
            { id: "motion_unknown", label: "غیر متعلقہ موشن الرٹس" },
            { id: "payment_counter", label: "بل و ادائیگی ثبوت" },
            { id: "goods_dispatch", label: "سامان گیٹ پاس" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategory === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Branch & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-medium outline-none"
          >
            <option value="all">تمام برانچز (All Branches)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="تلاش: نام، بل نمبر، گاڑی، کیمرہ..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Snapshots Grid */}
      {filteredSnapshots.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-3xl text-center space-y-3">
          <Camera className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">کوئی سیکیورٹی سنیپ شاٹ نہیں ملا</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            منتخب کردہ فلٹر کے مطابق کوئی ریکارڈ دستیاب نہیں۔ موشن الرٹ ٹیسٹ کریں یا نیا سامان گیٹ پاس بنائیں۔
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSnapshots.map((snap) => {
            const isMotion = snap.category === "motion_unknown";
            const isPayment = snap.category === "payment_counter";
            const isDispatch = snap.category === "goods_dispatch";

            return (
              <div
                key={snap.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl transition flex flex-col justify-between group"
              >
                {/* Image Section */}
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  <img
                    src={snap.imageUrl}
                    alt={snap.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/50" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase flex items-center gap-1 shadow-md ${
                        isMotion
                          ? "bg-amber-500/30 text-amber-300 border-amber-500/40 backdrop-blur-sm"
                          : isPayment
                          ? "bg-emerald-500/30 text-emerald-300 border-emerald-500/40 backdrop-blur-sm"
                          : "bg-blue-500/30 text-blue-300 border-blue-500/40 backdrop-blur-sm"
                      }`}
                    >
                      {isMotion && <ShieldAlert className="w-3 h-3 text-amber-400" />}
                      {isPayment && <CreditCard className="w-3 h-3 text-emerald-400" />}
                      {isDispatch && <Truck className="w-3 h-3 text-blue-400" />}
                      <span>
                        {isMotion
                          ? "موشن الرٹ (غیر ملازم)"
                          : isPayment
                          ? "ادائیگی کاؤنٹر ثبوت"
                          : "سامان ڈسپیچ گیٹ پاس"}
                      </span>
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] text-slate-300 font-mono backdrop-blur-sm border border-slate-700/50">
                      {snap.timeFormatted}
                    </span>
                  </div>

                  {/* Bottom Image Overlay Info */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
                    <span className="font-mono text-xs font-semibold text-slate-200 truncate max-w-[200px]">
                      📹 {snap.cameraName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {snap.branchName}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {snap.title}
                    </h4>

                    {snap.description && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {snap.description}
                      </p>
                    )}

                    {/* Specific Metadata by Category */}
                    {isMotion && (
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">شناخت کی صورتحال:</span>
                          <span className="font-bold text-amber-300">غیر رجسٹرڈ چہرہ</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">سیکیورٹی درجہ:</span>
                          <span className="font-bold text-emerald-400">نارمل وزٹر (Normal)</span>
                        </div>
                      </div>
                    )}

                    {isPayment && (
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">خریدار کا نام:</span>
                          <span className="font-bold text-slate-100">{snap.customerName || "حاجی عرفان"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">ادا شدہ رقم:</span>
                          <span className="font-mono font-black text-emerald-400 text-sm">
                            {settings.currencySymbol} {snap.amountPaid ? snap.amountPaid.toLocaleString() : "45,000"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>بل نمبر: {snap.invoiceNumber || "HPS-2026-0001"}</span>
                          <span>طریقہ: {snap.paymentMethod || "کیش"}</span>
                        </div>
                      </div>
                    )}

                    {isDispatch && (
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">وصول کنندہ / ڈرائیور:</span>
                          <span className="font-bold text-blue-300">{snap.receiverName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">گاڑی / سواری نمبر:</span>
                          <span className="font-mono font-bold text-amber-300">{snap.vehicleNumber}</span>
                        </div>
                        {snap.itemsSummary && (
                          <div className="text-[11px] text-slate-300 bg-slate-900 p-1.5 rounded-lg">
                            <span className="text-slate-400 block text-[10px]">سامان کی تفصیل:</span>
                            <span className="line-clamp-2">{snap.itemsSummary}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>گیٹ انچارج: {snap.gateOfficerName || "قنبر علی"}</span>
                          {snap.invoiceNumber && <span>بل: {snap.invoiceNumber}</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <button
                      onClick={() => setSelectedSnapshot(snap)}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>تفصیلات و فل ویو</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrintPass(snap)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                        title="پرنٹ گیٹ پاس"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `حیدر سینیٹری سیکیورٹی لاگ: ${snap.title} | کیمرہ: ${snap.cameraName} | وقت: ${snap.timeFormatted}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg"
                        title="واٹس ایپ پر شیئر کریں"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goods Dispatch & Gate Pass Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    نیا سامان ڈسپیچ تصویری گیٹ پاس
                  </h3>
                  <p className="text-xs text-slate-400">
                    سامان لے جانے والے شخص یا گاڑی کا کیمرہ سنیپ شاٹ اور رسید
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDispatchPass} className="space-y-4 text-xs">
              {/* Select Invoice */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  متعلقہ بل / انوائس نمبر منتخب کریں (اختیاری):
                </label>
                <select
                  value={dispatchInvoiceId}
                  onChange={(e) => setDispatchInvoiceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
                >
                  <option value="">-- منتخب کریں (یا دستی اندراج کریں) --</option>
                  {invoices.slice(0, 15).map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.customerName} (Rs. {inv.grandTotal.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Driver / Receiver Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    سامان لے جانے والے کا نام *:
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchReceiverName}
                    onChange={(e) => setDispatchReceiverName(e.target.value)}
                    placeholder="مثلاً: محمد ساجد (ڈرائیور) یا گاہک"
                    className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    ڈرائیور / وصول کنندہ فون:
                  </label>
                  <input
                    type="text"
                    value={dispatchReceiverPhone}
                    onChange={(e) => setDispatchReceiverPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Vehicle Number */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  گاڑی / رکشہ نمبر یا طریقہ روانگی *:
                </label>
                <input
                  type="text"
                  required
                  value={dispatchVehicleNumber}
                  onChange={(e) => setDispatchVehicleNumber(e.target.value)}
                  placeholder="مثلاً: سوزوکی راوی LES-4921 / چنگچی رکشہ / کسٹمر بائے ہینڈ"
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Items Summary */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  روانہ ہونے والے سامان کی مختصر تفصیل:
                </label>
                <textarea
                  rows={2}
                  value={dispatchItemsSummary}
                  onChange={(e) => setDispatchItemsSummary(e.target.value)}
                  placeholder="مثلاً: 25 لینتھ PPRC پائپس، 4 عدد شاور مکسر، 1 پی وی سی سلوشن گیلن..."
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Gate Photo Selection */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  گیٹ کیمرہ سنیپ شاٹ تصویر منتخب کریں:
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {DISPATCH_PRESET_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDispatchImageUrl(img.url)}
                      className={`relative rounded-xl overflow-hidden border p-1 text-left ${
                        dispatchImageUrl === img.url
                          ? "border-indigo-500 ring-2 ring-indigo-500/30"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-16 object-cover rounded-lg"
                      />
                      <span className="block text-[10px] text-slate-300 mt-1 font-semibold truncate">
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>گیٹ پاس محفوظ کریں</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snapshot Full Details Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-white text-base">
                  سیکیورٹی کیمرہ مکمل سنیپ شاٹ آڈٹ
                </h3>
              </div>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-700 relative">
              <img
                src={selectedSnapshot.imageUrl}
                alt={selectedSnapshot.title}
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-sm p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400 font-bold">
                  {selectedSnapshot.cameraName}
                </span>
                <span className="text-slate-300">
                  {selectedSnapshot.dateFormatted} • {selectedSnapshot.timeFormatted}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-100 text-sm">{selectedSnapshot.title}</h4>
              <p className="text-slate-400 leading-relaxed">{selectedSnapshot.description}</p>

              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">برانچ:</span>
                  <span className="font-bold text-slate-200">{selectedSnapshot.branchName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">کیٹیگری:</span>
                  <span className="font-bold text-indigo-300 uppercase">
                    {selectedSnapshot.category.replace("_", " ")}
                  </span>
                </div>
                {selectedSnapshot.customerName && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">کسٹمر:</span>
                    <span className="font-bold text-slate-200">{selectedSnapshot.customerName}</span>
                  </div>
                )}
                {selectedSnapshot.amountPaid && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">رقم:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {settings.currencySymbol} {selectedSnapshot.amountPaid.toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedSnapshot.receiverName && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">ڈرائیور / وصول کنندہ:</span>
                    <span className="font-bold text-slate-200">{selectedSnapshot.receiverName}</span>
                  </div>
                )}
                {selectedSnapshot.vehicleNumber && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">گاڑی نمبر:</span>
                    <span className="font-mono font-bold text-amber-300">{selectedSnapshot.vehicleNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handlePrintPass(selectedSnapshot)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>پرنٹ تصویری ثبوت / گیٹ پاس</span>
              </button>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"
              >
                ٹھیک ہے (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
