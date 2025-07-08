'use client';
import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Typography, Box, Grid, TextField, Button
} from "@mui/material";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useRouter } from "next/router";
import axios from "axios";
import InvoicePdfGenerator from "./InvoicePdfGenerator";

import dotenv from "dotenv";
dotenv.config();
 // Import the component

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const entriesPerPage = 15;
  const router = useRouter();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/invoices`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setInvoices(sorted);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      }
    };
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/invoices/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoices(prev => prev.filter(i => i._id !== id));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const filteredInvoices = invoices.filter(i =>
    i.invoiceNo?.toLowerCase().includes(search.toLowerCase()) ||
    i.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = page * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirst, indexOfLast);

  return (
    <Box sx={{ padding: 3, borderRadius: 2, backgroundColor: "#fff", boxShadow: 2 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>Invoices</Typography>
        <TextField
          placeholder="Search..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCell}>Invoice No</TableCell>
              <TableCell sx={headerCell}>Customer</TableCell>
              <TableCell sx={headerCell}>Date</TableCell>
              <TableCell sx={headerCell}>Amount</TableCell>
              <TableCell sx={headerCell}>User</TableCell>
              <TableCell sx={headerCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentInvoices.map((inv) => (
              <TableRow key={inv._id} hover>
                <TableCell>{inv.invoiceNo}</TableCell>
                <TableCell>{inv.customerId?.name || "N/A"}</TableCell>
                <TableCell>{inv.invoiceDate?.slice(0, 10)}</TableCell>
                <TableCell>{inv.grandTotal.toFixed(2)}</TableCell>
                <TableCell>{inv.userId?.name || "N/A"}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => router.push(`/invoices/${inv._id}`)}>
                    <Visibility fontSize="small" color="primary" />
                  </IconButton>
                  <InvoicePdfGenerator invoice={inv} /> {/* Replace direct generateInvoicePdf call */}
                  <IconButton size="small" onClick={() => router.push(`/invoices/edit/${inv._id}`)}>
                    <Edit fontSize="small" color="action" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(inv._id)}>
                    <Delete fontSize="small" color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
        <Button variant="outlined" size="small" disabled={page === 1} onClick={() => setPage(prev => prev - 1)}>Previous</Button>
        <Typography variant="body2">Showing {indexOfFirst + 1}-{Math.min(indexOfLast, filteredInvoices.length)} of {filteredInvoices.length}</Typography>
        <Button variant="outlined" size="small" disabled={indexOfLast >= filteredInvoices.length} onClick={() => setPage(prev => prev + 1)}>Next</Button>
      </Box>
    </Box>
  );
};

const headerCell = {
  color: "white",
  fontWeight: "bold",
  fontSize: 14,
  position: "sticky",
  top: 0,
  backgroundColor: "#1565c0",
  zIndex: 1
};

export default InvoiceList;