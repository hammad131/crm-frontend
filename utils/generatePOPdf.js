import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePOPdf = async (po) => {
  const doc = new jsPDF();
  const logoImg = "/images/paktech-logo.png"; // Must be in public/images/
  const signatureImg = "/images/signature.png"; // Must be in public/images/

  const {
    poNumber = "",
    poDate,
    userId = { name: "N/A" },
    vendorId = { name: "N/A", address: "", phone: "", email: "" },
    clientRefNo = { quoteNo: "N/A" },
    clientOrderNo = "",
    mode = "F.O.R",
    shipTo = { name: "", address: "", city: "", zip: "", phone: "", fax: "", email: "" },
    shippingTerms = "",
    shippingMethod = "",
    deliveryDate,
    items = [],
    subTotal = 0,
    grandTotal = 0,
    unitPriceMultiplier = 1,
    tax = 0,
    deliveryTerms = "12-16 weeks after confirmed order",
    paymentTerms = "",
    warranty = "The equipment shall be covered by a 12 Months warranty, commencing after two weeks from the date of delivery.",
    notes = "We are highly anticipating this partnership and we’re looking forward to working with you.",
    importDutiesTaxes = "Including all duties and Taxes, GST mentioned separately.",
    inspectionTerms = "The Buyer shall inspect the equipment upon delivery and notify the Seller of any defects or discrepancies within five days.",
    forceMajeure = "Paktech will not be liable for any failure to perform due to unforeseen circumstances beyond our control.",
    customsCompliance = "The Buyer shall comply with all applicable customs regulations and provide necessary documentation if applicable."
  } = po;

  // Format currency based on mode
  const currency = mode === "F.O.R" ? "PKR" : "USD";
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Load logo image
  const logo = new Image();
  logo.src = logoImg;
  await new Promise((resolve, reject) => {
    logo.onload = () => {
      doc.addImage(logo, "PNG", 135, 5, 70, 15); // Top-right corner
      resolve();
    };
    logo.onerror = () => {
      console.warn("Failed to load logo.png");
      resolve(); // Continue without logo
    };
  });

  // Load signature image
  const signature = new Image();
  signature.src = signatureImg;
  let signatureLoaded = false;
  await new Promise((resolve) => {
    signature.onload = () => {
      signatureLoaded = true;
      resolve();
    };
    signature.onerror = () => {
      console.warn("Failed to load signature.png");
      resolve(); // Continue without signature
    };
  });

  // ======= HEADER COMPANY INFO =======
  doc.setFontSize(14);
  doc.text("Paktech Instrumentation Co.", 14, 15);
  doc.setFontSize(10);
  doc.text("236, Street # 17, Block-3, Sharafabad, Karachi", 14, 20);
  doc.text("0213-4949215  |  info@paktech1.com", 14, 25);

  // ======= PURCHASE ORDER BOX =======
  doc.setFontSize(12);
  doc.rect(140, 20, 60, 18);
  doc.text("PURCHASE ORDER", 170, 26, { align: "center" });
  doc.setFontSize(9);
  doc.text(`${poNumber}    Date: ${formatDate(poDate)}`, 142, 33);

  // ======= CLIENT ORDER / REF / MODE =======
  doc.setFontSize(10);
  doc.text(`Order Ref #: ${clientRefNo.quoteNo}`, 14, 40);
  doc.text(`Client Order #: ${clientOrderNo || "N/A"}`, 80, 40);

  // ======= VENDOR & SHIP TO BLOCKS =======
  const blockY = 46;
  doc.setFontSize(10);
  doc.setFillColor(240);
  doc.rect(14, blockY, 90, 36, "F"); // Increased height for email
  doc.rect(110, blockY, 90, 36, "F");

  doc.text("VENDOR", 16, blockY + 6);
  doc.setFontSize(9);
  doc.text(vendorId.name, 16, blockY + 12);
  doc.text(vendorId.address || "N/A", 16, blockY + 17);
  doc.text(`${vendorId.city || ""}${vendorId.city && vendorId.zip ? ", " : ""}${vendorId.zip || ""}`, 16, blockY + 22);

  doc.text(vendorId.phone || "N/A", 16, blockY + 27);
  doc.text(vendorId.email || "N/A", 16, blockY + 32);
  
  doc.setFontSize(10);
  doc.text("SHIP TO", 112, blockY + 6);
  doc.setFontSize(9);
  doc.text(shipTo.name || "N/A", 112, blockY + 12);
  doc.text(shipTo.address || "N/A", 112, blockY + 17);
  doc.text(shipTo.phone || "N/A", 112, blockY + 22);
  doc.text(shipTo.email || "N/A", 112, blockY + 27);
  doc.text(`${shipTo.city || ""}${shipTo.city && shipTo.zip ? ", " : ""}${shipTo.zip || ""}`, 112, blockY + 32);

  // ======= SHIPPING TERMS ROW =======
  const shipY = blockY + 42;
  doc.setFillColor(210);
  doc.rect(14, shipY, 60, 10, "F");
  doc.rect(74, shipY, 60, 10, "F");
  doc.rect(134, shipY, 66, 10, "F");

  doc.setTextColor(255);
  doc.setFontSize(9);
  doc.text("Shipping Terms", 16, shipY + 7);
  doc.text("Shipping Method", 76, shipY + 7);
  doc.text("Delivery Date", 136, shipY + 7);
  doc.setTextColor(0);
  doc.setFontSize(9);
  doc.text(shippingTerms || "N/A", 16, shipY + 15);
  doc.text(shippingMethod || "N/A", 76, shipY + 15);
  doc.text(formatDate(deliveryDate), 136, shipY + 15);

  // ======= ITEM TABLE =======
  const itemRows = items.map((item, i) => [
    item.sNo || i + 1,
    item.description || "N/A",
    item.qty || 0,
    formatCurrency(item.unitPrice || 0),
    formatCurrency(item.totalPrice || 0)
  ]);

  autoTable(doc, {
    startY: shipY + 20,
    head: [["S.No", "Description", "Qty", "Unit Price", "Total Price"]],
    body: itemRows,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    theme: "grid",
    margin: { top: 10, bottom: 60, left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageInfo = doc.internal.getCurrentPageInfo();
      const currentPage = pageInfo.pageNumber;
      const totalPages = doc.internal.getNumberOfPages();
      const finalY = data.cursor.y + 5;

      // PAGE FOOTER (Always)
      doc.setFontSize(8);
      doc.text(`Page ${currentPage} of ${totalPages}`, 105, 290, { align: "center" });

      // FOOTER CONTENT (Only on Last Page)
      if (currentPage === totalPages) {
        // Financial Details
        doc.setFontSize(10);

        doc.text("Subtotal:", 140, finalY + 8);
        doc.text(formatCurrency(subTotal), 190, finalY + 8, { align: "right" });

        doc.setFillColor(200);
        doc.rect(140, finalY + 12, 60, 8, "F");

        doc.setTextColor(0);
        doc.text("Grand Total:", 140, finalY + 18);
        doc.text(formatCurrency(grandTotal), 190, finalY + 18, { align: "right" });


        // Terms and Conditions
       doc.setFontSize(11);
        doc.setFont(undefined, "bold");
        doc.text("Terms and Conditions", 14, finalY + 40);

        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        let termsY = finalY + 45;

        const terms = [
          { label: "Delivery Terms:", value: deliveryTerms },
          { label: "Payment Terms:", value: paymentTerms },
          { label: "Warranty:", value: warranty },
          // { label: "Notes:", value: notes },
          { label: "Import Duties & Taxes:", value: importDutiesTaxes },
          { label: "Inspection Terms:", value: inspectionTerms },
          { label: "Force Majeure:", value: forceMajeure },
          { label: "Customs Compliance:", value: customsCompliance }
        ];

        terms.forEach(({ label, value }) => {
          const fullText = `${label} ${value || ''}`;
          const splitText = doc.splitTextToSize(fullText, 180);
          doc.text(splitText, 14, termsY);
          termsY += splitText.length * 5;
        });

        // Signature
        if (signatureLoaded) {
          doc.addImage(signature, "PNG", 14, termsY + 5, 60, 20);
          doc.text("Authorized Signature", 14, termsY + 20);
        }

       
      }
    }
  });

  // SAVE PDF
  doc.save(`${poNumber}.pdf`);
};