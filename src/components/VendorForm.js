'use client';
import React, { useState } from "react";
import {
  Container, Typography, TextField, Grid, Button, Card, CardContent,
  Divider, Box, Alert, CircularProgress, InputAdornment, Paper
} from "@mui/material";
import { styled } from '@mui/material/styles';
import axios from "axios";

// Custom styled components matching QuotationForm
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

const VendorForm = () => {
  const [formData, setFormData] = useState({
    name: "", 
    contactPerson: "", 
    phone: "", 
    email: "",
    address: "", 
    city: "", 
    country: "", 
    zipCode: "", 
    ntn: "", 
    remarks: ""
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Vendor name is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }
    
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
        `${process.env.NEXT_PUBLIC_API}/api/vendors`, 
        formData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: 'Vendor created successfully!' });
      
      // Reset form
      setFormData({
        name: "", contactPerson: "", phone: "", email: "",
        address: "", city: "", country: "", zipCode: "", ntn: "", remarks: ""
      });
      
    } catch (err) {
      console.error("Vendor creation failed", err);
      const errorMessage = err.response?.data?.message || "Failed to create vendor. Please try again.";
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", contactPerson: "", phone: "", email: "",
      address: "", city: "", country: "", zipCode: "", ntn: "", remarks: ""
    });
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Create New Vendor
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
                    label="Vendor Name *"
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
                    label="Contact Person"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Contact Information Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Contact Information</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
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
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Address Information Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Address Information</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                <Grid item xs={12}>
                  <StyledTextField
                    label="Street Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    label="ZIP/Postal Code"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Additional Information Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Additional Information</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="NTN Number"
                    name="ntn"
                    value={formData.ntn}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                    helperText="National Tax Number"
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    label="Remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    fullWidth
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                    helperText="Additional notes or comments about this vendor"
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
              {loading ? 'Creating Vendor...' : 'Create Vendor'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default VendorForm;