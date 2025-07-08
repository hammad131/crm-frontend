import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, Grid, Paper,
  Card, CardContent, Divider, IconButton, Box, MenuItem,
  FormControl, Select, InputAdornment, CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { jwtDecode } from 'jwt-decode';
import dotenv from "dotenv";
dotenv.config();

// Custom styled components (matching QuotationEditPage)
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

const InvoiceEditPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [invoiceRes, customersRes, quotationsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/invoices/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/customers`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/quotations`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setInvoice(invoiceRes.data);
        setCustomers(customersRes.data);
        setQuotations(quotationsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    setInvoice(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { 
        ...updatedItems[index], 
        [field]: field === 'qty' || field === 'unitPrice' || field === 'gst' 
          ? parseFloat(value) || 0 
          : value 
      };
      return { ...prev, items: updatedItems };
    });
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { 
          sNo: prev.items.length + 1, 
          description: '', 
          qty: 1,
          unitPrice: 0,
          gst: 0
        }
      ]
    }));
  };

  const removeItem = (index) => {
    if (invoice.items.length <= 1) return;
    setInvoice(prev => {
      const updatedItems = prev.items
        .filter((_, i) => i !== index)
        .map((item, idx) => ({ ...item, sNo: idx + 1 }));
      return { ...prev, items: updatedItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { invoiceDate, customerId, orderReference, items } = invoice;
      if (!invoiceDate || !customerId || !orderReference) {
        alert('Please fill all required fields.');
        setSaving(false);
        return;
      }

      const validItems = items.filter(item => item.description && item.qty > 0 && item.unitPrice > 0);
      if (validItems.length === 0) {
        alert('Please add at least one valid item with description, positive quantity, and price.');
        setSaving(false);
        return;
      }

      const calculatedItems = validItems.map(item => ({
        ...item,
        totalWithTax: (item.qty * item.unitPrice) + (item.gst || 0),
      }));

      const subTotal = calculatedItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
      const totalGST = calculatedItems.reduce((acc, item) => acc + (item.gst || 0), 0);
      const grandTotal = subTotal + totalGST;

      const updatedInvoice = {
        ...invoice,
        items: calculatedItems,
        subTotal,
        totalGST,
        grandTotal,
      };

      await axios.put(`${process.env.NEXT_PUBLIC_API}/api/invoices/${id}`, updatedInvoice, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/invoices/${id}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert(`Failed to update invoice: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/invoices');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert(`Failed to delete invoice: ${error.response?.data?.message || error.message}`);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!invoice) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Invoice not found</Typography>
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
        Edit Invoice: #{invoice.invoiceNo}
      </Typography>

      <Paper component="form" onSubmit={handleSubmit} elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Basic Information</SectionHeader>
                <Divider sx={{ mb: 3 }} />
                
                <TextField
                  label="Invoice Number"
                  name="invoiceNo"
                  value={invoice.invoiceNo}
                  fullWidth
                  disabled
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="Bill Number"
                  name="billNo"
                  value={invoice.billNo || ''}
                  fullWidth
                  disabled
                  sx={{ mb: 2 }}
                />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Customer
                  </Typography>
                  <Select
                    name="customerId"
                    value={invoice.customerId?._id || invoice.customerId || ''}
                    onChange={handleChange}
                    required
                  >
                    {customers.map(c => (
                      <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Order Reference (Quotation)
                  </Typography>
                  <Select
                    name="orderReference"
                    value={invoice.orderReference?._id || invoice.orderReference || ''}
                    onChange={handleChange}
                    required
                  >
                    {quotations.map(q => (
                      <MenuItem key={q._id} value={q._id}>{q.quoteNo || q._id}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Invoice Date"
                  name="invoiceDate"
                  type="date"
                  value={formatDateForInput(invoice.invoiceDate)}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Payment Status
                  </Typography>
                  <Select
                    name="status"
                    value={invoice.status || ''}
                    onChange={handleChange}
                  >
                    <MenuItem value="Not Paid">Not Paid</MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  label="Payment Instructions"
                  name="paymentInstructions"
                  value={invoice.paymentInstructions || ''}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Items */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <SectionHeader variant="h6">Items</SectionHeader>
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={addItem} 
                    variant="outlined" 
                    size="small"
                  >
                    Add Item
                  </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                {invoice.items.map((item, index) => (
                  <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <TextField 
                        label="Item Description" 
                        fullWidth 
                        value={item.description || ''} 
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        required
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={2}>
                      <TextField 
                        label="Quantity" 
                        type="number"
                        fullWidth 
                        value={item.qty || ''} 
                        onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                        required
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={2}>
                      <TextField 
                        label="Unit Price (PKR)" 
                        type="number"
                        fullWidth 
                        value={item.unitPrice || ''} 
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        required
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={2}>
                      <TextField 
                        label="GST (PKR)" 
                        type="number"
                        fullWidth 
                        value={item.gst || ''} 
                        onChange={(e) => handleItemChange(index, "gst", e.target.value)}
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={1}>
                      <IconButton 
                        onClick={() => removeItem(index)} 
                        disabled={invoice.items.length <= 1}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Total Preview */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Total Preview</SectionHeader>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {(() => {
                      const validItems = invoice.items.filter(item => item.description && item.qty > 0 && item.unitPrice > 0);
                      const subTotal = validItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
                      const totalGST = validItems.reduce((acc, item) => acc + (item.gst || 0), 0);
                      const grandTotal = subTotal + totalGST;
                      return (
                        <Box sx={{ p: 2 }}>
                          <Typography variant="body1">
                            Subtotal: Rs. <strong>{subTotal.toFixed(2)}</strong>
                          </Typography>
                          <Typography variant="body1">
                            Total GST: Rs. <strong>{totalGST.toFixed(2)}</strong>
                          </Typography>
                          <Typography variant="body1">
                            Grand Total: Rs. <strong>{grandTotal.toFixed(2)}</strong>
                          </Typography>
                        </Box>
                      );
                    })()}
                  </Grid>
                </Grid>
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

export default InvoiceEditPage;