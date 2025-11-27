import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DOMPurify from "dompurify";

// Function for Paktech quotation template
// Function for Paktech quotation template
export const generatePaktechQuotationPdf = (quotation) => {
  const doc = new jsPDF("p", "mm", "a4");

  const PAGE_HEIGHT = 297;
  const BOTTOM_MARGIN = 45.72; // 1.8 inches
  const CONTENT_MAX_Y = PAGE_HEIGHT - BOTTOM_MARGIN;

  const {
    quoteNo,
    quoteDate,
    userId,
    expiryDate,
    customerId = {},
    items = [],
    subTotal = 0,
    tax = 0,
    grandTotal = 0,
    currencyUnit = "$",
    delivery = "",
    warranty = "",
    coOrigin = [],
    paymentTerms = "",
    mode = "F.O.R",
    modeOtherText = "",
    quoteValidityDays = 30,
    unitPriceMultiplier = 1,
  } = quotation;

  const taxAmount = subTotal * tax;
  const safeCustomer = customerId || {};
  // Function to format numbers with thousand separators
  const formatNumber = (number) => {
    return Number(number).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Header
  doc.setFontSize(14).setTextColor(200, 0, 0).setFont(undefined, "bold");
  doc.text("QUOTATION", 105, 40, { align: "center" });

  // Draw underline manually
  const textWidth = doc.getTextWidth("QUOTATION");
  const startX = 105 - textWidth / 2;
  const underlineY = 41;
  doc.setDrawColor(200, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(startX, underlineY, startX + textWidth, underlineY);

  // Bill To
  let y = 45;
  doc.setFontSize(10).setFont(undefined, "bold").setTextColor(0).text("Bill To", 14, y);
  doc.setFont(undefined, "normal").setFontSize(9);
  const addressLines = [
    safeCustomer.name?`${safeCustomer.name},`:"",
    safeCustomer.universityName?`${safeCustomer.universityName},`: '',
    safeCustomer.address?`${safeCustomer.address}.` : "",
  ];
  addressLines.forEach((line, i) => doc.text(line, 14, y + 5 + i * 5));

  // Ship To
  y += 35;
  doc.setFontSize(10).setFont(undefined, "bold").text("Ship To", 14, y);
  doc.setFont(undefined, "normal").setFontSize(9);
  addressLines.forEach((line, i) => doc.text(line, 14, y + 5 + i * 5));

  // Info Table
  autoTable(doc, {
    margin: { left: 130 },
    startY: 45,
    tableWidth: 65,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    body: [
      ["Quotation No.", `${quoteNo}`],
      ["Quotation Date", new Date(quoteDate).toLocaleDateString()],
      ["Expiry Date", expiryDate || new Date(new Date(quoteDate).setDate(new Date(quoteDate).getDate() + quoteValidityDays)).toLocaleDateString()],
      ["Customer Ref", safeCustomer.name || ""],
      ["Lead By", userId.name || ""],
      ["Incoterms", `${mode}${mode === "Other" ? ` (${modeOtherText})` : ""}`],
      ["Payment Terms", paymentTerms],
      ["Prices", currencyUnit],
    ],
  });

  // Function to convert HTML to formatted text
  const htmlToFormattedText = (html) => {
    if (!html) return "";
    
    const div = document.createElement("div");
    div.innerHTML = DOMPurify.sanitize(html);
    
    let lines = [];
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        lines.push(node.textContent.trim());
      } else if (node.nodeName === 'P' && node.textContent.trim()) {
        lines.push(node.textContent.trim());
      } else if (node.nodeName === 'STRONG' || node.nodeName === 'B') {
        lines.push(`**${node.textContent.trim()}**`);
      } else if (node.nodeName === 'UL' || node.nodeName === 'OL') {
        node.querySelectorAll('li').forEach(li => {
          lines.push(`• ${li.textContent.trim()}`);
        });
      } else if (node.nodeName === 'LI') {
        lines.push(`• ${node.textContent.trim()}`);
      } else if (node.childNodes) {
        Array.from(node.childNodes).forEach(processNode);
      }
    };
    
    Array.from(div.childNodes).forEach(processNode);
    
    return lines.join('\n')
      .replace(/●/g, '•')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&');
  };

  // Item Table - Tax column removed
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Sr-#", "Model", "Item & Description", "Qty", `Rate (${currencyUnit})`, `Amount (${currencyUnit})`]],
    body: items.map((item, i) => [
      item.sNo || i + 1,
      item.refNo || "-",
      htmlToFormattedText(item.item),
      item.qty || 0,
      formatNumber((item.unitPrice || 0) * unitPriceMultiplier),
      formatNumber((item.unitPrice || 0) * item.qty * unitPriceMultiplier),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [242, 242, 242], textColor: 0, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 20 },
      2: { cellWidth: 85, valign: "top" }, // Increased width since tax column is removed
      3: { halign: "right", cellWidth: 15 },
      4: { halign: "right", cellWidth: 25 },
      5: { halign: "right", cellWidth: 25 },
    },
    theme: "grid",
    pageBreak: "auto",
    didParseCell: function (data) {
      if (data.column.index === 2 && typeof data.cell.raw === "string") {
        const raw = data.cell.raw;
        if (raw.startsWith("**") && raw.endsWith("**")) {
          data.cell.text = [raw.replace(/\*\*/g, "")];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  let yT = doc.lastAutoTable.finalY + 10;

  // Totals
  if (yT + 25 > CONTENT_MAX_Y) {
    doc.addPage();
    yT = 20;
  }

  doc.setFontSize(9).setFont(undefined, "normal").setTextColor(0);
  doc.text("Sub Total", 160, yT, { align: "right" });
  doc.text(`${formatNumber(subTotal)}`, 195, yT, { align: "right" });

  doc.text("GST Amount", 160, yT + 5, { align: "right" });
  doc.text(` ${formatNumber(taxAmount)}`, 195, yT + 5, { align: "right" });

  doc.setFont(undefined, "bold").setTextColor(200, 0, 0);
  doc.text("Total", 160, yT + 18, { align: "right" });
  doc.text(`${currencyUnit} ${formatNumber(grandTotal)}`, 195, yT + 18, { align: "right" });

  yT += 28;

  // Terms & Conditions
  const terms = [
    `Prices quoted in ${currencyUnit}`,
    `Origin: ${coOrigin.length ? coOrigin.join(", ") : "N/A"}`,
    `Warranty: ${warranty || "N/A"}`,
    `Delivery: ${delivery || "N/A"}`,
    "*Due to global supply change issues delivery dates are tentative"
  ];

  if (yT + terms.length * 5 > CONTENT_MAX_Y) {
    doc.addPage();
    yT = 20;
  }

  doc.setFontSize(9).setTextColor(0).setFont(undefined, "bold");
  doc.text("Term & Conditions:", 14, yT);

  const headingTextWidth = doc.getTextWidth("Term & Conditions:");
  const termsunderlineY = yT + 1;
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(14, termsunderlineY, 14 + headingTextWidth, termsunderlineY);

  doc.setFontSize(8).setFont(undefined, "normal");
  terms.forEach((line, i) => {
    const lineHeight = 5;
    if (yT + (i + 1) * lineHeight > CONTENT_MAX_Y) {
      doc.addPage();
      yT = 20;
      doc.setFontSize(9).setFont(undefined, "bold");
      doc.text("Term & Conditions (cont.):", 14, yT);
      const continuedTextWidth = doc.getTextWidth("Term & Conditions (cont.):");
      doc.line(14, yT + 1, 14 + continuedTextWidth, yT + 1);
      doc.setFontSize(8).setFont(undefined, "normal");
    }
    doc.text(line, 14, yT + (i + 1) * lineHeight);
  });

  yT += (terms.length + 1) * 5;

  // Signature
  if (yT + 20 > CONTENT_MAX_Y) {
    doc.addPage();
    yT = 20;
  }

  
  try {
    doc.addImage("/images/signature.png", "PNG", 14, yT + 5, 61, 30);
  } catch {
    doc.setFontSize(8).text("Authorized Signature: ___________________", 14, yT + 10);
  }
  doc.setFontSize(9).setFont(undefined, "bold").text("Authorized Signature ___________________", 14, yT + 25);

  doc.save(`Quotation_${quoteNo || "Paktech"}.pdf`);
};
// Function for Techno quotation template
export const generateTechnoQuotationPdf = (quotation) => {
  const doc = new jsPDF();

  const {
    quoteNo,
    quoteDate,
    tax = 0,
    customerId = {},
    items = [],
    subTotal = 0,
    grandTotal = 0,
    delivery = "N/A",
    warranty = "N/A",
    coOrigin = [],
    principal = [],
    paymentTerms = "N/A",
    mode = "N/A",
    modeOtherText = "",
    quoteValidityDays = 30,
    unitPriceMultiplier = 1,
    currencyUnit = "PKR",
  } = quotation;

  const currencySymbol = currencyUnit;
  const taxAmount = subTotal * tax;
  let cursorY = 35;

  // Title
  doc.setFontSize(16).setTextColor(0);
  doc.text("QUOTATION", 105, cursorY, { align: "center" });
  cursorY += 10;

  // Quote details
  doc.setFontSize(9);
  doc.text(`Quote No: ${quoteNo || "N/A"}`, 14, cursorY);
  doc.text(`Date: ${quoteDate ? new Date(quoteDate).toLocaleDateString() : "N/A"}`, 14, cursorY += 5);
  doc.text(`Mode: ${mode}${mode === "Other" ? ` (${modeOtherText})` : ""}`, 14, cursorY += 5);
  doc.text(`Prices: ${currencyUnit}`, 14, cursorY += 5);
  doc.text(`Validity: ${quoteValidityDays} Days`, 14, cursorY += 5);

  // Customer box
  const customerLines = [
    `${safeCustomer.departmentName || "N/A"} Department`,
    `${safeCustomer.universityName || "N/A"}`,
    `Address: ${safeCustomer.address || "N/A"}`,
    `Phone: ${safeCustomer.phone || "N/A"}`,
    `Email: ${safeCustomer.email || "N/A"}`,
  ];
  const customerBoxX = 120;
  const customerBoxY = 40;
  const customerBoxWidth = 75;
  const customerBoxLineHeight = 5;
  const customerBoxHeight = 5 + customerLines.length * customerBoxLineHeight + 3;

  doc.setFillColor(240, 240, 240);
  doc.rect(customerBoxX, customerBoxY, customerBoxWidth, customerBoxHeight, "F");

  let textY = customerBoxY + 5;
  doc.setFontSize(9).text("Customer:", customerBoxX + 2, textY);
  doc.setFontSize(8);
  customerLines.forEach((line) => {
    textY += customerBoxLineHeight;
    doc.text(line, customerBoxX + 2, textY);
  });

  // Function to convert HTML to formatted text
  const htmlToFormattedText = (html) => {
    if (!html) return "";
    
    const div = document.createElement("div");
    div.innerHTML = DOMPurify.sanitize(html);
    
    let lines = [];
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        lines.push(node.textContent.trim());
      } else if (node.nodeName === 'P' && node.textContent.trim()) {
        lines.push(node.textContent.trim());
      } else if (node.nodeName === 'STRONG' || node.nodeName === 'B') {
        lines.push(`**${node.textContent.trim()}**`);
      } else if (node.nodeName === 'UL' || node.nodeName === 'OL') {
        node.querySelectorAll('li').forEach(li => {
          lines.push(`• ${li.textContent.trim()}`);
        });
      } else if (node.nodeName === 'LI') {
        lines.push(`• ${node.textContent.trim()}`);
      } else if (node.childNodes) {
        Array.from(node.childNodes).forEach(processNode);
      }
    };
    
    Array.from(div.childNodes).forEach(processNode);
    
    return lines.join('\n')
      .replace(/●/g, '•')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&');
  };

  // Item table with formatting support
  autoTable(doc, {
    startY: textY + 10,
    head: [["#", "Model No", "Items Description", "Qty", `Unit (${currencySymbol})`, `Total (${currencySymbol})`]],
    body: items.map((item, i) => [
      item.sNo || i + 1,
      item.refNo || "-",
      htmlToFormattedText(item.item),
      item.qty || 0,
      ((item.unitPrice || 0) * unitPriceMultiplier).toFixed(2),
      (item.qty * (item.unitPrice || 0) * unitPriceMultiplier).toFixed(2),
    ]),
    styles: { fontSize: 8, halign: "left" },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 9 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      2: { cellWidth: 75, valign: "top" },
    },
    theme: "striped",
    pageBreak: 'auto',
    didParseCell: function (data) {
      if (data.column.index === 2 && typeof data.cell.raw === "string") {
        const raw = data.cell.raw;
        if (raw.startsWith("**") && raw.endsWith("**")) {
          data.cell.text = [raw.replace(/\*\*/g, "")];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  let finalY = doc.lastAutoTable.finalY + 5;

  // Subtotal, Tax, Grand Total
  doc.setFillColor(245, 245, 245);
  doc.rect(140, finalY, 60, 6, "F");
  doc.setFontSize(9).setTextColor(0);
  doc.text("Sub Total:", 145, finalY + 4);
  doc.text(`${currencySymbol} ${subTotal.toFixed(2)}`, 195, finalY + 4, { align: "right" });

  doc.setFillColor(245, 245, 245);
  doc.rect(140, finalY + 6, 60, 6, "F");
  doc.text(`Tax (${(tax * 100).toFixed(0)}%):`, 145, finalY + 10);
  doc.text(`${currencySymbol} ${taxAmount.toFixed(2)}`, 195, finalY + 10, { align: "right" });

  doc.setFillColor(0);
  doc.setTextColor(255, 255, 255);
  doc.rect(140, finalY + 12, 60, 8, "F");
  doc.text("Grand Total:", 145, finalY + 18);
  doc.text(`${currencySymbol} ${grandTotal.toFixed(2)}`, 195, finalY + 18, { align: "right" });

  doc.setTextColor(0);

  // Prepare to write Terms
  let docY = finalY + 25;
  if (docY + 35 > 280) {
    doc.addPage();
    docY = 20;
  }

  doc.setFontSize(8);
  doc.text("We assure you of the best quality products with prompt services.", 14, (docY += 10));

  doc.setDrawColor(150);
  doc.rect(14, docY + 5, 180, 35);
  doc.setFontSize(9).text("Terms and Conditions:", 16, docY += 10);
  doc.setFontSize(8);
  doc.text(`Delivery: ${delivery}`, 16, docY += 5);
  doc.text(`Warranty: ${warranty}`, 16, docY += 5);
  doc.text(`Payment: ${paymentTerms}`, 16, docY += 5);
  doc.text(`Origin: ${coOrigin.length ? coOrigin.join(", ") : "N/A"}`, 16, docY += 5);
  doc.text(`Principal: ${principal.length ? principal.join(", ") : "N/A"}`, 16, docY += 5);

  // Signature or fallback
  try {
    doc.addImage("/images/signature.png", "PNG", 14, docY + 5, 40, 0);
  } catch {
    doc.setFontSize(8).text("Authorized Signature: ___________________", 14, docY + 10);
  }

  // Footer for all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7).setTextColor(100).setFont(undefined, "italic");
    doc.text("This is a system generated document and needs no signature.", 105, 290, { align: "center" });
  }

  doc.save(`Quotation_${quoteNo || "Preview"}.pdf`);
};

// Main function to decide which template to use
export const generateQuotationPdf = (quotation) => {
  const { forCompany } = quotation;

  if (forCompany === "Techno") {
    generateTechnoQuotationPdf(quotation);
  } else if (forCompany === "Paktech") {
    generatePaktechQuotationPdf(quotation);
  } else {
    throw new Error("Invalid forCompany value. Must be 'Techno' or 'Paktech'.");
  }
};