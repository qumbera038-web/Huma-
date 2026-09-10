import React, { useState, useMemo } from "react";
import { Product, ProductCategory, StoreSettings } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { exportAllDataBackup, saveStoredProducts } from "../../utils/posStorage";
import { ScannerModal } from "./ScannerModal";
import { StockAlertDashboard } from "./StockAlertDashboard";
import { AiPriceListUploaderModal } from "./AiPriceListUploaderModal";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle, 
  Download, 
  TrendingUp, 
  X, 
  Save, 
  DollarSign, 
  Percent, 
  Layers, 
  Sparkles,
  RefreshCw,
  Check,
  ScanLine,
  ArrowRight,
  ClipboardList,
  Printer,
  ChevronDown,
  Smartphone,
  FileSpreadsheet,
  Database,
  Camera
} from "lucide-react";

interface InventoryManagerProps {
  products: Product[];
  settings: StoreSettings;
  onUpdateProducts: (products: Product[]) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  settings,
  onUpdateProducts,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showStockAlertDashboard, setShowStockAlertDashboard] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [bulkBrand, setBulkBrand] = useState<string>("All");
  const [bulkCategory, setBulkCategory] = useState<string>("All");
  const [bulkPercent, setBulkPercent] = useState<number>(10);
  const [bulkMode, setBulkMode] = useState<"percent" | "fixed">("percent");
  const [bulkFixedPrice, setBulkFixedPrice] = useState<number>(1000);
  const [bulkTarget, setBulkTarget] = useState<"salePrice" | "costPrice" | "both">("salePrice");
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState("");

  // Form State for Add / Edit
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Basin Mixer");
  const [brand, setBrand] = useState("Black Gold");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [unit, setUnit] = useState<Product["unit"]>("piece");
  const [costPrice, setCostPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [barcode, setBarcode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [percentCalcInput, setPercentCalcInput] = useState<number>(10);

  // AI Investment Analysis State
  const [showAiAnalysisModal, setShowAiAnalysisModal] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // AI Multimodal Price List Uploader State
  const [showAiUploaderModal, setShowAiUploaderModal] = useState(false);
  const [aiImportSuccessMsg, setAiImportSuccessMsg] = useState("");

  const handleImportFromAi = (newProducts: Product[]) => {
    const updated = [...newProducts, ...products];
    onUpdateProducts(updated);
    saveStoredProducts(updated);
    setAiImportSuccessMsg(`کامیابی! ${newProducts.length} مصنوعات خودکار کیٹیگریز کے ساتھ انوینٹری میں شامل کر دی گئیں!`);
    setTimeout(() => setAiImportSuccessMsg(""), 6000);
  };

  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiAnalysisResult(null);
    setShowAiAnalysisModal(true);

    try {
      // We pass a simplified view of inventory to save API tokens
      const compactInventory = products.map(p => ({
        n: p.name,
        c: p.category,
        qty: p.stockQuantity,
        cst: p.costPrice,
        sp: p.salePrice
      }));

      const res = await fetch("/api/gemini/inventory-investment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: settings.storeName,
          inventoryData: compactInventory,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiAnalysisResult(data.text);
    } catch (err: any) {
      setAiAnalysisResult(`**Error generating analysis:** ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Dynamic Categories & Brands list
  const categories: ProductCategory[] = [
    "Basin Mixer",
    "Wall Shower",
    "Shower Mixer",
    "Bib Cock",
    "Stop Cock",
    "Waste",
    "Toilet",
    "Bath Set",
    "PPRC Pipes & Fittings",
    "PVC / UPVC Pipes",
    "CP Bathroom Fittings",
    "Valves & Cocks",
    "Water Tanks & Pumps",
    "Indicators & Sensors",
    "Drainage & Traps",
    "GI / MS Fittings",
    "Accessories & Sealants",
  ];

  const uniqueBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [products]);

  React.useEffect(() => {
    const handleOpenScanner = () => setShowScannerModal(true);
    window.addEventListener('OPEN_SCANNER', handleOpenScanner);
    return () => window.removeEventListener('OPEN_SCANNER', handleOpenScanner);
  }, []);

  const safeProducts = useMemo(() => Array.isArray(products) ? products : [], [products]);

  const filteredProducts = useMemo(() => {
    return safeProducts.filter((p) => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchBrand = selectedBrand === "All" || p.brand === selectedBrand;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        (p.size && p.size.toLowerCase().includes(term)) ||
        (p.color && p.color.toLowerCase().includes(term)) ||
        (p.barcode && p.barcode.includes(term)) ||
        p.costPrice.toString().includes(term) ||
        p.salePrice.toString().includes(term);
      return matchCat && matchBrand && matchSearch;
    });
  }, [safeProducts, selectedCategory, selectedBrand, searchTerm]);

  // Inventory Valuations
  const totalValuation = useMemo(() => {
    return safeProducts.reduce((sum, p) => sum + (p.costPrice || 0) * (p.stockQuantity || 0), 0);
  }, [safeProducts]);

  const totalRetailValuation = useMemo(() => {
    return safeProducts.reduce((sum, p) => sum + (p.salePrice || 0) * (p.stockQuantity || 0), 0);
  }, [safeProducts]);

  const lowStockCount = useMemo(() => {
    return safeProducts.filter((p) => p.stockQuantity <= p.minStockAlert).length;
  }, [safeProducts]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setCode(`91${Math.floor(10 + Math.random() * 90)}`);
    setName("");
    setCategory("Basin Mixer");
    setBrand("Black Gold");
    setSize("Standard");
    setColor("");
    setUnit("piece");
    setCostPrice(1000);
    setSalePrice(1400);
    setStockQuantity(10);
    setMinStockAlert(3);
    setBarcode("");
    setImageUrl("");
    setProductDescription("");
    setIsNewModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setCode(p.code);
    setName(p.name);
    setCategory(p.category);
    setBrand(p.brand);
    setSize(p.size || "");
    setColor(p.color || "");
    setUnit(p.unit);
    setCostPrice(p.costPrice);
    setSalePrice(p.salePrice);
    setStockQuantity(p.stockQuantity);
    setMinStockAlert(p.minStockAlert);
    setBarcode(p.barcode || "");
    setImageUrl(p.imageUrl || "");
    setProductDescription(p.productDescription || "");
    setIsNewModalOpen(true);
  };

  const applyPercentToCurrentSalePrice = (pct: number) => {
    const multiplier = 1 + pct / 100;
    setSalePrice(Math.round(costPrice > 0 ? costPrice * multiplier : salePrice * multiplier));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              code: code.trim(),
              name: name.trim(),
              category,
              brand: brand.trim(),
              size: size.trim() || undefined,
              color: color.trim() || undefined,
              unit,
              costPrice: Number(costPrice) || 0,
              salePrice: Number(salePrice) || 0,
              stockQuantity: Number(stockQuantity) || 0,
              minStockAlert: Number(minStockAlert) || 5,
              barcode: barcode.trim() || undefined,
              imageUrl: imageUrl.trim() || undefined,
              productDescription: productDescription.trim() || undefined,
            }
          : p
      );
      onUpdateProducts(updated);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        code: code.trim() || `ITM-${Date.now().toString().slice(-4)}`,
        name: name.trim(),
        category,
        brand: brand.trim(),
        size: size.trim() || undefined,
        color: color.trim() || undefined,
        unit,
        costPrice: Number(costPrice) || 0,
        salePrice: Number(salePrice) || 0,
        stockQuantity: Number(stockQuantity) || 0,
        minStockAlert: Number(minStockAlert) || 5,
        barcode: barcode.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        productDescription: productDescription.trim() || undefined,
      };
      onUpdateProducts([newProd, ...products]);
    }

    setIsNewModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      onUpdateProducts(products.filter((p) => p.id !== id));
    }
  };

  // Bulk Price Adjuster Preview & Execution
  const bulkAffectedProducts = useMemo(() => {
    return products.filter((p) => {
      const matchBrand = bulkBrand === "All" || p.brand.toLowerCase() === bulkBrand.toLowerCase();
      const matchCat = bulkCategory === "All" || p.category === bulkCategory;
      return matchBrand && matchCat;
    });
  }, [products, bulkBrand, bulkCategory]);

  const handleApplyBulkPricing = () => {
    if (bulkAffectedProducts.length === 0) return;

    const updated = products.map((p) => {
      const matchBrand = bulkBrand === "All" || p.brand.toLowerCase() === bulkBrand.toLowerCase();
      const matchCat = bulkCategory === "All" || p.category === bulkCategory;
      if (!matchBrand || !matchCat) return p;

      let newSale = p.salePrice;
      let newCost = p.costPrice;

      if (bulkMode === "percent") {
        const factor = 1 + bulkPercent / 100;
        if (bulkTarget === "salePrice" || bulkTarget === "both") {
          newSale = Math.round(p.salePrice * factor);
        }
        if (bulkTarget === "costPrice" || bulkTarget === "both") {
          newCost = Math.round(p.costPrice * factor);
        }
      } else {
        if (bulkTarget === "salePrice" || bulkTarget === "both") {
          newSale = bulkFixedPrice;
        }
        if (bulkTarget === "costPrice" || bulkTarget === "both") {
          newCost = bulkFixedPrice;
        }
      }

      return {
        ...p,
        salePrice: newSale,
        costPrice: newCost,
      };
    });

    onUpdateProducts(updated);
    setBulkSuccessMsg(`Successfully adjusted prices for ${bulkAffectedProducts.length} items!`);
    setTimeout(() => {
      setBulkSuccessMsg("");
      setShowBulkPriceModal(false);
    }, 1500);
  };

  const exportCSV = () => {
    const header = "Code,Name,Category,Brand,Size,Unit,Cost Price,Sale Price,Stock,Min Alert\n";
    const rows = products
      .map(
        (p) =>
          `"${p.code}","${p.name}","${p.category}","${p.brand}","${p.size || ""}","${p.unit}",${p.costPrice},${p.salePrice},${p.stockQuantity},${p.minStockAlert}`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `haider-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4">
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-glass border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('total_items')}</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-slate-100">{products.length} Items</p>
        </div>

        <div className="bg-glass border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('total_stock_value')}</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-purple-300 font-mono">
            {settings.currencySymbol} {totalValuation.toLocaleString()}
          </p>
        </div>

        <div className="bg-glass border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Retail Valuation</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 font-mono">
            {settings.currencySymbol} {totalRetailValuation.toLocaleString()}
          </p>
        </div>

        <div
          onClick={() => setShowStockAlertDashboard(!showStockAlertDashboard)}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            showStockAlertDashboard
              ? "bg-rose-950/50 border-rose-500/60 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/50"
              : lowStockCount > 0
              ? "bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60 hover:bg-rose-950/30"
              : "bg-glass border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('low_stock_alerts')}</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? "text-rose-400 animate-pulse" : "text-amber-400"}`} />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-bold text-rose-300 font-mono">
              {lowStockCount} Items
            </p>
            <span className="text-[10px] font-bold text-rose-400 hover:underline flex items-center gap-0.5">
              {showStockAlertDashboard ? "ڈیش بورڈ بند کریں ✕" : "ری اسٹاک ڈیش بورڈ ➔"}
            </span>
          </div>
        </div>
      </div>

      {/* Low Stock Reorder Notification Banner (shown when items need restocking and dashboard is closed) */}
      {!showStockAlertDashboard && lowStockCount > 0 && (
        <div className="bg-gradient-to-r from-rose-950/50 via-slate-900 to-amber-950/40 border border-rose-500/40 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span>انتباہ: {lowStockCount} آئٹمز کا اسٹاک الرٹ کی حد سے نیچے آ چکا ہے!</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-bold">
                  {lowStockCount} SKUs Need Restock
                </span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                سپلائرز کے لیے ری اسٹاکنگ شیٹ پرنٹ کرنے یا آرڈر لسٹ ایکسل / واٹس ایپ ایکسپورٹ کرنے کے لیے الرٹ سینٹر کھولیں۔
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowStockAlertDashboard(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>ری اسٹاک ڈیش بورڈ کھولیں (Open Restock Hub)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* If Stock Alert Dashboard is active, render it */}
      {showStockAlertDashboard ? (
        <StockAlertDashboard
          products={products}
          settings={settings}
          onUpdateProducts={onUpdateProducts}
          onClose={() => setShowStockAlertDashboard(false)}
          onEditProduct={handleOpenEdit}
        />
      ) : (
        /* Main Table Card */
        <div className="bg-glass border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Controls Header */}
          <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950/40">
            <div className="flex flex-1 items-center flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('search_inventory')}
                  className="w-full pl-9 pr-10 py-2 bg-glass border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setShowScannerModal(true)}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-blue-400 transition bg-slate-800 p-1 rounded border border-slate-700"
                  title="Scan Barcode"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                </button>
              </div>

              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-2 bg-glass border border-slate-700/80 rounded-xl text-xs text-slate-300 outline-none"
              >
                <option value="All">All Companies ({products.length})</option>
                {uniqueBrands.map((b) => (
                  <option key={b} value={b}>
                    {b} ({products.filter((p) => p.brand === b).length})
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-glass border border-slate-700/80 rounded-xl text-xs text-slate-300 outline-none"
              >
                <option value="All">{t('all_categories')}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {/* Dedicated Restock Alerts Button */}
              <button
                type="button"
                onClick={() => setShowStockAlertDashboard(true)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  lowStockCount > 0
                    ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950/30"
                    : "bg-white/5 hover:bg-slate-700 text-slate-300 border border-slate-700"
                }`}
                title="Open Dedicated Stock Alert & Reorder Dashboard"
              >
                <AlertTriangle className={`w-4 h-4 shrink-0 ${lowStockCount > 0 ? "text-rose-400 animate-pulse" : ""}`} />
                <span>الرٹ ڈیش بورڈ (Restock Hub)</span>
                {lowStockCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white">
                    {lowStockCount}
                  </span>
                )}
              </button>

              {/* Percentage & Company Price Adjuster Button */}
              <button
                onClick={() => setShowBulkPriceModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl transition"
              >
                <Percent className="w-4 h-4 shrink-0" />
                <span>Bulk Price Adjuster</span>
              </button>

              <button
                onClick={handleRunAiAnalysis}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl transition"
              >
                <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>AI Investment Analysis</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 border border-purple-500/30 rounded-xl transition"
                title="Print Inventory Stock Report"
              >
                <Printer className="w-4 h-4 shrink-0 text-purple-400" />
                <span>Print Stock (پرنٹ)</span>
              </button>

              {/* Comprehensive Export Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl transition shadow-sm"
                >
                  <Download className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>📦 Export (ایکسپورٹ مینو)</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExportDropdown ? "rotate-180" : ""}`} />
                </button>

                {showExportDropdown && (
                  <div className="absolute right-0 top-11 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95">
                    <a
                      href="/haider_sanitary_pos.apk"
                      download="haider_sanitary_pos.apk"
                      onClick={() => setShowExportDropdown(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition"
                    >
                      <Smartphone className="w-3.5 h-3.5 shrink-0 text-slate-950" />
                      <div>
                        <span>Download 1 APK (.apk)</span>
                        <span className="block text-[9px] font-medium text-slate-900">اینڈرائیڈ موبائل ایپ انسٹالر</span>
                      </div>
                    </a>

                    <a
                      href="/haider_sanitary_pos_single_file.html"
                      download="haider_sanitary_pos_single_file.html"
                      onClick={() => setShowExportDropdown(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition"
                    >
                      <Download className="w-3.5 h-3.5 shrink-0 text-white" />
                      <div>
                        <span>Download 1 File (.html)</span>
                        <span className="block text-[9px] font-medium text-emerald-100">سنگل آف لائن فائل (بغیر انٹرنیٹ)</span>
                      </div>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setShowExportDropdown(false);
                        exportCSV();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-300 hover:bg-slate-800 transition border-t border-slate-800 mt-1 pt-2"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                      <span>Export Stock Sheet (CSV / Excel)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowExportDropdown(false);
                        exportAllDataBackup();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-purple-300 hover:bg-purple-900/20 transition"
                    >
                      <Database className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                      <span>Backup All Store Data (JSON)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* AI Multimodal Price List / Photo / PDF Auto-Entry Button */}
              <button
                type="button"
                onClick={() => setShowAiUploaderModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-black bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl shadow-lg shadow-amber-500/30 transition cursor-pointer border border-amber-400/50 active:scale-95 animate-pulse"
                title="موبائل سے پرائس لسٹ، رسید یا کیٹلاگ کی تصویر یا PDF اپلوڈ کریں — AI خودکار پڑھ کر کیٹیگریز میں ڈالے گا"
              >
                <Camera className="w-4 h-4 shrink-0 text-slate-950" />
                <span>📸 AI Upload Price List / Photo (آٹو انٹری)</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30 transition"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>{t('add_item')}</span>
              </button>
            </div>
          </div>

        {/* AI Import Success Toast Notification */}
        {aiImportSuccessMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-950/30 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{aiImportSuccessMsg}</span>
            </div>
            <button
              onClick={() => setAiImportSuccessMsg("")}
              className="text-emerald-400 hover:text-white text-xs font-normal"
            >
              ✕
            </button>
          </div>
        )}

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="py-3 px-4 font-semibold w-12">Sr #</th>
                <th className="py-3 px-4 font-semibold text-center w-12">Photo</th>
                <th className="py-3 px-4 font-semibold">Code</th>
                <th className="py-3 px-4 font-semibold">{t('item_name')}</th>
                <th className="py-3 px-4 font-semibold">Brand / Company</th>
                <th className="py-3 px-4 font-semibold">{t('category')}</th>
                <th className="py-3 px-4 font-semibold text-right">{t('purchase_price')}</th>
                <th className="py-3 px-4 font-semibold text-right">{t('sale_price')}</th>
                <th className="py-3 px-4 font-semibold text-center">{t('stock')} Level</th>
                <th className="py-3 px-4 font-semibold text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, index) => {
                  const isLow = p.stockQuantity <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-white/5/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-500 text-[10px]">
                        {index + 1}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">
                        {p.code}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-100 block text-xs">{p.name}</span>
                        {(p.size || p.color) && (
                          <span className="text-[10px] text-slate-400">
                            {p.size ? `Size: ${p.size}` : ""} {p.color ? `Color: ${p.color}` : ""}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/5 text-amber-300">
                          {p.brand}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{p.category}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {settings.currencySymbol} {p.costPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {settings.currencySymbol} {p.salePrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            isLow
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {p.stockQuantity} {p.unit}s
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/5 transition"
                            title="Edit Product Details"
                          >
                            <Edit className="w-4 h-4 shrink-0" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4 shrink-0" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Bulk Price Adjuster Modal */}
      {showBulkPriceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-400" />
                <span>Bulk Price Adjuster (Company & Percentage)</span>
              </h3>
              <button
                onClick={() => setShowBulkPriceModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkSuccessMsg ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-center font-bold flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                <span>{bulkSuccessMsg}</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Target Company / Brand</label>
                    <select
                      value={bulkBrand}
                      onChange={(e) => setBulkBrand(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                    >
                      <option value="All">All Companies</option>
                      {uniqueBrands.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Target Category</label>
                    <select
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                    >
                      <option value="All">All Categories</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Adjustment Type</label>
                    <select
                      value={bulkMode}
                      onChange={(e) => setBulkMode(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                    >
                      <option value="percent">Percentage Adjustment (%)</option>
                      <option value="fixed">Fixed Price Setter (Rs.)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Apply To</label>
                    <select
                      value={bulkTarget}
                      onChange={(e) => setBulkTarget(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                    >
                      <option value="salePrice">Retail Sale Price Only</option>
                      <option value="costPrice">Purchase Cost Price Only</option>
                      <option value="both">Both Cost & Sale Price</option>
                    </select>
                  </div>
                </div>

                {bulkMode === "percent" ? (
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">
                      Percentage Change (+10 for +10% markup, -5 for -5% discount)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={bulkPercent}
                        onChange={(e) => setBulkPercent(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-bold font-mono text-sm outline-none"
                      />
                      <span className="text-slate-400 font-bold text-sm">%</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">
                      Fixed Price Value (Rs.)
                    </label>
                    <input
                      type="number"
                      value={bulkFixedPrice}
                      onChange={(e) => setBulkFixedPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-bold font-mono text-sm outline-none"
                    />
                  </div>
                )}

                {/* Preview Box */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Matching Items to Update:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {bulkAffectedProducts.length} Products
                    </span>
                  </div>
                  {bulkAffectedProducts.length > 0 && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                      Sample item: {bulkAffectedProducts[0].name} (Old: Rs. {bulkAffectedProducts[0].salePrice.toLocaleString()} → New: Rs. {Math.round(bulkMode === "percent" ? bulkAffectedProducts[0].salePrice * (1 + bulkPercent / 100) : bulkFixedPrice).toLocaleString()})
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkPriceModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyBulkPricing}
                    disabled={bulkAffectedProducts.length === 0}
                    className="px-5 py-2 font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg shadow-md shadow-amber-600/30 transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Apply to {bulkAffectedProducts.length} Items</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Modal with Item Detail & Percentage Calc */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-glass border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-slate-100 text-base">
                {editingProduct ? "Edit Product Details" : "Add New Pipe / Sanitary Product"}
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-950 border-2 border-slate-700 flex items-center justify-center relative group">
                    {imageUrl ? (
                      <>
                        <img src={imageUrl} alt="Product" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          type="button" 
                          onClick={() => setImageUrl("")}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold"
                        >
                          حذف کریں
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2">
                        <Camera className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                        <span className="text-[8px] text-slate-500 block">تصویر یہاں نہیں ہے</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        const url = window.prompt("Product Image URL درج کریں یا کیمرہ سے لیں (Placeholder link pasted)");
                        if (url) setImageUrl(url);
                        else setImageUrl(`https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=60&sig=${Math.random()}`);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-bold border border-slate-700 transition"
                    >
                      Capture / Upload Photo
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-medium block mb-1">Item Code *</label>
                      <input
                        type="text"
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-medium block mb-1">Brand Name *</label>
                      <input
                        type="text"
                        required
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="Master, Sonex, Porta..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Product Title / Description *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Basin Mixer (Black Gold)"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">تفصیلی تفصیل (Product Notes / Specs)</label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="آئٹم کی تفصیل، وارنٹی، یا اسپیسیفیکیشن یہاں لکھیں..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500 min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Size / Dimension</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. Standard, 25mm, 4 inch"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Color (Optional)</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Chrome, White, Ivory"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Barcode (Optional)</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Scan or type barcode"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Unit Type</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as Product["unit"])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                  >
                    <option value="piece">Piece (Pcs)</option>
                    <option value="set">Set</option>
                    <option value="length">Length (Pipe)</option>
                    <option value="foot">Foot (Ft)</option>
                    <option value="box">Box</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Purchase Cost</label>
                  <input
                    type="number"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Retail Sale Price *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-bold font-mono outline-none"
                  />
                </div>
              </div>

              {/* Quick % Markup tool */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">Quick Markup:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPercentToCurrentSalePrice(5)}
                    className="px-2 py-1 bg-white/5 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold"
                  >
                    +5%
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPercentToCurrentSalePrice(10)}
                    className="px-2 py-1 bg-white/5 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold"
                  >
                    +10%
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPercentToCurrentSalePrice(15)}
                    className="px-2 py-1 bg-white/5 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold"
                  >
                    +15%
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPercentToCurrentSalePrice(20)}
                    className="px-2 py-1 bg-white/5 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold"
                  >
                    +20%
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Current Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Low Stock Alert Minimum</label>
                  <input
                    type="number"
                    min="1"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md shadow-blue-600/30"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? "Save Changes" : "Create Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Scanner & Manual Search Modal */}
      <ScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScan={(code) => {
          setSearchTerm(code);
        }}
      />

      {/* AI Investment Analysis Modal */}
      {showAiAnalysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-900/20 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-indigo-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    AI Inventory & Investment Analysis
                  </h3>
                  <p className="text-xs text-slate-400">Powered by Google Gemini AI</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiAnalysisModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-300 font-medium">Analyzing stock levels and financials...</p>
                  <p className="text-sm text-slate-500 mt-2">Gemini is looking for dead stock and investment opportunities.</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-indigo max-w-none">
                  {aiAnalysisResult ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: aiAnalysisResult
                        .replace(/\n/g, '<br />')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>')
                        .replace(/# (.*?)(<br \/>|$)/g, '<h1 class="text-2xl font-bold text-white mb-4">$1</h1>')
                        .replace(/## (.*?)(<br \/>|$)/g, '<h2 class="text-xl font-bold text-white mt-6 mb-3">$1</h2>')
                        .replace(/### (.*?)(<br \/>|$)/g, '<h3 class="text-lg font-bold text-indigo-200 mt-4 mb-2">$1</h3>')
                    }} />
                  ) : (
                    <p className="text-slate-400">No analysis available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Multimodal Price List / Image / PDF Auto-Categorizer Modal */}
      <AiPriceListUploaderModal
        isOpen={showAiUploaderModal}
        onClose={() => setShowAiUploaderModal(false)}
        onImportProducts={handleImportFromAi}
      />
    </div>
  );
};
