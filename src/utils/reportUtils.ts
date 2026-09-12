import { BusinessExpense, Invoice, Product, UserAccount, Branch } from "../types";

export interface MonthlyReportSummary {
  monthStr: string;
  monthName: string;
  totalSales: number;
  cashCollected: number;
  totalUdhaar: number;
  totalExpenses: number;
  netCashFlow: number;
  invoiceCount: number;
  itemsSoldCount: number;
  branchBreakdown: {
    branchId: string;
    branchName: string;
    sales: number;
    cash: number;
    invoicesCount: number;
  }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  lowStockItemsCount: number;
}

export const generateMonthlyReportData = (
  monthStr: string, // e.g. "2026-09"
  invoices: Invoice[],
  expenses: BusinessExpense[],
  products: Product[],
  branches?: Branch[],
  branchId?: string
): MonthlyReportSummary => {
  const monthInvoices = (invoices || []).filter(
    (inv) =>
      inv.date.startsWith(monthStr) &&
      inv.status !== "cancelled" &&
      (!branchId || inv.branchId === branchId)
  );

  const monthExpenses = (expenses || []).filter(
    (exp) =>
      exp.date.startsWith(monthStr) &&
      (!branchId || exp.branchId === branchId)
  );

  const totalSales = monthInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const cashCollected = monthInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalUdhaar = monthInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  const totalExpenses = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const netCashFlow = cashCollected - totalExpenses;
  const invoiceCount = monthInvoices.length;

  let itemsSoldCount = 0;
  const productSalesMap: { [name: string]: { quantity: number; revenue: number } } = {};

  monthInvoices.forEach((inv) => {
    (inv.items || []).forEach((item) => {
      const q = item.quantity || 1;
      const t = item.total || (item.price || 0) * q;
      itemsSoldCount += q;
      const name = item.productName || item.product?.name || "Item";
      if (!productSalesMap[name]) {
        productSalesMap[name] = { quantity: 0, revenue: 0 };
      }
      productSalesMap[name].quantity += q;
      productSalesMap[name].revenue += t;
    });
  });

  const topProducts = Object.entries(productSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const defaultBranchList = branches && branches.length > 0 ? branches : [
    { id: "branch-1", name: "Branch 1 (Main HQ)" },
    { id: "branch-2", name: "Branch 2 (Asad Sanitary)" },
    { id: "branch-3", name: "Branch 3 (Abbas Sanitary)" }
  ];

  const branchBreakdown = defaultBranchList.map((b) => {
    const bInvoices = monthInvoices.filter(
      (inv) =>
        inv.branchId === b.id ||
        (inv.branchName && inv.branchName.toLowerCase().includes(b.id === "branch-2" ? "asad" : b.id === "branch-3" ? "abbas" : "main"))
    );
    const sales = bInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const cash = bInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    return {
      branchId: b.id,
      branchName: b.name,
      sales,
      cash,
      invoicesCount: bInvoices.length,
    };
  });

  const lowStockItemsCount = (products || []).filter(
    (p) => (p.stockQuantity ?? p.stock ?? 0) <= (p.minStockAlert ?? p.minStock ?? 5)
  ).length;

  const [yearStr, mStr] = monthStr.split("-");
  const dateObj = new Date(parseInt(yearStr, 10), parseInt(mStr, 10) - 1, 1);
  const monthName = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : monthStr;

  return {
    monthStr,
    monthName,
    totalSales,
    cashCollected,
    totalUdhaar,
    totalExpenses,
    netCashFlow,
    invoiceCount,
    itemsSoldCount,
    branchBreakdown,
    topProducts,
    lowStockItemsCount,
  };
};

export const generateMonthlyReportText = (
  monthStr: string,
  invoices: Invoice[],
  expenses: BusinessExpense[],
  products: Product[],
  branches?: Branch[],
  branchId?: string
): string => {
  const summary = generateMonthlyReportData(monthStr, invoices, expenses, products, branches, branchId);

  let text = `🏛️ *HAIDER SANITARY - MONTHLY FINANCIAL & AUDIT REPORT*\n`;
  text += `📅 *Month: ${summary.monthName}*\n`;
  text += `===========================================\n`;
  text += `💰 Total Gross Sales: Rs. ${summary.totalSales.toLocaleString()}\n`;
  text += `💵 Net Cash Collected: Rs. ${summary.cashCollected.toLocaleString()}\n`;
  text += `📋 Total Active Bills: ${summary.invoiceCount} Invoices\n`;
  text += `📦 Total Items Sold: ${summary.itemsSoldCount} Units\n`;
  text += `⏳ Outstanding Receivables (Udhaar): Rs. ${summary.totalUdhaar.toLocaleString()}\n`;
  text += `📉 Total Monthly Expenses: Rs. ${summary.totalExpenses.toLocaleString()}\n`;
  text += `-------------------------------------------\n`;
  text += `📈 *Net Cash Flow / Profit: Rs. ${summary.netCashFlow.toLocaleString()}*\n`;
  text += `===========================================\n\n`;

  text += `🏢 *3-BRANCH PERFORMANCE BREAKDOWN:*\n`;
  summary.branchBreakdown.forEach((b) => {
    text += `• *${b.branchName}*: Rs. ${b.sales.toLocaleString()} (${b.invoicesCount} bills)\n`;
  });

  if (summary.topProducts.length > 0) {
    text += `\n🔥 *TOP SELLING PRODUCTS (MONTHLY):*\n`;
    summary.topProducts.forEach((p, idx) => {
      text += `${idx + 1}. ${p.name} — ${p.quantity} sold (Rs. ${p.revenue.toLocaleString()})\n`;
    });
  }

  if (summary.lowStockItemsCount > 0) {
    text += `\n⚠️ *INVENTORY ALERT:* ${summary.lowStockItemsCount} items currently running at or below safety stock.\n`;
  }

  text += `\n🛡️ Super Admin Executive Verified • Haider Sanitary Master POS`;
  return text;
};

export const generateDailyReportText = (
  date: string,
  invoices: Invoice[],
  expenses: BusinessExpense[],
  products: Product[],
  branchId?: string
) => {
  const dayInvoices = invoices.filter(inv => inv.date.startsWith(date) && (!branchId || inv.branchId === branchId));
  const dayExpenses = expenses.filter(exp => exp.date.startsWith(date) && (!branchId || exp.branchId === branchId));
  
  const totalSales = dayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const cashCollected = dayInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalExpenses = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netBalance = cashCollected - totalExpenses;

  const expenseBreakdown = dayExpenses.map(exp => `• ${exp.description}: Rs. ${exp.amount.toLocaleString()}`).join("\n");

  let text = `📊 *DAILY BUSINESS REPORT - ${new Date(date).toLocaleDateString()}*\n`;
  text += `-------------------------------------------\n`;
  text += `💰 Total Sales: Rs. ${totalSales.toLocaleString()}\n`;
  text += `💵 Cash Collected: Rs. ${cashCollected.toLocaleString()}\n`;
  text += `📉 Total Expenses: Rs. ${totalExpenses.toLocaleString()}\n`;
  text += `-------------------------------------------\n`;
  text += `✅ *Net Cash Balance: Rs. ${netBalance.toLocaleString()}*\n\n`;
  
  if (dayExpenses.length > 0) {
    text += `📍 *EXPENSE BREAKDOWN:*\n${expenseBreakdown}\n\n`;
  }

  const lowStock = products.filter(p => (p.stockQuantity ?? p.stock ?? 0) <= (p.minStockAlert ?? p.minStock ?? 5));
  if (lowStock.length > 0) {
    text += `⚠️ *LOW STOCK ALERTS:*\n`;
    lowStock.slice(0, 5).forEach(p => {
      text += `• ${p.name}: ${(p.stockQuantity ?? p.stock ?? 0)} remaining\n`;
    });
    if (lowStock.length > 5) text += `• ...and ${lowStock.length - 5} more items\n`;
  }

  text += `\n📱 Generated by QumberSanitary POS`;
  return text;
};

export const sendToWhatsApp = (phone: string, text: string) => {
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodedText}`;
  window.open(url, "_blank");
};
