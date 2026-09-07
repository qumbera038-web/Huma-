import React, { useState, useMemo } from "react";
import { Product, StoreSettings } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import jsPDF from "jspdf";
import {
  AlertTriangle,
  Printer,
  Download,
  FileText,
  Copy,
  Check,
  Plus,
  ArrowLeft,
  ShoppingCart,
  Search,
  Filter,
  Building2,
  Package,
  Layers,
  X,
  FileDown,
  CheckCircle2,
  Send,
  SlidersHorizontal,
  RefreshCw
} from "lucide-react";

interface StockAlertDashboardProps {
  products: Product[];
  settings: StoreSettings;
  onUpdateProducts: (products: Product[]) => void;
  onClose: () => void;
  onEditProduct?: (product: Product) => void;
}

export const StockAlertDashboard: React.FC<StockAlertDashboardProps> = ({
  products,
  settings,
  onUpdateProducts,
  onClose,
  onEditProduct
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "out_of_stock" | "low_stock">("all");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [quickStockFeedback, setQuickStockFeedback] = useState<string | null>(null);

  // Custom reorder multipliers or overrides (product.id -> suggestedQty)
  const [customReorderQtys, setCustomReorderQtys] = useState<Record<string, number>>({});

  // All products that are currently below or equal to their minStockAlert
  const allAlertProducts = useMemo(() => {
    return products.filter((p) => p.stockQuantity <= p.minStockAlert);
  }, [products]);

  // Unique brands among alert products
  const alertBrands = useMemo(() => {
    const set = new Set<string>();
    allAlertProducts.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [allAlertProducts]);

  // Unique categories among alert products
  const alertCategories = useMemo(() => {
    const set = new Set<string>();
    allAlertProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [allAlertProducts]);

  // Filtered alert items
  const filteredAlertProducts = useMemo(() => {
    return allAlertProducts.filter((p) => {
      // Urgency filter
      if (urgencyFilter === "out_of_stock" && p.stockQuantity > 0) return false;
      if (urgencyFilter === "low_stock" && p.stockQuantity === 0) return false;

      // Brand filter
      if (selectedBrand !== "All" && p.brand !== selectedBrand) return false;

      // Category filter
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const match =
          p.name.toLowerCase().includes(term) ||
          p.code.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          (p.size && p.size.toLowerCase().includes(term)) ||
          (p.barcode && p.barcode.includes(term));
        if (!match) return false;
      }

      return true;
    });
  }, [allAlertProducts, urgencyFilter, selectedBrand, selectedCategory, searchTerm]);

  // Helper to get suggested reorder quantity
  const getSuggestedReorder = (p: Product): number => {
    if (customReorderQtys[p.id] !== undefined) {
      return customReorderQtys[p.id];
    }
    // Recommended standard reorder formula:
    // Buffer = 2x minStockAlert (or minStockAlert + 10, whichever is larger) minus current stock
    const targetBuffer = Math.max(p.minStockAlert * 2, p.minStockAlert + 10);
    return Math.max(1, targetBuffer - p.stockQuantity);
  };

  const handleUpdateCustomReorder = (productId: string, qty: number) => {
    setCustomReorderQtys((prev) => ({
      ...prev,
      [productId]: Math.max(1, qty)
    }));
  };

  // KPI Calculations
  const outOfStockCount = useMemo(() => {
    return allAlertProducts.filter((p) => p.stockQuantity === 0).length;
  }, [allAlertProducts]);

  const lowStockBufferCount = useMemo(() => {
    return allAlertProducts.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert).length;
  }, [allAlertProducts]);

  const totalEstReorderCost = useMemo(() => {
    return filteredAlertProducts.reduce((sum, p) => {
      const qty = getSuggestedReorder(p);
      return sum + qty * p.costPrice;
    }, 0);
  }, [filteredAlertProducts, customReorderQtys]);

  const totalUnitsToOrder = useMemo(() => {
    return filteredAlertProducts.reduce((sum, p) => {
      return sum + getSuggestedReorder(p);
    }, 0);
  }, [filteredAlertProducts, customReorderQtys]);

  // 1-Click Quick Restock (e.g. +5, +10, +25 units received)
  const handleQuickReceiveStock = (productId: string, addQty: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newQty = prod.stockQuantity + addQty;
    const updated = products.map((p) =>
      p.id === productId ? { ...p, stockQuantity: newQty } : p
    );
    onUpdateProducts(updated);

    setQuickStockFeedback(`Received +${addQty} ${prod.unit}s of ${prod.name}. New Stock: ${newQty}`);
    setTimeout(() => setQuickStockFeedback(null), 3000);
  };

  // Export Restock CSV
  const handleExportRestockCSV = () => {
    const headers = [
      "Sr #",
      "Item Code",
      "Product Name",
      "Brand / Company",
      "Category",
      "Size / Specs",
      "Unit",
      "Current Stock",
      "Alert Threshold",
      "Deficit",
      "Suggested Order Qty",
      "Unit Cost Price",
      "Est Total Cost (PKR)"
    ];

    const rows = filteredAlertProducts.map((p, idx) => {
      const orderQty = getSuggestedReorder(p);
      const deficit = Math.max(0, p.minStockAlert - p.stockQuantity);
      const totalCost = orderQty * p.costPrice;
      return [
        idx + 1,
        `"${p.code}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.brand}"`,
        `"${p.category}"`,
        `"${p.size || ""}"`,
        `"${p.unit}"`,
        p.stockQuantity,
        p.minStockAlert,
        deficit,
        orderQty,
        p.costPrice,
        totalCost
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `haider-restocking-order-${selectedBrand !== "All" ? selectedBrand.toLowerCase().replace(/\s+/g, "-") : "all-brands"}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate and Download Clean PDF Purchase Order
  const handleDownloadRestockPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 14;

      // Brand Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 28, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(settings.storeName || "HAIDER PIPE & SANITARY STORE", 14, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // slate-400
      y += 5;
      doc.text("Official Purchase Requisition & Stock Replenishment Sheet", 14, y);

      y += 4;
      doc.text(
        `Contact: ${settings.phone || "0300-1234567"} | Address: ${settings.address || "Main Sanitary Market"}`,
        14,
        y
      );

      // Requisition Metadata
      y = 35;
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("REORDER DETAILS & SUMMARY:", 14, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      y += 5;
      doc.text(`Generated Date: ${new Date().toLocaleDateString("en-PK")} at ${new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}`, 14, y);
      doc.text(`Vendor / Company: ${selectedBrand === "All" ? "All Suppliers" : selectedBrand}`, 120, y);

      y += 4;
      doc.text(`Items Below Buffer: ${filteredAlertProducts.length} SKUs`, 14, y);
      doc.text(`Total Units to Order: ${totalUnitsToOrder} Units`, 70, y);
      doc.text(`Est. Purchase Budget: Rs. ${totalEstReorderCost.toLocaleString()}`, 120, y);

      // Table Header
      y += 8;
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(14, y, pageWidth - 28, 7, "F");
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, y, pageWidth - 28, 7, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      doc.text("Sr", 16, y + 4.5);
      doc.text("Item Code", 23, y + 4.5);
      doc.text("Product Name & Specs", 46, y + 4.5);
      doc.text("Brand", 108, y + 4.5);
      doc.text("Cur", 132, y + 4.5);
      doc.text("Min", 143, y + 4.5);
      doc.text("Order Qty", 154, y + 4.5);
      doc.text("Unit Cost", 172, y + 4.5);
      doc.text("Total Est", 188, y + 4.5);

      y += 7;

      // Table Rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);

      filteredAlertProducts.forEach((p, idx) => {
        // Page overflow check
        if (y > 270) {
          doc.addPage();
          y = 15;
          // Re-draw small header on new page
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text(`Haider Sanitary - Restocking List (Page Continued)`, 14, y);
          y += 5;
        }

        const orderQty = getSuggestedReorder(p);
        const totalCost = orderQty * p.costPrice;
        const isOutOfStock = p.stockQuantity === 0;

        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, pageWidth - 28, 6, "F");
        }

        doc.setTextColor(isOutOfStock ? 225 : 51, isOutOfStock ? 29 : 65, isOutOfStock ? 72 : 85);
        doc.text(`${idx + 1}`, 16, y + 4);
        doc.text(`${p.code}`, 23, y + 4);

        // Product Name (truncated if too long)
        const fullName = `${p.name} ${p.size ? `(${p.size})` : ""}`;
        doc.text(fullName.slice(0, 36), 46, y + 4);

        doc.text(`${p.brand.slice(0, 14)}`, 108, y + 4);
        doc.text(`${p.stockQuantity}`, 132, y + 4);
        doc.text(`${p.minStockAlert}`, 143, y + 4);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(37, 99, 235); // Blue
        doc.text(`${orderQty} ${p.unit}`, 154, y + 4);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`${p.costPrice}`, 172, y + 4);
        doc.text(`${totalCost.toLocaleString()}`, 188, y + 4);

        y += 6;
      });

      // Bottom Signatures
      y = Math.min(265, y + 12);
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setDrawColor(203, 213, 225);
      doc.line(14, y, 60, y);
      doc.line(80, y, 130, y);
      doc.line(150, y, 196, y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Prepared By (Store Incharge)", 14, y + 4);
      doc.text("Approved By (Owner / Manager)", 80, y + 4);
      doc.text("Supplier / Dealer Acceptance", 150, y + 4);

      doc.save(`haider-restock-order-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  // Copy Order text for WhatsApp or supplier message
  const handleCopyWhatsAppOrder = () => {
    const dateStr = new Date().toLocaleDateString("en-PK");
    let text = `📦 *HAIDER PIPE & SANITARY STORE - REORDER REQUISITION*\n`;
    text += `📅 Date: ${dateStr}\n`;
    text += `🏢 Brand/Supplier: ${selectedBrand === "All" ? "General Purchase Order" : selectedBrand}\n`;
    text += `-------------------------------------------\n`;

    filteredAlertProducts.forEach((p, idx) => {
      const orderQty = getSuggestedReorder(p);
      text += `${idx + 1}. *[${p.code}]* ${p.name} ${p.size ? `(${p.size})` : ""}\n`;
      text += `   👉 Order Qty: *${orderQty} ${p.unit}s* (Current Stock: ${p.stockQuantity}, Min: ${p.minStockAlert})\n`;
    });

    text += `-------------------------------------------\n`;
    text += `📊 Total SKUs: ${filteredAlertProducts.length}\n`;
    text += `📦 Total Units: ${totalUnitsToOrder}\n`;
    text += `💰 Estimated Cost: Rs. ${totalEstReorderCost.toLocaleString()}\n`;
    text += `\nPlease confirm availability & delivery schedule. Thank you!`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Toast Feedback for quick replenishment */}
      {quickStockFeedback && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{quickStockFeedback}</span>
          </div>
          <button
            onClick={() => setQuickStockFeedback(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-amber-950/40 border border-rose-500/30 p-5 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Back to Inventory"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
                <span>اسٹاک الرٹ اور ری اسٹاکنگ ڈیش بورڈ</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Critical Stock Reorder Center
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 pl-8">
            Highlighting all items that have breached safety thresholds. Adjust suggested reorder quantities, print physical purchase sheets, or export purchase lists for suppliers.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition shadow-sm cursor-pointer"
            title="Print Reorder Sheet"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>پرنٹ شیٹ (Print Sheet)</span>
          </button>

          <button
            onClick={handleDownloadRestockPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl transition shadow-sm cursor-pointer"
            title="Download PDF Purchase Order"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-400" />
            <span>پی ڈی ایف (Download PDF)</span>
          </button>

          <button
            onClick={handleExportRestockCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl transition shadow-sm cursor-pointer"
            title="Export CSV for Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>ایکسل CSV (Export)</span>
          </button>

          <button
            onClick={handleCopyWhatsAppOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer"
            title="Copy Reorder Formatted for WhatsApp"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>واٹس ایپ آرڈر (WhatsApp Order)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Below Threshold */}
        <div
          onClick={() => setUrgencyFilter("all")}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            urgencyFilter === "all"
              ? "bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/30"
              : "bg-glass border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>کل کم اسٹاک پروڈکٹس (All Alert Items)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-300 font-mono">
              {allAlertProducts.length}
            </span>
            <span className="text-[11px] text-slate-400">SKUs below safety limit</span>
          </div>
        </div>

        {/* Critical Out of Stock */}
        <div
          onClick={() => setUrgencyFilter("out_of_stock")}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            urgencyFilter === "out_of_stock"
              ? "bg-red-950/60 border-red-500/60 shadow-lg shadow-red-950/40"
              : "bg-glass border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>بالکل ختم (Out of Stock - 0 Qty)</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-400 font-mono">
              {outOfStockCount}
            </span>
            <span className="text-[11px] text-red-300/80">Immediate replenishment required</span>
          </div>
        </div>

        {/* Total Reorder Units */}
        <div className="bg-glass border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>کل مطلوبہ یونٹس (Total Units Needed)</span>
            <ShoppingCart className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-300 font-mono">
              {totalUnitsToOrder.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400">Pcs / Meters to order</span>
          </div>
        </div>

        {/* Est. Restocking Budget */}
        <div className="bg-glass border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>تخمینہ لاگت (Estimated Restock Budget)</span>
            <span className="text-xs text-amber-400 font-bold">{settings.currencySymbol}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300 font-mono">
              {totalEstReorderCost.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400">At wholesale cost price</span>
          </div>
        </div>
      </div>

      {/* Main Alert Products Table Container */}
      <div className="bg-glass border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex flex-1 items-center flex-wrap gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by code, product name, barcode..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-rose-500 transition"
              />
            </div>

            {/* Urgency Filter Tabs */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setUrgencyFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  urgencyFilter === "all"
                    ? "bg-rose-500/20 text-rose-300 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All Low ({allAlertProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setUrgencyFilter("out_of_stock")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  urgencyFilter === "out_of_stock"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-red-400 hover:text-red-300"
                }`}
              >
                Out of Stock ({outOfStockCount})
              </button>
              <button
                type="button"
                onClick={() => setUrgencyFilter("low_stock")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  urgencyFilter === "low_stock"
                    ? "bg-amber-500/20 text-amber-300 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Low Buffer ({lowStockBufferCount})
              </button>
            </div>

            {/* Company / Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 outline-none focus:border-blue-500"
            >
              <option value="All">All Suppliers / Brands</option>
              {alertBrands.map((b) => (
                <option key={b} value={b}>
                  {b} ({allAlertProducts.filter((p) => p.brand === b).length})
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 outline-none focus:border-blue-500"
            >
              <option value="All">All Categories</option>
              {alertCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 text-xs text-slate-400">
            <span>
              Showing <strong className="text-slate-100">{filteredAlertProducts.length}</strong> items to restock
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/70">
                <th className="py-3 px-4 font-semibold w-12 text-center">Sr #</th>
                <th className="py-3 px-4 font-semibold">Status / Urgency</th>
                <th className="py-3 px-4 font-semibold">Code</th>
                <th className="py-3 px-4 font-semibold">Item & Specifications</th>
                <th className="py-3 px-4 font-semibold">Brand / Vendor</th>
                <th className="py-3 px-4 font-semibold text-center">Current Stock</th>
                <th className="py-3 px-4 font-semibold text-center">Threshold</th>
                <th className="py-3 px-4 font-semibold text-center">Shortfall</th>
                <th className="py-3 px-4 font-semibold text-center min-w-[140px]">Suggested Reorder</th>
                <th className="py-3 px-4 font-semibold text-right">Est. Unit Cost</th>
                <th className="py-3 px-4 font-semibold text-right">Total Est. Budget</th>
                <th className="py-3 px-4 font-semibold text-right min-w-[130px]">Quick Stock In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlertProducts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3 text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-200 text-sm">اسٹاک لیول محفوظ ہے! (No Critical Alerts)</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        کوئی بھی پراڈکٹ اس فلٹر کے مطابق خطرے کے نشان سے نیچے نہیں ہے۔ آپ کا انوینٹری بفر بالکل برقرار ہے۔
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedBrand("All");
                          setSelectedCategory("All");
                          setUrgencyFilter("all");
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
                      >
                        تمام فلٹرز ری سیٹ کریں (Reset Filters)
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAlertProducts.map((p, index) => {
                  const isZero = p.stockQuantity === 0;
                  const deficit = Math.max(0, p.minStockAlert - p.stockQuantity);
                  const suggestedOrder = getSuggestedReorder(p);
                  const lineCost = suggestedOrder * p.costPrice;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/30 transition ${
                        isZero ? "bg-rose-950/15" : ""
                      }`}
                    >
                      {/* Sr */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-[11px] text-center">
                        {index + 1}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isZero ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                            ختم (OUT OF STOCK)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            کم اسٹاک (LOW)
                          </span>
                        )}
                      </td>

                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                        {p.code}
                      </td>

                      {/* Name & Specs */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-100 block text-xs">
                          {p.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          {p.size && (
                            <span className="bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700 text-slate-300">
                              {p.size}
                            </span>
                          )}
                          {p.color && <span>{p.color}</span>}
                          <span className="text-slate-500">({p.category})</span>
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-amber-300 border border-slate-700">
                          {p.brand}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                            isZero
                              ? "bg-red-500/20 text-red-400 border border-red-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {p.stockQuantity} {p.unit}s
                        </span>
                      </td>

                      {/* Alert Threshold */}
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-400 text-xs">
                        {p.minStockAlert} {p.unit}s
                      </td>

                      {/* Deficit / Shortfall */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-xs text-rose-400">
                          -{deficit > 0 ? deficit : 0}
                        </span>
                      </td>

                      {/* Suggested Reorder Qty (Editable) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden p-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCustomReorder(p.id, Math.max(1, suggestedOrder - 1))
                            }
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                          >
                            <span className="font-bold text-xs">-</span>
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={suggestedOrder}
                            onChange={(e) =>
                              handleUpdateCustomReorder(p.id, parseInt(e.target.value) || 1)
                            }
                            className="w-12 text-center bg-transparent font-mono font-bold text-xs text-blue-400 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCustomReorder(p.id, suggestedOrder + 1)
                            }
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                          >
                            <span className="font-bold text-xs">+</span>
                          </button>
                        </div>
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {settings.currencySymbol} {p.costPrice.toLocaleString()}
                      </td>

                      {/* Total Est Budget */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-amber-300">
                        {settings.currencySymbol} {lineCost.toLocaleString()}
                      </td>

                      {/* Quick Stock In Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuickReceiveStock(p.id, 5)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-300 border border-slate-700 rounded text-[10px] font-bold text-slate-300 transition"
                            title="Quick Receive 5 units"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickReceiveStock(p.id, 10)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-300 border border-slate-700 rounded text-[10px] font-bold text-slate-300 transition"
                            title="Quick Receive 10 units"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickReceiveStock(p.id, 25)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-300 border border-slate-700 rounded text-[10px] font-bold text-slate-300 transition"
                            title="Quick Receive 25 units"
                          >
                            +25
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

      {/* 🖨️ Printable Restocking Sheet Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print-only-modal">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-black text-slate-100 text-sm">
                    پرنٹ پریویو - خریداری و ری اسٹاکنگ پروانہ (Print Reorder Sheet)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Press Print to print this formatted sheet on A4 or Thermal slip.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>پرنٹ کریں (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Paper */}
            <div className="p-6 overflow-y-auto bg-slate-950">
              <div
                id="printable-restock-sheet"
                className="bg-white text-slate-900 p-6 rounded-lg shadow-lg border border-slate-300 font-sans text-xs space-y-4"
              >
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                      {settings.storeName || "HAIDER PIPE & SANITARY STORE"}
                    </h1>
                    <p className="text-[11px] text-slate-600 font-medium">
                      حیدر پائپ اینڈ سینیٹری اسٹور - ہول سیل و ریٹیل ڈیلر
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {settings.address || "Main Sanitary Market"} | Phone: {settings.phone || "0300-1234567"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 bg-slate-900 text-white font-bold text-[10px] rounded">
                      STOCK REQUISITION
                    </span>
                    <p className="text-[10px] font-bold text-slate-800 mt-1">
                      Date: {new Date().toLocaleDateString("en-PK")}
                    </p>
                    <p className="text-[9px] text-slate-500">
                      Time: {new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                {/* Filter info */}
                <div className="bg-slate-100 p-2.5 rounded border border-slate-200 flex justify-between text-[11px]">
                  <div>
                    <span className="text-slate-500">Vendor / Brand:</span>{" "}
                    <strong>{selectedBrand === "All" ? "All Suppliers" : selectedBrand}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Items:</span>{" "}
                    <strong>{filteredAlertProducts.length} Products</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Order Units:</span>{" "}
                    <strong>{totalUnitsToOrder} Units</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Est. Budget:</span>{" "}
                    <strong>Rs. {totalEstReorderCost.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Itemized Table */}
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold border-b border-slate-900">
                      <th className="p-1.5 text-center w-8">Sr#</th>
                      <th className="p-1.5 w-16">Code</th>
                      <th className="p-1.5">Description & Specs</th>
                      <th className="p-1.5 w-20">Brand</th>
                      <th className="p-1.5 text-center w-14">In Stock</th>
                      <th className="p-1.5 text-center w-12">Min</th>
                      <th className="p-1.5 text-center w-16 bg-blue-900 text-white">Order Qty</th>
                      <th className="p-1.5 text-right w-16">Unit Cost</th>
                      <th className="p-1.5 text-right w-20">Est. Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 border-b border-slate-300">
                    {filteredAlertProducts.map((p, i) => {
                      const orderQty = getSuggestedReorder(p);
                      const lineCost = orderQty * p.costPrice;
                      const isZero = p.stockQuantity === 0;
                      return (
                        <tr key={p.id} className={i % 2 === 1 ? "bg-slate-50" : ""}>
                          <td className="p-1.5 text-center font-bold text-slate-500">{i + 1}</td>
                          <td className="p-1.5 font-mono font-bold text-slate-800">{p.code}</td>
                          <td className="p-1.5">
                            <span className="font-bold text-slate-900">{p.name}</span>
                            {p.size && <span className="text-slate-500 ml-1">({p.size})</span>}
                            {isZero && (
                              <span className="text-[8px] ml-1.5 px-1 py-0.2 bg-red-100 text-red-700 font-bold rounded">
                                NIL STOCK
                              </span>
                            )}
                          </td>
                          <td className="p-1.5 font-semibold text-slate-700">{p.brand}</td>
                          <td className="p-1.5 text-center font-mono font-bold text-slate-800">
                            {p.stockQuantity} {p.unit}
                          </td>
                          <td className="p-1.5 text-center font-mono text-slate-600">
                            {p.minStockAlert}
                          </td>
                          <td className="p-1.5 text-center font-mono font-black text-blue-900 bg-blue-50">
                            {orderQty} {p.unit}
                          </td>
                          <td className="p-1.5 text-right font-mono text-slate-600">
                            {p.costPrice.toLocaleString()}
                          </td>
                          <td className="p-1.5 text-right font-mono font-bold text-slate-900">
                            {lineCost.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-slate-900">
                      <td colSpan={6} className="p-2 text-right">
                        Grand Total:
                      </td>
                      <td className="p-2 text-center text-blue-900 font-black">
                        {totalUnitsToOrder} Units
                      </td>
                      <td className="p-2 text-right">Budget:</td>
                      <td className="p-2 text-right font-black">
                        Rs. {totalEstReorderCost.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Signatures */}
                <div className="pt-8 grid grid-cols-3 gap-8 text-center text-[10px] text-slate-700 font-bold">
                  <div>
                    <div className="border-t border-slate-400 pt-1">Store Incharge</div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1">Authorized Signature (Owner)</div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1">Dealer / Supplier Received</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
