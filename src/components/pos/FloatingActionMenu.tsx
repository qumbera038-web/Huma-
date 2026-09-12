import React, { useState } from "react";
import { Plus, FileText, UserPlus, X } from "lucide-react";
import { Customer } from "../../types";

interface Props {
  setActiveTab: (tab: any) => void;
  onAddNewCustomer: (customer: Customer) => void;
}

export function FloatingActionMenu({ setActiveTab, onAddNewCustomer }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");

  const handleSaveCustomer = () => {
    if (!newCustName.trim()) return;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim() || "",
      address: newCustAddress.trim() || undefined,
      totalPurchases: 0,
      outstandingKhata: 0,
      creditLimit: 50000,
      createdAt: new Date().toISOString()
    };
    onAddNewCustomer(newCust);
    setShowAddCustomerModal(false);
    setIsOpen(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewCustAddress("");
    setActiveTab("khata"); // Switch to khata tab to see the new customer
  };

  return (
    <>
      {/* Floating Button & Menu */}
      <div className="fixed bottom-6 end-6 z-40 flex flex-col items-end gap-3">
        {isOpen && (
          <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200 origin-bottom">
            <button
              onClick={() => {
                setActiveTab("export");
                setIsOpen(false);
              }}
              className="flex items-center gap-3 bg-amber-500 text-slate-950 font-bold px-4 py-3 rounded-full shadow-[0_8px_30px_rgb(245,158,11,0.3)] hover:shadow-[0_8px_30px_rgb(245,158,11,0.5)] hover:scale-105 transition-all border border-amber-400"
            >
              <span className="text-sm pe-1">Download APK & 1-File</span>
              <div className="bg-slate-950 text-amber-400 p-2 rounded-full">
                <Plus className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("billing");
                setIsOpen(false);
              }}
              className="flex items-center gap-3 bg-white text-slate-900 font-semibold px-4 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:scale-105 transition-all border border-slate-200"
            >
              <span className="text-sm pe-1">New Invoice</span>
              <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                <FileText className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddCustomerModal(true);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 bg-white text-slate-900 font-semibold px-4 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:scale-105 transition-all border border-slate-200"
            >
              <span className="text-sm pe-1">New Customer</span>
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full">
                <UserPlus className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 ${
            isOpen 
              ? "bg-slate-800 text-white rotate-45 hover:bg-slate-700 hover:scale-110" 
              : "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_8px_30px_rgb(59,130,246,0.5)] hover:scale-110"
          }`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Backdrop for closing menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Global Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-slate-100 text-lg mb-1">Add New Khata Customer</h3>
            <p className="text-xs text-slate-400 mb-5">Create a customer account for credit tracking</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="e.g. Qasim Khan"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="03xx-xxxxxxx"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Address (Optional)</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="e.g. Hayatabad, Peshawar"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCustomer();
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomer}
                disabled={!newCustName.trim()}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 font-semibold shadow-md"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
