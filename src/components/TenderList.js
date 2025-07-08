import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Typography, Box, Button, TextField, Grid
} from "@mui/material";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { useRouter } from "next/router";
import dotenv from "dotenv";
dotenv.config();

const TenderList = () => {
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const entriesPerPage = 15;
  const router = useRouter();

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/tenders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTenders(sorted);
        setFilteredTenders(sorted);
      } catch (err) {
        console.error("Error fetching tenders:", err);
      }
    };
    fetchTenders();
  }, []);

  useEffect(() => {
    const filtered = tenders.filter(tender =>
      tender.title?.toLowerCase().includes(search.toLowerCase()) ||
      tender.description?.toLowerCase().includes(search.toLowerCase()) ||
      tender.customerId?.universityName?.toLowerCase().includes(search.toLowerCase()) ||
      tender.user?.name?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredTenders(filtered);
    setPage(1);
  }, [search, tenders]);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this tender?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/tenders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTenders(prev => prev.filter(t => t._id !== id));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const indexOfLast = page * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentTenders = filteredTenders.slice(indexOfFirst, indexOfLast);

  return (
    <Box sx={{ padding: 3, borderRadius: 2, backgroundColor: "#fff", boxShadow: 2 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>Tenders</Typography>
        <TextField
          placeholder="Search..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Grid>

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                 <TableCell sx={headerCell}>Tender No</TableCell>
                <TableCell sx={headerCell}>Title</TableCell>
                <TableCell sx={headerCell}>University/College</TableCell>
                <TableCell sx={headerCell}>Order Status</TableCell>
                <TableCell sx={headerCell}>Amount Quoted</TableCell>
                <TableCell sx={headerCell}>Awarded</TableCell>
                <TableCell sx={headerCell}>Project Status</TableCell>
                <TableCell sx={headerCell}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentTenders.map((tender) => (
                <TableRow key={tender._id} hover>
                   <TableCell>{tender.tenderNo}</TableCell>
                  <TableCell>{tender.title}</TableCell>
                  <TableCell>{tender.customerId?.universityName || "N/A"}</TableCell>
                  <TableCell>{tender.ordersPlaced ? "Placed" : "Pending"}</TableCell>
                  <TableCell>{tender.totalAmountQuoted?.toLocaleString() || 0}</TableCell>
                  <TableCell>{tender.awardedAmount?.toLocaleString() || 0}</TableCell>
                  <TableCell>{tender.projectStatus || "N/A"}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => router.push(`/tenders/${tender._id}`)}>
                      <Visibility fontSize="small" color="primary" />
                    </IconButton>
                    <IconButton size="small" onClick={() => router.push(`/tenders/edit/${tender._id}`)}>
                      <Edit fontSize="small" color="action" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(tender._id)}>
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
          Showing {indexOfFirst + 1} - {Math.min(indexOfLast, filteredTenders.length)} of {filteredTenders.length}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          disabled={indexOfLast >= filteredTenders.length}
          onClick={() => setPage(prev => prev + 1)}
        >
          Next
        </Button>
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

export default TenderList;
