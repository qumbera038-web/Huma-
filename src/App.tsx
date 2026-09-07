import React, { useState, useEffect, useMemo } from "react";
import { 
  Product, 
  Customer, 
  Invoice, 
  StoreSettings, 
  UserAccount, 
  KhataTransaction,
  Branch,
  StaffAttendanceLog,
  WhatsAppOrder
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
  AppTheme
} from "./utils/posStorage";
import { PosHeader, PosTab } from "./components/pos/PosHeader";
import { BillingCounter } from "./components/pos/BillingCounter";
import { InventoryManager } from "./components/pos/InventoryManager";
import { CustomerKhata } from "./components/pos/CustomerKhata";
import { SalesReports } from "./components/pos/SalesReports";
import { BranchNetworkManager } from "./components/pos/BranchNetworkManager";
import { WhatsAppHub } from "./components/pos/WhatsAppHub";
import { StaffAttendanceTracker } from "./components/pos/StaffAttendanceTracker";
import { PlumbingAIEstimator } from "./components/pos/PlumbingAIEstimator";
import { PosSettings } from "./components/pos/PosSettings";
import { ReturnItemModal } from "./components/pos/ReturnItemModal";
import { GlobalVoiceCommand } from "./components/pos/GlobalVoiceCommand";
import { FloatingActionMenu } from "./components/pos/FloatingActionMenu";

export default function App() {
  const [activeTab, setActiveTab] = useState<PosTab>("billing");
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
  const [theme, setTheme] = useState<AppTheme>(getStoredTheme);

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

  const handleSelectBranch = (branchId: string) => {
    setActiveBranchIdState(branchId);
    saveActiveBranchId(branchId);
  };

  const handleSwitchUser = (user: UserAccount) => {
    setActiveUserState(user);
    saveActiveUser(user);
    setAttendanceLogs(getStoredAttendanceLogs());
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
    invoiceId: string,
    productId: string,
    returnQty: number,
    refundAmount: number,
    refundMethod: "cash" | "khata_adjust" | "store_credit",
    reason: string
  ) => {
    // 1. Restock item in inventory
    const updatedProducts = products.map((p) => {
      if (p.id === productId || p.code === productId) {
        return {
          ...p,
          stockQuantity: p.stockQuantity + returnQty,
        };
      }
      return p;
    });
    handleUpdateProducts(updatedProducts);

    // 2. Update invoice notes and totals
    const targetInv = invoices.find((i) => i.id === invoiceId);
    let updatedInvoices = invoices;
    if (targetInv) {
      const updatedInv: Invoice = {
        ...targetInv,
        notes: `${targetInv.notes || ""} [RETURNED: ${returnQty}x item - Refunded Rs. ${refundAmount.toLocaleString()} via ${refundMethod}. Reason: ${reason}]`.trim(),
      };
      updatedInvoices = invoices.map((i) => (i.id === invoiceId ? updatedInv : i));
      setInvoices(updatedInvoices);
      saveStoredInvoices(updatedInvoices);

      // 3. If refund is khata adjust and customer exists, adjust khata
      if (refundMethod === "khata_adjust" && targetInv.customerId) {
        const cust = customers.find((c) => c.id === targetInv.customerId);
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
            description: `Refund for returned items on Invoice #${targetInv.invoiceNumber}`,
            balanceAfter: newOutstanding,
          };
          const updatedKhata = [newTx, ...khataTransactions];
          setKhataTransactions(updatedKhata);
          saveStoredKhata(updatedKhata);

          const updatedCusts = customers.map((c) => (c.id === cust.id ? updatedCust : c));
          handleUpdateCustomers(updatedCusts);
        }
      }
    }

    showToast(`✅ Successfully returned ${returnQty} unit(s) and restocked inventory! Refund: Rs. ${refundAmount.toLocaleString()}`);
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
      cancelledBy: activeUser ? `${activeUser.name} (${activeUser.role})` : "Haider Ali (Admin)",
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

  return (
    <div className={`min-h-screen ${themeClassMap[theme] || themeClassMap.slate} flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-blue-400/40 animate-in slide-in-from-top-3 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top POS Header & Nav */}
      <PosHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        activeUser={activeUser}
        users={users}
        branches={branches}
        activeBranchId={activeBranchId}
        onSelectBranch={handleSelectBranch}
        onSwitchUser={handleSwitchUser}
        onUpdateUsers={handleUpdateUsers}
        onOpenReturnModal={() => setShowReturnModal(true)}
        todaySales={todaySales}
        todayInvoicesCount={todayInvoicesCount}
        lowStockCount={lowStockCount}
        totalUdhaar={totalUdhaar}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />

      {/* Dynamic Views */}
      <main className="flex-1">
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
          />
        )}

        {activeTab === "inventory" && (
          <InventoryManager
            products={products}
            settings={settings}
            onUpdateProducts={handleUpdateProducts}
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
            orders={whatsappOrders}
            settings={settings}
            activeUser={activeUser}
            onUpdateOrders={handleUpdateWhatsAppOrders}
          />
        )}

        {activeTab === "attendance" && (
          <StaffAttendanceTracker
            users={users}
            activeUser={activeUser}
            branches={branches}
            attendanceLogs={attendanceLogs}
            onUpdateAttendanceLogs={handleUpdateAttendanceLogs}
            onPunchIn={handlePunchInAttendance}
          />
        )}

        {activeTab === "ai_estimator" && (
          <PlumbingAIEstimator
            products={products}
            settings={settings}
          />
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
          />
        )}
      </main>

      {/* Return Item Modal */}
      {showReturnModal && (
        <ReturnItemModal
          invoices={invoices}
          products={products}
          settings={settings}
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
