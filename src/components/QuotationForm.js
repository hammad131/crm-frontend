import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  Container, Typography, TextField, Grid, Button, MenuItem,
  InputLabel, Box, Card, CardContent, Divider, IconButton, Paper,
  FormControl, Select, Tabs, Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Custom styled components
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

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  fontSize: '1rem',
  whiteSpace: 'normal',
  overflow: 'visible',
  textOverflow: 'unset',
  lineHeight: 1.5,
  marginBottom: theme.spacing(1),
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const FormGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

// TipTap Editor Component
const TipTapEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <Box sx={{ width: '100%' }}>
      <StyledInputLabel shrink>Item Description</StyledInputLabel>
      <Box sx={{ 
        border: '1px solid rgba(0, 0, 0, 0.23)',
        borderRadius: '4px',
        padding: '8px',
        minHeight: '56px',
        '& .ProseMirror': {
          minHeight: '56px',
          padding: '14.5px 14px',
          '&:focus': {
            outline: 'none',
            borderColor: 'primary.main',
          },
        },
      }}>
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};

// TipTap Toolbar Component
const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 1, 
      mb: 1, 
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      pb: 1,
    }}>
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        variant={editor.isActive('bold') ? 'contained' : 'outlined'}
        size="small"
      >
        Bold
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        variant={editor.isActive('italic') ? 'contained' : 'outlined'}
        size="small"
      >
        Italic
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        variant={editor.isActive('bulletList') ? 'contained' : 'outlined'}
        size="small"
      >
        Bullet List
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        variant={editor.isActive('orderedList') ? 'contained' : 'outlined'}
        size="small"
      >
        Numbered List
      </Button>
    </Box>
  );
};

// Utility function to check if HTML content is non-empty
const isValidItemDescription = (html) => {
  if (typeof html !== 'string') return false;
  const textContent = html.replace(/<[^>]+>/g, '').trim();
  return textContent.length > 0;
};

const QuotationForm = () => {
  const [formData, setFormData] = useState({
    tenderId: '',
    customerId: '',
    quoteDate: '',
    tax: 0.13,
    delivery: '',
    warranty: '',
    coOrigin: [''],
    principal: [''],
    paymentTerms: '',
    approvedBy: '',
    oemSpecification: '',
    mode: 'F.O.R',
    modeOtherText: '',
    quoteValidityDays: 0,
    unitPriceMultiplier: 1,
    currencyUnit: '',
    forCompany: 'Paktech',
    items: [{ sNo: 1, refNo: "", item: '', qty: 1, unitPrice: 0 }],
  });
  const [tenders, setTenders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tenderItems, setTenderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        console.error('No token found');
        return;
      }
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [tendersRes, customersRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/tenders`, { headers }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/customers`, { headers }),
        ]);
        setTenders(tendersRes.data || []);
        setCustomers(customersRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTenderItems = async () => {
      if (formData.tenderId) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          console.error('No token found');
          return;
        }
        try  {
          if (formData.tenderId != "None"){
          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/tenders/${formData.tenderId}`, { headers });
          setTenderItems(response.data.items || []);
          }
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
    updatedItems[index][name] = (name === 'qty' || name === 'unitPrice') 
      ? Math.max(0, parseFloat(value) || 0) 
      : value;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleArrayChange = (field, index, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    setFormData({ ...formData, [field]: updatedArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length <= 1) return;
    const updatedArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updatedArray });
  };

  const addItem = () => {
    const newItems = [...formData.items, { 
      sNo: formData.items.length + 1, 
      refNo: "", 
      item: '', 
      qty: 1, 
      unitPrice: 0 
    }];
    setFormData({ ...formData, items: newItems });
    setActiveTab(newItems.length - 1);
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, sNo: idx + 1 }));
    setFormData({ ...formData, items: newItems });
    if (activeTab >= index && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tax' || name === 'quoteValidityDays' || name === 'unitPriceMultiplier') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'tender');
    data.append('folder', 'tender_system');
    const res = await axios.post('https://api.cloudinary.com/v1_1/dnfxaju5y/auto/upload', data);
    return res.data.secure_url;
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      try {
        const url = await uploadToCloudinary(files[0]);
        setFormData((prev) => ({ ...prev, [name]: url }));
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { customerId, quoteDate, items } = formData;
      if (!customerId || !quoteDate) {
        alert('Please fill all required fields.');
        setLoading(false);
        return;
      }

      const validItems = items.filter(item => isValidItemDescription(item.item) && item.qty > 0 && item.unitPrice > 0);
      if (validItems.length === 0) {
        alert('Please add at least one valid item with a description, positive quantity, and price.');
        setLoading(false);
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        alert('User not authenticated. Please login again.');
        setLoading(false);
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.id || decoded._id;

      const subTotal = validItems.reduce((acc, item) => acc + item.qty * item.unitPrice / (formData.unitPriceMultiplier || 1), 0);
      const taxAmount = subTotal * parseFloat(formData.tax || 0);
      const grandTotal = subTotal + taxAmount;

      const quotationData = {
        ...formData,
        userId,
        items: validItems,
        quoteAmount: grandTotal,
        subTotal,
        tax: parseFloat(formData.tax || 0),
        grandTotal,
        coOrigin: formData.coOrigin.filter(co => co),
        principal: formData.principal.filter(p => p),
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API}/api/quotations`, quotationData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Quotation created successfully!');

      setFormData({
        tenderId: '',
        customerId: '',
        quoteDate: '',
        tax: 0.13,
        delivery: '',
        warranty: '',
        coOrigin: [''],
        principal: [''],
        paymentTerms: '',
        approvedBy: '',
        oemSpecification: '',
        mode: 'F.O.R',
        modeOtherText: '',
        quoteValidityDays: 0,
        unitPriceMultiplier: 1,
        currencyUnit: '',
        forCompany: 'Paktech',
        items: [{ sNo: 1, refNo: '', item: '', qty: 1, unitPrice: 0 }],
      });
      setActiveTab(0);
      setTenderItems([]);
    } catch (error) {
      console.error('Error creating quotation:', error);
      alert(`Failed to create quotation: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatLabel = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .replace(/(\b\w)/g, s => s.toUpperCase());
  };

  // Helper to strip HTML for display in dropdown
const stripHtml = (html = '') => html.replace(/<[^>]+>/g, '').trim();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Create New Quotation
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
                      label="Tender"
                      name="tenderId"
                      value={formData.tenderId}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="None">None</MenuItem>
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
                  <StyledTextField
                    label="Quotation Date"
                    name="quoteDate"
                    type="date"
                    value={formData.quoteDate}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Delivery Details"
                    name="delivery"
                    value={formData.delivery}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Warranty"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Payment Terms"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
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
                      <MenuItem value="Other">Other</MenuItem>
                    </StyledTextField>
                  </FormControl>
                </Grid>
                {formData.mode === 'Other' && (
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Other Mode"
                      name="modeOtherText"
                      value={formData.modeOtherText}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Quote Validity (Days)"
                    name="quoteValidityDays"
                    type="number"
                    value={formData.quoteValidityDays}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <StyledTextField
                      select
                      label="For Company"
                      name="forCompany"
                      value={formData.forCompany}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="Paktech">Paktech</MenuItem>
                      <MenuItem value="LinkLines">Link Lines</MenuItem>
                      <MenuItem value="Techno">Techno</MenuItem>
                    </StyledTextField>
                  </FormControl>
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Financial Information Section */}
          <StyledCard>
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
                    label="Net Price Multiplier"
                    name="unitPriceMultiplier"
                    type="number"
                    value={formData.unitPriceMultiplier}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Currency Unit"
                    name="currencyUnit"
                    value={formData.currencyUnit}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Countries of Origin Section */}
          <StyledCard>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <SectionHeader variant="h5">Countries of Origin</SectionHeader>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => addArrayItem('coOrigin')}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  Add Country
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                {formData.coOrigin.map((co, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <StyledTextField
                        label={`Country of Origin ${index + 1}`}
                        value={co}
                        onChange={(e) => handleArrayChange('coOrigin', index, e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                      <IconButton
                        onClick={() => removeArrayItem('coOrigin', index)}
                        disabled={formData.coOrigin.length <= 1}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Principals Section */}
          <StyledCard>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <SectionHeader variant="h5">Principals</SectionHeader>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => addArrayItem('principal')}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  Add Principal
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                {formData.principal.map((p, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <StyledTextField
                        label={`Principal ${index + 1}`}
                        value={p}
                        onChange={(e) => handleArrayChange('principal', index, e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                      <IconButton
                        onClick={() => removeArrayItem('principal', index)}
                        disabled={formData.principal.length <= 1}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Documents Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Documents</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              <FormGrid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StyledInputLabel>OEM Quotation</StyledInputLabel>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<AddIcon />}
                    sx={{ textTransform: 'none', justifyContent: 'flex-start', mb: 1 }}
                  >
                    {formData.oemSpecification ? 'Change File' : 'Select File'}
                    <input
                      type="file"
                      name="oemSpecification"
                      accept="application/pdf,image/*"
                      onChange={handleFileChange}
                      hidden
                    />
                  </Button>
                  {formData.oemSpecification && (
                    <Typography variant="caption" color="success.main">
                      {formData.oemSpecification.split('/').pop()}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledInputLabel>Approved By</StyledInputLabel>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<AddIcon />}
                    sx={{ textTransform: 'none', justifyContent: 'flex-start', mb: 1 }}
                  >
                    {formData.approvedBy ? 'Change File' : 'Select File'}
                    <input
                      type="file"
                      name="approvedBy"
                      accept="application/pdf,image/*"
                      onChange={handleFileChange}
                      hidden
                    />
                  </Button>
                  {formData.approvedBy && (
                    <Typography variant="caption" color="success.main">
                      {formData.approvedBy.split('/').pop()}
                    </Typography>
                  )}
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
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 3 }}
              >
                {formData.items.map((item, index) => (
                  <Tab label={`Item ${item.sNo}`} key={index} />
                ))}
              </Tabs>
              {formData.items.map((item, index) => (
                <Box key={index} sx={{ display: activeTab === index ? 'block' : 'none' }}>
                  <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <StyledTextField
                          label="Model No"
                          name="refNo"
              
                          value={item.refNo}
                          onChange={(e) => handleItemChange(index, e)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                        <StyledTextField
                          label="Quantity"
                          name="qty"
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, e)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                        <StyledTextField
                          label={`Unit Price (${formData.currencyUnit || 'Currency'})`}
                          name="unitPrice"
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, e)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      {formData.tenderId && tenderItems.length > 0 ? (
                        <FormControl fullWidth>
                          <StyledTextField
                            select
                            label="Item Description"
                            name="item"
                            value={item.item}
                            onChange={(e) => handleItemChange(index, e)}
                            InputLabelProps={{ shrink: true }}
                          >
                            <MenuItem value="">Select Description</MenuItem>
                            {tenderItems.map((tenderItem, idx) => (
                              <MenuItem key={idx} value={tenderItem.item}>
                                {stripHtml(tenderItem.item)}
                              </MenuItem>
                            ))}
                          </StyledTextField>
                        </FormControl>
                      ) : (
                        <TipTapEditor
                          content={item.item}
                          onChange={(value) => handleItemChange(index, { target: { name: 'item', value } })}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <IconButton
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length <= 1}
                        color="error"
                        sx={{ mt: 3 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
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
                    const validItems = formData.items.filter(item => 
                      isValidItemDescription(item.item) && item.qty > 0 && item.unitPrice > 0
                    );
                    const subTotal = validItems.reduce((acc, item) => 
                      acc + item.qty * item.unitPrice / (formData.unitPriceMultiplier || 1), 0
                    );
                    const taxAmount = subTotal * parseFloat(formData.tax || 0);
                    const grandTotal = subTotal + taxAmount;
                    return (
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body1">
                          Subtotal: {formData.currencyUnit || 'Currency'} <strong>{subTotal.toFixed(2)}</strong>
                        </Typography>
                        <Typography variant="body1">
                          Tax Amount ({(formData.tax * 100).toFixed(0)}%): {formData.currencyUnit || 'Currency'} <strong>{taxAmount.toFixed(2)}</strong>
                        </Typography>
                        <Typography variant="body1">
                          Grand Total: {formData.currencyUnit || 'Currency'} <strong>{grandTotal.toFixed(2)}</strong>
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
              {loading ? 'Creating...' : 'Create Quotation'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default QuotationForm;