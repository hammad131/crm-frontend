import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Typography, Box, Grid, TextField, Button
} from "@mui/material";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useRouter } from "next/router";
import { generateQuotationPdf } from "../../utils/generateQuotationPdf";
import dotenv from "dotenv";
dotenv.config();

const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const entriesPerPage = 15;
  const router = useRouter();

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/quotations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setQuotations(sorted);
      } catch (err) {
        console.error("Error fetching quotations:", err);
      }
    };
    fetchQuotations();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this quotation?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/quotations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuotations(prev => prev.filter(q => q._id !== id));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const filteredQuotations = quotations.filter(q =>
    q.quoteNo?.toLowerCase().includes(search.toLowerCase()) ||
    q.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    q.departmentName?.toLowerCase().includes(search.toLowerCase()) ||
    q.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = page * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentQuotations = filteredQuotations.slice(indexOfFirst, indexOfLast);

  return (
    <Box sx={{ padding: 3, borderRadius: 2, backgroundColor: "#fff", boxShadow: 2 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>Quotations</Typography>
        <TextField
          placeholder="Search..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Grid>

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            maxHeight: 400,
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: "#1565c0" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: 14, position: "sticky", top: 0, backgroundColor: "#1565c0", zIndex: 1 }}>Quotation No</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: 14, position: "sticky", top: 0, backgroundColor: "#1565c0", zIndex: 1 }}>University/College</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: 14, position: "sticky", top: 0, backgroundColor: "#1565c0", zIndex: 1 }}>Department</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: 14, position: "sticky", top: 0, backgroundColor: "#1565c0", zIndex: 1 }}>Amount</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: 14, position: "sticky", top: 0, backgroundColor: "#1565c0", zIndex: 1 }}>User</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: 14, position: "sticky", top: 0, backgroundColor: "#1565c0", zIndex: 1 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentQuotations.map((q) => (
                <TableRow key={q._id} hover>
                  <TableCell>{q.quoteNo}</TableCell>
                  <TableCell>{q.customerId?.universityName || "N/A"}</TableCell>
                  <TableCell>{q.customerId?.departmentName || "N/A"}</TableCell>
                  <TableCell>{q.currencyUnit} {q.grandTotal.toFixed(2)}</TableCell>
                  <TableCell>{q.userId?.name || "N/A"}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => router.push(`/quotations/${q._id}`)}>
                      <Visibility fontSize="small" color="primary" />
                    </IconButton>
                    <IconButton size="small" onClick={() => generateQuotationPdf(q)} color="secondary">
                      <PictureAsPdfIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => router.push(`/quotations/edit/${q._id}`)}>
                      <Edit fontSize="small" color="action" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(q._id)}>
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box mt={2} display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
        <Button
          variant="outlined"
          size="small"
          disabled={page === 1}
          onClick={() => setPage(prev => prev - 1)}
        >
          Previous
        </Button>
        <Typography variant="body2">
          Showing {indexOfFirst + 1} - {Math.min(indexOfLast, filteredQuotations.length)} of {filteredQuotations.length}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          disabled={indexOfLast >= filteredQuotations.length}
          onClick={() => setPage(prev => prev + 1)}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default QuotationList;
