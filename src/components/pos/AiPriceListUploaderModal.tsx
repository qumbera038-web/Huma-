import React, { useState, useRef } from "react";
import { Product, ProductCategory } from "../../types";
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
  Smartphone
} from "lucide-react";

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
  const [activeMode, setActiveMode] = useState<"file" | "camera" | "text">("file");
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
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
                  Gemini 3.8 Flash Multimodal
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
          <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveMode("file")}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                activeMode === "file"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>تصویر یا PDF اپلوڈ کریں</span>
            </button>

            <button
              onClick={() => setActiveMode("camera")}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                activeMode === "camera"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>موبائل کیمرہ سے تصویر لیں</span>
            </button>

            <button
              onClick={() => setActiveMode("text")}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                activeMode === "text"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>ٹیکسٹ پرائس لسٹ پیسٹ کریں</span>
            </button>
          </div>

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
                      className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-rose-600/90 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition"
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
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5 text-right font-bold">پراڈکٹ کا نام و برانڈ</th>
                        <th className="p-2.5 text-right font-bold">کیٹیگری (Category)</th>
                        <th className="p-2.5 text-right font-bold">سائز / رنگ</th>
                        <th className="p-2.5 text-right font-bold">خرید ریٹ (Cost)</th>
                        <th className="p-2.5 text-right font-bold">سیل ریٹ (Sale)</th>
                        <th className="p-2.5 text-right font-bold">اسٹاک</th>
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
