import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { styled } from '@mui/material/styles';

// Custom styled components
const StyledDialogButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5),
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '1rem',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

// Updated generateInvoicePdf function
export const generateInvoicePdf = async (invoice, documentType) => {
  const doc = new jsPDF();

  const {
    invoiceNo,
    billNo,
    invoiceDate,
    customerId = {},
    orderReference,
    forCompany = 'Techno',
    items = [],
    subTotal = 0,
    totalGST = 0,
    grandTotal = 0,
    amountInWords = "",
    paymentInstructions = "",
  } = invoice;

  // Company-specific configurations
  const companyConfig = {
    Paktech: {
      logoPath: null, // No header image
      logo: { x: 0, y: 0, width: 0, height: 0 }, // Disabled
      companyInfo: [],
      footerInfo: {
        address: "",
        contact: "",
        link: "",
      },
      styles: {
        headerColor: [0, 0, 0], // Black for text
        font: "Helvetica",
        titleFontSize: 18,
        textFontSize: 10,
        tableHeadFillColor: [200, 200, 200], // Light gray
        tableHeadTextColor: [0, 0, 0],
      },
    },
    'Link Lines': {
      logoPath: "/images/linklines_header.png",
      logo: { x: 14, y: 10, width: 80, height: 25 },
      companyInfo: [
        "Link Lines Enterprises",
        "Office No. 12, 2nd Floor,",
        "Gulberg Plaza, Karachi-75500, Pakistan",
        "Tel: +92-21-987 654 321",
        "www.linklines.com",
      ],
      footerInfo: {
        address: "OFFICE NO. 12, GULBERG PLAZA, KARACHI 75500=PAKISTAN",
        contact: "TEL: (92 21) 98765432   E-MAIL: contact@linklines.com   Web: www.linklines.com",
        link: "http://www.linklines.com",
      },
      styles: {
        headerColor: [0, 128, 0], // Green
        font: "Times",
        titleFontSize: 14,
        textFontSize: 9,
        tableHeadFillColor: [0, 128, 0],
        tableHeadTextColor: [255, 255, 255],
      },
    },
    Techno: {
      logoPath: "/images/techno_header.png",
      logo: { x: 15, y: 10, width: 180, height: 20 },
      companyInfo: [
        "Techno Instruments",
        "Suite 101, Business Tower,",
        "Saddar, Karachi-74000, Pakistan",
        "Tel: +92-21-123 456 789",
        "www.technoinstruments.com",
      ],
      footerInfo: {
        address: "SUITE 101, BUSINESS TOWER, SADDAR, KARACHI 74000=PAKISTAN",
        contact: "TEL: (92 21) 12345678   E-MAIL: info@technoinstruments.com   Web: www.technoinstruments.com",
        link: "http://www.technoinstruments.com",
      },
      styles: {
        headerColor: [20, 50, 100], // Dark Blue
        font: "Courier",
        titleFontSize: 14,
        textFontSize: 9,
        tableHeadFillColor: [20, 50, 100],
        tableHeadTextColor: [255, 255, 255],
      },
    },
  };

  const config = companyConfig[forCompany] || companyConfig.Techno;

  // Set font for the document
  doc.setFont(config.styles.font);
  var numberValue
  // Template for Paktech
  if (forCompany === 'Paktech') {
   // --- Header Title ---
doc.setFontSize(config.styles.titleFontSize);
doc.setTextColor(...config.styles.headerColor);
doc.text(documentType.toUpperCase(), 105, 15, { align: "center" });

// --- Supplier Box ---
const leftY = 25;
doc.setFontSize(config.styles.textFontSize);
doc.rect(14, leftY, 90, 30);
doc.text("Supplier Name: Paktech Instrument Co.", 16, leftY + 6);
doc.text("Address: 236, 1st Floor, Street 17,", 16, leftY + 11);
doc.text("Block-3 Sharafabad Karachi", 16, leftY + 16);
doc.text("NTN: 0615834-0  GST#: 12-00-9999-125-55", 16, leftY + 21);
doc.text("Phone: 34949215", 16, leftY + 26);

// --- Buyer Box ---
doc.rect(110, leftY, 90, 30);
doc.text("Buyer Name: Project Director", 112, leftY + 6);
doc.text("University of Karachi", 112, leftY + 11);
doc.text("University Road", 112, leftY + 16);
doc.text("Karachi", 112, leftY + 21);
doc.text("NTN/S Tax #: ", 112, leftY + 26);

// --- Reference Info Row ---
doc.setFontSize(config.styles.textFontSize - 1);
doc.text(
  `Ref: Tender for Supply of Chemical, Glassware and Spares for Lab Equipment - University of Karachi`,
  14,
  leftY + 38
);
doc.text(
  `Tender No: ${orderReference?.tenderNo || "DPD/CGS/2024/006-10"}, Against Order: ${orderReference?.quoteNo || "DPD/SO/270"}`,
  14,
  leftY + 43
);

// --- Items Table ---
let itemRows, tableHead;
if (documentType === "Delivery Chalan") {
  itemRows = items.map((item, i) => [i + 1, item.description, item.qty]);
  tableHead = [["S. No", "Description", "Qty"]];
} else {
  itemRows = items.map((item, i) => [
  i + 1,
  item.description || "",
  (item.unitPrice ?? 0).toFixed(2),
  ((item.qty ?? 0) * (item.unitPrice ?? 0)).toFixed(2), // Excl. Tax
  (item.gst ?? 0).toFixed(2),
  (item.totalWithTax ?? ((item.qty ?? 0) * (item.unitPrice ?? 0) + (item.gst ?? 0))).toFixed(2),
]);
  tableHead = [["S. No", "Description", "Unit Price", "Excl. Tax", "GST 18%", "Total"]];
}

let finalY = leftY + 48;
autoTable(doc, {
  startY: finalY,
  head: tableHead,
  body: itemRows,
  styles: {
    fontSize: config.styles.textFontSize,
    halign: 'center',
    font: config.styles.font,
  },
  headStyles: {
    fillColor: config.styles.tableHeadFillColor,
    textColor: config.styles.tableHeadTextColor,
  },
  columnStyles: { 1: { halign: 'left' } },
  didDrawPage: (data) => {
    finalY = data.cursor.y;
  },
});

// --- Totals Footer Box ---
if (documentType !== "Delivery Chalan") {
  const footerY = finalY + 10;
  doc.rect(14, footerY, 181, 30);
  doc.setFontSize(config.styles.textFontSize);
  doc.text(`Subtotal: ${subTotal.toFixed(2)}`, 20, footerY + 8);
  doc.text(`Total GST: ${totalGST.toFixed(2)}`, 20, footerY + 14);
  doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, 20, footerY + 20);
  doc.text(`In Words: ${amountInWords || "__________________________"}`, 20, footerY + 26);
}

// --- Additional Notes ---
if (paymentInstructions) {
  doc.setFontSize(config.styles.textFontSize);
  doc.text(paymentInstructions, 20, finalY + 45);
}

// --- Footer ---
doc.setFontSize(config.styles.textFontSize);
doc.text("Received By: ___________________________", 14, 285);
doc.setFontSize(config.styles.textFontSize - 1);
doc.text("Paktech Instruments Co", 14, 290);
  }
  // Template for Link Lines
  else if (forCompany === 'Link Lines') {
    // Header Background
    doc.setFillColor(...config.styles.headerColor);
    doc.rect(0, 0, 210, 30, 'F');

    // Company Info (right side)
    doc.setFontSize(config.styles.textFontSize);
    doc.setTextColor(255, 255, 255);
    config.companyInfo.forEach((line, index) => {
      doc.text(line, 200, 10 + index * 5, { align: "right" });
    });

    // Title
    doc.setFontSize(config.styles.titleFontSize);
    doc.text(documentType.toUpperCase(), 14, 45);

    // Bill To & Invoice Info
    const leftY = 55;
    doc.setFontSize(config.styles.textFontSize);

    // BILL TO box
    doc.rect(14, leftY, 90, 36);
    doc.text("BILL TO:", 16, leftY + 6);
    doc.text(customerId.name || "Customer", 16, leftY + 12);
    doc.text(customerId.address || "Office Address", 16, leftY + 17);
    doc.text(`TELL: ${customerId.phone || "---"}`, 16, leftY + 22);
    doc.text(`Email: ${customerId.email || ""}`, 16, leftY + 27);
    doc.text(`NTN: ${customerId.ntn || "N/A"}`, 16, leftY + 32);

    // INVOICE INFO box
    doc.rect(110, leftY, 85, 36);
    const numberLabel = documentType === "Invoice" ? "INVOICE NO" : documentType === "Bill" ? "BILL NO" : "CHALAN NO";
    numberValue = documentType === "Invoice" ? invoiceNo : billNo || "N/A";
    doc.text(`${numberLabel}: ${numberValue}`, 112, leftY + 6);
    doc.text(`DATE: ${new Date(invoiceDate).toLocaleDateString()}`, 112, leftY + 12);
    doc.text(`Order Ref: ${orderReference?.quoteNo || orderReference?._id || "N/A"}`, 112, leftY + 18);
    doc.text(`NTN: 0615834-0`, 112, leftY + 24);
    doc.text(`GST: 12-00-9999-125-55`, 112, leftY + 30);

    // Item Table
    let itemRows, tableHead;
    if (documentType === "Delivery Chalan") {
      itemRows = items.map((item, i) => [i + 1, item.description, item.qty]);
      tableHead = [["S. No", "DESCRIPTION", "Qty"]];
    } else {
      itemRows = items.map((item, i) => [
        i + 1,
        item.description,
        item.qty,
        item.unitPrice.toFixed(2),
        item.gst.toFixed(2),
        item.totalWithTax.toFixed(2),
      ]);
      tableHead = [["S. No", "DESCRIPTION", "Qty", "Unit Price\nwithout Tax", "GST @ 18%", "TOTAL with Tax"]];
    }

    let finalY = leftY + 38;
    autoTable(doc, {
      startY: leftY + 38,
      head: tableHead,
      body: itemRows,
      styles: { fontSize: config.styles.textFontSize, halign: 'center', font: config.styles.font },
      headStyles: { fillColor: config.styles.tableHeadFillColor, textColor: config.styles.tableHeadTextColor },
      columnStyles: { 1: { halign: 'left' } },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.cell.section === 'body') {
          data.cell.styles.cellWidth = 'auto';
        }
      },
      didDrawPage: (data) => {
        finalY = data.cursor.y;
      },
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    doc.setPage(totalPages);
    const footerY = finalY + 10;

    if (documentType !== "Delivery Chalan") {
      doc.setFontSize(config.styles.textFontSize);
      doc.text("AMOUNT IN WORDS: " + (amountInWords ? amountInWords.toUpperCase() : "__________________________"), 14, footerY);
      doc.text(`GRAND TOTAL: ${grandTotal.toFixed(2)}`, 200, footerY, { align: "right" });
    }

    doc.setFontSize(config.styles.textFontSize);
    doc.text(paymentInstructions || "N/A", 14, footerY + 15);

    doc.setDrawColor(...config.styles.headerColor);
    doc.setLineWidth(0.3);
    doc.line(14, 290, 196, 290);
    doc.setFontSize(8).setTextColor(0);
    doc.setFont(config.styles.font, 'normal');
    doc.textWithLink(config.footerInfo.contact, 105, 295, { align: "center", link: config.footerInfo.link });
  }
  // Template for Techno
  else {
    // Title
    doc.setFontSize(config.styles.titleFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text(documentType.toUpperCase(), 105, 40, { align: "center" });

    // Bill To & Invoice Info
    const leftY = 48;
    doc.setFontSize(config.styles.textFontSize);

    // BILL TO box
    doc.rect(14, leftY, 90, 36);
    doc.text("BILL TO:", 16, leftY + 6);
    doc.text(customerId.name || "Customer", 16, leftY + 12);
    doc.text(customerId.address || "Office Address", 16, leftY + 17);
    doc.text(`TELL: ${customerId.phone || "---"}`, 16, leftY + 22);
    doc.text(`Email: ${customerId.email || ""}`, 16, leftY + 27);
    doc.text(`NTN: ${customerId.ntn || "N/A"}`, 16, leftY + 32);

    // INVOICE INFO box
    doc.rect(110, leftY, 85, 36);
    const numberLabel = documentType === "Invoice" ? "INVOICE NO" : documentType === "Bill" ? "BILL NO" : "CHALAN NO";
    numberValue = documentType === "Invoice" ? invoiceNo : billNo || "N/A";
    doc.text(`${numberLabel}: ${numberValue}`, 112, leftY + 6);
    doc.text(`DATE: ${new Date(invoiceDate).toLocaleDateString()}`, 112, leftY + 12);
    doc.text(`Order Ref: ${orderReference?.quoteNo || orderReference?._id || "N/A"}`, 112, leftY + 18);
    doc.text(`NTN: 0615834-0`, 112, leftY + 24);
    doc.text(`GST: 12-00-9999-125-55`, 112, leftY + 30);

    // Item Table
    let itemRows, tableHead;
    if (documentType === "Delivery Chalan") {
      itemRows = items.map((item, i) => [i + 1, item.description, item.qty]);
      tableHead = [["S. No", "DESCRIPTION", "Qty"]];
    } else {
      itemRows = items.map((item, i) => [
        i + 1,
        item.description,
        item.qty,
        item.unitPrice.toFixed(2),
        item.gst.toFixed(2),
        item.totalWithTax.toFixed(2),
      ]);
      tableHead = [["S. No", "DESCRIPTION", "Qty", "Unit Price\nwithout Tax", "GST @ 18%", "TOTAL with Tax"]];
    }

    let finalY = leftY + 38;
    autoTable(doc, {
      startY: leftY + 38,
      head: tableHead,
      body: itemRows,
      styles: { fontSize: config.styles.textFontSize, halign: 'center', font: config.styles.font },
      headStyles: { fillColor: config.styles.tableHeadFillColor, textColor: config.styles.tableHeadTextColor },
      columnStyles: { 1: { halign: 'left' } },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.cell.section === 'body') {
          data.cell.styles.cellWidth = 'auto';
        }
      },
      didDrawPage: (data) => {
        finalY = data.cursor.y;
      },
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    doc.setPage(totalPages);
    const footerY = finalY + 5;

    if (documentType !== "Delivery Chalan") {
      doc.rect(14, footerY, 160, 10);
      doc.setFontSize(config.styles.textFontSize);
      doc.text("AMOUNT IN WORDS", 16, footerY + 6);
      doc.text(amountInWords ? amountInWords.toUpperCase() : "__________________________", 60, footerY + 6);
      doc.rect(174, footerY, 26, 10);
      doc.text(grandTotal.toFixed(2), 198, footerY + 6, { align: "right" });
    }

    doc.setFontSize(config.styles.textFontSize);
    doc.text(paymentInstructions || "N/A", 14, footerY + 20);

    doc.setDrawColor(...config.styles.headerColor);
    doc.setLineWidth(0.5);
    doc.line(14, 285, 196, 285);
    doc.setFontSize(8).setTextColor(0);
    doc.setFont(config.styles.font, 'bold');
    doc.text(config.footerInfo.address, 105, 290, { align: "center" });
    doc.setFont(config.styles.font, 'normal');
    doc.textWithLink(config.footerInfo.contact, 105, 295, { align: "center", link: config.footerInfo.link });
  }

  // Save
  doc.save(`${documentType}_${numberValue}.pdf`);
};

// React component to trigger PDF generation with popup
const InvoicePdfGenerator = ({ invoice }) => {
  const [open, setOpen] = useState(false);
  const [documentType, setDocumentType] = useState(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDocumentType(null);
  };

  const handleGenerate = async () => {
    if (documentType) {
      try {
        await generateInvoicePdf(invoice, documentType);
        handleClose();
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      }
    }
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen} color="secondary">
        <PictureAsPdfIcon fontSize="small" />
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          Select Document Type
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please choose whether to generate an Invoice, a Bill, or a Delivery Chalan.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <StyledDialogButton
              variant={documentType === 'Invoice' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setDocumentType('Invoice')}
              fullWidth
            >
              Invoice
            </StyledDialogButton>
            <StyledDialogButton
              variant={documentType === 'Bill' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setDocumentType('Bill')}
              fullWidth
            >
              Bill
            </StyledDialogButton>
            <StyledDialogButton
              variant={documentType === 'Delivery Chalan' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setDocumentType('Delivery Chalan')}
              fullWidth
            >
              Delivery Chalan
            </StyledDialogButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            color="primary"
            variant="contained"
            disabled={!documentType}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoicePdfGenerator;