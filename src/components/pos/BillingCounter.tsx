import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Product, 
  CartItem, 
  Customer, 
  Invoice, 
  PaymentMethod, 
  StoreSettings, 
  UserAccount,
  KhataTransaction
} from "../../types";
import { getStoredBranches, addMotionSnapshot } from "../../utils/posStorage";
import { 
  Search, 
  Plus, 
  Minus, 
  User, 
  UserPlus, 
  CreditCard, 
  Banknote, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  RotateCcw,
  Layers,
  FilePlus,
  Ban,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Camera,
  Scan,
  ScanLine,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Package,
  Printer,
  FileDown,
  FileText,
  Loader2,
  Phone
} from "lucide-react";
import { InvoiceReceiptModal } from "./InvoiceReceiptModal";
import { ScannerModal } from "./ScannerModal";
import { useLanguage } from "../../context/LanguageContext";
import { downloadPdfReceipt } from "../../utils/pdfReceiptGenerator";

interface BillingCounterProps {
  products: Product[];
  customers: Customer[];
  settings: StoreSettings;
  activeUser: UserAccount;
  onSaveInvoice: (invoice: Invoice, updatedProducts: Product[], updatedCustomers: Customer[], newKhataTx?: KhataTransaction) => void;
  onAddNewCustomer: (customer: Customer) => void;
  onOpenAiEstimator: () => void;
  onGoToInventory?: () => void;
  autoOpenScanner?: boolean;
  onScannerOpened?: () => void;
}

export const BillingCounter: React.FC<BillingCounterProps> = ({
  products,
  customers,
  settings,
  activeUser,
  onSaveInvoice,
  onAddNewCustomer,
  onOpenAiEstimator,
  onGoToInventory = () => {},
  autoOpenScanner = false,
  onScannerOpened = () => {},
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [discountType, setDiscountType] = useState<"fixed" | "percent">("fixed");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [amountPaidInput, setAmountPaidInput] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [lastSavedInvoice, setLastSavedInvoice] = useState<Invoice | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Thermal Receipt Printing feature state
  const [showThermalModal, setShowThermalModal] = useState(false);
  const [thermalInvoice, setThermalInvoice] = useState<Invoice | null>(null);

  // New Bill & Cancel Bill confirmation modals & notifications
  const [showCancelBillModal, setShowCancelBillModal] = useState(false);
  const [showNewBillModal, setShowNewBillModal] = useState(false);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // New Customer quick modal state
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");

  // Auto-open scanner from external trigger
  useEffect(() => {
    if (autoOpenScanner) {
      setShowScannerModal(true);
      onScannerOpened();
    }
  }, [autoOpenScanner, onScannerOpened]);
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");

  // Live Camera / Barcode Scanner Modal state
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Counter Camera Snapshot for Payer at Checkout (ادائیگی پر خریدار کی تصویر)
  const [enableAutoCaptureOnPay, setEnableAutoCaptureOnPay] = useState<boolean>(true);
  const [payerSnapshotUrl, setPayerSnapshotUrl] = useState<string>(
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
  );
  const [showPayerPhotoChooser, setShowPayerPhotoChooser] = useState<boolean>(false);

  // Toggle & Mobile View modes for Product Catalog vs Cart
  const [showProductCatalog, setShowProductCatalog] = useState(true);
  const [mobileViewMode, setMobileViewMode] = useState<"products" | "cart">("products");
  const [autoOpenCartOnAdd, setAutoOpenCartOnAdd] = useState(true);
  const [showLowStockNotification, setShowLowStockNotification] = useState<boolean>(true);

  const lowStockItems = useMemo(() => {
    return products.filter((p) => p.stockQuantity <= p.minStockAlert);
  }, [products]);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleOpenScanner = () => setShowScannerModal(true);
    window.addEventListener('OPEN_SCANNER', handleOpenScanner);
    return () => window.removeEventListener('OPEN_SCANNER', handleOpenScanner);
  }, []);

  const showNotification = (msg: string) => {
    setActionNotification(msg);
    setTimeout(() => setActionNotification(null), 3000);
  };

  const handleDownloadInvoicePdf = (inv: Invoice) => {
    setIsDownloadingPdf(true);
    setTimeout(() => {
      try {
        const success = downloadPdfReceipt({
          invoice: inv,
          settings,
        });
        if (success) {
          showNotification(`✓ انوائس ${inv.invoiceNumber} کی PDF کامیابی سے ڈاؤن لوڈ ہو گئی!`);
        }
      } catch (e) {
        console.error("PDF generation failed:", e);
      } finally {
        setIsDownloadingPdf(false);
      }
    }, 100);
  };

  // Keyboard shortcut listener for F2 (New Bill) and Escape (Cancel Bill)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        handleRequestNewBill();
      } else if (e.key === "Escape" && cart.length > 0 && !completedInvoice && !showCancelBillModal) {
        e.preventDefault();
        setShowCancelBillModal(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, completedInvoice, showCancelBillModal]);

  // Direct reset for a completely fresh bill
  const handleResetForNewBill = () => {
    setCart([]);
    setDiscountValue(0);
    setDiscountType("fixed");
    setAmountPaidInput("");
    setNotes("");
    setSelectedCustomerId("");
    setSearchTerm("");
    setShowNewBillModal(false);
    setShowCancelBillModal(false);
    showNotification("نیا بل شروع کر دیا گیا ہے (New Bill Initialized)");
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Trigger New Bill request
  const handleRequestNewBill = () => {
    if (cart.length > 0 || discountValue > 0 || notes || selectedCustomerId) {
      setShowNewBillModal(true);
    } else {
      handleResetForNewBill();
    }
  };

  // Trigger Cancel Bill request
  const handleRequestCancelBill = () => {
    if (cart.length > 0 || discountValue > 0 || selectedCustomerId || notes) {
      setShowCancelBillModal(true);
    } else {
      showNotification("بل پہلے سے خالی ہے (Bill is already empty)");
    }
  };

  // Execute Bill Cancellation
  const handleConfirmCancelBill = () => {
    setCart([]);
    setDiscountValue(0);
    setDiscountType("fixed");
    setAmountPaidInput("");
    setNotes("");
    setSelectedCustomerId("");
    setShowCancelBillModal(false);
    showNotification("بل کامیابی سے منسوخ کر دیا گیا (Current Bill Cancelled / Voided)");
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchesCategory;

      const matchesSearch =
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        (p.size && p.size.toLowerCase().includes(term)) ||
        (p.color && p.color.toLowerCase().includes(term)) ||
        (p.barcode && p.barcode.includes(term)) ||
        p.salePrice.toString().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const categories = [
    "All",
    "PPRC Pipes & Fittings",
    "PVC / UPVC Pipes",
    "Sanitary Ware & Ceramics",
    "Faucets & Taps",
    "Valves & Brass Fittings",
    "Water Tanks & Pumps",
    "Indicators & Sensors",
    "Hardware & Tools",
  ];

  // Cart operations
  const handleAddToCart = (product: Product, forceCartView?: boolean) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product,
            quantity: 1,
            unitPrice: product.salePrice,
            total: product.salePrice,
          },
        ];
      }
    });

    showNotification(`✓ ${product.name} بل میں شامل ہو گیا!`);

    // If autoOpenCartOnAdd or forceCartView is active, automatically navigate to cart / checkout page
    if (forceCartView || autoOpenCartOnAdd) {
      setMobileViewMode("cart");
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              total: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleUpdateUnitPrice = (productId: string, newPrice: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const validPrice = Math.max(0, newPrice);
          return {
            ...item,
            unitPrice: validPrice,
            total: item.quantity * validPrice,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    if (cart.length > 0 && window.confirm("Are you sure you want to clear current cart?")) {
      setCart([]);
      setDiscountValue(0);
      setAmountPaidInput("");
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === "percent") {
      return Math.round((subtotal * Math.min(100, Math.max(0, discountValue))) / 100);
    }
    return Math.min(subtotal, Math.max(0, discountValue));
  }, [subtotal, discountType, discountValue]);

  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Subtotal Status indicator based on cart value
  const subtotalStatus = useMemo(() => {
    if (subtotal === 0) {
      return {
        label: "خالی بل (Empty Cart)",
        color: "bg-slate-500/10 text-slate-400 border-slate-500/25",
        dotColor: "bg-slate-400"
      };
    }
    if (subtotal >= 50000) {
      return {
        label: "بڑی تھوک سیل (High Value Wholesale)",
        color: "bg-purple-500/10 text-purple-300 border-purple-500/25",
        dotColor: "bg-purple-400 animate-pulse"
      };
    }
    if (subtotal >= 15000) {
      return {
        label: "تھوک سیل (Bulk / Wholesale Order)",
        color: "bg-blue-500/10 text-blue-300 border-blue-500/25",
        dotColor: "bg-blue-400 animate-pulse"
      };
    }
    return {
      label: "پرچون سیل (Standard Retail Order)",
      color: "bg-amber-500/10 text-amber-300 border-amber-500/25",
      dotColor: "bg-amber-400"
    };
  }, [subtotal]);

  const amountPaid = useMemo(() => {
    if (amountPaidInput === "") {
      return paymentMethod === "credit_khata" ? 0 : grandTotal;
    }
    return Math.max(0, Number(amountPaidInput) || 0);
  }, [amountPaidInput, paymentMethod, grandTotal]);

  const balanceDue = Math.max(0, grandTotal - amountPaid);
  const changeReturned = amountPaid > grandTotal ? amountPaid - grandTotal : 0;

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (paymentMethod === "credit_khata" && !selectedCustomerId) {
      alert("Please select or add a Khata Customer for credit purchases.");
      return;
    }

    const invoiceNum = `HPS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      date: new Date().toISOString(),
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer ? selectedCustomer.name : "Walk-in Cash Customer",
      customerPhone: selectedCustomer?.phone || "",
      items: [...cart],
      subtotal,
      discount: discountAmount,
      tax: 0,
      grandTotal,
      amountPaid: Math.min(amountPaid, grandTotal),
      balanceDue,
      paymentMethod,
      cashierName: activeUser.name,
      cashierId: activeUser.id,
      cashierRole: activeUser.role,
      cashierAvatar: activeUser.avatarUrl,
      counterStation: activeUser.counterStation || "Counter #1 (Main Terminal)",
      printedBy: activeUser.name,
      printedAt: new Date().toISOString(),
      notes: notes || undefined,
      customerPhotoSnapshot: enableAutoCaptureOnPay ? payerSnapshotUrl : undefined,
    };

    const updatedProducts = products.map((prod) => {
      const inCart = cart.find((c) => c.product.id === prod.id);
      if (inCart) {
        return {
          ...prod,
          stockQuantity: Math.max(0, prod.stockQuantity - inCart.quantity),
        };
      }
      return prod;
    });

    let updatedCustomers = [...customers];
    let newKhataTx: KhataTransaction | undefined;

    if (selectedCustomer) {
      const newOutstanding = selectedCustomer.outstandingKhata + balanceDue;
      const newPurchases = selectedCustomer.totalPurchases + grandTotal;

      updatedCustomers = customers.map((c) =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              outstandingKhata: newOutstanding,
              totalPurchases: newPurchases,
            }
          : c
      );

      if (balanceDue > 0) {
        newKhataTx = {
          id: `tx-${Date.now()}`,
          customerId: selectedCustomer.id,
          date: new Date().toISOString(),
          type: "debit",
          amount: balanceDue,
          invoiceNumber: invoiceNum,
          description: `Sale invoice ${invoiceNum} (${cart.length} items)`,
          balanceAfter: newOutstanding,
        };
      }
    }

    onSaveInvoice(newInvoice, updatedProducts, updatedCustomers, newKhataTx);

    // Automatically record payment camera snapshot in CCTV motion surveillance logs
    if (enableAutoCaptureOnPay) {
      try {
        addMotionSnapshot({
          branchId: activeUser.branchId || "branch-1",
          branchName: activeUser.branchName || "Branch 1 (Main HQ)",
          cameraName: `${activeUser.counterStation || "Counter #1"} Cash Cam`,
          category: "payment_counter",
          imageUrl: payerSnapshotUrl,
          title: `${newInvoice.customerName} - بل ادائیگی کیمرہ سنیپ شاٹ (${invoiceNum})`,
          description: `کاؤنٹر پر بل بناتے اور ادائیگی کے وقت کیمرے نے رقم ادا کرنے والے خریدار کی تصویر محفوظ کی۔`,
          invoiceId: newInvoice.id,
          invoiceNumber: invoiceNum,
          customerName: newInvoice.customerName,
          amountPaid: Math.min(amountPaid, grandTotal),
          paymentMethod: paymentMethod === "cash" ? "کیش (Cash)" : paymentMethod === "credit_khata" ? "ادھار کھاتہ" : "بینک ٹرانسفر",
          cashierName: activeUser.name,
        });
      } catch (e) {
        console.error("Failed to log payment motion snapshot", e);
      }
    }

    setLastSavedInvoice(newInvoice);
    setCompletedInvoice(newInvoice);
    showNotification(`✓ انوائس ${invoiceNum} اور گاہک کی ادائیگی کی تصویر محفوظ ہو گئی!`);

    setCart([]);
    setDiscountValue(0);
    setAmountPaidInput("");
    setNotes("");
    setSelectedCustomerId("");
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim(),
      totalPurchases: 0,
      outstandingKhata: 0,
      creditLimit: 50000,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onAddNewCustomer(newCust);
    setSelectedCustomerId(newCust.id);
    setShowAddCustomerModal(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewCustAddress("");
  };

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4 max-w-[1600px] mx-auto min-h-[calc(100vh-130px)] relative">
      {/* Action Notification Toast */}
      {actionNotification && (
        <div className="fixed top-20 right-6 z-50 bg-glass border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotification}</span>
        </div>
      )}

      {/* Mobile View Switcher Tabs (Only visible on mobile / tablet screens < lg) */}
      <div className="lg:hidden flex items-center bg-glass border border-slate-800 rounded-2xl p-1.5 gap-1.5 shadow-lg">
        <button
          onClick={() => setMobileViewMode("products")}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
            mobileViewMode === "products"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5/80"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>پراڈکٹس لسٹ ({filteredProducts.length})</span>
        </button>

        <button
          onClick={() => setMobileViewMode("cart")}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
            mobileViewMode === "cart"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5/80"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>موجودہ بل و کارٹ ({cart.length})</span>
          {cart.length > 0 && (
            <span className="text-[11px] font-mono font-black ml-1 px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300">
              Rs. {grandTotal.toLocaleString()}
            </span>
          )}
        </button>
      </div>

      {/* Low Stock Summary Notification Card */}
      {showLowStockNotification && lowStockItems.length > 0 && (
        <div className="bg-slate-900/90 border border-amber-500/20 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-100 text-sm">
                  کم سٹاک وارننگ (Low Stock Alert)
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  {lowStockItems.length} {t('items')}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                مندرجہ ذیل اشیاء سٹاک میں کم ہیں۔ براہ کرم فوراً دوبارہ آرڈر کریں۔
              </p>
              
              {/* Horizontal scroll of low stock items */}
              <div className="flex flex-wrap gap-2 mt-3">
                {lowStockItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="truncate max-w-[150px] font-semibold">{item.name}</span>
                    <span className="text-slate-500 font-mono">({item.stockQuantity} Left)</span>
                  </div>
                ))}
                {lowStockItems.length > 3 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[10px] text-amber-300 font-bold">
                    <span>+{lowStockItems.length - 3} More</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => onGoToInventory()}
              className="flex-1 md:flex-none px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/10"
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>سٹاک اور دوبارہ آرڈر کریں (Reorder & Manage Stock)</span>
            </button>
            <button
              onClick={() => setShowLowStockNotification(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-slate-800 transition"
              title="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Product Search, Categories & Catalog Grid (7 Cols) */}
        <div className={`${mobileViewMode === "cart" ? "hidden lg:flex" : "flex"} lg:col-span-7 flex flex-col gap-3`}>
          {/* Top Controls: Search, New Bill, Cancel Bill, AI Estimator */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search_items')}
                className="w-full pl-10 pr-12 py-2.5 bg-glass border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:border-blue-500 outline-none shadow-sm"
              />
              <button
                onClick={() => setShowScannerModal(true)}
                className="absolute right-3.5 top-2 text-slate-400 hover:text-blue-400 transition bg-slate-800 p-1 rounded-md border border-slate-700"
                title="Scan Barcode or Search"
              >
                <ScanLine className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Quick New Bill Button */}
              <button
                onClick={handleRequestNewBill}
                title="نیا بل شروع کریں (Press F2)"
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition shadow-sm"
              >
                <FilePlus className="w-4 h-4 text-emerald-400" />
                <span>{t('add')}</span>
                <span className="text-[10px] px-1 py-0.2 bg-emerald-500/30 text-emerald-200 rounded font-mono hidden sm:inline">F2</span>
              </button>

              {/* Quick Cancel Bill Button */}
              <button
                onClick={handleRequestCancelBill}
                title="موجودہ بل کینسل کریں (Press Esc)"
                disabled={cart.length === 0 && discountValue === 0 && !selectedCustomerId && !notes}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition border shadow-sm ${
                  cart.length > 0 || discountValue > 0 || selectedCustomerId || notes
                    ? "bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40 text-rose-300 cursor-pointer"
                    : "bg-glass border-slate-800 text-slate-500 cursor-not-allowed opacity-60"
                }`}
              >
                <Ban className="w-4 h-4 text-rose-400" />
                <span>{t('cancel')}</span>
              </button>

              {/* Quick Print Button */}
              <button
                onClick={() => window.print()}
                title="پرنٹ کریں (Print Current Bill / Screen)"
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition shadow-sm"
              >
                <Printer className="w-4 h-4 text-purple-400" />
                <span>پرنٹ</span>
              </button>

              <button
                onClick={onOpenAiEstimator}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">{t('ai_estimator')}</span>
              </button>
            </div>
          </div>

          {/* Category Pills & Product Hide/Show Bar & Auto-Open Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-glass hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Auto Open Bill On Item Add Toggle */}
              <button
                onClick={() => setAutoOpenCartOnAdd(!autoOpenCartOnAdd)}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition ${
                  autoOpenCartOnAdd
                    ? "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40"
                    : "bg-white/5 text-slate-400 border-slate-700 hover:text-slate-200"
                }`}
                title="جب بھی نیا آئٹم شامل کریں تو خودکار بل والے پیج پر جائیں"
              >
                <span>⚡ خودکار بل پیج: {autoOpenCartOnAdd ? "آن (On)" : "آف"}</span>
              </button>

              {/* Direct Hide / Show Toggle Button */}
              <button
                onClick={() => setShowProductCatalog(!showProductCatalog)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  showProductCatalog
                    ? "bg-white/5 hover:bg-slate-700 text-slate-300 border-slate-700"
                    : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/40"
                }`}
                title="پراڈکٹس لسٹ بند یا اوپن کریں (Hide or Show Product Cards)"
              >
                {showProductCatalog ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">پراڈکٹس بند کریں</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>پراڈکٹس دکھائیں</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Product Catalog Cards OR Collapsed State */}
          {!showProductCatalog ? (
            <div className="p-4 bg-glass/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                  <EyeOff className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    پراڈکٹس لسٹ بند کر دی گئی ہے (Products Hidden)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    اسکرین کی جگہ خالی ہے، آپ اوپر سرچ بار یا کیمرہ سکینر سے بھی براہِ راست آئٹم بل میں شامل کر سکتے ہیں۔
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowProductCatalog(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition shrink-0"
              >
                <Eye className="w-4 h-4" />
                <span>پراڈکٹس لسٹ کھولیں (Open Catalog)</span>
              </button>
            </div>
          ) : (
            <div className="flex-1 bg-glass/50 border border-slate-800 rounded-2xl p-3 overflow-y-auto max-h-[68vh] shadow-inner">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm font-medium">No sanitary or pipe items match your search.</p>
                  <p className="text-slate-500 text-xs mt-1">Try searching for "PPRC", "Master", "PVC", "Commode", or "Elbow"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {filteredProducts.map((product) => {
                    const inCart = cart.find((item) => item.product.id === product.id);
                    const isLowStock = product.stockQuantity <= product.minStockAlert;

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleAddToCart(product)}
                        className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                          inCart
                            ? "bg-blue-950/40 border-blue-500/50 shadow-md ring-1 ring-blue-500/30"
                            : "bg-glass/90 hover:bg-white/5/90 border-slate-800 hover:border-slate-700 shadow-sm"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-semibold">
                              {product.code}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                isLowStock
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : "bg-white/5 text-slate-400"
                              }`}
                            >
                              Stock: {product.stockQuantity} {product.unit}
                            </span>
                          </div>

                          <h4 className="font-semibold text-slate-100 text-xs leading-snug line-clamp-2 group-hover:text-blue-300 transition">
                            {product.name}
                          </h4>

                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="text-slate-300 font-medium">{product.brand}</span>
                            {product.size && <span>• {product.size}</span>}
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 block leading-none">Price / {product.unit}</span>
                            <span className="text-sm font-bold text-emerald-400 font-mono">
                              {settings.currencySymbol} {product.salePrice.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {inCart && (
                              <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-md">
                                {inCart.quantity} in cart
                              </span>
                            )}
                            <div className="w-7 h-7 rounded-lg bg-blue-600/20 group-hover:bg-blue-600 text-blue-300 group-hover:text-white flex items-center justify-center transition">
                              <Plus className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: POS Cart & Checkout Terminal (5 Cols) */}
        <div className={`${mobileViewMode === "products" ? "hidden lg:flex" : "flex"} lg:col-span-5 bg-glass border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden`}>
        {/* Cart Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-glass/90 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Switch Back Button */}
            <button
              onClick={() => setMobileViewMode("products")}
              className="lg:hidden p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center gap-1 text-xs font-bold shrink-0"
              title="مزید اشیاء شامل کریں (Add More Products)"
            >
              <Package className="w-4 h-4" />
              <span>+ مزید اشیاء</span>
            </button>

            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <span className="font-bold text-xs">{cart.length}</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-100 text-sm leading-none truncate">{t('billing_cart')}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {cart.reduce((s, i) => s + i.quantity, 0)} {t('total_items')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Last Saved Invoice PDF Download Button */}
            {lastSavedInvoice && (
              <button
                onClick={() => handleDownloadInvoicePdf(lastSavedInvoice)}
                disabled={isDownloadingPdf}
                title={`Download PDF for ${lastSavedInvoice.invoiceNumber}`}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/25 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1 transition shadow-sm active:scale-95 cursor-pointer"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span className="hidden sm:inline">PDF رسید</span>
              </button>
            )}

            {/* Thermal Print Preview Button */}
            <button
              onClick={() => {
                if (cart.length === 0) {
                  showNotification("کارٹ خالی ہے (Cart is empty)");
                  return;
                }
                const draftInv: Invoice = {
                  id: `draft-${Date.now()}`,
                  invoiceNumber: `HPS-REC-${Math.floor(1000 + Math.random() * 9000)}`,
                  date: new Date().toISOString(),
                  customerId: selectedCustomer?.id,
                  customerName: selectedCustomer ? selectedCustomer.name : "Walk-in Cash Customer",
                  customerPhone: selectedCustomer?.phone || "",
                  items: [...cart],
                  subtotal,
                  discount: discountAmount,
                  tax: 0,
                  grandTotal,
                  amountPaid: Math.min(amountPaid, grandTotal),
                  balanceDue,
                  paymentMethod,
                  cashierName: activeUser.name,
                  cashierId: activeUser.id,
                  cashierRole: activeUser.role,
                  counterStation: activeUser.counterStation || "Counter #1",
                  printedBy: activeUser.name,
                  printedAt: new Date().toISOString(),
                  notes: notes || undefined,
                };
                setThermalInvoice(draftInv);
                setShowThermalModal(true);
              }}
              title="تھرمل رسید پرنٹ (Thermal Receipt Print)"
              className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center gap-1 transition"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">تھرمل پرنٹ</span>
            </button>

            {/* New Bill Button */}
            <button
              onClick={handleRequestNewBill}
              title="نیا بل شروع کریں (F2)"
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 transition"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('add')}</span>
            </button>

            {/* Cancel Bill Button */}
            <button
              onClick={handleRequestCancelBill}
              title="موجودہ بل کینسل کریں (Esc)"
              disabled={cart.length === 0 && discountValue === 0 && !selectedCustomerId && !notes}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition border ${
                cart.length > 0 || discountValue > 0 || selectedCustomerId || notes
                  ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40 cursor-pointer"
                  : "bg-white/5 text-slate-500 border-slate-700 cursor-not-allowed opacity-60"
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('cancel')}</span>
            </button>
          </div>
        </div>

        {/* Active Cashier & Counter Station Banner */}
        <div className="px-3.5 py-2 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={activeUser.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"}
                alt={activeUser.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-blue-500/40 shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[11px] font-bold text-slate-200 truncate">{activeUser.name}</span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">
                  {activeUser.role}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                <span className="text-slate-400 truncate">
                  {activeUser.counterStation || "Counter #1 (Main Terminal)"}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-300 font-mono font-bold flex items-center gap-0.5 shrink-0">
                  <Phone className="w-2.5 h-2.5 text-amber-400" />
                  {activeUser.phone || "0300-5861463"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Online</span>
          </div>
        </div>

        {/* Last Saved Invoice Quick Access Banner with Direct PDF Download */}
        {lastSavedInvoice && (
          <div className="px-3.5 py-2 bg-indigo-950/40 border-b border-indigo-500/30 flex items-center justify-between gap-2 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="truncate text-slate-300 text-[11px]">
                <span>آخری بل: </span>
                <span className="font-mono font-bold text-indigo-300">
                  {lastSavedInvoice.invoiceNumber}
                </span>{" "}
                <span className="text-slate-400 font-semibold">(Rs {lastSavedInvoice.grandTotal.toLocaleString()})</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleDownloadInvoicePdf(lastSavedInvoice)}
                disabled={isDownloadingPdf}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-bold shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
                title="Download PDF directly"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <FileDown className="w-3 h-3" />
                )}
                <span>PDF ڈاؤن لوڈ</span>
              </button>
              <button
                onClick={() => setCompletedInvoice(lastSavedInvoice)}
                className="px-2 py-1 text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
              >
                رسید دیکھیں
              </button>
            </div>
          </div>
        )}

        {/* Customer Selector Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-glass border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:border-blue-500 outline-none"
              >
                <option value="">{t('select_customer')}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.outstandingKhata > 0 ? `(Khata: Rs. ${c.outstandingKhata.toLocaleString()})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-slate-700 border border-slate-700 text-blue-400 hover:text-blue-300 transition"
              title={t('new_customer')}
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {selectedCustomer && (
            <div className="mt-2 p-2 rounded-lg bg-blue-950/30 border border-blue-500/20 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-blue-200 block">{selectedCustomer.name}</span>
                <span className="text-[10px] text-slate-400">{selectedCustomer.phone || "No phone"}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">{t('previous_udhaar')}:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {settings.currencySymbol} {selectedCustomer.outstandingKhata.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 p-3 overflow-y-auto max-h-[35vh] space-y-2 divide-y divide-slate-800/60">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <Layers className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-400 text-xs font-medium">Your cart is empty</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Click any pipe or fitting from the left catalog to add to bill</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                
                {/* Sr No */}
                <div className="w-5 shrink-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-500">{index + 1}.</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-xs text-slate-200 truncate">{item.product.name}</h5>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{settings.currencySymbol}</span>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateUnitPrice(item.product.id, Number(e.target.value))}
                      className="w-16 px-1.5 py-0.5 bg-white/5 border border-slate-700 rounded text-slate-200 font-mono text-[11px] outline-none"
                    />
                    <span>/ {item.product.unit}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => handleUpdateQuantity(item.product.id, -1)}
                    className="w-6 h-6 rounded bg-white/5 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-100 font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item.product.id, 1)}
                    className="w-6 h-6 rounded bg-white/5 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Item Total & Remove */}
                <div className="text-right min-w-[70px]">
                  <span className="font-bold text-xs text-slate-100 font-mono block">
                    {settings.currencySymbol} {item.total.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.product.id)}
                    className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

          {/* Billing Calculations & Payment Options */}
          <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 space-y-3">
            {/* Subtotal, Discount & Grand Total */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span>{t('subtotal')}:</span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${subtotalStatus.color}`}>
                    <span className={`w-1 h-1 rounded-full ${subtotalStatus.dotColor}`} />
                    <span>{subtotalStatus.label}</span>
                  </span>
                </div>
                <span className="font-mono text-slate-200">
                  {settings.currencySymbol} {subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-1">
                  <span>{t('discount')}:</span>
                  <button
                    onClick={() => setDiscountType(discountType === "fixed" ? "percent" : "fixed")}
                    className="px-1.5 py-0.2 rounded bg-white/5 text-[10px] font-mono text-blue-400 hover:text-blue-300 border border-slate-700"
                  >
                    {discountType === "fixed" ? settings.currencySymbol : "%"}
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={discountValue || ""}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    placeholder="0"
                    className="w-20 px-2 py-0.5 bg-glass border border-slate-700 rounded text-right text-emerald-400 font-mono text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-100 pt-1.5 border-t border-slate-800">
                <span>{t('net_total')}:</span>
                <span className="font-mono text-base text-blue-400">
                  {settings.currencySymbol} {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                {t('payment_method')}:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                    paymentMethod === "cash"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-glass border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>{t('cash')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("credit_khata")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                    paymentMethod === "credit_khata"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-glass border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t('addToKhata')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank_transfer")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                    paymentMethod === "bank_transfer"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-glass border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t('transfer')}</span>
                </button>
              </div>
          </div>

          {/* Paid Amount Input & Balance Alert */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">{t('paid_amount')}:</label>
              <input
                type="number"
                value={amountPaidInput}
                onChange={(e) => setAmountPaidInput(e.target.value)}
                placeholder={paymentMethod === "credit_khata" ? "0" : grandTotal.toString()}
                className="w-full px-3 py-1.5 bg-glass border border-slate-700 rounded-lg text-slate-100 font-mono text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                {balanceDue > 0 ? "Khata Balance (Due):" : `${t('change')}:`}
              </label>
              <div
                className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs flex items-center justify-between ${
                  balanceDue > 0
                    ? "bg-rose-950/40 text-rose-400 border border-rose-500/30"
                    : "bg-glass text-emerald-400 border border-slate-700"
                }`}
              >
                <span>{settings.currencySymbol}</span>
                <span>{balanceDue > 0 ? balanceDue.toLocaleString() : changeReturned.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Counter Security Motion Cam Live Snapshot Widget */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-2.5 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-slate-200 text-[11px] flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-indigo-400" />
                  <span>کاؤنٹر کیمرہ (ادائیگی پر تصویر)</span>
                </span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAutoCaptureOnPay}
                  onChange={(e) => setEnableAutoCaptureOnPay(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span className="text-[10px] text-slate-400 font-semibold">آٹو کیپچر فعال</span>
              </label>
            </div>

            {enableAutoCaptureOnPay && (
              <div className="flex items-center gap-2.5 pt-1">
                <img
                  src={payerSnapshotUrl}
                  alt="Payer Snapshot Preview"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover border border-indigo-500/40 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block truncate">
                    {selectedCustomer ? selectedCustomer.name : "Walk-in Cash Payer"}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 block">
                    📹 {activeUser.counterStation || "Counter #1"} Live Feed
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPayerPhotoChooser(!showPayerPhotoChooser)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-semibold mt-0.5 block"
                  >
                    تصویر تبدیل یا دوبارہ لیں
                  </button>
                </div>
              </div>
            )}

            {/* Quick Photo Chooser Drawer */}
            {enableAutoCaptureOnPay && showPayerPhotoChooser && (
              <div className="pt-2 border-t border-slate-800 grid grid-cols-4 gap-1.5 animate-in fade-in">
                {[
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
                ].map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPayerSnapshotUrl(img);
                      setShowPayerPhotoChooser(false);
                    }}
                    className={`rounded-lg overflow-hidden border ${
                      payerSnapshotUrl === img ? "border-indigo-400 ring-1 ring-indigo-400" : "border-slate-700"
                    }`}
                  >
                    <img src={img} alt="Payer choice" referrerPolicy="no-referrer" className="w-full h-10 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition duration-150 ${
              cart.length === 0
                ? "bg-white/5 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 hover:scale-[1.01]"
            }`}
          >
            <span>{t('checkout')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>

      {/* Floating Bottom Quick-Action Bar on Mobile when browsing products with active cart */}
      {mobileViewMode === "products" && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-glass/95 backdrop-blur-md border border-emerald-500/50 p-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-2 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 pl-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block leading-none">موجودہ بل (Active Bill)</span>
              <span className="font-bold text-emerald-300 text-sm font-mono leading-tight">
                {settings.currencySymbol} {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileViewMode("cart")}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition"
          >
            <span>بل و پرنٹنگ پیج</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cancel Bill Confirmation Modal */}
      {showCancelBillModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass border border-rose-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/30">
                <Ban className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">موجودہ بل منسوخ کریں؟ (Cancel Active Bill?)</h3>
                <p className="text-xs text-rose-300">Are you sure you want to void / clear this active bill?</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 my-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Selected Items (اشیاء):</span>
                <span className="font-bold text-slate-100 font-mono">{cart.length} items ({cart.reduce((s, i) => s + i.quantity, 0)} pcs)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Amount (کل رقم):</span>
                <span className="font-bold text-rose-400 font-mono">{settings.currencySymbol} {grandTotal.toLocaleString()}</span>
              </div>
              {selectedCustomer && (
                <div className="flex justify-between text-slate-300">
                  <span>Customer (گاہک):</span>
                  <span className="font-semibold text-blue-300">{selectedCustomer.name}</span>
                </div>
              )}
              <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                یہ بل کینسل کرنے سے تمام سلیکٹ کردہ سامان اور ڈسکاؤنٹ کینسل ہو جائے گا اور کاؤنٹر فریش ہو جائے گا۔
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelBillModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 border border-slate-700 transition"
              >
                نہیں، بل رکھیں (Keep Bill)
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelBill}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ہاں، بل منسوخ کریں (Confirm Cancel)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Bill Confirmation Modal (when cart has items) */}
      {showNewBillModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass border border-emerald-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-emerald-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <FilePlus className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">نیا بل شروع کریں؟ (Start Fresh Bill?)</h3>
                <p className="text-xs text-emerald-300">Clear current items and start a fresh bill for next customer</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 my-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 leading-relaxed">
              موجودہ کاؤنٹر پر <strong>{cart.length}</strong> اشیاء موجود ہیں۔ نیا بل بنانے سے یہ کلیئر ہو جائیں گی اور کاؤنٹر نئے گاہک کے لیے تیار ہو جائے گا۔
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowNewBillModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 border border-slate-700 transition"
              >
                کینسل (Cancel)
              </button>
              <button
                type="button"
                onClick={handleResetForNewBill}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
              >
                <FilePlus className="w-4 h-4" />
                <span>نیا بل بنائیں (Start New Bill)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-slate-100 text-base mb-1">Add New Khata Customer</h3>
            <p className="text-xs text-slate-400 mb-4">Create customer account for credit tracking</p>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Customer / Contractor Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Ustad Imran Plumber"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Mobile / WhatsApp Phone</label>
                <input
                  type="tel"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Site / Shop Address</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="e.g. Street 4, Johar Town"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md shadow-blue-600/30"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Scanner & Manual Search Modal */}
      <ScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScan={(code) => {
          // Look for exact match by ID or Code
          const match = products.find(p => p.id.toLowerCase() === code.toLowerCase());
          if (match) {
            handleAddToCart(match);
            showNotification(`✅ Added: ${match.name}`);
          } else {
            setSearchTerm(code);
            showNotification(`Barcode scanned: ${code}`);
          }
        }}
      />

      {/* Thermal Receipt Print Modal */}
      {showThermalModal && thermalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-slate-100 text-sm">تھرمل رسید پرنٹ (Thermal Receipt Print)</h3>
              </div>
              <button onClick={() => setShowThermalModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-slate-950/60 max-h-[70vh] overflow-y-auto flex flex-col items-center">
              {/* Printable Thermal Receipt Container */}
              <div 
                id="billing-thermal-receipt-container"
                className="bg-white text-slate-950 p-5 rounded-lg font-mono text-xs shadow-xl border border-slate-300 w-full max-w-[380px]"
              >
                <style dangerouslySetInnerHTML={{__html: `
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    #billing-thermal-receipt-container, #billing-thermal-receipt-container * {
                      visibility: visible !important;
                    }
                    #billing-thermal-receipt-container {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      max-width: 100% !important;
                      margin: 0 !important;
                      padding: 10px !important;
                      border: none !important;
                      box-shadow: none !important;
                      color: #000000 !important;
                      background: #ffffff !important;
                      font-family: 'Courier New', Courier, monospace !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                `}} />

                {/* Store Header */}
                {(() => {
                  const allBranches = getStoredBranches();
                  const thermalBranch = allBranches.find(b => b.name === thermalInvoice.branchName || b.id === thermalInvoice.branchId) || allBranches[0];
                  return (
                    <div className="text-center pb-3 border-b-2 border-dashed border-slate-400 space-y-1">
                      <h2 className="font-black text-base uppercase tracking-wide font-sans text-slate-950">
                        {settings.storeName || "Haider Pipe And Sanitary Store"}
                      </h2>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-800 font-sans">
                        🏢 {thermalInvoice.branchName || thermalBranch?.name || "Branch 1 (Main HQ)"}
                      </div>
                      <p className="text-[10px] text-slate-700 font-sans">
                        📍 {thermalBranch?.address || settings.address || "#03 Sikandro Square, Khyber Bazaar, Peshawar"}
                      </p>
                      <p className="text-[10px] text-slate-900 font-sans font-bold flex items-center justify-center gap-1.5 flex-wrap">
                        <span>📞 PTCL: {thermalBranch?.ptcl || "091-2565800"}</span>
                        <span>|</span>
                        <span>📱 Mobile: {thermalBranch?.mobile || "0300-5861463"}</span>
                      </p>
                    </div>
                  );
                })()}

                {/* Invoice Meta */}
                <div className="py-2 border-b border-dashed border-slate-400 text-[11px] font-sans space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Bill No: {thermalInvoice.invoiceNumber}</span>
                    <span className="uppercase text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">{thermalInvoice.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>Date: {new Date(thermalInvoice.date).toLocaleDateString()}</span>
                    <span>Time: {new Date(thermalInvoice.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 text-[10px]">
                    <span>Customer: <strong>{thermalInvoice.customerName}</strong></span>
                    <span>Cashier: {thermalInvoice.cashierName}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="py-2 border-b-2 border-dashed border-slate-400 font-sans">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-400 text-slate-900 font-black">
                        <th className="text-left py-1">Item</th>
                        <th className="text-center py-1">Qty</th>
                        <th className="text-right py-1">Price</th>
                        <th className="text-right py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {thermalInvoice.items.map((item, idx) => (
                        <tr key={idx} className="align-top">
                          <td className="py-1 pr-1">
                            <span className="font-bold block text-slate-950">{item.product.name}</span>
                            {item.product.brand && <span className="text-[9px] text-slate-600">{item.product.brand}</span>}
                          </td>
                          <td className="py-1 text-center font-mono whitespace-nowrap">{item.quantity} {item.product.unit || "pcs"}</td>
                          <td className="py-1 text-right font-mono whitespace-nowrap">{item.unitPrice.toLocaleString()}</td>
                          <td className="py-1 text-right font-mono font-bold whitespace-nowrap">{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px] font-sans">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal:</span>
                    <span className="font-mono">Rs {thermalInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  {thermalInvoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount:</span>
                      <span className="font-mono">- Rs {thermalInvoice.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-950 pt-1 border-t border-slate-400">
                    <span>Grand Total:</span>
                    <span className="font-mono">Rs {thermalInvoice.grandTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Amount Paid:</span>
                    <span className="font-mono font-bold">Rs {thermalInvoice.amountPaid.toLocaleString()}</span>
                  </div>
                  {thermalInvoice.balanceDue > 0 && (
                    <div className="flex justify-between text-rose-700 font-bold bg-rose-50 p-1 rounded">
                      <span>Balance Khata:</span>
                      <span className="font-mono">Rs {thermalInvoice.balanceDue.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Footer Note */}
                <div className="pt-3 text-center font-sans space-y-1">
                  <p className="text-[10px] italic text-slate-700 font-semibold">
                    "{settings.receiptFooter || "Thank you for shopping with Haider Pipe & Sanitary Store!"}"
                  </p>
                  <div className="text-[8px] text-slate-500 font-mono">
                    Software by HaiderSanitary • {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setShowThermalModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-lg transition"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    showNotification("✓ تھرمل پرنٹر (58mm/80mm ESC/POS) کنکشن کامیاب! پرنٹر ریڈی ہے۔");
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg transition"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Printer</span>
                </button>
                {thermalInvoice && (
                  <button
                    onClick={() => {
                      const allBranches = getStoredBranches();
                      const thermalBranch = allBranches.find(b => b.name === thermalInvoice.branchName || b.id === thermalInvoice.branchId) || allBranches[0];
                      downloadPdfReceipt({ 
                        invoice: thermalInvoice, 
                        settings,
                        branchName: thermalBranch?.name,
                        address: thermalBranch?.address,
                        phone: `PTCL: ${thermalBranch?.ptcl || "091-2565800"} | Mobile: ${thermalBranch?.mobile || "0300-5861463"}`
                      });
                      showNotification("✓ PDF رسید کامیابی سے ڈاؤن لوڈ ہو گئی!");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow transition active:scale-95 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download PDF (پی ڈی ایف ڈاؤن لوڈ)</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-black bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-600/30 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Thermal Receipt (تھرمل پرنٹ)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {completedInvoice && (
        <InvoiceReceiptModal
          invoice={completedInvoice}
          settings={settings}
          onClose={() => setCompletedInvoice(null)}
          onStartNewBill={() => {
            setCompletedInvoice(null);
            handleResetForNewBill();
          }}
        />
      )}
    </div>
  );
};
