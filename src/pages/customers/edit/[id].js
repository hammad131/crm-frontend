'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import {
  Container, Typography, TextField, Grid, Button, Card, CardContent,
  Divider, Box, Alert, CircularProgress, InputAdornment, Paper
} from "@mui/material";
import { styled } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from "axios";

// Custom styled components matching VendorEdit
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

const CustomerEditPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;
      
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required' });
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/api/customers/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCustomer(response.data);
      } catch (err) {
        console.error("Failed to fetch customer", err);
        setMessage({ 
          type: 'error', 
          text: err.response?.data?.message || 'Failed to load customer details' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!customer?.name?.trim()) newErrors.name = "Customer name is required";
    if (customer?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      newErrors.email = "Invalid email format";
    }
    if (customer?.phone && !/^\+?[\d\s-()]{10,}$/.test(customer.phone)) {
      newErrors.phone = "Invalid phone number format";
    }
    if (!customer?.universityName?.trim()) newErrors.universityName = "University name is required";
    if (!customer?.departmentName?.trim()) newErrors.departmentName = "Department name is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix form errors before saving' });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: 'error', text: 'Authentication required. Please login again.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API}/api/customers/${id}`,
        customer,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: 'Customer updated successfully!' });
      
      // Redirect to customer details page after short delay
      setTimeout(() => {
        router.push(`/customers/${id}`);
      }, 1500);
      
    } catch (err) {
      console.error("Customer update failed", err);
      const errorMessage = err.response?.data?.message || "Failed to update customer. Please try again.";
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: 'error', text: 'Authentication required' });
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/api/customers/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: 'Customer deleted successfully!' });
      
      // Redirect to customers list after short delay
      setTimeout(() => {
        router.push('/customers');
      }, 1500);
      
    } catch (err) {
      console.error("Customer deletion failed", err);
      const errorMessage = err.response?.data?.message || "Failed to delete customer. Please try again.";
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!customer) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Customer not found</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, marginLeft: "240px" }}>
      {/* Header with Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          variant="contained"
          color="primary"
        >
          Back
        </Button>
        <Box>
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ mr: 2 }}
          >
            Delete Customer
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

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Edit Customer: {customer.name}
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
                    value={customer.name || ''}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={saving}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Phone Number"
                    name="phone"
                    value={customer.phone || ''}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone}
                    disabled={saving}
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
                    value={customer.email || ''}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={saving}
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
                    value={customer.address || ''}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    disabled={saving}
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
                    value={customer.universityName || ''}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.universityName}
                    helperText={errors.universityName}
                    disabled={saving}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    label="University Prefix"
                    name="universityPrefix"
                    value={customer.universityPrefix || ''}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
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
                    value={customer.departmentName || ''}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.departmentName}
                    helperText={errors.departmentName}
                    disabled={saving}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    label="Department Prefix"
                    name="departmentPrefix"
                    value={customer.departmentPrefix || ''}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                    InputLabelProps={{ shrink: true }}
                    helperText="Short code or abbreviation"
                  />
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => router.back()}
              disabled={saving}
              sx={{ px: 4 }}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={saving}
              sx={{ px: 6 }}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CustomerEditPage;