import { jsPDF } from "jspdf";
import { Invoice, StoreSettings } from "../types";

export interface PdfReceiptOptions {
  invoice: Invoice;
  settings?: StoreSettings;
  storeName?: string;
  branchName?: string;
  address?: string;
  phone?: string;
  ntn?: string;
  receiptFooter?: string;
}

/**
 * Generates and downloads a clean, professional, high-resolution PDF receipt
 * for Haider Pipe & Sanitary Store (HaiderSanitary).
 */
export const downloadPdfReceipt = (options: PdfReceiptOptions): boolean => {
  try {
    const { invoice } = options;
    const storeName =
      options.storeName ||
      options.settings?.storeName ||
      "Haider Pipe & Sanitary Store";
    const branchName =
      options.branchName ||
      invoice.branchName ||
      "Main Branch Peshawar";
    const address =
      options.address ||
      options.settings?.address ||
      "Peshawar Cantt, Khyber Pakhtunkhwa";
    const phone =
      options.phone ||
      options.settings?.phone ||
      "0333-1234567 | 091-5273423";
    const ntn = options.ntn || options.settings?.ntn;
    const footerText =
      options.receiptFooter ||
      options.settings?.receiptFooter ||
      "Thank you for choosing HaiderSanitary! Building trust for your dream home.";

    // Use 80mm roll receipt or A4 / standard receipt format.
    // An A5 or custom receipt width (80mm or 105mm x dynamic / A5)
    // 105mm x 148mm (A6) or A5 (148mm x 210mm) is standard for retail trade receipts in Pakistan,
    // or standard A4 format that prints crisp on any desktop/thermal printer.
    // Let's create an 80mm thermal/pos width or standard neat A5 portrait (148 x 210 mm)
    // A5 portrait (148mm width x 210mm height) is ideal for trade & plumbing supplies,
    // allowing all item descriptions, brand names, quantities, and totals to fit perfectly.
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 148mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
    const margin = 10;
    const contentWidth = pageWidth - margin * 2; // 128mm

    let y = 12;

    // Header Background Accent Bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, 22, "F");

    // Brand Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(storeName.toUpperCase(), pageWidth / 2, y + 7, { align: "center" });

    // Subtitle / Slogan
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(186, 230, 253); // sky-200
    doc.text(
      `Showroom & Sanitary Ware • ${branchName}`,
      pageWidth / 2,
      y + 12,
      { align: "center" }
    );

    doc.setFontSize(7);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(`Address: ${address}  |  Ph: ${phone}`, pageWidth / 2, y + 17, {
      align: "center",
    });

    y += 26;

    // Invoice Details & Customer Info Grid
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

    // Left Column: Invoice Metadata
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(`INVOICE: ${invoice.invoiceNumber}`, margin + 4, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const invoiceDate = new Date(invoice.date);
    const dateStr = invoiceDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = invoiceDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    doc.text(`Date & Time: ${dateStr} ${timeStr}`, margin + 4, y + 12);
    doc.text(
      `Payment Mode: ${invoice.paymentMethod.replace("_", " ").toUpperCase()}`,
      margin + 4,
      y + 17
    );
    if (ntn) {
      doc.text(`NTN / STRN: ${ntn}`, margin + 4, y + 21);
    }

    // Right Column: Customer Info
    const rightColX = pageWidth / 2 + 5;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`Billed To: ${invoice.customerName || "Walk-in Cash Customer"}`, rightColX, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    if (invoice.customerPhone) {
      doc.text(`Contact: ${invoice.customerPhone}`, rightColX, y + 12);
    }
    doc.text(
      `Cashier: ${invoice.cashierName || "Counter Staff"} (${invoice.counterStation || "Counter #1"})`,
      rightColX,
      y + 17
    );

    y += 28;

    // Items Table Header
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(margin, y, contentWidth, 7, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);

    const colX = {
      sr: margin + 2,
      desc: margin + 10,
      qty: margin + 74,
      price: margin + 98,
      total: margin + contentWidth - 3,
    };

    doc.text("#", colX.sr, y + 4.8);
    doc.text("Item / Description", colX.desc, y + 4.8);
    doc.text("Qty", colX.qty, y + 4.8, { align: "center" });
    doc.text("Rate (Rs)", colX.price, y + 4.8, { align: "right" });
    doc.text("Amount (Rs)", colX.total, y + 4.8, { align: "right" });

    y += 7;

    // Items Rows
    invoice.items.forEach((item, index) => {
      // Check for page overflow
      if (y > pageHeight - 48) {
        doc.addPage();
        y = 12;
      }

      // Alternating row background
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 6.5, "F");
      }

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);

      // SR #
      doc.text(`${index + 1}`, colX.sr, y + 4.5);

      // Description (truncated if long)
      const itemName = item.product.brand
        ? `${item.product.name} (${item.product.brand})`
        : item.product.name;
      const truncatedName =
        itemName.length > 36 ? `${itemName.slice(0, 34)}...` : itemName;
      doc.text(truncatedName, colX.desc, y + 4.5);

      // Qty
      doc.text(
        `${item.quantity} ${item.product.unit || "pcs"}`,
        colX.qty,
        y + 4.5,
        { align: "center" }
      );

      // Unit Price
      doc.text(item.unitPrice.toLocaleString(), colX.price, y + 4.5, {
        align: "right",
      });

      // Total
      doc.setFont("helvetica", "bold");
      doc.text(item.total.toLocaleString(), colX.total, y + 4.5, {
        align: "right",
      });

      // Bottom row divider line
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);

      y += 6.5;
    });

    y += 3;

    // Financial Calculation Block
    // Check if enough space for summary block
    if (y > pageHeight - 45) {
      doc.addPage();
      y = 12;
    }

    const summaryBoxX = pageWidth - margin - 55;
    const summaryWidth = 55;

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(summaryBoxX, y, summaryWidth, 34, 1.5, 1.5, "FD");

    let sumY = y + 5;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);

    // Subtotal
    doc.text("Subtotal:", summaryBoxX + 4, sumY);
    doc.text(`Rs ${invoice.subtotal.toLocaleString()}`, summaryBoxX + summaryWidth - 4, sumY, {
      align: "right",
    });

    sumY += 5;

    // Discount (if any)
    if (invoice.discount > 0) {
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text("Discount:", summaryBoxX + 4, sumY);
      doc.text(
        `- Rs ${invoice.discount.toLocaleString()}`,
        summaryBoxX + summaryWidth - 4,
        sumY,
        { align: "right" }
      );
      sumY += 5;
    }

    // Grand Total Highlight
    doc.setFillColor(15, 23, 42); // dark background for total
    doc.rect(summaryBoxX + 1, sumY - 3.5, summaryWidth - 2, 7, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("Grand Total:", summaryBoxX + 4, sumY + 1.5);
    doc.text(
      `Rs ${invoice.grandTotal.toLocaleString()}`,
      summaryBoxX + summaryWidth - 4,
      sumY + 1.5,
      { align: "right" }
    );

    sumY += 8;

    // Amount Paid
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Amount Paid:", summaryBoxX + 4, sumY);
    doc.text(`Rs ${invoice.amountPaid.toLocaleString()}`, summaryBoxX + summaryWidth - 4, sumY, {
      align: "right",
    });

    sumY += 5;

    // Balance Due
    if (invoice.balanceDue > 0) {
      doc.setTextColor(225, 29, 72); // rose-600
      doc.setFont("helvetica", "bold");
      doc.text("Balance Due:", summaryBoxX + 4, sumY);
      doc.text(`Rs ${invoice.balanceDue.toLocaleString()}`, summaryBoxX + summaryWidth - 4, sumY, {
        align: "right",
      });
    } else {
      doc.setTextColor(16, 185, 129);
      doc.setFont("helvetica", "bold");
      doc.text("Status:", summaryBoxX + 4, sumY);
      doc.text("PAID IN FULL", summaryBoxX + summaryWidth - 4, sumY, {
        align: "right",
      });
    }

    // Left side of summary: Terms & Notes
    const notesWidth = summaryBoxX - margin - 4;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Important Notice & Store Policy:", margin + 2, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    const policyText = [
      "• Sanitary items and pipes can be exchanged within 7 days with original receipt.",
      "• Used, damaged, or cut PPRC/PVC pipes will not be eligible for return.",
      "• Please check all goods at the counter upon delivery.",
    ];
    let policyY = y + 10;
    policyText.forEach((p) => {
      doc.text(p, margin + 2, policyY, { maxWidth: notesWidth });
      policyY += 4;
    });

    if (invoice.notes) {
      policyY += 2;
      doc.setFont("helvetica", "italic");
      doc.setTextColor(79, 70, 229);
      doc.text(`Notes: ${invoice.notes}`, margin + 2, policyY, {
        maxWidth: notesWidth,
      });
    }

    y += 38;

    // Signatures
    const sigY = Math.min(y + 6, pageHeight - 20);
    doc.setDrawColor(203, 213, 225);
    doc.line(margin + 5, sigY, margin + 40, sigY);
    doc.line(pageWidth - margin - 40, sigY, pageWidth - margin - 5, sigY);

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("Customer Signature", margin + 12, sigY + 3.5);
    doc.text("Authorized Signature", pageWidth - margin - 35, sigY + 3.5);

    // Footer Slogan & System Watermark
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "italic");
    doc.text(`"${footerText}"`, pageWidth / 2, pageHeight - 8, {
      align: "center",
    });

    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated by HaiderSanitary Billing System • ${new Date().toISOString().slice(0, 10)}`,
      pageWidth / 2,
      pageHeight - 4,
      { align: "center" }
    );

    // Trigger Browser Download
    const fileName = `Receipt-${invoice.invoiceNumber || "INV"}.pdf`;
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error("Failed to generate PDF receipt:", error);
    return false;
  }
};
