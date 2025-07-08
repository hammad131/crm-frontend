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

const PurchaseOrderEditPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [purchaseOrderRes, vendorsRes, quotationsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/purchase-orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/vendors`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/quotations`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setPurchaseOrder(purchaseOrderRes.data);
        setVendors(vendorsRes.data);
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
    setPurchaseOrder(prev => ({
      ...prev,
      [name]: name === 'tax' || name === 'unitPriceMultiplier'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleShipToChange = (e) => {
    const { name, value } = e.target;
    setPurchaseOrder(prev => ({
      ...prev,
      shipTo: { ...prev.shipTo, [name]: value }
    }));
  };

  const handleItemChange = (index, field, value) => {
    setPurchaseOrder(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'qty' || field === 'unitPrice'
          ? parseFloat(value) || 0
          : value
      };
      return { ...prev, items: updatedItems };
    });
  };

  const addItem = () => {
    setPurchaseOrder(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          sNo: prev.items.length + 1,
          description: "",
          qty: 1,
          unitPrice: 0,
          totalPrice: 0
        }
      ]
    }));
  };

  const removeItem = (index) => {
    if (purchaseOrder.items.length <= 1) return;
    setPurchaseOrder(prev => {
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
      const validItems = purchaseOrder.items.filter(item => item.description && item.qty > 0 && item.unitPrice > 0);
      if (validItems.length === 0) {
        alert('Please add at least one valid item with description, positive quantity, and price.');
        setSaving(false);
        return;
      }

      const baseTotal = validItems.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
      const subTotal = baseTotal * (purchaseOrder.unitPriceMultiplier || 1);
      const taxAmount = subTotal * parseFloat(purchaseOrder.tax || 0);
      const grandTotal = subTotal + taxAmount;

      const updatedPurchaseOrder = {
        ...purchaseOrder,
        items: validItems.map(item => ({
          ...item,
          totalPrice: item.qty * item.unitPrice
        })),
        subTotal,
        tax: parseFloat(purchaseOrder.tax || 0),
        grandTotal,
        unitPriceMultiplier: parseFloat(purchaseOrder.unitPriceMultiplier || 1)
      };

      await axios.put(`${process.env.NEXT_PUBLIC_API}/api/purchase-orders/${id}`, updatedPurchaseOrder, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/purchase-orders/${id}`);
    } catch (error) {
      console.error('Error updating purchase order:', error);
      alert(`Failed to update purchase order: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this purchase order?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/purchase-orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/purchase-orders');
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      alert(`Failed to delete purchase order: ${error.response?.data?.message || error.message}`);
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

  if (!purchaseOrder) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Purchase Order not found</Typography>
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
        Edit Purchase Order: #{purchaseOrder.poNumber}
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
                  label="Purchase Order Number"
                  name="poNumber"
                  value={purchaseOrder.poNumber}
                  fullWidth
                  disabled
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Vendor
                  </Typography>
                  <Select
                    name="vendorId"
                    value={purchaseOrder.vendorId?._id || purchaseOrder.vendorId || ''}
                    onChange={handleChange}
                    required
                  >
                    {vendors.map(v => (
                      <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Quotation Reference
                  </Typography>
                  <Select
                    name="clientRefNo"
                    value={purchaseOrder.clientRefNo?._id || purchaseOrder.clientRefNo || ''}
                    onChange={handleChange}
                    required
                  >
                    {quotations.map(q => (
                      <MenuItem key={q._id} value={q._id}>{q.quoteNo}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Client Order Number"
                  name="clientOrderNo"
                  value={purchaseOrder.clientOrderNo || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Purchase Order Date"
                  name="poDate"
                  type="date"
                  value={formatDateForInput(purchaseOrder.poDate)}
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

                <TextField
                  label="Shipping Terms"
                  name="shippingTerms"
                  value={purchaseOrder.shippingTerms || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Shipping Method
                </Typography>
                <Select
                    name="shippingMethod"
                    value={purchaseOrder.shippingMethod || ''}
                    onChange={handleChange}
                >
                    <MenuItem value="By Air">By Air</MenuItem>
                    <MenuItem value="By Sea">By Sea</MenuItem>
                    <MenuItem value="Both By Air and Sea">Both By Air and Sea</MenuItem>
                </Select>
                </FormControl>
                

                <TextField
                  label="Delivery Date"
                  name="deliveryDate"
                  type="date"
                  value={formatDateForInput(purchaseOrder.deliveryDate)}
                  onChange={handleChange}
                  fullWidth
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
                        Mode
                      </Typography>
                      <Select
                        name="mode"
                        value={purchaseOrder.mode || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="F.O.R">F.O.R</MenuItem>
                        <MenuItem value="C&F">C&F</MenuItem>
                      </Select>
                    </FormControl>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Purchase Order Details */}
          {/* <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Purchase Order Details</SectionHeader>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                        Mode
                      </Typography>
                      <Select
                        name="mode"
                        value={purchaseOrder.mode || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="F.O.R">F.O.R</MenuItem>
                        <MenuItem value="C&F">C&F</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid> */}

          {/* Ship To */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Ship To</SectionHeader>
                <Divider sx={{ mb: 3 }} />

                <TextField
                  label="Name"
                  name="name"
                  value={purchaseOrder.shipTo?.name || ''}
                  onChange={handleShipToChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Address"
                  name="address"
                  value={purchaseOrder.shipTo?.address || ''}
                  onChange={handleShipToChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="City"
                  name="city"
                  value={purchaseOrder.shipTo?.city || ''}
                  onChange={handleShipToChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Zip Code"
                  name="zip"
                  value={purchaseOrder.shipTo?.zip || ''}
                  onChange={handleShipToChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Phone"
                  name="phone"
                  value={purchaseOrder.shipTo?.phone || ''}
                  onChange={handleShipToChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Fax"
                  name="fax"
                  value={purchaseOrder.shipTo?.fax || ''}
                  onChange={handleShipToChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Email"
                  name="email"
                  value={purchaseOrder.shipTo?.email || ''}
                  onChange={handleShipToChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Financial Information */}
          {/* <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Financial Information</SectionHeader>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Unit Price Multiplier"
                      name="unitPriceMultiplier"
                      type="number"
                      value={purchaseOrder.unitPriceMultiplier || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Tax (Decimal)"
                      name="tax"
                      type="number"
                      value={purchaseOrder.tax || ''}
                      onChange={handleChange}
                      fullWidth
                      helperText="Enter tax as a decimal (e.g., 0.13 for 13%)"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid> */}

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

                {purchaseOrder.items.map((item, index) => (
                  <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <TextField
                        label="Description"
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        fullWidth
                        required
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <TextField
                        label="Quantity"
                        type="number"
                        value={item.qty || ''}
                        onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                        fullWidth
                        required
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <TextField
                        label="Unit Price"
                        type="number"
                        value={item.unitPrice || ''}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        fullWidth
                        required
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={1}>
                      <IconButton
                        onClick={() => removeItem(index)}
                        disabled={purchaseOrder.items.length <= 1}
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

          {/* Terms and Conditions */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Terms and Conditions</SectionHeader>
                <Divider sx={{ mb: 3 }} />

                <TextField
                  label="Delivery Terms"
                  name="deliveryTerms"
                  value={purchaseOrder.deliveryTerms || ''}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Payment Terms"
                  name="paymentTerms"
                  value={purchaseOrder.paymentTerms || ''}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Warranty"
                  name="warranty"
                  value={purchaseOrder.warranty || ''}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Notes"
                  name="notes"
                  value={purchaseOrder.notes || ''}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows= "2"
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Import Duties and Taxes"
                  name="importDutiesTaxes"
                  value={purchaseOrder.importDutiesTaxes || ''}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows= "2"
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Inspection Terms"
                  name="inspectionTerms"
                  value={purchaseOrder.inspectionTerms || ''}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows= "2"
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Force Majeure"
                  name="forceMajeure"
                  value={purchaseOrder.forceMajeure || ''}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows= "2"
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Customs Compliance"
                  name="customsCompliance"
                  value={purchaseOrder.customsCompliance || ''}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows= "2"
                  sx={{ mb: 2 }}
                />
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

export default PurchaseOrderEditPage;