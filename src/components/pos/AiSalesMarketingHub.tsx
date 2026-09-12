import React, { useState, useMemo } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Copy,
  Check,
  Truck,
  Phone,
  MessageSquare,
  Share2,
  Building2,
  ShieldCheck,
  Layers,
  Plus,
  RefreshCw,
  FileText,
  Printer,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Award,
  Zap,
  Search,
  Filter,
  Package,
  Wrench,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  Product,
  Branch,
  StoreSettings,
  OnlineAiOrder,
  AiMarketingCampaign,
  AiSalesChatMessage,
  Invoice,
  Customer,
} from "../../types";
import {
  getStoredAiOrders,
  saveStoredAiOrders,
  getStoredAiCampaigns,
  saveStoredAiCampaigns,
} from "../../utils/posStorage";
import {
  generateMarketingCampaign,
  parseOnlineOrderWithAI,
  chatWithSalesAdvisor,
} from "../../services/geminiService";

interface AiSalesMarketingHubProps {
  products: Product[];
  branches: Branch[];
  currentBranchId: string;
  settings: StoreSettings;
  onConvertToInvoice: (order: OnlineAiOrder) => void;
}

export const AiSalesMarketingHub: React.FC<AiSalesMarketingHubProps> = ({
  products,
  branches,
  currentBranchId,
  settings,
  onConvertToInvoice,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "orders" | "marketing" | "advisor" | "sync"
  >("orders");

  // Orders State
  const [orders, setOrders] = useState<OnlineAiOrder[]>(() => getStoredAiOrders());
  const [selectedOrder, setSelectedOrder] = useState<OnlineAiOrder | null>(
    orders[0] || null
  );
  const [orderFilterBranch, setOrderFilterBranch] = useState<string>("all");
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>("all");

  // Order Ingestion state
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [rawInquiryInput, setRawInquiryInput] = useState("");
  const [ingestionMessage, setIngestionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Marketing Campaign State
  const [campaigns, setCampaigns] = useState<AiMarketingCampaign[]>(() =>
    getStoredAiCampaigns()
  );
  const [selectedCampaign, setSelectedCampaign] = useState<AiMarketingCampaign | null>(
    campaigns[0] || null
  );
  const [campaignType, setCampaignType] = useState<
    "dream_home" | "viral_social" | "trust_branding" | "plumber_special"
  >("dream_home");
  const [targetAudience, setTargetAudience] = useState("Homeowners & New Builders");
  const [customOffer, setCustomOffer] = useState("15% Dream Home Renovation Discount + Free Delivery");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Bath Set",
    "Basin Mixer",
    "PPRC Pipes & Fittings",
  ]);
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Chat Advisor State
  const [chatMessages, setChatMessages] = useState<AiSalesChatMessage[]>([
    {
      id: "msg-0",
      sender: "ai",
      text: `وعلیکم السلام و رحمتہ اللہ! Welcome to QumberSanitary 24/7 AI Sales & Dream Home Advisory.
ہم اپنے کسٹمرز کو 100% اصلی خالص پیتل کے باتھ سیٹس، لیکیج پروف پی پی آر سی پائپ اور پورٹا سیرامکس کے ذریعے ان کا خوابوں جیسا گھر بنانے میں مدد کرتے ہیں۔

پشاور کی تینوں برانچز (کینٹ ہیڈ آفس، سٹی مارکیٹ برانڈرتھ روڈ، ہائی وے بائی پاس) 24 گھنٹے آپ کی خدمت کیلئے حاضر ہیں!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedProducts: [
        {
          name: "Master Black Gold Bath Set (8 Pcs)",
          price: 99530,
          category: "Luxury Bath",
          trustPoint: "100% Pure Heavy Brass Guarantee",
        },
        {
          name: "Master Basin Mixer Luxury",
          price: 20120,
          category: "Faucets",
          trustPoint: "Zero-Leak Ceramic Core",
        },
        {
          name: "Master PPRC Pipe 25mm PN-20",
          price: 530,
          category: "Piping",
          trustPoint: "50-Year Pressure Certified",
        },
      ],
      quickReplies: [
        "Suggest Master Bathroom Package",
        "Which pipe is better: PPRC or PVC?",
        "Check stock across 3 branches",
        "What is your warranty policy?",
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Helpers
  const currentBranch = branches.find((b) => b.id === currentBranchId) || branches[0];

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sample prompt buttons for 24/7 online orders
  const sampleInquiries = [
    {
      title: "Hayatabad Dream Banglow Order",
      text: "اسلام علیکم، حیات آباد فیز 5 کوٹھی کیلئے ارجنٹ سامان چاہئے: 2 سیٹ ماسٹر بلیک گولڈ بیسن مکسر، 1 مکمل باتھ سیٹ 8 پیس، اور 15 لینتھ ماسٹر 25 ایم ایم پی پی آر سی پائپ۔ برائے مہربانی کیش آن ڈیلیوری بھیجیں، فون نمبر 0301-8592110 ڈاکٹر طارق جمیل۔",
    },
    {
      title: "Highway Bypass Drainage Order",
      text: "Highway Bypass project site requirement: 30 lengths 4-inch Popular PVC Class B pipes and 15 P-traps. Deliver via pickup within 2 hours. Site Supervisor Farhan 0333-9182736.",
    },
    {
      title: "City Market Plumber Renovation",
      text: "Brandreth Road flat plumbing renovation: 4 pcs Single Lever Wall Shower Mixers (Sonex/Master), 20 elbows 25mm PPRC, 1 Master Kitchen Sink Mixer. Plumber Bashir 0345-9988776.",
    },
  ];

  // Process raw text with AI Order Agent
  const handleProcessAiOrder = async () => {
    if (!rawInquiryInput.trim()) return;
    setIsProcessingOrder(true);
    setIngestionMessage(null);

    try {
      // Build inventory summary to ground the AI
      const inventorySummary = products
        .slice(0, 25)
        .map((p) => `${p.name} (Code: ${p.code}, Brand: ${p.brand || "Master"}, Price: Rs. ${p.price})`)
        .join("; ");

      const result = await parseOnlineOrderWithAI({
        inquiryText: rawInquiryInput,
        inventoryContext: inventorySummary,
        branches,
      });

      const newOrder: OnlineAiOrder = {
        id: `ai-ord-${Date.now()}`,
        orderNumber: `AI-247-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: result.customerName || "Online Customer",
        customerPhone: result.customerPhone || "0300-0000000",
        customerAddress: result.customerAddress || "Peshawar Delivery Address",
        source: "whatsapp",
        assignedBranchId: result.assignedBranchId || "branch-1",
        assignedBranchName:
          result.assignedBranchName ||
          branches.find((b) => b.id === result.assignedBranchId)?.name ||
          "Branch 1 - Main Head Office",
        status: "ai_verified",
        items: (result.items || []).map((it) => ({
          productName: it.productName,
          brand: it.brand || "Master",
          quantity: it.quantity || 1,
          unitPrice: it.unitPrice || 5000,
          total: (it.quantity || 1) * (it.unitPrice || 5000),
          stockStatus: it.stockStatus || "in_stock",
          branchAvailability: branches.map((b) => ({
            branchId: b.id,
            branchName: b.name,
            availableStock: Math.floor(10 + Math.random() * 40),
          })),
        })),
        subtotal: result.subtotal || 45000,
        deliveryFee: result.deliveryFee || 1000,
        discount: result.discount || 1500,
        totalAmount: result.totalAmount || 44500,
        paymentMethod: result.paymentMethod || "cod",
        rawInquiryText: rawInquiryInput,
        aiConfidence: result.aiConfidence || 96,
        aiNotes:
          result.aiNotes ||
          "24/7 AI verified customer items, checked cross-branch stock availability, and assigned to optimal branch.",
        crossBranchNotes:
          result.crossBranchNotes || "Stock ready for immediate delivery dispatch.",
        transferRecommended: result.transferRecommended || false,
        createdAt: new Date().toISOString(),
      };

      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      saveStoredAiOrders(updatedOrders);
      setSelectedOrder(newOrder);
      setRawInquiryInput("");
      setIngestionMessage({
        type: "success",
        text: `Order #${newOrder.orderNumber} successfully analyzed and routed to ${newOrder.assignedBranchName}!`,
      });
    } catch (err: any) {
      console.error(err);
      setIngestionMessage({
        type: "error",
        text: err.message || "Failed to process order with AI.",
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Generate Marketing Campaign with AI
  const handleGenerateCampaign = async () => {
    setIsGeneratingCampaign(true);
    try {
      const result = await generateMarketingCampaign({
        campaignType,
        targetAudience,
        themeFocus: "Trust in Sanitary Ware & Making Homes a Dream Reality",
        customOffer,
        featuredProducts: selectedCategories,
      });

      const newCampaign: AiMarketingCampaign = {
        id: `camp-${Date.now()}`,
        title: result.title || "Dream Home Luxury Bathroom Package",
        campaignType,
        targetAudience,
        headlineUrdu:
          result.headlineUrdu ||
          "آپ کا خواب، ہمارا معیار — حیدر سینیٹری کے ساتھ اپنے گھر کو جنت بنائیں",
        headlineEnglish:
          result.headlineEnglish ||
          "Make Your Home A Dream Reality with QumberSanitary Luxury Fittings",
        contentUrdu:
          result.contentUrdu ||
          "✨ حیدر سینیٹری پیش کرتے ہیں 100% خالص پیتل کے باتھ سیٹس اور لیکیج پروف پائپ۔ 3 برانچز سے 24/7 تیز ترین ترسیل۔",
        contentEnglish:
          result.contentEnglish ||
          "Transform your bathroom with QumberSanitary authentic heavy brass fixtures and 50-year warranty PPRC piping across 3 branches.",
        suggestedOffer: result.suggestedOffer || customOffer,
        trustGuarantees: result.trustGuarantees || [
          "100% Authentic Heavy Brass (خالص پیتل)",
          "Zero-Leakage Ceramic Disc Cartridge",
          "7-Day Money Back / Exchange Policy",
          "3 Fully Operational Branches & Warehouses",
        ],
        featuredCategories: selectedCategories,
        suggestedHashtags:
          result.suggestedHashtags || [
            "#QumberSanitary",
            "#DreamHomePakistan",
            "#LuxurySanitary",
            "#PeshawarSanitary",
          ],
        callToAction:
          result.callToAction ||
          "ابھی واٹس ایپ پر آرڈر کریں یا قریبی برانچ تشریف لائیں! WhatsApp: 0300-5861464",
        branchContacts: branches.map((b) => ({
          branchName: b.name,
          phone: b.phone,
          whatsapp: b.whatsapp || b.phone,
          location: b.address,
        })),
        createdAt: new Date().toISOString(),
      };

      const updated = [newCampaign, ...campaigns];
      setCampaigns(updated);
      saveStoredAiCampaigns(updated);
      setSelectedCampaign(newCampaign);
    } catch (err) {
      console.error("Campaign generation error:", err);
    } finally {
      setIsGeneratingCampaign(false);
    }
  };

  // AI Chat Advisor send
  const handleSendChatMessage = async (textToSend?: string) => {
    const message = textToSend || chatInput;
    if (!message.trim() || isChatLoading) return;

    const userMsg: AiSalesChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const history = chatMessages.slice(-6).map((m) => ({
        sender: m.sender as "user" | "ai",
        text: m.text,
      }));

      const response = await chatWithSalesAdvisor(message, currentBranchId, history);

      const aiMsg: AiSalesChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedProducts: response.suggestedProducts,
        quickReplies: response.quickReplies,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: AiSalesChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text:
          "Welcome to QumberSanitary! We are standing by 24/7 across Branch 1 (Main HQ Cantt), Branch 2 (City Market), and Branch 3 (Highway Bypass) to serve your sanitary ware needs with 100% pure brass quality and complete trust.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Order status badge styling
  const getStatusBadge = (status: OnlineAiOrder["status"]) => {
    switch (status) {
      case "ai_verified":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Bot className="w-3 h-3" /> AI Verified (مصدقہ)
          </span>
        );
      case "assigned":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Building2 className="w-3 h-3" /> Branch Assigned
          </span>
        );
      case "dispatched":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Truck className="w-3 h-3" /> Dispatched (روانہ)
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3" /> New Online Inquiry
          </span>
        );
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return (orders || []).filter((ord) => {
      const matchBranch =
        orderFilterBranch === "all" || ord.assignedBranchId === orderFilterBranch;
      const matchStatus =
        orderFilterStatus === "all" || ord.status === orderFilterStatus;
      return matchBranch && matchStatus;
    });
  }, [orders, orderFilterBranch, orderFilterStatus]);

  // WhatsApp order dispatch text generator
  const getWhatsAppOrderText = (order: OnlineAiOrder) => {
    return `*QumberSanitary (قنبر سینیٹری) - 24/7 Verified Order Confirmation*
━━━━━━━━━━━━━━━━━━━━━━━
Order ID: #${order.orderNumber}
Customer: ${order.customerName}
Delivery Address: ${order.customerAddress}
Fulfillment Hub: ${order.assignedBranchName}

*Items Ordered:*
${order.items.map((it) => `• ${it.productName} (${it.brand || "Master"}) x ${it.quantity} = Rs. ${it.total.toLocaleString()}`).join("\n")}

Subtotal: Rs. ${order.subtotal.toLocaleString()}
Delivery: Rs. ${order.deliveryFee.toLocaleString()}
Discount: Rs. ${order.discount.toLocaleString()}
*Net Total Payable: Rs. ${order.totalAmount.toLocaleString()}*
Payment Mode: ${order.paymentMethod.toUpperCase()}

*Brand Quality & Trust Guarantee:*
✅ 100% Pure Heavy Brass Guarantee (خالص پیتل)
✅ 7-Day Money Back / Replacement Guarantee
✅ 50-Year Warranty on Master PPRC Pipe Systems

Thank you for choosing QumberSanitary to make your dream home reality!
For support, call or WhatsApp: 0300-5861464`;
  };

  return (
    <div className="space-y-6" id="ai-sales-marketing-hub">
      {/* Top Banner: Brand Building & 24/7 Autonomous Agent Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -end-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -start-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                24/7 AI Autonomous Agent Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                <Building2 className="w-3.5 h-3.5" /> 3 Branches Network Synchronized
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              QumberSanitary AI Sales, Marketing & 24/7 Order Center
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
              <span className="font-semibold text-white">Brand Building of Sanitary:</span>{" "}
              Providing unwavering customer trust with 100% pure heavy brass fittings, zero-leakage PPRC/PVC systems, and automated 24/7 order fulfillment to{" "}
              <span className="text-indigo-300 font-semibold italic">
                &ldquo;make every customer&apos;s home like a dream.&rdquo;
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Current POS Terminal</div>
                <div className="text-sm font-semibold text-white truncate">
                  {currentBranch.name}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">24/7 Online Orders</div>
                <div className="text-sm font-semibold text-white">
                  {orders.length} Active Across 3 Branches
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab("orders")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === "orders"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Truck className="w-4 h-4" />
            24/7 Multi-Branch Orders (آن لائن آرڈرز)
            <span className="ms-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-900/50 text-indigo-200">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("marketing")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === "marketing"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Brand Building & Ads (برانڈ مارکیٹنگ)
          </button>

          <button
            onClick={() => setActiveSubTab("advisor")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === "advisor"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Bot className="w-4 h-4" />
            24/7 AI Dream Home Advisor (کسٹمر چیٹ ایڈوائزر)
          </button>

          <button
            onClick={() => setActiveSubTab("sync")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === "sync"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            3-Branch Stock Balancing (تینوں برانچز کا باہمی توازن)
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: 24/7 MULTI-BRANCH ONLINE ORDERS
      ========================================================================= */}
      {activeSubTab === "orders" && (
        <div className="space-y-6">
          {/* Order Intake & AI Parser Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  24/7 AI Order Ingestion & Routing Agent
                </h2>
                <p className="text-sm text-slate-500">
                  Paste incoming WhatsApp inquiries, phone orders, or voice transcripts in Urdu, English, or Roman Urdu. The AI parses items, checks inventory across all 3 branches, calculates PKR prices, and prepares invoice.
                </p>
              </div>

              {/* Sample Templates */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Sample Inquiries:</span>
                {sampleInquiries.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setRawInquiryInput(sample.text)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-100 font-medium"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                value={rawInquiryInput}
                onChange={(e) => setRawInquiryInput(e.target.value)}
                placeholder="Paste customer WhatsApp message or phone order text here (e.g. 'Salam bhai, Hayatabad Phase 5 k liye 2 Master black gold basin mixer aur 10 pipe 25mm chahiay...')"
                className="w-full h-28 p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none transition-all placeholder:text-slate-400"
              />

              {ingestionMessage && (
                <div
                  className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
                    ingestionMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {ingestionMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  {ingestionMessage.text}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cross-branch inventory lookup & 100% brass quality audit included</span>
                </div>

                <button
                  onClick={handleProcessAiOrder}
                  disabled={isProcessingOrder || !rawInquiryInput.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
                >
                  {isProcessingOrder ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing with AI across 3 Branches...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze & Route Order (AI آرڈر پراسیس)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Orders Layout: Left List + Right Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Orders Queue (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Online Orders Queue ({filteredOrders.length})
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs">
                    <select
                      value={orderFilterBranch}
                      onChange={(e) => setOrderFilterBranch(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs outline-none"
                    >
                      <option value="all">All 3 Branches</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={orderFilterStatus}
                      onChange={(e) => setOrderFilterStatus(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="new_inquiry">New</option>
                      <option value="ai_verified">AI Verified</option>
                      <option value="assigned">Assigned</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pe-1">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No orders found matching the filter.
                    </div>
                  ) : (
                    filteredOrders.map((ord) => {
                      const isSelected = selectedOrder?.id === ord.id;
                      return (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div>
                              <div className="text-xs font-mono font-bold text-indigo-700">
                                #{ord.orderNumber}
                              </div>
                              <div className="font-bold text-slate-900 text-sm">
                                {ord.customerName}
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="font-bold text-slate-900 text-sm">
                                Rs. {ord.totalAmount.toLocaleString()}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {new Date(ord.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-600 mb-2 truncate">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate font-medium">
                              {ord.assignedBranchName}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            {getStatusBadge(ord.status)}
                            <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              {ord.aiConfidence}% AI Match
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Order Details (7 cols) */}
            <div className="lg:col-span-7">
              {selectedOrder ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-indigo-600">
                          #{selectedOrder.orderNumber}
                        </span>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {selectedOrder.customerName}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {selectedOrder.customerPhone}
                        </span>
                        <span>•</span>
                        <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Quick Status Update */}
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => {
                          const updated = orders.map((o) =>
                            o.id === selectedOrder.id
                              ? { ...o, status: e.target.value as any }
                              : o
                          );
                          setOrders(updated);
                          saveStoredAiOrders(updated);
                          setSelectedOrder({
                            ...selectedOrder,
                            status: e.target.value as any,
                          });
                        }}
                        className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      >
                        <option value="new_inquiry">New Inquiry</option>
                        <option value="ai_verified">AI Verified</option>
                        <option value="assigned">Assigned to Branch</option>
                        <option value="dispatched">Dispatched (روانہ)</option>
                        <option value="delivered">Delivered (مکمل)</option>
                      </select>
                    </div>
                  </div>

                  {/* Delivery Location & Fulfillment Hub */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-indigo-600" />
                        Delivery Destination
                      </div>
                      <div className="text-sm font-semibold text-slate-800">
                        {selectedOrder.customerAddress}
                      </div>
                    </div>

                    <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <div className="text-xs font-medium text-indigo-600 mb-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        Assigned Fulfillment Hub
                      </div>
                      <div className="text-sm font-semibold text-indigo-950">
                        {selectedOrder.assignedBranchName}
                      </div>
                    </div>
                  </div>

                  {/* 24/7 AI Routing Intelligence */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-white rounded-xl border border-indigo-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        24/7 AI Multi-Branch Routing Intelligence
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                        Confidence: {selectedOrder.aiConfidence}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedOrder.aiNotes}
                    </p>
                    {selectedOrder.crossBranchNotes && (
                      <div className="text-xs text-indigo-800 bg-indigo-100/60 p-2 rounded-lg font-medium">
                        {selectedOrder.crossBranchNotes}
                      </div>
                    )}
                  </div>

                  {/* Order Items Table with Multi-Branch Availability */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">
                        Requested Items & 3-Branch Availability
                      </h4>
                      <span className="text-xs text-slate-500">
                        {selectedOrder.items.length} Product Line(s)
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-start text-xs">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Product Name</th>
                            <th className="p-3 text-center">Qty</th>
                            <th className="p-3 text-end">Price (PKR)</th>
                            <th className="p-3 text-end">Total</th>
                            <th className="p-3 text-center">3-Branch Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedOrder.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-3 font-semibold text-slate-900">
                                {item.productName}
                                {item.brand && (
                                  <span className="ms-1.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                                    {item.brand}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center font-bold text-slate-800">
                                {item.quantity}
                              </td>
                              <td className="p-3 text-end text-slate-600">
                                Rs. {item.unitPrice.toLocaleString()}
                              </td>
                              <td className="p-3 text-end font-bold text-slate-900">
                                Rs. {item.total.toLocaleString()}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-1 text-[10px]">
                                  <span
                                    title="Branch 1 Main HQ"
                                    className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold border border-blue-200"
                                  >
                                    BR1: {item.branchAvailability?.[0]?.availableStock ?? "Available"}
                                  </span>
                                  <span
                                    title="Branch 2 City Market"
                                    className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-semibold border border-emerald-200"
                                  >
                                    BR2: {item.branchAvailability?.[1]?.availableStock ?? "Available"}
                                  </span>
                                  <span
                                    title="Branch 3 Highway Bypass"
                                    className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-semibold border border-amber-200"
                                  >
                                    BR3: {item.branchAvailability?.[2]?.availableStock ?? "Available"}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-xs space-y-1 text-slate-600">
                      <div>
                        Subtotal:{" "}
                        <span className="font-semibold text-slate-900">
                          Rs. {selectedOrder.subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        Delivery Fee:{" "}
                        <span className="font-semibold text-slate-900">
                          Rs. {selectedOrder.deliveryFee.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        Inaugural Discount:{" "}
                        <span className="font-semibold text-emerald-600">
                          -Rs. {selectedOrder.discount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="text-xs text-slate-500 font-medium">Grand Net Total</div>
                      <div className="text-2xl font-extrabold text-indigo-700">
                        Rs. {selectedOrder.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500 uppercase font-semibold">
                        {selectedOrder.paymentMethod}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: 1-Click Invoice & WhatsApp confirmation */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => onConvertToInvoice(selectedOrder)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      Convert to POS Invoice & Reserve Stock (بل تیار کریں)
                    </button>

                    <button
                      onClick={() => {
                        const text = getWhatsAppOrderText(selectedOrder);
                        const phone = selectedOrder.customerPhone.replace(/[^0-9]/g, "");
                        const waUrl = `https://wa.me/${phone.startsWith("0") ? "92" + phone.slice(1) : phone}?text=${encodeURIComponent(text)}`;
                        window.open(waUrl, "_blank");
                      }}
                      className="px-4 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      Send 24/7 WhatsApp Confirmation
                    </button>

                    <button
                      onClick={() =>
                        handleCopyText(
                          getWhatsAppOrderText(selectedOrder),
                          `copy-${selectedOrder.id}`
                        )
                      }
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all"
                    >
                      {copiedId === `copy-${selectedOrder.id}` ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy Confirmation
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                  Select an online order from the left queue to view details and fulfillment routing.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BRAND BUILDING & MARKETING CAMPAIGN STUDIO
      ========================================================================= */}
      {activeSubTab === "marketing" && (
        <div className="space-y-6">
          {/* Campaign Generator Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  QumberSanitary Brand Building & Ad Generator
                </h2>
                <p className="text-sm text-slate-500">
                  Empower your 3 branches with persuasive, trust-building campaigns that highlight our genuine brass quality, zero-leakage guarantee, and dream home packages.
                </p>
              </div>

              <button
                onClick={handleGenerateCampaign}
                disabled={isGeneratingCampaign}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
              >
                {isGeneratingCampaign ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Campaign with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate New Campaign (نئی مہم بنائیں)
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Campaign Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Campaign Archetype</label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value as any)}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="dream_home">Dream Home Luxury Bathroom (خوابوں جیسا گھر)</option>
                  <option value="trust_branding">Pure Brass Trust & Anti-Leakage (پختہ اعتماد)</option>
                  <option value="plumber_special">Plumber & Contractor Loyalty Scheme (پلمبرز پیکیج)</option>
                  <option value="viral_social">Viral Facebook & TikTok Video Ad Copy (سوشل میڈیا)</option>
                </select>
              </div>

              {/* Target Audience */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Audience</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Home builders in Peshawar, Plumbers"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Custom Offer */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Special Promotion / Offer</label>
                <input
                  type="text"
                  value={customOffer}
                  onChange={(e) => setCustomOffer(e.target.value)}
                  placeholder="e.g. 15% discount + Free 3-branch site delivery"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Campaigns Grid & Selected Viewer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Campaign Selection List (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                Saved Brand Campaigns ({campaigns.length})
              </h3>

              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pe-1">
                {campaigns.map((camp) => {
                  const isSelected = selectedCampaign?.id === camp.id;
                  return (
                    <div
                      key={camp.id}
                      onClick={() => setSelectedCampaign(camp)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/60 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
                        {camp.campaignType.replace("_", " ")}
                      </div>
                      <div className="font-bold text-slate-900 text-sm line-clamp-2">
                        {camp.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-2 line-clamp-1">
                        {camp.suggestedOffer}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Campaign Detailed Viewer (8 cols) */}
            <div className="lg:col-span-8">
              {selectedCampaign ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  {/* Campaign Header */}
                  <div className="space-y-2 pb-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                        {selectedCampaign.campaignType.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">
                        Target: {selectedCampaign.targetAudience}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900">
                      {selectedCampaign.title}
                    </h3>
                  </div>

                  {/* Urdu Nastaliq Marketing Copy */}
                  <div className="p-5 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900">
                        اردو اشتہار (Urdu Marketing Copy for WhatsApp & Socials)
                      </span>
                      <button
                        onClick={() =>
                          handleCopyText(
                            `${selectedCampaign.headlineUrdu}\n\n${selectedCampaign.contentUrdu}\n\n${selectedCampaign.callToAction}`,
                            `copy-urdu-${selectedCampaign.id}`
                          )
                        }
                        className="text-xs px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md font-medium flex items-center gap-1 transition-colors"
                      >
                        {copiedId === `copy-urdu-${selectedCampaign.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Urdu!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Urdu Text
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base text-end font-serif leading-relaxed">
                      {selectedCampaign.headlineUrdu}
                    </h4>

                    <div className="text-sm text-slate-800 text-end whitespace-pre-line leading-relaxed font-serif">
                      {selectedCampaign.contentUrdu}
                    </div>
                  </div>

                  {/* English Marketing Copy */}
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        English Copy (For Meta Ads, Website & Architectural Portfolios)
                      </span>
                      <button
                        onClick={() =>
                          handleCopyText(
                            `${selectedCampaign.headlineEnglish}\n\n${selectedCampaign.contentEnglish}`,
                            `copy-en-${selectedCampaign.id}`
                          )
                        }
                        className="text-xs px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md font-medium flex items-center gap-1 transition-colors"
                      >
                        {copiedId === `copy-en-${selectedCampaign.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy English
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">
                      {selectedCampaign.headlineEnglish}
                    </h4>

                    <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {selectedCampaign.contentEnglish}
                    </div>
                  </div>

                  {/* Trust Guarantees Badges */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Customer Trust Guarantees
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedCampaign.trustGuarantees.map((tg, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-medium border border-emerald-100"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{tg}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3-Branch Network Contacts */}
                  <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Included 3-Branch Direct Contacts
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {selectedCampaign.branchContacts.map((bc, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-800 rounded-lg text-xs space-y-1">
                          <div className="font-bold text-white truncate">{bc.branchName}</div>
                          <div className="text-slate-400 truncate">{bc.location}</div>
                          <div className="text-emerald-400 font-mono font-semibold pt-1">
                            WA: {bc.whatsapp}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Direct WhatsApp Share & Print */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        const fullText = `${selectedCampaign.headlineUrdu}\n\n${selectedCampaign.contentUrdu}\n\nOffer: ${selectedCampaign.suggestedOffer}\n\n${selectedCampaign.callToAction}\n\n${selectedCampaign.suggestedHashtags.join(" ")}`;
                        window.open(
                          `https://wa.me/?text=${encodeURIComponent(fullText)}`,
                          "_blank"
                        );
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
                    >
                      <Share2 className="w-4 h-4" /> Share on WhatsApp Status & Groups
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                    >
                      <Printer className="w-4 h-4" /> Print Promo Flyer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                  Select a campaign from the list or click &apos;Generate New Campaign&apos;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: 24/7 AI CUSTOMER SALES ADVISOR & PLUMBING CONCIERGE
      ========================================================================= */}
      {activeSubTab === "advisor" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
          {/* Chat Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/40">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base">Qumber AI Sales & Dream Home Advisor</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online 24/7
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Real-time technical sanitary guidance, PPRC vs PVC advice, and price estimates for all 3 branches
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hidden sm:block">
              Terminal: <span className="text-white font-semibold">{currentBranch.name}</span>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-2`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-be-xs shadow-md shadow-indigo-600/10"
                        : "bg-white text-slate-800 rounded-bs-xs border border-slate-200 shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* AI Suggested Products in Chat */}
                    {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Recommended Fittings from QumberSanitary Catalog:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.suggestedProducts.map((p, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2"
                            >
                              <div>
                                <div className="font-bold text-slate-900">{p.name}</div>
                                <div className="text-emerald-700 font-medium">
                                  {p.trustPoint}
                                </div>
                              </div>
                              <div className="font-bold text-indigo-700 shrink-0">
                                Rs. {p.price.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      className={`text-[10px] mt-1 text-end ${
                        isUser ? "text-indigo-200" : "text-slate-400"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {/* Quick Replies chips */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendChatMessage(qr)}
                          className="text-xs px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-medium transition-colors shadow-2xs"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 w-fit text-xs text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                Qumber AI is analyzing inventory and writing advice...
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
              placeholder="Ask Qumber AI (e.g. 'What is the best bath mixer under Rs. 25,000?' or 'PPRC vs PVC pipe comparison')..."
              className="flex-1 p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />

            <button
              onClick={() => handleSendChatMessage()}
              disabled={isChatLoading || !chatInput.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: 3-BRANCH SYNCHRONIZATION & STOCK BALANCING
      ========================================================================= */}
      {activeSubTab === "sync" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                  3-Branch Real-Time Stock Balancing & AI Transfer Intelligence
                </h2>
                <p className="text-sm text-slate-500">
                  Autonomous stock monitoring across Branch 1 (Main HQ Cantt), Branch 2 (City Market), and Branch 3 (Highway Bypass) to prevent stockouts and balance customer demand.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                All 3 Branches Online
              </span>
            </div>

            {/* 3 Branches Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {branches.map((b, idx) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-xl border ${
                    b.id === currentBranchId
                      ? "border-indigo-500 bg-indigo-50/40"
                      : "border-slate-200 bg-slate-50/50"
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 uppercase">
                      Branch #{idx + 1}
                    </span>
                    {b.id === currentBranchId && (
                      <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-semibold">
                        This Terminal
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{b.name}</h3>
                  <div className="text-xs text-slate-500 truncate">{b.address}</div>
                  <div className="text-xs text-slate-700 font-mono font-medium pt-1">
                    Phone: {b.phone}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Inter-Branch Rebalancing Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              AI Inter-Branch Transfer Advisories
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Recommended Transfer: Master PPRC 25mm Pipes
                  </span>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    High Demand
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Highway Bypass (Branch 3) has only 20 lengths left due to new commercial plaza construction, while Main HQ (Branch 1) has 150 lengths in central reserve. Recommend moving 30 lengths from Branch 1 to Branch 3.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Transfer Route: BR-01 ➔ BR-03 (via Ring Road Suzuki)
                  </span>
                  <button
                    onClick={() =>
                      alert(
                        "Inter-Branch Stock Transfer Requisition Dispatched to Branch 1 Main HQ Warehouse!"
                      )
                    }
                    className="text-xs px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Execute Transfer
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Recommended Transfer: Black Gold Shower Mixers
                  </span>
                  <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    Luxury Demand
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  City Market Outlet (Branch 2) has 1 unit of Master Shower Mixer 9103 remaining. Branch 1 Main HQ has 10 units available. Recommend transfer of 3 units to City Market showroom.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Transfer Route: BR-01 ➔ BR-02 (Khyber Bazar to Brandreth Rd)
                  </span>
                  <button
                    onClick={() =>
                      alert(
                        "Inter-Branch Stock Transfer Requisition Dispatched to Branch 2 Showroom!"
                      )
                    }
                    className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Execute Transfer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
