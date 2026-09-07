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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>↩️ Return Item / Bill Refund Desk</span>
                <span className="text-xs font-normal text-amber-400 font-urdu">(آئٹم واپسی و ریفنڈ)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Lookup customer bill, restock inventory, and issue verified cash/khata refund
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Lookup Input */}
          <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
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
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleLookupBill}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Search className="w-4 h-4" />
                <span>Lookup Bill</span>
              </button>
            </div>

            {/* Quick list of recent bills */}
            <div className="pt-2 flex items-center gap-2 flex-wrap text-xs text-slate-400">
              <span className="text-slate-500 font-medium">Recent Bills:</span>
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
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-mono transition"
                >
                  {inv.invoiceNumber} ({inv.customerName})
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Selected Invoice Details & Items Selection */}
          {selectedInvoice && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3 mb-3">
                  <div>
                    <span className="text-xs text-slate-400">Bill Number:</span>
                    <span className="ml-2 font-mono font-bold text-amber-400">{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Customer:</span>
                    <span className="ml-2 font-semibold text-slate-200">{selectedInvoice.customerName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Date:</span>
                    <span className="ml-2 text-slate-300 text-xs">
                      {new Date(selectedInvoice.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Branch:</span>
                    <span className="ml-2 text-xs font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded">
                      {selectedInvoice.branchName || "Branch 1 (Main HQ)"}
                    </span>
                  </div>
                </div>

                {/* Items in Invoice */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-slate-300 block">
                    Step 2: Select Item To Return
                  </label>
                  <select
                    value={selectedItemIndex}
                    onChange={(e) => {
                      setSelectedItemIndex(Number(e.target.value));
                      setReturnQty(1);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    {selectedInvoice.items.map((item, idx) => (
                      <option key={idx} value={idx}>
                        {item.product.name} — Qty: {item.quantity} | Rate: {settings.currencySymbol} {item.unitPrice.toLocaleString()} | Total: {settings.currencySymbol} {item.total.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedItem && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Quantity to Return (Max: {maxQty}):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={maxQty}
                          value={returnQty}
                          onChange={(e) => setReturnQty(Math.min(maxQty, Math.max(1, Number(e.target.value))))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-bold text-base focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setReturnQty(maxQty)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl whitespace-nowrap"
                        >
                          All ({maxQty})
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Calculated Refund Amount:</label>
                      <div className="px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-xl text-right">
                        <span className="text-xs text-slate-400 mr-2">Refund:</span>
                        <span className="text-lg font-black text-amber-400 font-mono">
                          {settings.currencySymbol} {refundTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-400 block mb-1">Return Reason / Memo:</label>
                      <input
                        type="text"
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="e.g. Size mismatch, defective piece, plumber returned unused pipe"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
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
                  className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Confirm Return & Issue Refund ({settings.currencySymbol} {refundTotal.toLocaleString()})</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition"
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
