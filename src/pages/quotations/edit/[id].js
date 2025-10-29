import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, Grid, Paper,
  Card, CardContent, Divider, IconButton, Box, MenuItem,
  FormControl, Select, CircularProgress, Tabs, Tab
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { jwtDecode } from 'jwt-decode';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Custom styled components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[3], // Match QuotationForm
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

const StyledInputLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  whiteSpace: 'normal',
  overflow: 'visible',
  textOverflow: 'unset',
  lineHeight: 1.5,
  marginBottom: theme.spacing(1),
  fontWeight: 500,
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const FormGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

// TipTap Editor Component (same as QuotationForm)
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

// TipTap Toolbar Component (same as QuotationForm)
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

// Utility function to check if HTML content is non-empty (from QuotationForm)
const isValidItemDescription = (html) => {
  if (typeof html !== 'string') return false;
  const textContent = html.replace(/<[^>]+>/g, '').trim();
  return textContent.length > 0;
};

// Helper to strip HTML for display in dropdown (from QuotationForm)
const stripHtml = (html = '') => html.replace(/<[^>]+>/g, '').trim();

const QuotationEditPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenders, setTenders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tenderItems, setTenderItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !token) {
        setLoading(false);
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [quotationRes, tendersRes, customersRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/quotations/${id}`, { headers }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/tenders`, { headers }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/customers`, { headers }),
        ]);

        setQuotation(quotationRes.data);
        setTenders(tendersRes.data || []);
        setCustomers(customersRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  useEffect(() => {
    const fetchTenderItems = async () => {
      if (quotation?.tenderId?._id || quotation?.tenderId) {
        try {
          const headers = { Authorization: `Bearer ${token}` };
          const tenderId = quotation.tenderId._id || quotation.tenderId;
          if (tenderId !== 'None') {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/tenders/${tenderId}`, { headers });
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
  }, [quotation?.tenderId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuotation((prev) => ({
      ...prev,
      [name]: name === 'tax' || name === 'quoteValidityDays' || name === 'unitPriceMultiplier'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setQuotation((prev) => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = value;
      return { ...prev, [field]: updatedArray };
    });
  };

  const addArrayItem = (field) => {
    setQuotation((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field, index) => {
    if (quotation[field].length <= 1) return;
    setQuotation((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setQuotation((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index][name] = (name === 'qty' || name === 'unitPrice')
        ? Math.max(0, parseFloat(value) || 0)
        : value; // Keep refNo as string, like QuotationForm
      return { ...prev, items: updatedItems };
    });
  };

  const addItem = () => {
    setQuotation((prev) => {
      const newItems = [
        ...prev.items,
        {
          sNo: prev.items.length + 1,
          refNo: '',
          item: '',
          qty: 1,
          unitPrice: 0,
        },
      ];
      setActiveTab(newItems.length - 1);
      return { ...prev, items: newItems };
    });
  };

  const removeItem = (index) => {
    if (quotation.items.length <= 1) return;
    setQuotation((prev) => {
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
        setQuotation((prev) => ({ ...prev, [name]: url }));
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { customerId, quoteDate } = quotation;
      if (!customerId || !quoteDate) {
        alert('Please fill all required fields.');
        setSaving(false);
        return;
      }

      const validItems = quotation.items.filter((item) => isValidItemDescription(item.item) && item.qty > 0 && item.unitPrice > 0);
      if (validItems.length === 0) {
        alert('Please add at least one valid item with a description, positive quantity, and price.');
        setSaving(false);
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        alert('User not authenticated. Please login again.');
        setSaving(false);
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.id || decoded._id;

      const subTotal = validItems.reduce((acc, item) => acc + item.qty * item.unitPrice / (quotation.unitPriceMultiplier || 1), 0);
      const taxAmount = subTotal * parseFloat(quotation.tax || 0);
      const grandTotal = subTotal + taxAmount;

      const updatedQuotation = {
        ...quotation,
        userId,
        items: validItems,
        quoteAmount: grandTotal,
        subTotal,
        tax: parseFloat(quotation.tax || 0),
        grandTotal,
        coOrigin: quotation.coOrigin.filter((co) => co),
        principal: quotation.principal.filter((p) => p),
      };

      await axios.put(`${process.env.NEXT_PUBLIC_API}/api/quotations/${id}`, updatedQuotation, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Quotation updated successfully!');
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
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Quotation deleted successfully!');
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!quotation) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Quotation not found</Typography>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
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

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Edit Quotation: #{quotation.quoteNo}
      </Typography>

      <Paper component="form" onSubmit={handleSubmit} elevation={3} sx={{ p: 3 }}>
        {/* Basic Information Section */}
        <StyledCard>
          <CardContent>
            <SectionHeader variant="h5">Basic Information</SectionHeader>
            <Divider sx={{ mb: 3 }} />
            <FormGrid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  label="Quotation Number"
                  name="quoteNo"
                  value={quotation.quoteNo || ''}
                  fullWidth
                  disabled
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <StyledTextField
                    select
                    label="Tender"
                    name="tenderId"
                    value={quotation.tenderId?._id || quotation.tenderId || 'None'}
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
                    value={quotation.customerId?._id || quotation.customerId || ''}
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
                  value={formatDateForInput(quotation.quoteDate)}
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
                  value={quotation.delivery || ''}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  label="Warranty"
                  name="warranty"
                  value={quotation.warranty || ''}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  label="Payment Terms"
                  name="paymentTerms"
                  value={quotation.paymentTerms || ''}
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
                    value={quotation.mode || 'F.O.R'}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="F.O.R">F.O.R</MenuItem>
                    <MenuItem value="C&F">C&F</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </StyledTextField>
                </FormControl>
              </Grid>
              {quotation.mode === 'Other' && (
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Other Mode"
                    name="modeOtherText"
                    value={quotation.modeOtherText || ''}
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
                  value={quotation.quoteValidityDays || 0}
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
                    value={quotation.forCompany || 'Paktech'}
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
                  value={quotation.tax || 0.13}
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
                  value={quotation.unitPriceMultiplier || 1}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  label="Currency Unit"
                  name="currencyUnit"
                  value={quotation.currencyUnit || ''}
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
              {quotation.coOrigin.map((co, index) => (
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
                      disabled={quotation.coOrigin.length <= 1}
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
              {quotation.principal.map((p, index) => (
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
                      disabled={quotation.principal.length <= 1}
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
                  {quotation.oemSpecification ? 'Change File' : 'Select File'}
                  <input
                    type="file"
                    name="oemSpecification"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
                {quotation.oemSpecification && (
                  <Typography variant="caption" color="success.main">
                    {quotation.oemSpecification.split('/').pop()}
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
                  {quotation.approvedBy ? 'Change File' : 'Select File'}
                  <input
                    type="file"
                    name="approvedBy"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
                {quotation.approvedBy && (
                  <Typography variant="caption" color="success.main">
                    {quotation.approvedBy.split('/').pop()}
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
                        label={`Unit Price (${quotation.currencyUnit || 'Currency'})`}
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
                    {(quotation.tenderId?._id || quotation.tenderId) && tenderItems.length > 0 ? (
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

        {/* Total Preview Section */}
        <StyledCard>
          <CardContent>
            <SectionHeader variant="h5">Total Preview</SectionHeader>
            <Divider sx={{ mb: 3 }} />
            <FormGrid container spacing={2}>
              <Grid item xs={12}>
                {(() => {
                  const validItems = quotation.items.filter((item) =>
                    isValidItemDescription(item.item) && item.qty > 0 && item.unitPrice > 0
                  );
                  const subTotal = validItems.reduce(
                    (acc, item) => acc + item.qty * item.unitPrice / (quotation.unitPriceMultiplier || 1),
                    0
                  );
                  const taxAmount = subTotal * parseFloat(quotation.tax || 0);
                  const grandTotal = subTotal + taxAmount;
                  return (
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body1">
                        Subtotal: {quotation.currencyUnit || 'Currency'} <strong>{subTotal.toFixed(2)}</strong>
                      </Typography>
                      <Typography variant="body1">
                        Tax Amount ({(quotation.tax * 100).toFixed(0)}%): {quotation.currencyUnit || 'Currency'}{' '}
                        <strong>{taxAmount.toFixed(2)}</strong>
                      </Typography>
                      <Typography variant="body1">
                        Grand Total: {quotation.currencyUnit || 'Currency'} <strong>{grandTotal.toFixed(2)}</strong>
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