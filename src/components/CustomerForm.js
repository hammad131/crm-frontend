'use client';
import React, { useState } from "react";
import {
  Container, Typography, TextField, Grid, Button, Card, CardContent,
  Divider, Box, Alert, CircularProgress, InputAdornment, Paper
} from "@mui/material";
import { styled } from '@mui/material/styles';
import axios from "axios";

// Custom styled components matching VendorForm
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
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

const SectionHeader = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const FormGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const CustomerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    universityName: "",
    universityPrefix: "",
    departmentName: "",
    departmentPrefix: "",
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Customer name is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }
    if (!formData.universityName.trim()) newErrors.universityName = "University name is required";
    if (!formData.departmentName.trim()) newErrors.departmentName = "Department name is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix form errors before submitting' });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: 'error', text: 'Authentication required. Please login again.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/customers`, 
        formData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: 'Customer created successfully!' });
      
      // Reset form
      setFormData({
        name: "", email: "", phone: "", address: "",
        universityName: "", universityPrefix: "",
        departmentName: "", departmentPrefix: ""
      });
      
    } catch (err) {
      console.error("Customer creation failed", err);
      const errorMessage = err.response?.data?.message || "Failed to create customer. Please try again.";
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", email: "", phone: "", address: "",
      universityName: "", universityPrefix: "",
      departmentName: "", departmentPrefix: ""
    });
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/(\b\w)/g, s => s.toUpperCase());
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Create New Customer
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        {message.text && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 3 }}
            onClose={() => setMessage({ type: '', text: '' })}
          >
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Basic Information</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Customer Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">📞</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">📧</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* University Information Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">University Information</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <StyledTextField
                    label="University Name *"
                    name="universityName"
                    value={formData.universityName}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.universityName}
                    helperText={errors.universityName}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    label="University Prefix"
                    name="universityPrefix"
                    value={formData.universityPrefix}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                    helperText="Short code or abbreviation"
                  />
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Department Information Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Department Information</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <StyledTextField
                    label="Department Name *"
                    name="departmentName"
                    value={formData.departmentName}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.departmentName}
                    helperText={errors.departmentName}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    label="Department Prefix"
                    name="departmentPrefix"
                    value={formData.departmentPrefix}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                    helperText="Short code or abbreviation"
                  />
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={resetForm}
              disabled={loading}
              sx={{ px: 4 }}
            >
              Reset Form
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ px: 6 }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Creating Customer...' : 'Create Customer'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CustomerForm;