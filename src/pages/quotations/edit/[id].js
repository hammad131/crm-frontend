import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, Grid, Paper,
  Card, CardContent, Divider, IconButton, Box, MenuItem,
  FormControl, Select, InputAdornment, CircularProgress,
  Tabs, Tab
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AttachFile as AttachFileIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { jwtDecode } from 'jwt-decode';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import dotenv from "dotenv";
dotenv.config();

// Custom styled components
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

const StyledInputLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  whiteSpace: 'normal',
  overflow: 'visible',
  textOverflow: 'unset',
  lineHeight: 1.5,
  marginBottom: theme.spacing(1),
  fontWeight: 500,
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
      <StyledInputLabel>Item Description</StyledInputLabel>
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

const QuotationEditPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenders, setTenders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [quotationRes, tendersRes, customersRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/quotations/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/tenders`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/customers`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setQuotation(quotationRes.data);
        setTenders(tendersRes.data);
        setCustomers(customersRes.data);
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
    setQuotation(prev => ({
      ...prev,
      [name]: name === 'tax' || name === 'quoteValidityDays' || name === 'unitPriceMultiplier' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setQuotation(prev => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = value;
      return { ...prev, [field]: updatedArray };
    });
  };

  const addArrayItem = (field) => {
    setQuotation(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    if (quotation[field].length <= 1) return;
    setQuotation(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setQuotation(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { 
        ...updatedItems[index], 
        [field]: field === 'qty' || field === 'unitPrice' || field === 'refNo' 
          ? parseFloat(value) || 0 
          : value 
      };
      return { ...prev, items: updatedItems };
    });
  };

  const addItem = () => {
    setQuotation(prev => {
      const newItems = [
        ...prev.items,
        { 
          sNo: prev.items.length + 1, 
          refNo: 0,
          item: '', 
          qty: 1,
          unitPrice: 0
        }
      ];
      setActiveTab(newItems.length - 1); // Switch to the new tab
      return { ...prev, items: newItems };
    });
  };

  const removeItem = (index) => {
    if (quotation.items.length <= 1) return;
    setQuotation(prev => {
      const updatedItems = prev.items
        .filter((_, i) => i !== index)
        .map((item, idx) => ({ ...item, sNo: idx + 1 }));
      if (activeTab >= index && activeTab > 0) {
        setActiveTab(activeTab - 1);
      }
      return { ...prev, items: updatedItems };
    });
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
        setQuotation(prev => ({ ...prev, [name]: url }));
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const validItems = quotation.items.filter(item => {
        const div = document.createElement('div');
        div.innerHTML = item.item;
        return div.textContent.trim() && item.qty > 0 && item.unitPrice > 0;
      });
      if (validItems.length === 0) {
        alert('Please add at least one valid item with a description, positive quantity, and price.');
        setSaving(false);
        return;
      }

      const subTotal = validItems.reduce((acc, item) => acc + item.qty * item.unitPrice * (quotation.unitPriceMultiplier || 1), 0);
      const taxAmount = subTotal * parseFloat(quotation.tax || 0);
      const grandTotal = subTotal + taxAmount;

      const updatedQuotation = {
        ...quotation,
        items: validItems,
        quoteAmount: grandTotal,
        subTotal,
        tax: parseFloat(quotation.tax || 0),
        grandTotal,
        coOrigin: quotation.coOrigin.filter(co => co),
        principal: quotation.principal.filter(p => p),
      };

      await axios.put(`${process.env.NEXT_PUBLIC_API}/api/quotations/${id}`, updatedQuotation, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/quotations/${id}`);
    } catch (error) {
      console.error('Error updating quotation:', error);
      alert(`Failed to update quotation: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;
    
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/quotations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/quotations');
    } catch (error) {
      console.error('Error deleting quotation:', error);
      alert(`Failed to delete quotation: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const fileFields = [
    { name: 'oemSpecification', label: 'OEM Specification' },
    { name: 'approvedBy', label: 'Approval Document' }
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!quotation) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Quotation not found</Typography>
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
        Edit Quotation: #{quotation.quoteNo}
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
                  label="Quotation Number"
                  name="quoteNo"
                  value={quotation.quoteNo}
                  fullWidth
                  disabled
                  sx={{ mb: 2 }}
                />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Tender
                  </Typography>
                  <Select
                    name="tenderId"
                    value={quotation.tenderId?._id || quotation.tenderId || ''}
                    onChange={handleChange}
                    required
                  >
                    {tenders.map(t => (
                      <MenuItem key={t._id} value={t._id}>{t.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Customer
                  </Typography>
                  <Select
                    name="customerId"
                    value={quotation.customerId?._id || quotation.customerId || ''}
                    onChange={handleChange}
                    required
                  >
                    {customers.map(c => (
                      <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Quotation Date"
                  name="quoteDate"
                  type="date"
                  value={formatDateForInput(quotation.quoteDate)}
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
                  label="Delivery Details"
                  name="delivery"
                  value={quotation.delivery || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="Warranty"
                  name="warranty"
                  value={quotation.warranty || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="Payment Terms"
                  name="paymentTerms"
                  value={quotation.paymentTerms || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Quotation Details */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Quotation Details</SectionHeader>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                        Mode
                      </Typography>
                      <Select
                        name="mode"
                        value={quotation.mode || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="F.O.R">F.O.R</MenuItem>
                        <MenuItem value="C&F">C&F</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {quotation.mode === 'Other' && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Other Mode"
                        name="modeOtherText"
                        value={quotation.modeOtherText || ''}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Financial Information */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Financial Information</SectionHeader>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Tax (Decimal)"
                      name="tax"
                      type="number"
                      value={quotation.tax || ''}
                      onChange={handleChange}
                      fullWidth
                      helperText="Enter tax as a decimal (e.g., 0.13 for 13%)"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Quote Validity (Days)"
                      name="quoteValidityDays"
                      type="number"
                      value={quotation.quoteValidityDays || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Unit Price Multiplier"
                      name="unitPriceMultiplier"
                      type="number"
                      value={quotation.unitPriceMultiplier || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Currency Unit"
                      name="currencyUnit"
                      value={quotation.currencyUnit || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Countries of Origin */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <SectionHeader variant="h6">Countries of Origin</SectionHeader>
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={() => addArrayItem('coOrigin')} 
                    variant="outlined" 
                    size="small"
                  >
                    Add
                  </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  {quotation.coOrigin.map((co, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TextField
                          label={`Country ${index + 1}`}
                          value={co}
                          onChange={(e) => handleArrayChange('coOrigin', index, e.target.value)}
                          fullWidth
                          size="small"
                        />
                        <IconButton
                          onClick={() => removeArrayItem('coOrigin', index)}
                          disabled={quotation.coOrigin.length <= 1}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Principals */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <SectionHeader variant="h6">Principals</SectionHeader>
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={() => addArrayItem('principal')} 
                    variant="outlined" 
                    size="small"
                  >
                    Add
                  </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  {quotation.principal.map((p, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TextField
                          label={`Principal ${index + 1}`}
                          value={p}
                          onChange={(e) => handleArrayChange('principal', index, e.target.value)}
                          fullWidth
                          size="small"
                        />
                        <IconButton
                          onClick={() => removeArrayItem('principal', index)}
                          disabled={quotation.principal.length <= 1}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Documents */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Documents</SectionHeader>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  {fileFields.map((field) => (
                    <Grid item xs={12} sm={6} key={field.name}>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        {field.label}
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<AttachFileIcon />}
                        sx={{ 
                          textTransform: 'none',
                          justifyContent: 'flex-start',
                          mb: 1
                        }}
                      >
                        {quotation[field.name] ? 'Change File' : 'Select File'}
                        <input
                          type="file"
                          name={field.name}
                          accept="application/pdf,image/*"
                          onChange={handleFileChange}
                          hidden
                        />
                      </Button>
                      {quotation[field.name] && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            color: 'success.main',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {quotation[field.name].split('/').pop()}
                        </Typography>
                      )}
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Items */}
          <Grid item xs={12}>
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
                  {quotation.items.map((item, index) => (
                    <Tab label={`Item ${item.sNo}`} key={index} />
                  ))}
                </Tabs>
                {quotation.items.map((item, index) => (
                  <Box key={index} sx={{ display: activeTab === index ? 'block' : 'none' }}>
                    <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <StyledTextField
                            label="Reference Number"
                            name="refNo"
                            type="number"
                            value={item.refNo}
                            onChange={(e) => handleItemChange(index, 'refNo', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                          <StyledTextField
                            label="Quantity"
                            name="qty"
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                          <StyledTextField
                            label={`Unit Price (${quotation.currencyUnit || 'USD'})`}
                            name="unitPrice"
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <TipTapEditor
                          content={item.item}
                          onChange={(value) => handleItemChange(index, 'item', value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <IconButton
                          onClick={() => removeItem(index)}
                          disabled={quotation.items.length <= 1}
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
          </Grid>

          {/* Total Preview */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Total Preview</SectionHeader>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ p: 2 }}>
                  {(() => {
                    const validItems = quotation.items.filter(item => {
                      const div = document.createElement('div');
                      div.innerHTML = item.item;
                      return div.textContent.trim() && item.qty > 0 && item.unitPrice > 0;
                    });
                    const subTotal = validItems.reduce((acc, item) => acc + item.qty * item.unitPrice * (quotation.unitPriceMultiplier || 1), 0);
                    const taxAmount = subTotal * parseFloat(quotation.tax || 0);
                    const grandTotal = subTotal + taxAmount;
                    return (
                      <>
                        <Typography variant="body1">
                          Subtotal: {quotation.currencyUnit || 'USD'} <strong>{subTotal.toFixed(2)}</strong>
                        </Typography>
                        <Typography variant="body1">
                          Tax Amount ({(quotation.tax * 100).toFixed(0)}%): {quotation.currencyUnit || 'USD'} <strong>{taxAmount.toFixed(2)}</strong>
                        </Typography>
                        <Typography variant="body1">
                          Grand Total: {quotation.currencyUnit || 'USD'} <strong>{grandTotal.toFixed(2)}</strong>
                        </Typography>
                      </>
                    );
                  })()}
                </Box>
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

export default QuotationEditPage;