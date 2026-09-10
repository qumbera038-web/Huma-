import React, { useState } from "react";
import { Invoice, Product, StoreSettings, UserAccount } from "../../types";
import { RotateCcw, Search, CheckCircle2, AlertCircle, Printer, Share2, X, ArrowLeft, Receipt } from "lucide-react";

interface ReturnItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  products: Product[];
  settings: StoreSettings;
  activeUser: UserAccount;
  onProcessReturn: (
    updatedInvoice: Invoice,
    refundAmount: number,
    returnedItemId: string,
    returnedQty: number,
    returnedItemName: string
  ) => void;
}

export const ReturnItemModal: React.FC<ReturnItemModalProps> = ({
  isOpen,
  onClose,
  invoices,
  products,
  settings,
  activeUser,
  onProcessReturn,
}) => {
  const [searchBillQuery, setSearchBillQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [returnQty, setReturnQty] = useState<number>(1);
  const [returnReason, setReturnReason] = useState("Customer returned item (Defect / Exchange)");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLookupBill = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const q = searchBillQuery.trim().toLowerCase();
    if (!q) {
      setErrorMsg("Please enter an Invoice #, Bill ID, or Customer Name");
      return;
    }

    const found = invoices.find(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.id.toLowerCase() === q ||
        inv.customerName.toLowerCase().includes(q)
    );

    if (found) {
      if (!found.items || found.items.length === 0) {
        setErrorMsg("This invoice has no items left to return.");
        setSelectedInvoice(null);
        return;
      }
      setSelectedInvoice(found);
      setSelectedItemIndex(0);
      setReturnQty(1);
    } else {
      setErrorMsg(`No bill found matching "${searchBillQuery}". Please verify the Invoice number.`);
      setSelectedInvoice(null);
    }
  };

  const selectedItem = selectedInvoice && selectedInvoice.items[selectedItemIndex];
  const maxQty = selectedItem ? selectedItem.quantity : 1;
  const refundTotal = selectedItem ? selectedItem.unitPrice * returnQty : 0;

  const handleConfirmReturn = () => {
    if (!selectedInvoice || !selectedItem) return;
    if (returnQty < 1 || returnQty > maxQty) {
      setErrorMsg(`Invalid return quantity. Must be between 1 and ${maxQty}.`);
      return;
    }

    const refund = selectedItem.unitPrice * returnQty;
    const remainingQty = selectedItem.quantity - returnQty;

    let updatedItems = [...selectedInvoice.items];
    if (remainingQty <= 0) {
      // Remove item completely
      updatedItems.splice(selectedItemIndex, 1);
    } else {
      // Update item quantity and total
      updatedItems[selectedItemIndex] = {
        ...selectedItem,
        quantity: remainingQty,
        total: remainingQty * selectedItem.unitPrice,
      };
    }

    const newSubtotal = updatedItems.reduce((s, i) => s + i.total, 0);
    const newGrandTotal = Math.max(0, newSubtotal - selectedInvoice.discount);

    const updatedInvoice: Invoice = {
      ...selectedInvoice,
      items: updatedItems,
      subtotal: newSubtotal,
      grandTotal: newGrandTotal,
      notes: `${selectedInvoice.notes ? selectedInvoice.notes + " | " : ""}Returned ${returnQty}x ${selectedItem.product.name} (Refund: ${settings.currencySymbol} ${refund.toLocaleString()}) by ${activeUser.name}`,
    };

    onProcessReturn(
      updatedInvoice,
      refund,
      selectedItem.product.id,
      returnQty,
      selectedItem.product.name
    );

    setSuccessMsg(
      `✅ Return processed successfully! Refund of ${settings.currencySymbol} ${refund.toLocaleString()} credited back. ${returnQty}x "${selectedItem.product.name}" returned to inventory stock.`
    );
    setSelectedInvoice(updatedInvoice);
    if (updatedItems.length > 0) {
      setSelectedItemIndex(0);
      setReturnQty(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-amber-500/20 overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-amber-500/30 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>↩️ Return Item / Bill Refund Desk</span>
                <span className="text-xs font-bold text-amber-300 font-urdu bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">آئٹم واپسی و ریفنڈ</span>
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Lookup customer bill, restock inventory, and issue verified cash/khata refund
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-slate-900">
          {/* Lookup Input */}
          <div className="bg-slate-950 border-2 border-amber-500/40 p-4 rounded-2xl space-y-3 shadow-inner">
            <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-amber-400" />
              <span>Step 1: Enter Bill / Invoice # or Customer</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchBillQuery}
                onChange={(e) => setSearchBillQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookupBill()}
                placeholder="e.g. HPS-2026-0001 or BR2-2026-0045 or Customer Name"
                className="flex-1 px-4 py-3 bg-slate-900 border-2 border-slate-700 focus:border-amber-500 rounded-xl text-white placeholder-slate-400 text-sm font-semibold outline-none transition"
              />
              <button
                onClick={handleLookupBill}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-500/30"
              >
                <Search className="w-4 h-4" />
                <span>Lookup Bill</span>
              </button>
            </div>

            {/* Quick list of recent bills */}
            <div className="pt-2 flex items-center gap-2 flex-wrap text-xs text-slate-300">
              <span className="text-slate-400 font-bold">Recent Bills:</span>
              {invoices.slice(0, 4).map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => {
                    setSearchBillQuery(inv.invoiceNumber);
                    setSelectedInvoice(inv);
                    setSelectedItemIndex(0);
                    setReturnQty(1);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono font-bold border border-slate-700 transition"
                >
                  {inv.invoiceNumber} ({inv.customerName})
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-500/15 border-2 border-red-500/40 rounded-2xl flex items-center gap-2.5 text-red-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/15 border-2 border-emerald-500/40 rounded-2xl flex items-center gap-2.5 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Selected Invoice Details & Items Selection */}
          {selectedInvoice && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold">Bill Number:</span>
                    <span className="ml-2 font-mono font-black text-amber-300 text-sm">{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold">Customer:</span>
                    <span className="ml-2 font-bold text-white">{selectedInvoice.customerName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold">Date:</span>
                    <span className="ml-2 text-slate-200 text-xs font-medium">
                      {new Date(selectedInvoice.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold">Branch:</span>
                    <span className="ml-2 text-xs font-black text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                      {selectedInvoice.branchName || "Branch 1 (Main HQ)"}
                    </span>
                  </div>
                </div>

                {/* Items in Invoice */}
                <div className="space-y-2.5">
                  <label className="text-xs font-black uppercase text-amber-300 block">
                    Step 2: Select Item To Return
                  </label>
                  <select
                    value={selectedItemIndex}
                    onChange={(e) => {
                      setSelectedItemIndex(Number(e.target.value));
                      setReturnQty(1);
                    }}
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 focus:border-amber-500 rounded-xl text-white font-semibold text-sm outline-none transition"
                  >
                    {selectedInvoice.items.map((item, idx) => (
                      <option key={idx} value={idx}>
                        {item.product.name} — Qty: {item.quantity} | Rate: {settings.currencySymbol} {item.unitPrice.toLocaleString()} | Total: {settings.currencySymbol} {item.total.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedItem && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900 p-4 rounded-xl border-2 border-amber-500/30">
                    <div>
                      <label className="text-xs text-slate-300 font-bold block mb-1.5">Quantity to Return (Max: {maxQty}):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={maxQty}
                          value={returnQty}
                          onChange={(e) => setReturnQty(Math.min(maxQty, Math.max(1, Number(e.target.value))))}
                          className="w-full px-3 py-2.5 bg-slate-950 border-2 border-amber-500/50 rounded-xl text-amber-300 font-black text-base outline-none text-center"
                        />
                        <button
                          type="button"
                          onClick={() => setReturnQty(maxQty)}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-black text-amber-300 border border-slate-700 rounded-xl whitespace-nowrap transition"
                        >
                          All ({maxQty})
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-bold block mb-1.5">Calculated Refund Amount:</label>
                      <div className="px-3 py-2 bg-slate-950 border-2 border-amber-500/60 rounded-xl text-right flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold">Refund Total:</span>
                        <span className="text-lg font-black text-amber-400 font-mono">
                          {settings.currencySymbol} {refundTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-300 font-bold block mb-1.5">Return Reason / Memo:</label>
                      <input
                        type="text"
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="e.g. Size mismatch, defective piece, plumber returned unused pipe"
                        className="w-full px-3 py-2.5 bg-slate-950 border-2 border-slate-700 focus:border-amber-500 rounded-xl text-white font-medium text-xs outline-none transition"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  className="flex-1 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl transition shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 border border-amber-300"
                >
                  <RotateCcw className="w-5 h-5 text-slate-950" />
                  <span>Confirm Return & Issue Refund ({settings.currencySymbol} {refundTotal.toLocaleString()})</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-2xl border border-slate-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
