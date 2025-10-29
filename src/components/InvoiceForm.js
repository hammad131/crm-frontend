import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  Container, Typography, TextField, Grid, Button, MenuItem,
  InputLabel, Box, Card, CardContent, Divider, IconButton, Paper,
  FormControl
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';

// Custom styled components
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

const InvoiceForm = () => {
  const [formData, setFormData] = useState({
    invoiceDate: '',
    customerId: '',
    orderReference: '',
    tenderId: '',
    forCompany: 'Paktech',
    paymentInstructions: 'Make all checks payable to M/S. PAKTECH INSTRUMENTS COMPANY',
    status: 'Not Paid',
    items: [{ sNo: 1, description: '', qty: 1, unitPrice: 0, gst: 0 }],
  });
  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [tenderItems, setTenderItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [customersRes, quotationsRes, tendersRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/customers`, { headers }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/quotations`, { headers }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/tenders`, { headers }),
        ]);
        setCustomers(customersRes.data || []);
        setQuotations(quotationsRes.data || []);
        setTenders(tendersRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTenderItems = async () => {
      if (formData.tenderId) {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }
        try {
          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/tenders/${formData.tenderId}`, { headers });
          setTenderItems(response.data.items || []);
        } catch (error) {
          console.error('Failed to fetch tender items:', error);
          setTenderItems([]);
        }
      } else {
        setTenderItems([]);
      }
    };
    fetchTenderItems();
  }, [formData.tenderId]);

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index][name] = (name === 'qty' || name === 'unitPrice' || name === 'gst') 
      ? Math.max(0, parseFloat(value) || 0) 
      : value;
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { sNo: formData.items.length + 1, description: '', qty: 1, unitPrice: 0, gst: 0 }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, sNo: idx + 1 }));
    setFormData({ ...formData, items: newItems });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { invoiceDate, customerId, orderReference, items } = formData;
      if (!invoiceDate || !customerId || !orderReference) {
        alert('Please fill all required fields.');
        setLoading(false);
        return;
      }

      const validItems = items.filter(item => item.description && item.qty > 0 && item.unitPrice > 0);
      if (validItems.length === 0) {
        alert('Please add at least one valid item with description, positive quantity, and price.');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.id || decoded._id;

      const calculatedItems = validItems.map(item => ({
        ...item,
        totalWithTax: (item.qty * item.unitPrice) + (item.gst || 0),
      }));

      const subTotal = calculatedItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
      const totalGST = calculatedItems.reduce((acc, item) => acc + (item.gst || 0), 0);
      const grandTotal = subTotal + totalGST;

      const invoiceData = {
        ...formData,
        userId,
        items: calculatedItems,
        subTotal,
        totalGST,
        grandTotal,
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API}/api/invoices`, invoiceData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Invoice created successfully!');

      setFormData({
        invoiceDate: '',
        customerId: '',
        orderReference: '',
        tenderId: '',
        forCompany: 'Paktech',
        paymentInstructions: 'Make all checks payable to M/S. PAKTECH INSTRUMENTS COMPANY',
        status: 'Not Paid',
        items: [{ sNo: 1, description: '', qty: 1, unitPrice: 0, gst: 0 }],
      });
      setTenderItems([]);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert(`Failed to create invoice: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to strip HTML for display in dropdown
const stripHtml = (html = '') => html.replace(/<[^>]+>/g, '').trim();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Create New Invoice
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Basic Information</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <StyledTextField
                      select
                      label="Customer"
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    >
                      {customers.map((cust) => (
                        <MenuItem key={cust._id} value={cust._id}>{cust.name}</MenuItem>
                      ))}
                    </StyledTextField>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <StyledTextField
                      select
                      label="Order Reference (Quotation)"
                      name="orderReference"
                      value={formData.orderReference}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="">None</MenuItem>
                      {quotations.map((quote) => (
                        <MenuItem key={quote._id} value={quote._id}>{quote.quoteNo || quote._id}</MenuItem>
                      ))}
                    </StyledTextField>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <StyledTextField
                      select
                      label="Tender Reference"
                      name="tenderId"
                      value={formData.tenderId}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="">None</MenuItem>
                      {tenders.map((tender) => (
                        <MenuItem key={tender._id} value={tender._id}>{tender.title}</MenuItem>
                      ))}
                    </StyledTextField>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <StyledTextField
                      select
                      label="For Company"
                      name="forCompany"
                      value={formData.forCompany}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="Paktech">Paktech</MenuItem>
                      <MenuItem value="Link Lines">Link Lines</MenuItem>
                      <MenuItem value="Techno">Techno</MenuItem>
                    </StyledTextField>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Invoice Date"
                    name="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
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
                      label="Payment Status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="Not Paid">Not Paid</MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                      <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                    </StyledTextField>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    label="Payment Instructions"
                    name="paymentInstructions"
                    value={formData.paymentInstructions}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Items Section */}
          <StyledCard>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <SectionHeader variant="h5">Items</SectionHeader>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addItem}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  Add Item
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                {formData.items.map((item, index) => (
                  <Grid item xs={12} key={index}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        {formData.tenderId && tenderItems.length > 0 ? (
                          <FormControl fullWidth required>
                            <StyledTextField
                              select
                              label="Item Description"
                              name="description"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, e)}
                              InputLabelProps={{ shrink: true }}
                            >
                              <MenuItem value="">Select Description</MenuItem>
                              {tenderItems.map((tenderItem, idx) => (
                                <MenuItem key={idx} value={tenderItem.itemName}>
                                  {stripHtml(tenderItem.itemName)}
                                </MenuItem>
                              ))}
                            </StyledTextField>
                          </FormControl>
                        ) : (
                          <StyledTextField
                            label="Item Description"
                            name="description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, e)}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                          />
                        )}
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <StyledTextField
                          label="Quantity"
                          name="qty"
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, e)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <StyledTextField
                          label="Unit Price (PKR)"
                          name="unitPrice"
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, e)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <StyledTextField
                          label="GST (PKR)"
                          name="gst"
                          type="number"
                          value={item.gst}
                          onChange={(e) => handleItemChange(index, e)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <StyledTextField
                          label="Total with Tax (PKR)"
                          value={((item.qty * item.unitPrice) + (item.gst || 0)).toFixed(2)}
                          InputProps={{ readOnly: true }}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length <= 1}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Total Preview Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Total Preview</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                <Grid item xs={12}>
                  {(() => {
                    const validItems = formData.items.filter(item => item.description && item.qty > 0 && item.unitPrice > 0);
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
              {loading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default InvoiceForm;