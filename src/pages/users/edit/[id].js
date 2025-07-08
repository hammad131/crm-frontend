'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, Grid, Paper,
  Card, CardContent, Divider, Box, MenuItem, Select,
  FormControl, CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import dotenv from "dotenv";
dotenv.config();

// Custom styled components (matching InvoiceEditPage)
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const UserEditPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { name, email, password, role } = user;
      if (!name || !email) {
        alert('Please fill all required fields.');
        setSaving(false);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        setSaving(false);
        return;
      }

      // Password validation (only if provided)
      if (password && password.length < 6) {
        alert('Password must be at least 6 characters long.');
        setSaving(false);
        return;
      }

      const updatedUser = {
        name,
        email,
        role,
        ...(password && { password }) // Only include password if provided
      };

      await axios.put(`${process.env.NEXT_PUBLIC_API}/api/users/${id}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/users/${id}`);
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`Failed to update user: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">User not found</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, marginLeft: '240px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          variant="outlined"
        >
          Back
        </Button>
        <Box>
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            variant="outlined"
            color="error"
            sx={{ mr: 2 }}
          >
            Delete
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Edit User: {user.name}
      </Typography>

      <Paper component="form" onSubmit={handleSubmit} elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* User Information */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">User Information</SectionHeader>
                <Divider sx={{ mb: 3 }} />

                <TextField
                  label="Name"
                  name="name"
                  value={user.name || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={user.email || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={user.password || ''}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Leave blank to keep current password"
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Role
                  </Typography>
                  <Select
                    name="role"
                    value={user.role || 'user'}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            startIcon={<SaveIcon />}
            type="submit"
            variant="contained"
            size="large"
            disabled={saving}
            sx={{ px: 6 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserEditPage;