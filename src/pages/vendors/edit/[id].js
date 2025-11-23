'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import {
  Container, Typography, TextField, Grid, Button, Card, CardContent,
  Divider, Box, Alert, CircularProgress, InputAdornment, Paper,
  IconButton
} from "@mui/material";
import { styled } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from "axios";

// Custom styled components matching QuotationEdit
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

const VendorEditPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchVendor = async () => {
      if (!id) return;
      
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required' });
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/api/vendors/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVendor(response.data);
      } catch (err) {
        console.error("Failed to fetch vendor", err);
        setMessage({ 
          type: 'error', 
          text: err.response?.data?.message || 'Failed to load vendor details' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!vendor?.name?.trim()) newErrors.name = "Vendor name is required";
    if (vendor?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendor.email)) {
      newErrors.email = "Invalid email format";
    }
    if (vendor?.phone && !/^\+?[\d\s-()]{10,}$/.test(vendor.phone)) {
      newErrors.phone = "Invalid phone number format";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVendor(prev => ({ ...prev, [name]: value }));
    
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
        `${process.env.NEXT_PUBLIC_API}/api/vendors/${id}`,
        vendor,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: 'Vendor updated successfully!' });
      
      // Redirect to vendor details page after short delay
      setTimeout(() => {
        router.push(`/vendors/${id}`);
      }, 1500);
      
    } catch (err) {
      console.error("Vendor update failed", err);
      const errorMessage = err.response?.data?.message || "Failed to update vendor. Please try again.";
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: 'error', text: 'Authentication required' });
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/api/vendors/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: 'Vendor deleted successfully!' });
      
      // Redirect to vendors list after short delay
      setTimeout(() => {
        router.push('/vendors');
      }, 1500);
      
    } catch (err) {
      console.error("Vendor deletion failed", err);
      const errorMessage = err.response?.data?.message || "Failed to delete vendor. Please try again.";
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

  if (!vendor) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Vendor not found</Typography>
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
    <Container maxWidth="lg" sx={{ py: 4,marginLeft: "240px" }}>
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
            Delete Vendor
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
        Edit Vendor: {vendor.name}
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
                    value={vendor.name || ''}
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
                    label="Contact Person"
                    name="contactPerson"
                    value={vendor.contactPerson || ''}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
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
                    value={vendor.email || ''}
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
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Phone Number"
                    name="phone"
                    value={vendor.phone || ''}
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
                    value={vendor.address || ''}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    label="City"
                    name="city"
                    value={vendor.city || ''}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    label="Country"
                    name="country"
                    value={vendor.country || ''}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    label="ZIP/Postal Code"
                    name="zipCode"
                    value={vendor.zipCode || ''}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
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
                    value={vendor.ntn || ''}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                    InputLabelProps={{ shrink: true }}
                    helperText="National Tax Number"
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    label="Remarks"
                    name="remarks"
                    value={vendor.remarks || ''}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    fullWidth
                    disabled={saving}
                    InputLabelProps={{ shrink: true }}
                    helperText="Additional notes or comments about this vendor"
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

export default VendorEditPage;