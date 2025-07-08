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
  const logoImg = "/images/header.png"; // Path from public folder

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
    paymentInstructions = "",
  } = invoice;

  // Load logo image
  const img = new Image();
  img.src = logoImg;

  await new Promise((resolve, reject) => {
    img.onload = () => {
      doc.addImage(img, "PNG",  15, 10, 180, 20);
      resolve();
    };
    img.onerror = () => reject(new Error('Failed to load logo image'));
  });

  // // Company Info (top-right)
  // doc.setFontSize(10);
  // doc.text("Paktech Instrumentation", 200, 10, { align: "right" });
  // doc.text("D-60, Block – 4, KDA Scheme No.5,", 200, 14, { align: "right" });
  // doc.text("Kehkashan Clifton, Karachi-75600,", 200, 18, { align: "right" });
  // doc.text("Pakistan", 200, 22, { align: "right" });
  // doc.text("Tel: +92-21-111 555 401", 200, 26, { align: "right" });
  // doc.text("www.paktech1.com", 200, 30, { align: "right" });

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
  doc.text(`Email: ${customerId.email || ""}`, 16, leftY + 27);
  doc.text(`NTN: ${customerId.ntn || "N/A"}`, 16, leftY + 32);

  // INVOICE INFO box
  doc.setFontSize(9);
  doc.rect(110, leftY, 85, 36);
  const numberLabel = documentType === "Invoice" ? "INVOICE NO" : "BILL NO";
  const numberValue = documentType === "Invoice" ? invoiceNo : billNo || "N/A";
  doc.text(`${numberLabel}: ${numberValue}`, 112, leftY + 6);
  doc.text(`DATE: ${new Date(invoiceDate).toLocaleDateString()}`, 112, leftY + 12);
  doc.text(`Order Ref: ${orderReference?.quoteNo || orderReference?._id || "N/A"}`, 112, leftY + 18);
  doc.text(`NTN: 0615834-0 `, 112, leftY + 24);
  doc.text(`GST: 12-00-9999-125-55`, 112, leftY + 30);

  // Item Table
  const itemRows = items.map((item, i) => [
    i + 1,
    item.description,
    item.qty,
    item.unitPrice.toFixed(2),
    item.gst.toFixed(2),
    item.totalWithTax.toFixed(2),
  ]);

  let finalY = leftY + 38; // Initialize finalY
  autoTable(doc, {
    startY: leftY + 38,
    head: [["S. No", "DESCRIPTION", "Qty", "Unit Price\nwithout Tax", "GST @ 18%", "TOTAL with Tax"]],
    body: itemRows,
    styles: { fontSize: 9, halign: 'center' },
    headStyles: { fillColor: [20, 50, 100], textColor: 255 },
    columnStyles: {
      1: { halign: 'left' },
    },
    didParseCell: (data) => {
      // Adjust cell height for description if needed
      if (data.column.index === 1 && data.cell.section === 'body') {
        data.cell.styles.cellWidth = 'auto'; // Allow wrapping
      }
    },
    didDrawPage: (data) => {
      finalY = data.cursor.y; // Update finalY after each page
    },
  });

  // Ensure we're on the last page
  const totalPages = doc.internal.getNumberOfPages();
  doc.setPage(totalPages);

  // Footer (only on the last page)
  const footerY = finalY + 5;

  // Amount in Words box
  doc.rect(14, footerY, 160, 10);
  doc.setFontSize(9);
  doc.text("AMOUNT IN WORDS", 16, footerY + 6);
  doc.setFontSize(10);
  doc.text(
    amountInWords ? amountInWords.toUpperCase() : "__________________________",
    60,
    footerY + 6
  );

  // Grand Total box
  doc.rect(174, footerY, 26, 10);
  doc.text(grandTotal.toFixed(2), 198, footerY + 6, { align: "right" });

  // Footer Note
  doc.setFontSize(9);
  doc.text(
    paymentInstructions || "N/A",
    14,
    footerY + 20
  );

  // Footer Divider and Info (last page only)
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(14, 285, 196, 285);

  doc.setFontSize(8).setTextColor(0);
  doc.setFont(undefined, 'bold');
  doc.text("# 236, 1st FLOOR, STREET 15, BLOCK-3, SHARAFABAD, KARACHI 74800=PAKISTAN", 105, 290, { align: "center" });

  doc.setFont(undefined, 'normal');
  doc.textWithLink(
    "TEL: (92 21) 34949215 / 4930971   E-MAIL: info@paktech1.com   Web: www.paktech1.com",
    105,
    295,
    {
      align: "center",
      link: "http://www.paktech1.com"
    }
  );

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
            Please choose whether to generate an Invoice or a Bill.
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