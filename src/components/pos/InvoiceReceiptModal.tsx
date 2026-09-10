import React, { useRef, useState, useEffect } from "react";
import { Invoice, StoreSettings } from "../../types";
import { getStoredBranches, saveStoredSettings } from "../../utils/posStorage";
import { downloadPdfReceipt } from "../../utils/pdfReceiptGenerator";
import { 
  Printer, 
  Download, 
  Share2, 
  X, 
  CheckCircle, 
  Phone, 
  MapPin, 
  User, 
  ShieldCheck,
  Award,
  PlusCircle,
  AlertTriangle,
  Ban,
  Settings2,
  Save,
  Check,
  Eye,
  Sliders,
  Sparkles,
  FileDown,
  Loader2
} from "lucide-react";

interface InvoiceReceiptModalProps {
  invoice: Invoice | null;
  settings: StoreSettings;
  onClose: () => void;
  onStartNewBill?: () => void;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  invoice,
  settings,
  onClose,
  onStartNewBill,
}) => {
  const receiptRef = useRef<HTMLDivElement | null>(null);

  if (!invoice) return null;

  const isCancelled = invoice.status === "cancelled";

  // Load branches
  const branches = getStoredBranches();
  const invoiceBranch = branches.find(b => b.name === invoice.branchName || b.id === invoice.branchId) || branches[0];

  // 1. Dynamic On-the-Fly States initialized with settings & current invoice details
  const [storeName, setStoreName] = useState(settings.storeName || "Haider Pipe and Sanitary Store");
  const [branchName, setBranchName] = useState(invoice.branchName || invoiceBranch?.name || "Branch 1 (Main Head Office)");
  const [address, setAddress] = useState(invoiceBranch?.address || settings.address || "Peshawar Cantt");
  const [ptclPhone, setPtclPhone] = useState(invoiceBranch?.ptcl || "091-2565800");
  const [mobilePhone, setMobilePhone] = useState(invoiceBranch?.mobile || invoiceBranch?.whatsapp || "0300-5861463");
  const [ntn, setNtn] = useState(settings.ntn || "");
  const [showNtn, setShowNtn] = useState(!!settings.ntn);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter || "Thank you for shopping with us!");
  
  // Custom layout toggles
  const [showOperator, setShowOperator] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);
  const [isSavedPermanently, setIsSavedPermanently] = useState(false);

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Sync state if settings or invoice changes
  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || "Haider Pipe and Sanitary Store");
      setNtn(settings.ntn || "");
      setReceiptFooter(settings.receiptFooter || "Thank you for shopping with us!");
    }
  }, [settings]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const branchInfo = branchName;
    const dateFormatted = new Date(invoice.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeFormatted = new Date(invoice.date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const text = `*${storeName.toUpperCase()}*
🏢 *Branch:* ${branchInfo}
📍 *Address:* ${address}
📞 *Phone:* PTCL: ${ptclPhone} | Mobile: ${mobilePhone}
━━━━━━━━━━━━━━━━━━━━
🧾 *BILL NO / INVOICE #:* ${invoice.invoiceNumber}
📅 *DATE:* ${dateFormatted} | ⏰ *TIME:* ${timeFormatted}
👤 *CUSTOMER:* ${invoice.customerName} ${invoice.customerPhone ? `(${invoice.customerPhone})` : ""}
💳 *PAYMENT MODE:* ${invoice.paymentMethod.replace("_", " ").toUpperCase()}
━━━━━━━━━━━━━━━━━━━━
📦 *ITEMS PURCHASED:*
${invoice.items.map((i, idx) => `${idx + 1}. *${i.product.name}*
   Qty: ${i.quantity} ${i.product.unit || "pcs"} × Rs ${i.unitPrice.toLocaleString()} = *Rs ${i.total.toLocaleString()}*`).join("\n")}
━━━━━━━━━━━━━━━━━━━━
*Subtotal:* Rs ${invoice.subtotal.toLocaleString()}
${invoice.discount > 0 ? `*Discount:* -Rs ${invoice.discount.toLocaleString()}\n` : ""}*Grand Total (کل رقم):* Rs ${invoice.grandTotal.toLocaleString()}
*Amount Paid (وصول رقم):* Rs ${invoice.amountPaid.toLocaleString()}
${invoice.balanceDue > 0 ? `*Balance Due (بقیہ کھاتہ):* Rs ${invoice.balanceDue.toLocaleString()}` : "*Payment Status:* Fully Paid (مکمل ادا شدہ)"}
━━━━━━━━━━━━━━━━━━━━
${showOperator ? `*Billed By:* ${invoice.cashierName} (${invoice.counterStation || "Counter #1"})` : ""}
"${receiptFooter}"

*Thank you for choosing Haider Pipe and Sanitary Store!*`;

    const url = `https://api.whatsapp.com/send?phone=${invoice.customerPhone ? invoice.customerPhone.replace(/[^0-9]/g, "") : ""}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify({ ...invoice, customStoreName: storeName, customAddress: address, customPtcl: ptclPhone, customMobile: mobilePhone }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${invoice.invoiceNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 📄 Generate & Download Professional PDF Receipt using jspdf
  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      try {
        const success = downloadPdfReceipt({
          invoice,
          settings,
          storeName,
          branchName,
          address,
          phone: `PTCL: ${ptclPhone} | Mobile: ${mobilePhone}`,
          ntn: showNtn && ntn ? ntn : undefined,
          receiptFooter,
        });

        if (success) {
          setPdfSuccess(true);
          setTimeout(() => setPdfSuccess(false), 2500);
        }
      } catch (err) {
        console.error("PDF generation failed:", err);
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 100);
  };

  // 💾 Save current values permanently to LocalStorage for all future bills
  const handleSavePermanently = () => {
    const updatedSettings: StoreSettings = {
      ...settings,
      storeName: storeName.trim(),
      address: address.trim(),
      phone: mobilePhone.trim(),
      ntn: showNtn && ntn.trim() ? ntn.trim() : undefined,
      receiptFooter: receiptFooter.trim(),
    };
    saveStoredSettings(updatedSettings);

    // Also update current active branch details permanently
    const updatedBranches = branches.map(b => {
      if (b.id === invoiceBranch?.id || b.name === invoice.branchName) {
        return {
          ...b,
          name: branchName.trim(),
          address: address.trim(),
          ptcl: ptclPhone.trim(),
          mobile: mobilePhone.trim(),
          whatsapp: mobilePhone.trim()
        };
      }
      return b;
    });
    localStorage.setItem("pos_branches", JSON.stringify(updatedBranches));

    setIsSavedPermanently(true);
    setTimeout(() => {
      setIsSavedPermanently(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            {isCancelled ? (
              <Ban className="w-5 h-5 text-rose-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-sm">
                  {isCancelled ? "منسوخ شدہ انوائس (Cancelled Invoice Receipt)" : "Invoice & Printing Dashboard"}
                </h3>
                {isCancelled && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    CANCELLED / VOID
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Haider Pipe and Sanitary Store Billing Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Panel Body Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 bg-slate-950">
          
          {/* LEFT COLUMN: Thermal Bill Receipt Live Preview (7 cols) */}
          <div className="lg:col-span-7 p-6 overflow-y-auto max-h-[72vh] flex flex-col items-center bg-slate-950/40">
            <div className="text-center mb-2 text-slate-400 text-[10px] uppercase font-bold tracking-wider no-print">
              📄 Live Printable Receipt Preview (لائیو رسید پرنٹ منظر)
            </div>

            <div
              ref={receiptRef}
              id="thermal-receipt-view"
              className="bg-white text-slate-950 p-6 rounded-lg font-mono text-xs shadow-xl border border-slate-300 w-full max-w-[420px] relative transition-all duration-150"
            >
              {/* CSS Print Rules for Perfect Thermal/Paper Printing */}
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #thermal-receipt-view, #thermal-receipt-view * {
                    visibility: visible !important;
                  }
                  #thermal-receipt-view {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 8px !important;
                    border: none !important;
                    box-shadow: none !important;
                    color: #000000 !important;
                    background: #ffffff !important;
                    font-family: monospace, sans-serif !important;
                  }
                  .no-print {
                    display: none !important;
                  }
                }
              `}} />

              {/* Cancelled Watermark & Stamp */}
              {isCancelled && (
                <div className="mb-3 p-3 bg-rose-50 border-2 border-dashed border-rose-500 rounded-lg text-center font-sans space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-rose-700 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>*** CANCELLED / VOIDED BILL (منسوخ شدہ بل) ***</span>
                  </div>
                  <p className="text-[10px] text-rose-600">
                    یہ بل منسوخ کر دیا گیا ہے اور سامان سٹاک میں واپس جمع ہو چکا ہے۔
                  </p>
                  {invoice.cancelledBy && (
                    <p className="text-[9px] text-slate-600">
                      Cancelled By: <strong>{invoice.cancelledBy}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Header Info */}
              <div className="text-center pb-3 border-b-2 border-dashed border-slate-300 space-y-1">
                <h2 className="font-black text-lg tracking-tight uppercase text-slate-950 font-sans">
                  {storeName}
                </h2>
                
                <div className="inline-flex items-center justify-center px-2.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-black text-slate-800 uppercase tracking-wider font-sans">
                  🏢 {branchName}
                </div>

                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-700 font-sans font-medium mt-1">
                  <MapPin className="w-3 h-3 inline text-slate-900 shrink-0" />
                  <span>📍 {address}</span>
                </div>

                <div className="text-[10px] text-slate-700 font-sans font-bold flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <span>📞 PTCL: {ptclPhone}</span>
                  <span className="text-slate-400">|</span>
                  <span>📱 Mobile: {mobilePhone}</span>
                </div>
                
                {showNtn && ntn && (
                  <div className="text-[9px] text-slate-500 font-mono font-bold mt-0.5">
                    NTN: {ntn}
                  </div>
                )}
              </div>

              {/* 📋 Prominent Bill No, Date & Time Section */}
              <div className="my-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-300 font-sans">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">
                      Bill No / Invoice # (بل نمبر):
                    </span>
                    <span className="font-mono font-black text-sm text-slate-950 tracking-wide">
                      {invoice.invoiceNumber}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">
                      Payment Mode (طریقہ ادائیگی):
                    </span>
                    <span className="inline-block font-extrabold text-[10px] uppercase text-blue-900 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded">
                      {invoice.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-medium">Date (تاریخ): </span>
                    <span className="font-mono font-bold text-slate-900">
                      {new Date(invoice.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-medium">Time (وقت): </span>
                    <span className="font-mono font-bold text-slate-900">
                      {new Date(invoice.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200 mt-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-medium">Customer (گاہک): </span>
                    <span className="font-bold text-slate-900 block">{invoice.customerName}</span>
                    {invoice.customerPhone && (
                      <span className="text-slate-600 font-mono text-[10px] block">📱 {invoice.customerPhone}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-medium">Billed By: </span>
                    <span className="font-bold text-slate-900 block">{invoice.cashierName}</span>
                    <span className="text-slate-600 text-[10px] font-mono block">{invoice.counterStation || "Counter #1"}</span>
                  </div>
                </div>

                {/* 📹 CCTV Counter Payer Photo Snapshot Verification */}
                {invoice.customerPhotoSnapshot && (
                  <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between gap-2 bg-white p-1.5 rounded border border-slate-200">
                    <div className="flex items-center gap-2">
                      <img
                        src={invoice.customerPhotoSnapshot}
                        alt="Security Counter Photo"
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded object-cover border border-slate-400"
                      />
                      <div>
                        <span className="text-[9px] font-bold text-slate-800 block">
                          📹 کاؤنٹر سیکیورٹی کیمرہ تصویری ثبوت (CCTV Verified)
                        </span>
                        <span className="text-[8px] text-slate-500 block">
                          ادائیگی کے وقت کیمرے سے محفوظ شدہ تصویر
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      PAID ✓
                    </span>
                  </div>
                )}
              </div>

              {/* 📦 Products & Items Table (Product. Item quantity price) */}
              <div className="py-2 border-b-2 border-dashed border-slate-300 font-sans">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="border-y-2 border-slate-800 bg-slate-100 text-slate-900 font-black">
                      <th className="py-1.5 px-1 text-left w-[8%]">#</th>
                      <th className="py-1.5 px-1 text-left w-[46%]">Product / Item (سامان)</th>
                      <th className="py-1.5 px-1 text-center w-[15%]">Qty (تعداد)</th>
                      <th className="py-1.5 px-1 text-right w-[15%]">Price (قیمت)</th>
                      <th className="py-1.5 px-1 text-right w-[16%]">Total (رقم)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="py-1.5 px-1 font-mono font-bold text-slate-500">{idx + 1}.</td>
                        <td className="py-1.5 px-1 pr-1">
                          <p className="font-bold text-slate-900 leading-snug">{item.product.name}</p>
                          {(item.product.brand || item.product.size || item.product.color) && (
                            <p className="text-[9px] text-slate-500 font-sans mt-0.5">
                              {[item.product.brand, item.product.size, item.product.color].filter(Boolean).join(" • ")}
                            </p>
                          )}
                        </td>
                        <td className="py-1.5 px-1 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                          {item.quantity} <span className="text-[9px] text-slate-500 font-sans">{item.product.unit || "pcs"}</span>
                        </td>
                        <td className="py-1.5 px-1 text-right font-mono text-slate-700 whitespace-nowrap">
                          {item.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-1.5 px-1 text-right font-mono font-bold text-slate-950 whitespace-nowrap">
                          {item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculations Block */}
              <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600 font-sans">
                  <span>Subtotal ({invoice.items.length} items):</span>
                  <span className="font-mono">Rs {invoice.subtotal.toLocaleString()}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-sans">
                    <span>Discount Allowed (رعایت):</span>
                    <span className="font-mono">- Rs {invoice.discount.toLocaleString()}</span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-slate-600 font-sans">
                    <span>Tax:</span>
                    <span className="font-mono">+ Rs {invoice.tax.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-950 pt-1.5 border-t-2 border-slate-800 font-sans">
                  <span>Grand Total (کل رقم):</span>
                  <span className="font-mono text-sm font-black">Rs {invoice.grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-sans pt-0.5">
                  <span>Amount Paid (وصول رقم):</span>
                  <span className="font-bold font-mono text-slate-900">Rs {invoice.amountPaid.toLocaleString()}</span>
                </div>
                {invoice.balanceDue > 0 ? (
                  <div className="flex justify-between font-bold text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200 font-sans mt-1">
                    <span>Balance Due (بقیہ کھاتہ / ادھار):</span>
                    <span className="font-mono font-black text-xs">Rs {invoice.balanceDue.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-emerald-700 font-semibold font-sans bg-emerald-50 p-1 rounded border border-emerald-200 mt-1">
                    <span>Payment Status (حیثیت):</span>
                    <span className="font-bold text-[10px]">Fully Paid (مکمل ادا شدہ)</span>
                  </div>
                )}
              </div>

              {/* Cashier Signature & Stamp Box */}
              {showSignatures && (
                <div className="pt-3 pb-1 border-b border-dashed border-slate-300">
                  <div className="grid grid-cols-2 gap-4 text-center text-[9px] text-slate-600 font-sans pt-2">
                    <div className="border-t border-slate-400 pt-1">
                      <p className="font-bold text-slate-800">{invoice.customerName}</p>
                      <p className="text-[8px] text-slate-400">Customer Signature</p>
                    </div>
                    <div className="border-t border-slate-400 pt-1">
                      <p className="font-bold text-slate-800">{invoice.cashierName}</p>
                      <p className="text-[8px] text-slate-400">Authorized Signature & Stamp</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Notice */}
              <div className="pt-2.5 text-center space-y-1">
                <p className="text-[10px] text-slate-700 font-sans italic font-semibold leading-relaxed">
                  "{receiptFooter}"
                </p>
                <div className="text-[8px] text-slate-400 font-sans flex items-center justify-center gap-1.5 pt-0.5">
                  <span>Terminal: {invoice.counterStation || "Counter #1"}</span>
                  <span>•</span>
                  <span>Software by QumberSanitary</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Advanced Real-time Customization Panel (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-slate-900 overflow-y-auto max-h-[72vh] flex flex-col space-y-4 font-sans">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Settings2 className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <div>
                <h4 className="font-bold text-slate-100 text-sm">
                  ✏️ بل اور پرنٹ کی ترتیبات (Customization Panel)
                </h4>
                <p className="text-[11px] text-slate-400">اپنی دکان اور بل کی معلومات یہاں فوری تبدیل کریں</p>
              </div>
            </div>

            {/* Live customizer inputs */}
            <div className="space-y-3.5 text-xs text-slate-300">
              
              {/* Store Name Input */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex justify-between">
                  <span>Shop / Store Name (دکان کا نام):</span>
                  <span className="text-[10px] text-amber-400 font-medium">On-the-fly</span>
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                  placeholder="Haider Pipe and Sanitary Store"
                />
              </div>

              {/* Branch Name Input */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">
                  Branch Name (برانچ کا نام):
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                  placeholder="Branch 1 - Main Head Office"
                />
              </div>

              {/* Address Input */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">
                  Address (پتا):
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="Khyber Bazaar, Peshawar"
                />
              </div>

              {/* PTCL & Phone Numbers Input */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold text-[11px]">
                    PTCL / Landline (پی ٹی سی ایل):
                  </label>
                  <input
                    type="text"
                    value={ptclPhone}
                    onChange={(e) => setPtclPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    placeholder="091-5273423"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold text-[11px]">
                    Mobile & WhatsApp (موبائل):
                  </label>
                  <input
                    type="text"
                    value={mobilePhone}
                    onChange={(e) => setMobilePhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    placeholder="0333-1234567"
                  />
                </div>
              </div>

              {/* NTN Section */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Show NTN Number on Receipt</span>
                  <button
                    type="button"
                    onClick={() => setShowNtn(!showNtn)}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${showNtn ? "bg-amber-500" : "bg-slate-800"}`}
                  >
                    <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform duration-200 ${showNtn ? "translate-x-4.5" : "translate-x-0"}`} />
                  </button>
                </div>
                {showNtn && (
                  <input
                    type="text"
                    value={ntn}
                    onChange={(e) => setNtn(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    placeholder="Enter NTN Code"
                  />
                )}
              </div>

              {/* Custom Receipt Footer Message */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">
                  Receipt Footer Note (بل کا آخر کا پیغام):
                </label>
                <textarea
                  rows={2}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="Thank you for shopping with us!"
                />
              </div>

              {/* Visual Layout Checkboxes */}
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="chkSignatures"
                    checked={showSignatures}
                    onChange={(e) => setShowSignatures(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 cursor-pointer"
                  />
                  <label htmlFor="chkSignatures" className="font-medium cursor-pointer">
                    Show Signature Stamps & Lines (دستخط والے خانے)
                  </label>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="chkOperator"
                    checked={showOperator}
                    onChange={(e) => setShowOperator(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 cursor-pointer"
                  />
                  <label htmlFor="chkOperator" className="font-medium cursor-pointer">
                    Show Bill Creator / Operator Name
                  </label>
                </div>
              </div>

              {/* 💾 Permanent Save action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSavePermanently}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg shadow-lg hover:shadow-amber-500/20 active:scale-95 transition cursor-pointer"
                >
                  {isSavedPermanently ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                      <span>کامیابی سے محفوظ ہو گیا (Saved Permanently!)</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-slate-950" />
                      <span>💾 ہمیشہ کے لیے محفوظ کریں (Save for Future Bills)</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-1.5">
                  محفوظ کرنے کے بعد، تمام اگلے بلوں میں خودکار طریقے سے یہ نئی سیٹنگز آئیں گی۔
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Bottom Sticky Action Panel */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-600/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Download professional PDF receipt"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>PDF تیار ہو رہا ہے...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>PDF ڈاؤن لوڈ ہو گیا!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF (پی ڈی ایف ڈاؤن لوڈ)</span>
                </>
              )}
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-lg transition active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp Bill
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 rounded-lg transition active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onStartNewBill ? (
              <button
                onClick={onStartNewBill}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>نیا بل بنائیں (New Bill)</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            )}
            
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-black bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Receipt (بل پرنٹ کریں)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
