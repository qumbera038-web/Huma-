import React, { useState, useRef } from "react";
import { Product, ProductCategory } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { 
  Camera, 
  Upload, 
  FileText, 
  Sparkles, 
  X, 
  Check, 
  AlertCircle, 
  Layers, 
  DollarSign, 
  Tag, 
  Plus, 
  Trash2, 
  Eye, 
  Loader2,
  RefreshCw,
  FolderPlus,
  SlidersHorizontal,
  CheckCircle2,
  Smartphone,
  Download,
  Search,
  BookOpen
} from "lucide-react";

const PPRC_ITEMS = [
  { code: "PPRC-25-PIPE", name: "Master PPRC Pipe 25mm (3/4\") - 13ft Length", category: "PPRC Pipes & Fittings", purchasePrice: 340, salePrice: 410, stock: 150, unit: "Length", image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=200&auto=format&fit=crop&q=60" },
  { code: "PPRC-32-PIPE", name: "Master PPRC Pipe 32mm (1\") - 13ft Length", category: "PPRC Pipes & Fittings", purchasePrice: 520, salePrice: 630, stock: 120, unit: "Length", image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=200&auto=format&fit=crop&q=60" },
  { code: "PPRC-ELB-25", name: "Master PPRC Elbow 25mm 90°", category: "PPRC Pipes & Fittings", purchasePrice: 30, salePrice: 45, stock: 500, unit: "Piece", image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=200&auto=format&fit=crop&q=60" },
  { code: "PPRC-TEE-25", name: "Master PPRC Equal Tee 25mm", category: "PPRC Pipes & Fittings", purchasePrice: 42, salePrice: 60, stock: 350, unit: "Piece", image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=200&auto=format&fit=crop&q=60" },
  { code: "PPRC-UNN-25", name: "Master PPRC Union Brass 25mm", category: "PPRC Pipes & Fittings", purchasePrice: 180, salePrice: 240, stock: 100, unit: "Piece", image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=200&auto=format&fit=crop&q=60" },
  { code: "PPRC-VLV-25", name: "Master PPRC Gate Valve Brass 25mm", category: "PPRC Pipes & Fittings", purchasePrice: 310, salePrice: 390, stock: 80, unit: "Piece", image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=200&auto=format&fit=crop&q=60" },
];

const BUJ_ITEMS = [
  { code: "BUJ-TAP-BR", name: "BUJ Solid Brass Bib Cock 1/2\"", category: "Valves & Brass Fittings", purchasePrice: 450, salePrice: 580, stock: 200, unit: "Piece", image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=200&auto=format&fit=crop&q=60" },
  { code: "BUJ-MXR-SH", name: "BUJ Single Lever Wall Shower Mixer", category: "Bath Set", purchasePrice: 8500, salePrice: 11200, stock: 30, unit: "Piece", image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=200&auto=format&fit=crop&q=60" },
  { code: "BUJ-MXR-BS", name: "BUJ Luxury Basin Mixer Tap", category: "Bath Set", purchasePrice: 4800, salePrice: 6400, stock: 45, unit: "Piece", image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=200&auto=format&fit=crop&q=60" },
  { code: "BUJ-CMD-WP", name: "BUJ Water Closet One-Piece Commode", category: "Sanitary Ware & Ceramics", purchasePrice: 14500, salePrice: 18500, stock: 15, unit: "Piece", image: "https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=200&auto=format&fit=crop&q=60" },
  { code: "BUJ-SINK-DB", name: "BUJ Double Bowl Stainless Steel Kitchen Sink", category: "Sanitary Ware & Ceramics", purchasePrice: 6500, salePrice: 8500, stock: 20, unit: "Piece", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=200&auto=format&fit=crop&q=60" },
  { code: "BUJ-CONN-SS", name: "BUJ Stainless Steel Flexible Connection 18\"", category: "Valves & Brass Fittings", purchasePrice: 90, salePrice: 140, stock: 600, unit: "Piece", image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=200&auto=format&fit=crop&q=60" },
];

interface AiPriceListUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProducts: (newProducts: Product[]) => void;
  targetBranchId?: string;
}

export const AiPriceListUploaderModal: React.FC<AiPriceListUploaderModalProps> = ({
  isOpen,
  onClose,
  onImportProducts,
  targetBranchId = "branch-1",
}) => {
  const { language, t: localTranslate } = useLanguage();
  const [activeMode, setActiveMode] = useState<"preloaded" | "file" | "camera" | "text">("preloaded");
  const [selectedPreloadedList, setSelectedPreloadedList] = useState<"pprc" | "buj" | null>(null);
  const [preloadedSearch, setPreloadedSearch] = useState("");
  const [selectedPreloadedItems, setSelectedPreloadedItems] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Array<{ name: string; size: string; preview: string; mimeType: string; base64: string }>>([]);
  const [rawText, setRawText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [importSuccess, setImportSuccess] = useState(false);
  const [summaryUrdu, setSummaryUrdu] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle file uploads (Images, PDFs, Text)
  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg("");
    const newFiles: Array<{ name: string; size: string; preview: string; mimeType: string; base64: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sizeStr = (file.size / 1024).toFixed(1) + " KB";
      const mimeType = file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg");

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newFiles.push({
        name: file.name,
        size: sizeStr,
        preview: mimeType.startsWith("image/") ? base64 : "",
        mimeType,
        base64,
      });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    if (e.target) e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Run AI Scanner
  const handleScanAndCategorize = async () => {
    if (selectedFiles.length === 0 && !rawText.trim()) {
      setErrorMsg("براہ کرم پہلے کوئی تصویر، پی ڈی ایف منتخب کریں یا پرائس لسٹ پیسٹ کریں!");
      return;
    }

    setIsScanning(true);
    setErrorMsg("");
    setImportSuccess(false);

    try {
      const payloadFiles = selectedFiles.map((f) => ({
        dataBase64: f.base64,
        mimeType: f.mimeType,
        filename: f.name,
      }));

      const res = await fetch("/api/ai/parse-pricelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: payloadFiles,
          rawText: rawText.trim(),
          targetBranchId,
        }),
      });

      const data = await res.json();

      if (data && Array.isArray(data.products) && data.products.length > 0) {
        setParsedProducts(data.products);
        setSummaryUrdu(data.summaryUrdu || `${data.products.length} مصنوعات تیار ہیں۔`);
      } else {
        setErrorMsg("کوئی پراڈکٹس ڈیٹیکٹ نہیں ہو سکیں۔ دوبارہ کوشش فرمائیں یا تصویر صاف بنائیں۔");
      }
    } catch (err: any) {
      console.error("AI Scanning error:", err);
      setErrorMsg("سرور سے رابطہ نہیں ہو سکا۔ ہم نے متبادل لسٹ لوڈ کر دی ہے۔");
    } finally {
      setIsScanning(false);
    }
  };

  // Direct 1-Click Import All
  const handleConfirmImport = () => {
    if (parsedProducts.length === 0) return;
    onImportProducts(parsedProducts);
    setImportSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Edit fields inline
  const updateParsedItem = (index: number, field: keyof Product, value: any) => {
    setParsedProducts((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const removeParsedItem = (index: number) => {
    setParsedProducts((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Distinct categories detected
  const detectedCategories = Array.from(new Set(parsedProducts.map((p) => p.category)));
  const filteredProducts =
    selectedCategoryFilter === "All"
      ? parsedProducts
      : parsedProducts.filter((p) => p.category === selectedCategoryFilter);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800/80 w-full max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/50 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>AI آٹو پرائس لسٹ و فوٹو اپلوڈر</span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 font-mono rounded-full border border-amber-500/30">
                  Gemini 2.5 Flash Multimodal
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                موبائل سے پرائس لسٹ، رسید یا کیٹلاگ کی تصویر یا PDF اپلوڈ کریں — AI خودکار پڑھ کر کیٹیگریز میں ڈالے گا
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Upload Method Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveMode("preloaded")}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                activeMode === "preloaded"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{localTranslate("price_lists")}</span>
            </button>

            <button
              onClick={() => setActiveMode("file")}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                activeMode === "file"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{language === "ur" ? "تصویر یا PDF اپلوڈ" : "Upload File/PDF"}</span>
            </button>

            <button
              onClick={() => setActiveMode("camera")}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                activeMode === "camera"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{language === "ur" ? "کیمرہ فوٹو" : "Camera Photo"}</span>
            </button>

            <button
              onClick={() => setActiveMode("text")}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                activeMode === "text"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{language === "ur" ? "ٹیکسٹ پیسٹ" : "Paste Text"}</span>
            </button>
          </div>

          {/* Tab 0: Preloaded Official Price Lists */}
          {activeMode === "preloaded" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PPRC Price List Card */}
                <div className="bg-slate-950/50 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400 transition shadow-lg">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">{localTranslate("pprc_price_list")}</h4>
                        <p className="text-[11px] text-slate-400 font-medium">Official Wholesale rates for PPRC Pipes, Elbows & Fittings</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {language === "ur" 
                        ? "ماسٹر پی پی آر سی آفیشل ریٹ لسٹ بشمول گرم و ٹھنڈے پانی کے پائپس، ایلبو، ساکٹ، ٹی اور گیٹ والوز۔"
                        : "Official wholesale catalog of PPRC pipes and adapters with verified supplier cost levels."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => {
                        setSelectedPreloadedList("pprc");
                        setSelectedPreloadedItems(PPRC_ITEMS.map(i => i.code));
                      }}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{localTranslate("view_interactive_list")}</span>
                    </button>
                    <a
                      href="/haider_sanitary_complete_documentation.pdf"
                      download="haider_sanitary_complete_documentation.pdf"
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                  </div>
                </div>

                {/* BUJ Price List Card */}
                <div className="bg-slate-950/50 border border-sky-500/30 rounded-2xl p-5 flex flex-col justify-between hover:border-sky-400 transition shadow-lg">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">{localTranslate("buj_price_list")}</h4>
                        <p className="text-[11px] text-slate-400 font-medium">Solid Brass CP Fittings, Shower Mixers & Luxury Ceramics</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {language === "ur"
                        ? "BUJ برانڈ کی سینیٹری، کروم پلیٹڈ پیتل کے فوارے، بیسن مکسرز، ون پیس کموڈ اور باورچی خانے کے سنگس۔"
                        : "Luxury sanitary wares, chrome mixers, heavy-brass valves and high-finish ceramic bathroom sets."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => {
                        setSelectedPreloadedList("buj");
                        setSelectedPreloadedItems(BUJ_ITEMS.map(i => i.code));
                      }}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{localTranslate("view_interactive_list")}</span>
                    </button>
                    <a
                      href="/haider_sanitary_complete_documentation.pdf"
                      download="haider_sanitary_complete_documentation.pdf"
                      className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Master Document Download Bar */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200 block">
                      {language === "ur" ? "مکمل حیدر سینیٹری پی ڈی ایف گائیڈ" : "Complete Haider Sanitary POS Manual & Price List (PDF)"}
                    </span>
                    <span className="text-[10px] text-slate-400">Includes wholesale/retail margin charts, barcode print templates and branch networks offline guide.</span>
                  </div>
                </div>
                <a
                  href="/haider_sanitary_complete_documentation.pdf"
                  download="haider_sanitary_complete_documentation.pdf"
                  className="w-full sm:w-auto px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{localTranslate("official_pdf_download")}</span>
                </a>
              </div>

              {/* Interactive List View Section */}
              {selectedPreloadedList && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h4 className="font-black text-white text-sm">
                        {selectedPreloadedList === "pprc" ? localTranslate("pprc_price_list") : localTranslate("buj_price_list")}
                      </h4>
                    </div>

                    {/* Search Field */}
                    <div className="relative max-w-xs w-full">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={preloadedSearch}
                        onChange={(e) => setPreloadedSearch(e.target.value)}
                        placeholder={language === "ur" ? "تلاش کریں..." : "Search items..."}
                        className="w-full bg-slate-900 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 border border-slate-800"
                      />
                    </div>
                  </div>

                  {/* Table/Grid representing preloaded list */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/40">
                          <th className="p-3 text-center w-10">
                            <input
                              type="checkbox"
                              checked={selectedPreloadedItems.length === (selectedPreloadedList === "pprc" ? PPRC_ITEMS : BUJ_ITEMS).length}
                              onChange={(e) => {
                                const currentList = selectedPreloadedList === "pprc" ? PPRC_ITEMS : BUJ_ITEMS;
                                if (e.target.checked) {
                                  setSelectedPreloadedItems(currentList.map(item => item.code));
                                } else {
                                  setSelectedPreloadedItems([]);
                                }
                              }}
                              className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 cursor-pointer"
                            />
                          </th>
                          <th className="p-3">{language === "ur" ? "پروڈکٹ کا نام اور تصویر" : "Product & Photo"}</th>
                          <th className="p-3">{language === "ur" ? "بارکوڈ کوڈ" : "Code"}</th>
                          <th className="p-3 text-right">{language === "ur" ? "ہول سیل قیمت" : "Wholesale Cost"}</th>
                          <th className="p-3 text-right">{language === "ur" ? "ریٹیل قیمت" : "Retail Price"}</th>
                          <th className="p-3 text-center">{language === "ur" ? "یونٹ" : "Unit"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedPreloadedList === "pprc" ? PPRC_ITEMS : BUJ_ITEMS)
                          .filter(item => 
                            item.name.toLowerCase().includes(preloadedSearch.toLowerCase()) || 
                            item.code.toLowerCase().includes(preloadedSearch.toLowerCase())
                          )
                          .map((item) => {
                            const isSelected = selectedPreloadedItems.includes(item.code);
                            return (
                              <tr 
                                key={item.code} 
                                className={`border-b border-slate-900 hover:bg-slate-900/60 transition ${
                                  isSelected ? "bg-slate-900/30" : ""
                                }`}
                              >
                                <td className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedPreloadedItems(prev => [...prev, item.code]);
                                      } else {
                                        setSelectedPreloadedItems(prev => prev.filter(code => code !== item.code));
                                      }
                                    }}
                                    className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 cursor-pointer"
                                  />
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shrink-0">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                    <div>
                                      <span className="font-bold text-slate-100 block text-xs">{item.name}</span>
                                      <span className="text-[10px] text-slate-500 font-medium block">{item.category}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 font-mono text-[11px] text-slate-400">{item.code}</td>
                                <td className="p-3 text-right text-emerald-400 font-bold font-mono">Rs. {item.purchasePrice}</td>
                                <td className="p-3 text-right text-amber-300 font-bold font-mono">Rs. {item.salePrice}</td>
                                <td className="p-3 text-center">
                                  <span className="px-2 py-0.5 bg-slate-900 rounded-full text-[10px] text-slate-400 font-medium border border-slate-800/60">
                                    {item.unit}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions for Interactive List */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-900">
                    <span className="text-slate-400 text-[11px] font-medium">
                      Selected: <strong className="text-amber-400">{selectedPreloadedItems.length}</strong> items to import.
                    </span>

                    <button
                      type="button"
                      disabled={selectedPreloadedItems.length === 0}
                      onClick={() => {
                        const sourceList = selectedPreloadedList === "pprc" ? PPRC_ITEMS : BUJ_ITEMS;
                        const itemsToImport = sourceList
                          .filter(item => selectedPreloadedItems.includes(item.code))
                          .map(item => ({
                            id: `prod-${Date.now()}-${item.code}`,
                            code: item.code,
                            name: item.name,
                            category: item.category as ProductCategory,
                            purchasePrice: item.purchasePrice,
                            salePrice: item.salePrice,
                            stock: item.stock,
                            minStock: 10,
                            unit: item.unit,
                            branchId: targetBranchId,
                            supplierName: selectedPreloadedList === "pprc" ? "Peshawar PPRC HQ Vendor" : "BUJ Premium Sanitary Wholesalers",
                            description: `${item.name} imported from official preloaded rate list.`
                          }));

                        onImportProducts(itemsToImport);
                        setImportSuccess(true);
                        setTimeout(() => {
                          onClose();
                        }, 1200);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>{language === "ur" ? "منتخب اشیاء انوینٹری میں امپورٹ کریں" : "Import Selected Items"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 1: File / PDF Upload */}
          {activeMode === "file" && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-3xl p-6 sm:p-8 text-center bg-slate-950/40 hover:bg-slate-950/70 transition cursor-pointer group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.csv,.txt"
                  multiple
                  onChange={handleFileSelection}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3 group-hover:scale-110 transition">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base">
                  یہاں کلک کر کے پرائس لسٹ، فوٹو یا PDF منتخب کریں
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  سپورٹڈ فارمیٹس: JPG, PNG, WebP, PDF، دستی لکھی ہوئی بل بک، ماسٹر و سونیکس پرائس لسٹ
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-full text-[11px] text-amber-300 border border-slate-700">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>موبائل فون گیلری یا فائلز سے براہ راست سلیکٹ کریں</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Mobile Camera Direct */}
          {activeMode === "camera" && (
            <div className="space-y-4">
              <div
                onClick={() => cameraInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-6 sm:p-8 text-center bg-slate-950/40 hover:bg-slate-950/70 transition cursor-pointer group"
              >
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelection}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base">
                  موبائل کیمرہ آن کر کے پرائس لسٹ کی تصویر کھینچیں
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  کاؤنٹر پر پڑی ہول سیل پرائس شیٹ، رسید یا ڈبے کے لیبل کے سامنے کیمرہ رکھیں
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 inline-flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>اوپن کیمرہ (Open Phone Camera)</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Text Paste */}
          {activeMode === "text" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>واٹس ایپ یا سپلائر کا پرائس لسٹ میسج یہاں پیسٹ کریں:</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  مثال: Master PPRC Pipe 25mm 650, Elbow 90, Basin Mixer 20500...
                </span>
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="مثال کے طور پر سپلائر کی لسٹ کاپی کر کے یہاں پیسٹ کریں:&#10;Master PPRC Pipe 25mm - Rs. 650&#10;Popular UPVC 4 inch - Rs. 1750&#10;Master Luxury Basin Mixer - Rs. 20500&#10;Porta One Piece Commode - Rs. 34500&#10;Faisal Brass Bib Cock 1/2 - Rs. 2650"
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60 font-mono"
              />
            </div>
          )}

          {/* Attached Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>منتخب شدہ فائلز ({selectedFiles.length}):</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative bg-slate-950 border border-slate-800 rounded-2xl p-2.5 flex flex-col group overflow-hidden"
                  >
                    {file.preview ? (
                      <div className="h-24 w-full rounded-xl overflow-hidden mb-2 bg-slate-900 border border-slate-800/80">
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-24 w-full rounded-xl bg-rose-950/30 border border-rose-500/20 flex flex-col items-center justify-center text-rose-400 mb-2">
                        <FileText className="w-8 h-8 mb-1" />
                        <span className="text-[10px] font-mono font-bold uppercase">
                          {file.name.split(".").pop()}
                        </span>
                      </div>
                    )}
                    <div className="text-[11px] font-bold text-slate-200 truncate" title={file.name}>
                      {file.name}
                    </div>
                    <div className="text-[10px] text-slate-500">{file.size}</div>

                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-2 end-2 w-6 h-6 rounded-lg bg-rose-600/90 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition"
                      title="فائل ہٹائیں"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action: Run Scanner */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleScanAndCategorize}
              disabled={isScanning || (selectedFiles.length === 0 && !rawText.trim())}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Gemini AI پرائس لسٹ پڑھ رہا ہے اور کیٹیگریز بنا رہا ہے...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>⚡ AI اسکین اور خودکار کیٹیگریز میں تقسیم کریں (Start AI Scan)</span>
                </>
              )}
            </button>
          </div>

          {/* Results: Parsed Products Preview */}
          {parsedProducts.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>شناخت شدہ مصنوعات ({parsedProducts.length} Products Detected):</span>
                  </h3>
                  {summaryUrdu && (
                    <p className="text-xs text-amber-300 font-medium mt-0.5">{summaryUrdu}</p>
                  )}
                </div>

                {/* Direct Add All Button */}
                <button
                  onClick={handleConfirmImport}
                  disabled={importSuccess}
                  className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition cursor-pointer"
                >
                  {importSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>انوینٹری میں شامل ہو گئیں! (Success)</span>
                    </>
                  ) : (
                    <>
                      <FolderPlus className="w-4 h-4 text-slate-950" />
                      <span>✅ تمام ({parsedProducts.length}) پروڈکٹس ڈائریکٹ انوینٹری میں ڈالیں</span>
                    </>
                  )}
                </button>
              </div>

              {/* Category Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCategoryFilter("All")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategoryFilter === "All"
                      ? "bg-amber-500 text-slate-950"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  سب ({parsedProducts.length})
                </button>
                {detectedCategories.map((cat) => {
                  const count = parsedProducts.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                        selectedCategoryFilter === cat
                          ? "bg-emerald-500 text-slate-950 font-black"
                          : "bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="px-1.5 py-0.2 bg-slate-900/60 rounded-full text-[10px]">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Editable Product Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-end text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5 text-end font-bold">پراڈکٹ کا نام و برانڈ</th>
                        <th className="p-2.5 text-end font-bold">کیٹیگری (Category)</th>
                        <th className="p-2.5 text-end font-bold">سائز / رنگ</th>
                        <th className="p-2.5 text-end font-bold">خرید ریٹ (Cost)</th>
                        <th className="p-2.5 text-end font-bold">سیل ریٹ (Sale)</th>
                        <th className="p-2.5 text-end font-bold">اسٹاک</th>
                        <th className="p-2.5 text-center font-bold">ایکشن</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredProducts.map((prod, idx) => {
                        const originalIndex = parsedProducts.findIndex((p) => p.id === prod.id);
                        return (
                          <tr key={prod.id || idx} className="hover:bg-slate-900/50 transition">
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={prod.name}
                                onChange={(e) =>
                                  updateParsedItem(originalIndex, "name", e.target.value)
                                }
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                              />
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                کوڈ: {prod.code} | برانڈ: {prod.brand}
                              </div>
                            </td>

                            <td className="p-2.5">
                              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold inline-block">
                                {prod.category}
                              </span>
                            </td>

                            <td className="p-2.5">
                              <span className="text-slate-300 font-mono text-[11px]">
                                {prod.size || "-"} {prod.color ? `(${prod.color})` : ""}
                              </span>
                            </td>

                            <td className="p-2.5">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-400">Rs.</span>
                                <input
                                  type="number"
                                  value={prod.costPrice}
                                  onChange={(e) =>
                                    updateParsedItem(
                                      originalIndex,
                                      "costPrice",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-amber-300 font-mono text-xs focus:outline-none"
                                />
                              </div>
                            </td>

                            <td className="p-2.5">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-400">Rs.</span>
                                <input
                                  type="number"
                                  value={prod.salePrice}
                                  onChange={(e) =>
                                    updateParsedItem(
                                      originalIndex,
                                      "salePrice",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-emerald-300 font-mono font-bold text-xs focus:outline-none"
                                />
                              </div>
                            </td>

                            <td className="p-2.5">
                              <input
                                type="number"
                                value={prod.stockQuantity}
                                onChange={(e) =>
                                  updateParsedItem(
                                    originalIndex,
                                    "stockQuantity",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none"
                              />
                            </td>

                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => removeParsedItem(originalIndex)}
                                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 flex items-center justify-center transition mx-auto"
                                title="اس آئٹم کو حذف کریں"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>حیدر سینیٹری AI وژن: پی پی آر سی، پی وی سی، مکسرز اور والوز کی درست درجہ بندی</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
            >
              بند کریں (Cancel)
            </button>
            {parsedProducts.length > 0 && (
              <button
                onClick={handleConfirmImport}
                disabled={importSuccess}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-900/40 transition cursor-pointer flex items-center gap-1.5"
              >
                <FolderPlus className="w-4 h-4" />
                <span>انوینٹری میں ڈالیں ({parsedProducts.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
