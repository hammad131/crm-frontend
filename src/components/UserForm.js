import React, { useState } from 'react';
import axios from 'axios';
import {
  Container, Typography, TextField, Grid, Button, MenuItem,
  Box, Card, CardContent, Divider, FormControl, Select,Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import dotenv from "dotenv";
dotenv.config();

// Custom styled components (adapted from InvoiceForm)
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const FormGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  minWidth: '300px',
  '& .MuiInputBase-root': {
    width: '100%',
  },
  '& .MuiInputLabel-root': {
    whiteSpace: 'normal',
    lineHeight: 1.2,
    overflow: 'visible',
    fontSize: '1rem',
  },
}));

const UserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { name, email, password, role } = formData;
      if (!name || !email || !password) {
        alert('Please fill all required fields.');
        setLoading(false);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      // Password length validation
      if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const userData = {
        name,
        email,
        password,
        role,
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API}/api/users`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('User created successfully!');

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
      });
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Failed to create user: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Create New User
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* User Information Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">User Information</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <StyledTextField
                      select
                      label="Role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </StyledTextField>
                  </FormControl>
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Submission */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ px: 6 }}
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default UserForm;