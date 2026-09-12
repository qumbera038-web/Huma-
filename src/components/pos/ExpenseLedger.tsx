import React, { useState, useMemo } from "react";
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Wallet, 
  Building2, 
  Trash2, 
  TrendingDown, 
  FileSpreadsheet,
  Printer,
  PieChart,
  User,
  ArrowRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BusinessExpense, 
  ExpenseCategory, 
  PaymentMethod, 
  UserAccount, 
  Branch, 
  MonthlyExpenseReport 
} from "../../types";

interface ExpenseLedgerProps {
  expenses: BusinessExpense[];
  activeUser: UserAccount;
  branches: Branch[];
  onAddExpense: (exp: Omit<BusinessExpense, "id">) => void;
  onDeleteExpense?: (id: string) => void;
}

export const ExpenseLedger: React.FC<ExpenseLedgerProps> = ({
  expenses,
  activeUser,
  branches,
  onAddExpense,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "all">("all");
  const [filterBranch, setFilterBranch] = useState<string>("all");

  // New Expense Form State
  const [newExp, setNewExp] = useState({
    description: "",
    amount: 0,
    category: "other" as ExpenseCategory,
    paymentMethod: "cash" as PaymentMethod,
    branchId: activeUser.branchId || "branch-1",
    isRecurring: false,
    date: new Date().toISOString().substring(0, 10)
  });

  const categories: { value: ExpenseCategory; label: string; urdu: string; color: string }[] = [
    { value: "salary", label: "Salary", urdu: "تنخواہ", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    { value: "rent", label: "Rent", urdu: "کرایہ", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    { value: "utility_bill", label: "Utility Bill", urdu: "بجلی/گیس بل", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    { value: "transport", label: "Transport", urdu: "ٹرانسپورٹ", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
    { value: "food", label: "Food", urdu: "کھانا پینا", color: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
    { value: "marketing", label: "Marketing", urdu: "مارکیٹنگ", color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" },
    { value: "repair_maintenance", label: "Repair", urdu: "مرمت", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
    { value: "office_supplies", label: "Supplies", urdu: "دفتر کا سامان", color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
    { value: "other", label: "Other", urdu: "دیگر", color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
  ];

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMonth = exp.monthYear === selectedMonth;
      const matchesCategory = filterCategory === "all" || exp.category === filterCategory;
      const matchesBranch = filterBranch === "all" || exp.branchId === filterBranch;
      return matchesSearch && matchesMonth && matchesCategory && matchesBranch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchQuery, selectedMonth, filterCategory, filterBranch]);

  const monthlyReport = useMemo((): MonthlyExpenseReport => {
    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const breakdown = filteredExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    // Ensure all categories exist in breakdown
    categories.forEach(cat => {
      if (!breakdown[cat.value]) breakdown[cat.value] = 0;
    });

    const monthName = new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return {
      monthYear: monthName,
      totalAmount: total,
      categoryBreakdown: breakdown,
      expenses: filteredExpenses
    };
  }, [filteredExpenses, selectedMonth]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.description || newExp.amount <= 0) return;

    onAddExpense({
      ...newExp,
      monthYear: newExp.date.substring(0, 7),
      branchName: branches.find(b => b.id === newExp.branchId)?.shortName || "Branch",
      recordedBy: activeUser.name
    });

    setNewExp({
      description: "",
      amount: 0,
      category: "other",
      paymentMethod: "cash",
      branchId: activeUser.branchId || "branch-1",
      isRecurring: false,
      date: new Date().toISOString().substring(0, 10)
    });
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-slate-200 overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      
      {/* 📊 Top Header & Statistics */}
      <div className="p-6 bg-slate-900/50 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileSpreadsheet className="w-7 h-7 text-indigo-400" />
              <span>کاروباری اخراجات کی شیٹ (Monthly Expense Sheet)</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              روزانہ کے اخراجات، تنخواہیں اور بلز کا مکمل ریکارڈ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">کل اخراجات ({monthlyReport.monthYear})</span>
                <p className="text-xl font-black text-white">Rs. {monthlyReport.totalAmount.toLocaleString()}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>نیا خرچہ درج کریں</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="خرچہ تلاش کریں..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 ps-10 pe-4 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-sm text-slate-200 focus:ring-0 outline-none w-full cursor-pointer"
            />
          </div>

          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="all">تمام کیٹیگریز (All Categories)</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.urdu} ({cat.label})</option>
            ))}
          </select>

          <select 
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="all">تمام برانچز (All Branches)</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.shortName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 📋 Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side: Summary Cards & Chart Info */}
        <div className="w-full lg:w-80 border-e border-slate-800 bg-slate-900/30 p-6 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            <span>کیٹیگری وائز خلاصہ</span>
          </h3>
          
          <div className="space-y-3">
            {categories.map(cat => {
              const amount = monthlyReport.categoryBreakdown[cat.value] || 0;
              const percentage = monthlyReport.totalAmount > 0 ? (amount / monthlyReport.totalAmount) * 100 : 0;
              
              if (amount === 0 && filterCategory !== "all" && filterCategory !== cat.value) return null;

              return (
                <div key={cat.value} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.color}`}>
                      {cat.urdu}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{percentage.toFixed(1)}%</span>
                  </div>
                  <p className="text-sm font-bold text-slate-200">Rs. {amount.toLocaleString()}</p>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-full ${cat.color.split(' ')[0].replace('text-', 'bg-')}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
             <div className="flex items-start gap-3">
               <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
               <div>
                 <p className="text-xs text-indigo-300 font-bold mb-1">خودکار رپورٹنگ</p>
                 <p className="text-[10px] text-slate-400 leading-relaxed">
                   ہر ماہ کے ختم ہونے پر سسٹم خودکار طور پر اس مہینے کی پی ڈی ایف شیٹ تیار کر دیتا ہے۔
                 </p>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Expenses Table */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">
              {filteredExpenses.length} اندراجات پائے گئے (Entries Found)
            </span>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <Printer className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-end border-collapse" dir="rtl">
              <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800">
                <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 text-end">تاریخ (Date)</th>
                  <th className="px-6 py-4 text-end">تفصیل (Description)</th>
                  <th className="px-6 py-4 text-end">کیٹیگری</th>
                  <th className="px-6 py-4 text-end">برانچ</th>
                  <th className="px-6 py-4 text-end">ادائیگی</th>
                  <th className="px-6 py-4 text-start">رقم (Amount)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredExpenses.map((exp) => {
                  const catInfo = categories.find(c => c.value === exp.category) || categories[categories.length - 1];
                  return (
                    <motion.tr 
                      key={exp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-900/50 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-slate-200">
                            {new Date(exp.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(exp.date).getFullYear()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-100">{exp.description}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                          <User className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] text-slate-500">{exp.recordedBy}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${catInfo.color}`}>
                          {catInfo.urdu}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-[11px] text-slate-300 font-medium">{exp.branchName}</span>
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {exp.paymentMethod === "cash" ? "کیش" : "بینک"}
                          </span>
                          <Wallet className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-start whitespace-nowrap">
                        <span className="text-base font-black text-white">Rs. {exp.amount.toLocaleString()}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {filteredExpenses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                  <Receipt className="w-8 h-8 text-slate-700" />
                </div>
                <h4 className="text-lg font-bold text-slate-300">اس مہینے کا کوئی ریکارڈ نہیں ہے</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                  برائے مہربانی اوپر دیے گئے بٹن سے نیا خرچہ درج کریں یا فلٹرز تبدیل کریں۔
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ➕ Add Expense Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-indigo-400" />
                  <span>نیا خرچہ درج کریں (New Expense)</span>
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">تاریخ (Date)</label>
                    <input 
                      type="date" 
                      required
                      value={newExp.date}
                      onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">رقم (Amount)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={newExp.amount || ""}
                        onChange={(e) => setNewExp({ ...newExp, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 ps-14 pe-4 text-white text-lg font-black focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                      <span className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rs.</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-end" dir="rtl">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">تفصیل / ڈسکرپشن (Description)</label>
                  <input 
                    type="text" 
                    required
                    value={newExp.description}
                    onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                    placeholder="مثال: دکان کا کرایہ، بجلی کا بل وغیرہ"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white text-end focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 text-end" dir="rtl">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">کیٹیگری (Category)</label>
                    <select 
                      value={newExp.category}
                      onChange={(e) => setNewExp({ ...newExp, category: e.target.value as ExpenseCategory })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white text-end focus:ring-1 focus:ring-indigo-400 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.urdu}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 text-end" dir="rtl">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">برانچ (Branch)</label>
                    <select 
                      value={newExp.branchId}
                      onChange={(e) => setNewExp({ ...newExp, branchId: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white text-end focus:ring-1 focus:ring-indigo-400 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.urduName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <Wallet className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-300">ادائیگی کا طریقہ</span>
                  </div>
                  <div className="flex gap-2">
                    {(["cash", "bank_transfer"] as PaymentMethod[]).map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setNewExp({ ...newExp, paymentMethod: method })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          newExp.paymentMethod === method 
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        {method === "cash" ? "کیش (Cash)" : "بینک ٹرانسفر"}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <Plus className="w-6 h-6" />
                  <span>خرچہ محفوظ کریں (Save Expense)</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

// Internal icon component for Close button (was missing from lucide-react imports in my head)
const X = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
