import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePdf = async (invoice, documentType) => {
  const doc = new jsPDF();
  const logoImg = "/images/logo.png"; // Path from public folder

  const {
    invoiceNo,
    billNo,
    invoiceDate,
    customerId = {},
    userId = {},
    orderReference,
    items = [],
    subTotal = 0,
    totalGST = 0,
    grandTotal = 0,
    amountInWords = "",
  } = invoice;

  // Load logo image
  const img = new Image();
  img.src = logoImg;

  await new Promise((resolve) => {
    img.onload = () => {
      doc.addImage(img, "PNG", 14, 10, 40, 15);
      resolve();
    };
  });

  // Company Info (top-right)
  doc.setFontSize(10);
  doc.text("Paktech Instrumentation", 200, 10, { align: "right" });
  doc.text("D-60, Block – 4, KDA Scheme No.5,", 200, 14, { align: "right" });
  doc.text("Kehkashan Clifton, Karachi-75600,", 200, 18, { align: "right" });
  doc.text("Pakistan", 200, 22, { align: "right" });
  doc.text("Tel: +92-21-111 555 401", 200, 26, { align: "right" });
  doc.text("www.paktech1.com", 200, 30, { align: "right" });

  // Title
  doc.setFontSize(14);
  doc.text(documentType.toUpperCase(), 105, 40, { align: "center" });

  // Bill To & Invoice Info
  const leftY = 48;
  doc.setFontSize(10);

  // BILL TO box
  doc.rect(14, leftY, 90, 36);
  doc.text("BILL TO:", 16, leftY + 6);
  doc.setFontSize(9);
  doc.text(customerId.name || "Customer", 16, leftY + 12);
  doc.text(customerId.address || "Office Address", 16, leftY + 17);
  doc.text(`TELL: ${customerId.phone || "---"}`, 16, leftY + 22);
  doc.text(`FAX: +92 021 3536 0305  E: ${customerId.email || "info@client.com"}`, 16, leftY + 27);
  doc.text(`NTN: ${customerId.ntn || "N/A"}`, 16, leftY + 32);

  // INVOICE INFO box
  doc.setFontSize(10);
  doc.rect(110, leftY, 85, 36);
  const numberLabel = documentType === "Invoice" ? "INVOICE NO" : "BILL NO";
  const numberValue = documentType === "Invoice" ? invoiceNo : billNo || "N/A";
  doc.text(`${numberLabel}: ${numberValue}`, 112, leftY + 6);
  doc.text(`DATE: ${new Date(invoiceDate).toLocaleDateString()}`, 112, leftY + 12);
  doc.text(`Order Ref: ${orderReference?.quoteNo || orderReference?._id || "N/A"}`, 112, leftY + 18);
  doc.text(`PREPARED BY: ${userId.name || userId.email || "Admin"}`, 112, leftY + 24);

  // Item Table
  const itemRows = items.map((item, i) => [
    i + 1,
    item.description,
    item.qty,
    item.unitPrice.toFixed(2),
    item.gst.toFixed(2),
    item.totalWithTax.toFixed(2),
  ]);

  autoTable(doc, {
    startY: leftY + 38,
    head: [["S. No", "DESCRIPTION", "Qty", "Unit Price\nwithout Tax", "GST @ 18%", "TOTAL with Tax"]],
    body: itemRows,
    styles: { fontSize: 9, halign: 'center' },
    headStyles: { fillColor: [20, 50, 100], textColor: 255 },
    columnStyles: {
      1: { halign: 'left' }
    },
    didDrawPage: (data) => {
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
      const totalPages = doc.internal.getNumberOfPages();

      // Only draw footer if this is the last page
      if (pageNumber === totalPages) {
        const footerY = data.cursor.y + 5;

        // Amount in Words box
        doc.rect(14, footerY, 160, 10);
        doc.setFontSize(9);
        doc.text("AMOUNT IN WORDS", 16, footerY + 6);
        doc.setFontSize(10);
        doc.text(amountInWords || "__________________________", 60, footerY + 6);

        // Grand Total box
        doc.rect(174, footerY, 26, 10);
        doc.text(grandTotal.toFixed(2), 198, footerY + 6, { align: "right" });

        // Footer Note
        doc.setFontSize(9);
        doc.text(
          "MAKE ALL CHECKS PAYABLE TO M/S. PAKTECH INSTRUMENTS COMPANY (NTN: 0615834-0)",
          14,
          footerY + 20
        );
      }
    },
  });

  // Save
  doc.save(`${documentType}_${numberValue}.pdf`);
};
