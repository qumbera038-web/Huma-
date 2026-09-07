import React, { useState, useMemo } from "react";
import { Product, ProductCategory, StoreSettings } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { ScannerModal } from "./ScannerModal";
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
  ScanLine
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
  const [percentCalcInput, setPercentCalcInput] = useState<number>(10);

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

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
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
  }, [products, selectedCategory, selectedBrand, searchTerm]);

  // Inventory Valuations
  const totalValuation = useMemo(() => {
    return products.reduce((sum, p) => sum + p.costPrice * p.stockQuantity, 0);
  }, [products]);

  const totalRetailValuation = useMemo(() => {
    return products.reduce((sum, p) => sum + p.salePrice * p.stockQuantity, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stockQuantity <= p.minStockAlert).length;
  }, [products]);

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

        <div className="bg-glass border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('low_stock_alerts')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-amber-400">
            {lowStockCount} Items
          </p>
        </div>
      </div>

      {/* Main Table Card */}
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

          <div className="flex items-center gap-2">
            {/* Percentage & Company Price Adjuster Button */}
            <button
              onClick={() => setShowBulkPriceModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl transition"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Bulk Price Adjuster</span>
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white/5 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('add_item')}</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="py-3 px-4 font-semibold w-12">Sr #</th>
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
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-medium block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Black Gold, Techno, Ideal, Master"
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
    </div>
  );
};
