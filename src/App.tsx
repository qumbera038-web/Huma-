import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Product, 
  Customer, 
  Invoice, 
  StoreSettings, 
  UserAccount, 
  KhataTransaction,
  Branch,
  StaffAttendanceLog,
  WhatsAppOrder,
  OnlineAiOrder,
  CartItem,
  MotionSnapshot,
  StaffMessage,
  BusinessExpense
} from "./types";
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredCustomers,
  saveStoredCustomers,
  getStoredInvoices,
  saveStoredInvoices,
  getStoredSettings,
  saveStoredSettings,
  getStoredUsers,
  saveStoredUsers,
  getActiveUser,
  setActiveUser as saveActiveUser,
  getStoredKhata,
  saveStoredKhata,
  getStoredBranches,
  saveStoredBranches,
  getActiveBranchId,
  setActiveBranchId as saveActiveBranchId,
  getStoredAttendanceLogs,
  saveStoredAttendanceLogs,
  logStaffLogin,
  getStoredWhatsAppOrders,
  saveStoredWhatsAppOrders,
  getStoredTheme,
  saveStoredTheme,
  AppTheme,
  exportAllDataBackup,
  getLastBackupDate,
  getStoredMotionSnapshots,
  addMotionSnapshot,
  getStoredStaffMessages,
  addStaffMessage,
  getStoredExpenses,
  addExpense,
  getMaintenanceStatus,
  recordMaintenance
} from "./utils/posStorage";
import { LockScreen } from "./components/pos/LockScreen";
import { PosHeader, PosTab } from "./components/pos/PosHeader";
import { SuperAdminDashboard } from "./components/pos/SuperAdminDashboard";
import { BranchOwnerDashboard } from "./components/pos/BranchOwnerDashboard";
import { BillingCounter } from "./components/pos/BillingCounter";
import { InventoryManager } from "./components/pos/InventoryManager";
import { CustomerKhata } from "./components/pos/CustomerKhata";
import { SalesReports } from "./components/pos/SalesReports";
import { BranchNetworkManager } from "./components/pos/BranchNetworkManager";
import { WhatsAppHub } from "./components/pos/WhatsAppHub";
import { MotionSecurityHub } from "./components/pos/MotionSecurityHub";
import { StaffAttendanceTracker } from "./components/pos/StaffAttendanceTracker";
import { StaffSecretHub } from "./components/pos/StaffSecretHub";
import { ExpenseLedger } from "./components/pos/ExpenseLedger";
import { ExportView } from "./components/pos/ExportView";
import { PlumbingAIEstimator } from "./components/pos/PlumbingAIEstimator";
import { AiSalesMarketingHub } from "./components/pos/AiSalesMarketingHub";
import { PosSettings } from "./components/pos/PosSettings";
import { PosExportCenter } from "./components/pos/PosExportCenter";
import { ReturnItemModal } from "./components/pos/ReturnItemModal";
import { GlobalVoiceCommand } from "./components/pos/GlobalVoiceCommand";
import { FloatingActionMenu } from "./components/pos/FloatingActionMenu";
import { DirectInstallModal } from "./components/pos/DirectInstallModal";
import { AiPriceListUploaderModal } from "./components/pos/AiPriceListUploaderModal";
import { LowStockToast, LowStockAlertPayload } from "./components/pos/LowStockToast";
import { Download, Smartphone, Package, Sparkles, Zap, Camera, Crown } from "lucide-react";

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [showAiUploadModal, setShowAiUploadModal] = useState<boolean>(false);

  const [showScanner, setShowScanner] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);
  const [activeTab, setActiveTab] = useState<PosTab>(() => {
    const u = getActiveUser();
    if (u?.isSuperAdmin || u?.role === "admin") return "super_admin_dashboard";
    if (u?.role === "manager") return "branch_owner_dashboard";
    return "billing";
  });
  const [showReturnModal, setShowReturnModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  // State loaded from localStorage
  const [settings, setSettings] = useState<StoreSettings>(getStoredSettings);
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [customers, setCustomers] = useState<Customer[]>(getStoredCustomers);
  const [invoices, setInvoices] = useState<Invoice[]>(getStoredInvoices);
  const [khataTransactions, setKhataTransactions] = useState<KhataTransaction[]>(getStoredKhata);
  const [users, setUsers] = useState<UserAccount[]>(getStoredUsers);
  const [activeUser, setActiveUserState] = useState<UserAccount>(getActiveUser);
  const [branches, setBranches] = useState<Branch[]>(getStoredBranches);
  const [activeBranchId, setActiveBranchIdState] = useState<string>(getActiveBranchId);
  const [whatsappOrders, setWhatsappOrders] = useState<WhatsAppOrder[]>(getStoredWhatsAppOrders);
  const [attendanceLogs, setAttendanceLogs] = useState<StaffAttendanceLog[]>(getStoredAttendanceLogs);
  const [motionSnapshots, setMotionSnapshots] = useState<MotionSnapshot[]>(getStoredMotionSnapshots);
  const [staffMessages, setStaffMessages] = useState<StaffMessage[]>(getStoredStaffMessages);
  const [expenses, setExpenses] = useState<BusinessExpense[]>(getStoredExpenses);
  const [theme, setTheme] = useState<AppTheme>(getStoredTheme);

  // Low Stock Notification System State
  const [lowStockAlert, setLowStockAlert] = useState<LowStockAlertPayload | null>(null);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [showLowStockOnlyInInventory, setShowLowStockOnlyInInventory] = useState<boolean>(false);
  const prevStockMapRef = useRef<Map<string, number>>(new Map());
  const initialLowStockCheckedRef = useRef(false);

  const triggerLowStockNotification = (payload: Omit<LowStockAlertPayload, "id" | "timestamp">) => {
    setLowStockAlert({
      ...payload,
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    });
  };

  const handleViewInInventoryFromToast = (productId?: string) => {
    setActiveTab("inventory");
    if (productId) {
      setHighlightedProductId(productId);
    }
    setShowLowStockOnlyInInventory(true);
    setLowStockAlert(null);
  };

  // Automatic Low Stock Detection Effect
  useEffect(() => {
    if (!products || products.length === 0) return;

    const defaultThresh = settings.lowStockThreshold ?? 5;
    const allLowItems = products.filter((p) => {
      const t = p.minStockAlert ?? defaultThresh;
      return (p.stockQuantity ?? 0) <= t;
    });

    // 1. Initial Load: Check if any items are currently low stock
    if (!initialLowStockCheckedRef.current) {
      initialLowStockCheckedRef.current = true;
      products.forEach((p) => {
        prevStockMapRef.current.set(p.id, p.stockQuantity ?? 0);
      });

      if (allLowItems.length > 0) {
        const lead = allLowItems[0];
        const thresh = lead.minStockAlert ?? defaultThresh;
        const timer = setTimeout(() => {
          triggerLowStockNotification({
            productId: lead.id,
            productName: lead.name,
            productCode: lead.code,
            productBrand: lead.brand,
            currentStock: lead.stockQuantity ?? 0,
            threshold: thresh,
            unit: lead.unit,
            totalLowCount: allLowItems.length,
            items: allLowItems.map((i) => ({
              id: i.id,
              name: i.name,
              code: i.code,
              brand: i.brand,
              currentStock: i.stockQuantity ?? 0,
              threshold: i.minStockAlert ?? defaultThresh,
              unit: i.unit,
            })),
          });
        }, 1500);
        return () => clearTimeout(timer);
      }
      return;
    }

    // 2. Subsequent Updates: Detect items whose stock was consumed and fell <= threshold
    const newlyFallen: Product[] = [];
    products.forEach((p) => {
      const prevQty = prevStockMapRef.current.get(p.id);
      const currQty = p.stockQuantity ?? 0;
      const thresh = p.minStockAlert ?? defaultThresh;

      if (prevQty !== undefined && currQty < prevQty && currQty <= thresh) {
        newlyFallen.push(p);
      }

      prevStockMapRef.current.set(p.id, currQty);
    });

    if (newlyFallen.length > 0) {
      const lead = newlyFallen[0];
      const thresh = lead.minStockAlert ?? defaultThresh;
      triggerLowStockNotification({
        productId: lead.id,
        productName: lead.name,
        productCode: lead.code,
        productBrand: lead.brand,
        currentStock: lead.stockQuantity ?? 0,
        threshold: thresh,
        unit: lead.unit,
        totalLowCount: allLowItems.length,
        items: newlyFallen.map((i) => ({
          id: i.id,
          name: i.name,
          code: i.code,
          brand: i.brand,
          currentStock: i.stockQuantity ?? 0,
          threshold: i.minStockAlert ?? defaultThresh,
          unit: i.unit,
        })),
      });
    }
  }, [products, settings.lowStockThreshold]);

  // Daily Backup Reminder
  useEffect(() => {
    if (settings.enableDailyBackup) {
      const today = new Date().toISOString().slice(0, 10);
      const lastBackup = getLastBackupDate();
      
      if (lastBackup !== today) {
        localStorage.setItem("hps_pos_last_backup_date", today);
      }
    }
  }, [settings.enableDailyBackup]);

  // 3-Day Maintenance Check
  useEffect(() => {
    const { needsMaintenance, daysSince } = getMaintenanceStatus();
    if (needsMaintenance && activeUser) {
      setTimeout(() => {
        showToast(`🛠️ Maintenance Reminder: ${daysSince} days since last system check. Please perform a manual backup.`);
      }, 5000);
    }
  }, [activeUser]);

  const handleMaintenanceComplete = () => {
    recordMaintenance();
    showToast("✅ Maintenance cycle recorded. Next check in 3 days.");
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    saveStoredTheme(newTheme);
    showToast(`🎨 Background Theme changed to: ${newTheme.toUpperCase()}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Sync to local storage
  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    saveStoredProducts(newProducts);
  };

  const handleRefreshProducts = () => {
    setProducts(getStoredProducts());
    showToast("✅ Inventory synced from database.");
  };

  const handleUpdateCustomers = (newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    saveStoredCustomers(newCustomers);
  };

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleUpdateUsers = (newUsers: UserAccount[]) => {
    setUsers(newUsers);
    saveStoredUsers(newUsers);
  };

  const handleUpdateBranches = (newBranches: Branch[]) => {
    setBranches(newBranches);
    saveStoredBranches(newBranches);
  };

  const handleUpdateWhatsAppOrders = (orders: WhatsAppOrder[]) => {
    setWhatsappOrders(orders);
    saveStoredWhatsAppOrders(orders);
    showToast("WhatsApp Orders updated.");
  };

  const handleUpdateAttendanceLogs = (logs: StaffAttendanceLog[]) => {
    setAttendanceLogs(logs);
    saveStoredAttendanceLogs(logs);
  };

  const handlePunchInAttendance = (user: UserAccount) => {
    const newLog = logStaffLogin(user);
    setAttendanceLogs(getStoredAttendanceLogs());
    showToast(`حاضری لاگ ان محفوظ: ${user.name} at ${newLog.loginTime}`);
  };

  const handleAddMotionSnapshot = (snapData: Omit<MotionSnapshot, "id" | "timestamp" | "timeFormatted" | "dateFormatted">) => {
    const newSnap = addMotionSnapshot(snapData);
    setMotionSnapshots(getStoredMotionSnapshots());
    showToast(`📸 کیمرہ سنیپ شاٹ محفوظ ہو گیا: ${snapData.title}`);
  };

  const handleAddStaffMessage = (msgData: Omit<StaffMessage, "id" | "timestamp">) => {
    addStaffMessage(msgData);
    setStaffMessages(getStoredStaffMessages());
  };

  const handleAddExpense = (expData: Omit<BusinessExpense, "id">) => {
    addExpense(expData);
    setExpenses(getStoredExpenses());
    showToast(`💰 خرچہ محفوظ ہو گیا: ${expData.description}`);
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    const newInvoices = invoices.map((i) => (i.id === updatedInvoice.id ? updatedInvoice : i));
    setInvoices(newInvoices);
    saveStoredInvoices(newInvoices);
    setMotionSnapshots(getStoredMotionSnapshots());
    showToast(`✓ انوائس ${updatedInvoice.invoiceNumber} کا گیٹ پاس اور ڈسپیچ ریکارڈ اپڈیٹ ہو گیا!`);
  };

  const handleSelectBranch = (branchId: string) => {
    setActiveBranchIdState(branchId);
    saveActiveBranchId(branchId);
  };

  const handleSwitchUser = (user: UserAccount) => {
    setActiveUserState(user);
    saveActiveUser(user);
    setAttendanceLogs(getStoredAttendanceLogs());
    if (user.isSuperAdmin || user.role === "admin") {
      setActiveTab("super_admin_dashboard");
    } else if (user.role === "manager") {
      setActiveTab("branch_owner_dashboard");
    } else {
      setActiveTab("billing");
    }
  };

  // Sale saved from billing counter
  const handleSaveInvoice = (
    newInvoice: Invoice,
    updatedProducts: Product[],
    updatedCustomers: Customer[],
    newKhataTx?: KhataTransaction
  ) => {
    const taggedInvoice: Invoice = {
      ...newInvoice,
      branchId: newInvoice.branchId || activeUser.branchId || "branch-1",
      branchName: newInvoice.branchName || activeUser.branchName || "Branch 1 (Main HQ)",
    };

    const updatedInvoices = [taggedInvoice, ...invoices];
    setInvoices(updatedInvoices);
    saveStoredInvoices(updatedInvoices);

    handleUpdateProducts(updatedProducts);
    handleUpdateCustomers(updatedCustomers);

    if (newKhataTx) {
      const updatedKhata = [newKhataTx, ...khataTransactions];
      setKhataTransactions(updatedKhata);
      saveStoredKhata(updatedKhata);
    }
    showToast(`Invoice ${newInvoice.invoiceNumber} created successfully!`);
  };

  // Return processed
  const handleProcessReturn = (
    updatedInvoice: Invoice,
    refundAmount: number,
    returnedItemId: string,
    returnedQty: number,
    returnedItemName: string
  ) => {
    // 1. Restock item in inventory
    const updatedProducts = products.map((p) => {
      if (p.id === returnedItemId || p.code === returnedItemId) {
        return {
          ...p,
          stockQuantity: (p.stockQuantity || 0) + returnedQty,
        };
      }
      return p;
    });
    handleUpdateProducts(updatedProducts);

    // 2. Update invoice notes and totals
    const updatedInvoices = invoices.map((i) => (i.id === updatedInvoice.id ? updatedInvoice : i));
    setInvoices(updatedInvoices);
    saveStoredInvoices(updatedInvoices);

    // 3. If refund is credit and customer exists, adjust khata
    if (updatedInvoice.customerId && updatedInvoice.paymentMethod === "credit") {
      const cust = customers.find((c) => c.id === updatedInvoice.customerId);
      if (cust) {
        const newOutstanding = Math.max(0, cust.outstandingKhata - refundAmount);
        const updatedCust: Customer = {
          ...cust,
          outstandingKhata: newOutstanding,
        };
        const newTx: KhataTransaction = {
          id: `tx-${Date.now()}`,
          customerId: cust.id,
          date: new Date().toISOString(),
          type: "credit",
          amount: refundAmount,
          description: `Refund for returned items on Invoice #${updatedInvoice.invoiceNumber}`,
          balanceAfter: newOutstanding,
        };
        const updatedKhata = [newTx, ...khataTransactions];
        setKhataTransactions(updatedKhata);
        saveStoredKhata(updatedKhata);

        const updatedCusts = customers.map((c) => (c.id === cust.id ? updatedCust : c));
        handleUpdateCustomers(updatedCusts);
      }
    }

    showToast(`✅ Successfully returned ${returnedQty} unit(s) of "${returnedItemName}"! Refund: Rs. ${refundAmount.toLocaleString()}`);
  };

  // Global AI Multimodal Products Importer
  const handleGlobalImportProducts = (newProducts: Product[]) => {
    const updated = [...newProducts, ...products];
    handleUpdateProducts(updated);
    showToast(`✅ ${newProducts.length} پروڈکٹس کامیابی سے انوینٹری میں شامل کر دی گئیں!`);
  };

  // Cancel / Void Entire Invoice
  const handleCancelInvoice = (invoiceId: string, reason: string) => {
    const targetInv = invoices.find((i) => i.id === invoiceId);
    if (!targetInv) {
      showToast("❌ Invoice not found!");
      return;
    }
    if (targetInv.status === "cancelled") {
      showToast("⚠️ This invoice is already cancelled!");
      return;
    }

    // 1. Mark invoice as cancelled
    const updatedInv: Invoice = {
      ...targetInv,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelledBy: activeUser ? `${activeUser.name} (${activeUser.role})` : "Qumber Ali Shah (Admin)",
      cancelledReason: reason || "Voided by manager",
      notes: `${targetInv.notes || ""} [CANCELLED on ${new Date().toLocaleDateString()}: ${reason}]`.trim(),
    };

    const updatedInvoices = invoices.map((inv) => (inv.id === invoiceId ? updatedInv : inv));
    setInvoices(updatedInvoices);
    saveStoredInvoices(updatedInvoices);

    // 2. Revert Stock in Inventory for all items in the cancelled invoice
    const itemQtyMap = new Map<string, number>();
    targetInv.items.forEach((item) => {
      itemQtyMap.set(item.productId, (itemQtyMap.get(item.productId) || 0) + item.quantity);
    });

    const updatedProducts = products.map((p) => {
      const qtyToRestore = itemQtyMap.get(p.id) || itemQtyMap.get(p.code);
      if (qtyToRestore) {
        return {
          ...p,
          stockQuantity: p.stockQuantity + qtyToRestore,
        };
      }
      return p;
    });
    handleUpdateProducts(updatedProducts);

    // 3. Revert Customer Khata if invoice had credit/balance due
    if (targetInv.customerId && targetInv.balanceDue > 0) {
      const cust = customers.find((c) => c.id === targetInv.customerId);
      if (cust) {
        const newOutstanding = Math.max(0, cust.outstandingKhata - targetInv.balanceDue);
        const updatedCust: Customer = {
          ...cust,
          outstandingKhata: newOutstanding,
        };
        const updatedCusts = customers.map((c) => (c.id === cust.id ? updatedCust : c));
        handleUpdateCustomers(updatedCusts);

        const newTx: KhataTransaction = {
          id: `tx-cancel-${Date.now()}`,
          customerId: cust.id,
          date: new Date().toISOString(),
          type: "credit",
          amount: targetInv.balanceDue,
          description: `بل منسوخی ایڈجسٹمنٹ - Invoice #${targetInv.invoiceNumber} (${reason})`,
          balanceAfter: newOutstanding,
        };
        const updatedKhata = [newTx, ...khataTransactions];
        setKhataTransactions(updatedKhata);
        saveStoredKhata(updatedKhata);
      }
    }

    showToast(`✅ بل #${targetInv.invoiceNumber} منسوخ کر دیا گیا۔ تمام سامان کا سٹاک اور کھاتہ بحال ہو گیا!`);
  };

  const handleAddNewCustomer = (newCust: Customer) => {
    const updated = [newCust, ...customers];
    handleUpdateCustomers(updated);
    showToast(`Customer ${newCust.name} added.`);
  };

  const handleAddKhataTx = (tx: KhataTransaction, updatedCustomer: Customer) => {
    const updatedKhata = [tx, ...khataTransactions];
    setKhataTransactions(updatedKhata);
    saveStoredKhata(updatedKhata);

    const updatedCusts = customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c));
    handleUpdateCustomers(updatedCusts);
    showToast(`Khata entry saved for ${updatedCustomer.name}.`);
  };

  // Convert 24/7 AI Online Order into formal POS Invoice
  const handleConvertOnlineOrderToInvoice = (order: OnlineAiOrder) => {
    let updatedProducts = [...products];
    const cartItems: CartItem[] = order.items.map((it) => {
      let matchedProd = products.find(
        (p) =>
          p.name.toLowerCase().includes(it.productName.toLowerCase()) ||
          it.productName.toLowerCase().includes(p.name.toLowerCase())
      );

      if (!matchedProd) {
        matchedProd = {
          id: `prod-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          code: `AI-${Math.floor(100 + Math.random() * 900)}`,
          name: it.productName,
          category: "Bath Set",
          brand: (it.brand as any) || "Master",
          unit: "Piece",
          costPrice: it.unitPrice * 0.75,
          salePrice: it.unitPrice,
          stockQuantity: 50,
          minStockAlert: 5,
        };
        updatedProducts.push(matchedProd);
      }

      updatedProducts = updatedProducts.map((p) =>
        p.id === matchedProd!.id
          ? { ...p, stockQuantity: Math.max(0, p.stockQuantity - it.quantity) }
          : p
      );

      return {
        product: matchedProd,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountAmount: 0,
        total: it.total,
      };
    });

    let updatedCustomers = [...customers];
    let matchedCust = customers.find(
      (c) =>
        c.phone === order.customerPhone ||
        c.name.toLowerCase() === order.customerName.toLowerCase()
    );

    if (!matchedCust) {
      matchedCust = {
        id: `cust-ai-${Date.now()}`,
        name: order.customerName,
        phone: order.customerPhone,
        address: order.customerAddress,
        totalPurchases: order.totalAmount,
        outstandingKhata: 0,
        creditLimit: 50000,
        createdAt: new Date().toISOString(),
      };
      updatedCustomers.push(matchedCust);
    } else {
      matchedCust = {
        ...matchedCust,
        totalPurchases: matchedCust.totalPurchases + order.totalAmount,
      };
      updatedCustomers = updatedCustomers.map((c) =>
        c.id === matchedCust!.id ? matchedCust! : c
      );
    }

    const assignedBranch =
      branches.find((b) => b.id === order.assignedBranchId) || branches[0];

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${invoices.length + 1001}`,
      date: new Date().toISOString(),
      customerId: matchedCust.id,
      customerName: matchedCust.name,
      customerPhone: matchedCust.phone,
      items: cartItems,
      subtotal: order.subtotal,
      discount: order.discount,
      tax: 0,
      grandTotal: order.totalAmount,
      amountPaid: order.paymentMethod === "cod" ? 0 : order.totalAmount,
      balanceDue: order.paymentMethod === "cod" ? order.totalAmount : 0,
      paymentMethod: order.paymentMethod === "cod" ? "cash" : "cash",
      cashierName: `${activeUser.name} (24/7 AI Online Engine)`,
      cashierId: activeUser.id,
      cashierRole: activeUser.role,
      counterStation: "24/7 AI Online Terminal",
      branchId: assignedBranch.id,
      branchName: assignedBranch.name,
      status: "completed",
      notes: `Generated from 24/7 AI Online Order #${order.orderNumber}. Delivery Address: ${order.customerAddress}`,
    };

    handleSaveInvoice(newInvoice, updatedProducts, updatedCustomers);
    showToast(`✅ Order #${order.orderNumber} converted to Official Invoice #${newInvoice.invoiceNumber}! Stock reserved in ${assignedBranch.name}.`);
  };

  // Live Metrics
  const todaySales = useMemo(() => {
    const today = new Date().toDateString();
    return invoices
      .filter((inv) => new Date(inv.date).toDateString() === today)
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [invoices]);

  const todayInvoicesCount = useMemo(() => {
    const today = new Date().toDateString();
    return invoices.filter((inv) => new Date(inv.date).toDateString() === today).length;
  }, [invoices]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stockQuantity <= p.minStockAlert).length;
  }, [products]);

  const totalUdhaar = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.outstandingKhata, 0);
  }, [customers]);

  // Dynamic Background Theme Classes (Clean, Uniform "Uni" Backgrounds)
  const themeClassMap: Record<AppTheme, string> = {
    uni: "bg-[#0b0f19] text-slate-100",
    "3d": "bg-[#0b0f19] text-slate-100 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]",
    slate: "bg-slate-900 text-slate-100",
    light: "bg-[#F8FAFC] text-slate-900", 
    navy: "bg-[#0A1128] text-blue-50",
    emerald: "bg-[#06241B] text-emerald-50",
    black: "bg-black text-neutral-100",
    amber: "bg-[#1C1917] text-amber-50",
  };

  if (!isUnlocked) {
    return (
      <LockScreen 
        users={users} 
        settings={settings} 
        onUnlock={(user) => {
          saveActiveUser(user);
          setActiveUserState(user);
          setIsUnlocked(true);
        }}
        onUpdateUsers={handleUpdateUsers}
      />
    );
  }

  return (
    <div className={`min-h-screen ${themeClassMap[theme] || themeClassMap.slate} flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300 overflow-x-hidden`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 end-4 z-50 bg-blue-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-blue-400/40 animate-in slide-in-from-top-3 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Automatic Low Stock Alert In-App Toast Notification */}
      {lowStockAlert && (
        <LowStockToast
          alert={lowStockAlert}
          onClose={() => setLowStockAlert(null)}
          onViewInInventory={handleViewInInventoryFromToast}
        />
      )}

      {/* Top POS Header & Nav */}
      <PosHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        activeUser={activeUser}
        users={users}
        products={products}
        branches={branches}
        activeBranchId={activeBranchId}
        onSelectBranch={handleSelectBranch}
        onSwitchUser={handleSwitchUser}
        onUpdateUsers={handleUpdateUsers}
        onRefreshProducts={handleRefreshProducts}
        onOpenReturnModal={() => setShowReturnModal(true)}
        onOpenScanner={() => {
          setActiveTab("billing");
          setShowScanner(true);
        }}
        todaySales={todaySales}
        todayInvoicesCount={todayInvoicesCount}
        lowStockCount={lowStockCount}
        totalUdhaar={totalUdhaar}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        onLock={() => setIsUnlocked(false)}
      />

      {/* Dynamic Views */}
      <main className="flex-1">
        {activeTab === "super_admin_dashboard" && (
          <SuperAdminDashboard
            activeUser={activeUser}
            users={users}
            branches={branches}
            products={products}
            invoices={invoices}
            expenses={expenses}
            customers={customers}
            settings={settings}
            onSwitchBranch={handleSelectBranch}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onUpdateUsers={handleUpdateUsers}
            onUpdateBranches={handleUpdateBranches}
            onOpenInstallModal={() => setShowInstallModal(true)}
          />
        )}

        {activeTab === "branch_owner_dashboard" && (
          <BranchOwnerDashboard
            activeUser={activeUser}
            activeBranch={branches.find((b) => b.id === activeUser.branchId) || branches[0]}
            products={products}
            invoices={invoices}
            expenses={expenses}
            customers={customers}
            settings={settings}
            branches={branches}
            users={users}
            onUpdateUsers={handleUpdateUsers}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenInstallModal={() => setShowInstallModal(true)}
          />
        )}

        {activeTab === "billing" && (
          <BillingCounter
            products={products}
            customers={customers}
            settings={settings}
            activeUser={activeUser}
            onSaveInvoice={handleSaveInvoice}
            onAddNewCustomer={handleAddNewCustomer}
            onOpenAiEstimator={() => setActiveTab("ai_estimator")}
            onGoToInventory={() => setActiveTab("inventory")}
            autoOpenScanner={showScanner}
            onScannerOpened={() => setShowScanner(false)}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryManager
            products={products}
            settings={settings}
            onUpdateProducts={handleUpdateProducts}
            highlightedProductId={highlightedProductId}
            onClearHighlight={() => setHighlightedProductId(null)}
            initialShowLowStockOnly={showLowStockOnlyInInventory}
          />
        )}

        {activeTab === "khata" && (
          <CustomerKhata
            customers={customers}
            khataTransactions={khataTransactions}
            settings={settings}
            onUpdateCustomers={handleUpdateCustomers}
            onAddKhataTransaction={handleAddKhataTx}
          />
        )}

        {activeTab === "reports" && (
          <SalesReports
            invoices={invoices}
            settings={settings}
            users={users}
            activeUser={activeUser}
            onCancelInvoice={handleCancelInvoice}
          />
        )}

        {activeTab === "branches" && (
          <BranchNetworkManager
            branches={branches}
            activeBranchId={activeBranchId}
            onSelectBranch={handleSelectBranch}
            onUpdateBranches={handleUpdateBranches}
            invoices={invoices}
            users={users}
            activeUser={activeUser}
            settings={settings}
          />
        )}

        {activeTab === "whatsapp_hub" && (
          <WhatsAppHub
            branches={branches}
            activeBranchId={activeBranchId}
            whatsappOrders={whatsappOrders}
            settings={settings}
            activeUser={activeUser}
            onUpdateOrders={handleUpdateWhatsAppOrders}
          />
        )}

        {activeTab === "motion_security" && (
          <MotionSecurityHub
            snapshots={motionSnapshots}
            invoices={invoices}
            branches={branches}
            activeBranch={branches.find((b) => b.id === (activeBranchId === "all" ? activeUser.branchId : activeBranchId)) || branches[0]}
            activeUser={activeUser}
            settings={settings}
            onAddSnapshot={handleAddMotionSnapshot}
            onUpdateInvoice={handleUpdateInvoice}
          />
        )}

        {activeTab === "attendance" && (
          <StaffAttendanceTracker
            users={users}
            activeUser={activeUser}
            branches={branches}
            attendanceLogs={attendanceLogs}
            settings={settings}
            onPunchIn={handlePunchInAttendance}
          />
        )}

        {activeTab === "staff_secret_hub" && (
          <StaffSecretHub
            activeUser={activeUser}
            allUsers={users}
            messages={staffMessages}
            branches={branches}
            onSendMessage={handleAddStaffMessage}
          />
        )}
        
        {activeTab === "expense_ledger" && (activeUser.isSuperAdmin || activeUser.role === "admin" || activeUser.role === "manager") && (
          <ExpenseLedger
            expenses={expenses}
            activeUser={activeUser}
            branches={branches}
            onAddExpense={handleAddExpense}
          />
        )}

        {activeTab === "export" && <ExportView />}

        {activeTab === "ai_estimator" && (
          <PlumbingAIEstimator
            products={products}
            settings={settings}
          />
        )}

        {activeTab === "ai_hub" && (
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <AiSalesMarketingHub
              products={products}
              branches={branches}
              currentBranchId={activeBranchId === "all" ? activeUser.branchId || "branch-1" : activeBranchId}
              settings={settings}
              onConvertToInvoice={handleConvertOnlineOrderToInvoice}
            />
          </div>
        )}

        {activeTab === "export" && (
          (activeUser.isSuperAdmin || activeUser.role === "admin") ? (
            <PosExportCenter
              settings={settings}
              onOpenInstallModal={() => setShowInstallModal(true)}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-6 bg-slate-900 border border-amber-500/40 rounded-3xl text-center text-slate-200 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-white mb-1">صرف برائے اونر / ایڈمن</h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                یہ تمام ڈاؤنلوڈز اور انسٹالیشن گائیڈ صرف اونر (حیدر علی) کے ذاتی ڈیش بورڈ پر مقفل ہیں۔ دوسرے ملازمین کے لیے یہ سیکشن بند ہے۔
              </p>
              <button
                onClick={() => setActiveTab("billing")}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl transition cursor-pointer"
              >
                واپس کاؤنٹر جائیں
              </button>
            </div>
          )
        )}

        {activeTab === "settings" && (
          <PosSettings
            settings={settings}
            users={users}
            activeUser={activeUser}
            onUpdateSettings={handleUpdateSettings}
            onUpdateUsers={handleUpdateUsers}
            currentTheme={theme}
            onThemeChange={handleThemeChange}
            onMaintenance={handleMaintenanceComplete}
          />
        )}
      </main>

      {/* Direct 1-Click Install Modal */}
      <DirectInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        deferredPrompt={deferredPrompt}
        onPromptTriggered={() => setDeferredPrompt(null)}
      />

      {/* AI Multimodal Price List / Photo / PDF Auto-Categorizer Modal */}
      <AiPriceListUploaderModal
        isOpen={showAiUploadModal}
        onClose={() => setShowAiUploadModal(false)}
        onImportProducts={handleGlobalImportProducts}
        targetBranchId={activeBranchId}
      />

      {/* Return Item Modal */}
      {showReturnModal && (
        <ReturnItemModal
          isOpen={showReturnModal}
          invoices={invoices}
          products={products}
          settings={settings}
          activeUser={activeUser}
          onProcessReturn={handleProcessReturn}
          onClose={() => setShowReturnModal(false)}
        />
      )}

      {/* Global Voice Command Listener */}
      <GlobalVoiceCommand setActiveTab={setActiveTab} showToast={showToast} />

      {/* Global Floating Action Menu */}
      <FloatingActionMenu 
        setActiveTab={setActiveTab} 
        onAddNewCustomer={handleAddNewCustomer} 
      />
    </div>
  );
}
