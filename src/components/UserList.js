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

import dotenv from "dotenv";
dotenv.config();
// import UserPdfGenerator from "./UserPdfGenerator"; // Placeholder for PDF generator component

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const entriesPerPage = 15;
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setUsers(sorted);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(prev => prev.filter(u => u._id !== id));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = page * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  return (
    <Box sx={{ padding: 3, borderRadius: 2, backgroundColor: "#fff", boxShadow: 2 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>Users</Typography>
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
              <TableCell sx={headerCell}>Name</TableCell>
              <TableCell sx={headerCell}>Email</TableCell>
              <TableCell sx={headerCell}>Role</TableCell>
              <TableCell sx={headerCell}>Created At</TableCell>
              <TableCell sx={headerCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentUsers.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>{user.name || "N/A"}</TableCell>
                <TableCell>{user.email || "N/A"}</TableCell>
                <TableCell>{user.role || "N/A"}</TableCell>
                <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => router.push(`/users/${user._id}`)}>
                    <Visibility fontSize="small" color="primary" />
                  </IconButton>
                  {/* <UserPdfGenerator user={user} />  */}
                  <IconButton size="small" onClick={() => router.push(`/users/edit/${user._id}`)}>
                    <Edit fontSize="small" color="action" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(user._id)}>
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
        <Typography variant="body2">Showing {indexOfFirst + 1}-{Math.min(indexOfLast, filteredUsers.length)} of {filteredUsers.length}</Typography>
        <Button variant="outlined" size="small" disabled={indexOfLast >= filteredUsers.length} onClick={() => setPage(prev => prev + 1)}>Next</Button>
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

export default UserList;