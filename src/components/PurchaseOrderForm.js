import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  Container, Typography, TextField, Grid, Button, MenuItem,
  InputLabel, Box, Card, CardContent, Divider, IconButton, Paper,
  FormControl, Select
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';

import dotenv from "dotenv";
dotenv.config();
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

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  fontSize: '1rem',
  whiteSpace: 'normal',
  overflow: 'visible',
  textOverflow: 'unset',
  lineHeight: 1.5,
  marginBottom: theme.spacing(1),
}));

const PurchaseOrderForm = () => {
  const [formData, setFormData] = useState({
    poDate: '',
    vendorId: '',
    clientRefNo: '',
    clientOrderNo: '',
    mode: 'F.O.R',
    shipTo: { name: '', address: '', city: '', zip: '', phone: '', fax: '', email: '' },
    shippingTerms: '',
    shippingMethod: '',
    deliveryDate: '',
    items: [{ sNo: 1, description: '', qty: 1, unitPrice: 0, totalPrice: 0 }],
    subTotal: 0,
    grandTotal: 0,
    deliveryTerms: '12-16 weeks after confirmed order',
    paymentTerms: '100% via Irrevocable L/c at sight',
    warranty: 'The equipment shall be covered by a 12 Months warranty, commencing after two weeks from the date of delivery.',
    notes: 'We are highly anticipating this partnership and we’re looking forward to working with you.',
    importDutiesTaxes: 'Including all duties and Taxes, GST mentioned separately.',
    inspectionTerms: 'The Buyer shall inspect the equipment upon delivery and notify the Seller of any defects or discrepancies within five days.',
    forceMajeure: 'Paktech will not be liable for any failure to perform due to unforeseen circumstances beyond our control.',
    customsCompliance: 'The Buyer shall comply with all applicable customs regulations and provide necessary documentation if applicable.',
  });
  const [vendors, setVendors] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [vendorsRes, quotationsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/vendors`, { headers }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/quotations`, { headers }),
        ]);
        setVendors(vendorsRes.data);
        setQuotations(quotationsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index][name] = (name === 'qty' || name === 'unitPrice') 
      ? Math.max(0, parseFloat(value) || 0) 
      : value;
    if (name === 'qty' || name === 'unitPrice') {
      updatedItems[index].totalPrice = (updatedItems[index].qty || 0) * (updatedItems[index].unitPrice || 0);
    }
    setFormData({ ...formData, items: updatedItems });
    console.log('Updated Items:', updatedItems);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { sNo: formData.items.length + 1, description: '', qty: 1, unitPrice: 0, totalPrice: 0 }],
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
    if (name === 'tax' || name === 'unitPriceMultiplier') {
      const newValue = parseFloat(value) || 0;
      setFormData((prev) => ({ ...prev, [name]: newValue }));
      console.log(`Updated ${name}:`, newValue);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleShipToChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      shipTo: { ...prev.shipTo, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { poDate, vendorId, mode, items, paymentTerms } = formData;
      if (!poDate || !vendorId || !mode || !paymentTerms) {
        alert('Please fill all required fields.');
        setLoading(false);
        return;
      }

      const validItems = items.filter(item => item.description && item.qty > 0 && item.unitPrice > 0);
      if (validItems.length === 0) {
        alert('Please add at least one valid item with positive quantity and price.');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.id || decoded._id;

      // Calculate totals
      const baseTotal = validItems.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
      const subTotal = baseTotal * (formData.unitPriceMultiplier || 1);
      const taxAmount = subTotal * parseFloat(formData.tax || 0);
      const grandTotal = subTotal + taxAmount;

      const purchaseOrderData = {
        ...formData,
        userId,
        items: validItems,
        subTotal,
        grandTotal,
        tax: parseFloat(formData.tax || 0),
      };

      console.log('Purchase Order Data Sent:', {
        subTotal,
        unitPriceMultiplier: formData.unitPriceMultiplier,
        taxAmount,
        grandTotal,
        items: validItems,
      });

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/api/purchase-orders`, purchaseOrderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Backend Response:', response.data);

      alert('Purchase Order created successfully!');

      // Reset form
      setFormData({
        poDate: '',
        vendorId: '',
        clientRefNo: '',
        clientOrderNo: '',
        mode: 'F.O.R',
        shipTo: { name: '', address: '', city: '', zip: '', phone: '', fax: '', email: '' },
        shippingTerms: '',
        shippingMethod: '',
        deliveryDate: '',
        items: [{ sNo: 1, description: '', qty: 1, unitPrice: 0, totalPrice: 0 }],
        subTotal: 0,
        grandTotal: 0,
        deliveryTerms: '12-16 weeks after confirmed order',
        paymentTerms: '100% via Irrevocable L/c at sight',
        warranty: 'The equipment shall be covered by a 12 Months warranty, commencing after two weeks from the date of delivery.',
        notes: 'We are highly anticipating this partnership and we’re looking forward to working with you.',
        importDutiesTaxes: 'Including all duties and Taxes, GST mentioned separately.',
        inspectionTerms: 'The Buyer shall inspect the equipment upon delivery and notify the Seller of any defects or discrepancies within five days.',
        forceMajeure: 'Paktech will not be liable for any failure to perform due to unforeseen circumstances beyond our control.',
        customsCompliance: 'The Buyer shall comply with all applicable customs regulations and provide necessary documentation if applicable.',

      });
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert(`Failed to create purchase order: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatLabel = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .replace(/(\b\w)/g, s => s.toUpperCase());
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Create New Purchase Order
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
                      label="Vendor"
                      name="vendorId"
                      value={formData.vendorId}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    >
                      {vendors.map((vendor) => (
                        <MenuItem key={vendor._id} value={vendor._id}>{vendor.name}</MenuItem>
                      ))}
                    </StyledTextField>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <StyledTextField
                      select
                      label="Quotation Reference"
                      name="clientRefNo"
                      value={formData.clientRefNo}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    >
                      {quotations.map((quote) => (
                        <MenuItem key={quote._id} value={quote._id}>{quote.quoteNo}</MenuItem>
                      ))}
                    </StyledTextField>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Purchase Order Date"
                    name="poDate"
                    type="date"
                    value={formData.poDate}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Client Order Number"
                    name="clientOrderNo"
                    value={formData.clientOrderNo}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <StyledTextField
                      select
                      label="Mode"
                      name="mode"
                      value={formData.mode}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="F.O.R">F.O.R</MenuItem>
                      <MenuItem value="C&F">C&F</MenuItem>
                    </StyledTextField>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Delivery Date"
                    name="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Shipping Terms"
                    name="shippingTerms"
                    value={formData.shippingTerms}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <StyledTextField
                      select
                      label="Shipping Method"
                      name="shippingMethod"
                      value={formData.shippingMethod}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="By Air">By Air</MenuItem>
                      <MenuItem value="By Sea">By Sea</MenuItem>
                      <MenuItem value="Both By Air and Sea">Both By Air and Sea</MenuItem>
                    </StyledTextField>
                  </FormControl>
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Ship To Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Ship To</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Name"
                    name="name"
                    value={formData.shipTo.name}
                    onChange={handleShipToChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Address"
                    name="address"
                    value={formData.shipTo.address}
                    onChange={handleShipToChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="City"
                    name="city"
                    value={formData.shipTo.city}
                    onChange={handleShipToChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Zip Code"
                    name="zip"
                    value={formData.shipTo.zip}
                    onChange={handleShipToChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Phone"
                    name="phone"
                    value={formData.shipTo.phone}
                    onChange={handleShipToChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Fax"
                    name="fax"
                    value={formData.shipTo.fax}
                    onChange={handleShipToChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Email"
                    name="email"
                    value={formData.shipTo.email}
                    onChange={handleShipToChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Financial Information Section */}
          {/* <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Financial Information</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Tax (Decimal)"
                    name="tax"
                    type="number"
                    value={formData.tax}
                    onChange={handleChange}
                    fullWidth
                    helperText="Enter tax as a decimal (e.g., 0.13 for 13%)"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Unit Price Multiplier"
                    name="unitPriceMultiplier"
                    type="number"
                    value={formData.unitPriceMultiplier}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard> */}

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
                        <StyledTextField
                          label="Description"
                          name="description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, e)}
                          fullWidth
                          required
                          InputLabelProps={{ shrink: true }}
                        />
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
                          label={`Unit Price (${formData.mode === 'F.O.R' ? 'PKR' : 'USD'})`}
                          name="unitPrice"
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, e)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      {/* <Grid item xs={12} sm={2}>
                        <StyledTextField
                          label={`Total Price (${formData.mode === 'F.O.R' ? 'PKR' : 'USD'})`}
                          name="totalPrice"
                          value={item.totalPrice.toFixed(2)}
                          InputProps={{ readOnly: true }}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid> */}
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

          {/* Terms and Conditions Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Terms and Conditions</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Delivery Terms"
                    name="deliveryTerms"
                    value={formData.deliveryTerms}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <StyledTextField
                      select
                      label="Payment Terms"
                      name="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="100% via Irrevocable L/c at sight">100% via Irrevocable L/c at sight</MenuItem>
                      <MenuItem value="50% advanced & 50% at the time of delivery">50% advanced & 50% at the time of delivery</MenuItem>
                      <MenuItem value="100% after delivery">100% after delivery</MenuItem>
                    </StyledTextField>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Warranty"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Import Duties and Taxes"
                    name="importDutiesTaxes"
                    value={formData.importDutiesTaxes}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Inspection Terms"
                    name="inspectionTerms"
                    value={formData.inspectionTerms}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Force Majeure"
                    name="forceMajeure"
                    value={formData.forceMajeure}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Customs Compliance"
                    name="customsCompliance"
                    value={formData.customsCompliance}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
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
                    const baseTotal = validItems.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
                    const subTotal = baseTotal * (formData.unitPriceMultiplier || 1);
                    const taxAmount = subTotal * parseFloat(formData.tax || 0);
                    const grandTotal = subTotal + taxAmount;
                    const currencySymbol = formData.mode === 'F.O.R' ? 'Rs.' : '$';
                    return (
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body1">
                          Subtotal: {currencySymbol} <strong>{subTotal.toFixed(2)}</strong>
                        </Typography>
                        {/* <Typography variant="body1">
                          Tax Amount ({(formData.tax * 100).toFixed(0)}%): {currencySymbol} <strong>{taxAmount.toFixed(2)}</strong>
                        </Typography> */}
                        <Typography variant="body1">
                          Grand Total: {currencySymbol} <strong>{grandTotal.toFixed(2)}</strong>
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
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default PurchaseOrderForm;