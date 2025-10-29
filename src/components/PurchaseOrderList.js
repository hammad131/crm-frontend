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
import { generatePOPdf } from "../../utils/generatePOPdf";
import dotenv from "dotenv";
dotenv.config();

const PurchaseOrderList = () => {
  const [pos, setPOs] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const entriesPerPage = 15;
  const router = useRouter();

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/purchase-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPOs(sorted);
      } catch (err) {
        console.error("Error fetching POs:", err);
      }
    };
    fetchPOs();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this PO?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/purchase-orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPOs(prev => prev.filter(po => po._id !== id));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const filteredPOs = pos.filter(po =>
    po.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
    po.vendorId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    po.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = page * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentPOs = filteredPOs.slice(indexOfFirst, indexOfLast);

  return (
    <Box sx={{ padding: 3, borderRadius: 2, backgroundColor: "#fff", boxShadow: 2 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>Purchase Orders</Typography>
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
              <TableCell sx={headerCell}>PO No</TableCell>
              <TableCell sx={headerCell} >Vendor</TableCell>
              <TableCell sx={headerCell}>Date</TableCell>
              <TableCell sx={headerCell}>Amount</TableCell>
              <TableCell sx={headerCell}>User</TableCell>
              <TableCell sx={headerCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentPOs.map((po) => (
              <TableRow key={po._id} hover>
                <TableCell>{po.poNumber}</TableCell>
                <TableCell>{po.vendorId?.name || "N/A"}</TableCell>
                <TableCell>{po.poDate?.slice(0, 10)}</TableCell>
                <TableCell>{po.currencyUnit} {po.grandTotal.toFixed(2)}</TableCell>
                <TableCell>{po.userId?.name || "N/A"}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => router.push(`/purchase-orders/${po._id}`)}>
                    <Visibility fontSize="small" color="primary" />
                  </IconButton>
                  <IconButton size="small" onClick={() => generatePOPdf(po)} color="secondary">
                    <PictureAsPdfIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => router.push(`/purchase-orders/edit/${po._id}`)}>
                    <Edit fontSize="small" color="action" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(po._id)}>
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
        <Typography variant="body2">Showing {indexOfFirst + 1}-{Math.min(indexOfLast, filteredPOs.length)} of {filteredPOs.length}</Typography>
        <Button variant="outlined" size="small" disabled={indexOfLast >= filteredPOs.length} onClick={() => setPage(prev => prev + 1)}>Next</Button>
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

export default PurchaseOrderList;
