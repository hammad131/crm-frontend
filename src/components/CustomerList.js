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


const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const entriesPerPage = 15;
  const router = useRouter();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/customers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCustomers(sorted);
        setFilteredCustomers(sorted);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email?.toLowerCase().includes(search.toLowerCase()) ||
      customer.universityName?.toLowerCase().includes(search.toLowerCase()) ||
      customer.departmentName?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCustomers(filtered);
    setPage(1);
  }, [search, customers]);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomers(prev => prev.filter(c => c._id !== id));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const indexOfLast = page * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);

  return (
    <Box sx={{ padding: 3, borderRadius: 2, backgroundColor: "#fff", boxShadow: 2 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Customers
        </Typography>
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
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: 14, position: "sticky", top: 0, backgroundColor: "#1565c0", zIndex: 1 }}>
                  Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: 14, position: "sticky", top: 0, backgroundColor: "#1565c0", zIndex: 1 }}>
                  Email
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: 14, position: "sticky", top: 0, backgroundColor: "#1565c0", zIndex: 1 }}>
                  University
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: 14, position: "sticky", top: 0, backgroundColor: "#1565c0", zIndex: 1 }}>
                  Department
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: 14, position: "sticky", top: 0, backgroundColor: "#1565c0", zIndex: 1 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentCustomers.map((customer) => (
                <TableRow key={customer._id} hover>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.universityName}</TableCell>
                  <TableCell>{customer.departmentName}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => router.push(`/customers/${customer._id}`)}>
                      <Visibility fontSize="small" color="primary" />
                    </IconButton>
                    <IconButton size="small" onClick={() => router.push(`/customers/edit/${customer._id}`)}>
                      <Edit fontSize="small" color="action" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(customer._id)}>
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
          Showing {indexOfFirst + 1} - {Math.min(indexOfLast, filteredCustomers.length)} of {filteredCustomers.length}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          disabled={indexOfLast >= filteredCustomers.length}
          onClick={() => setPage(prev => prev + 1)}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default CustomerList;
