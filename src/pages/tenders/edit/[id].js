import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, Grid, Paper,
  Card, CardContent, Divider, IconButton, Box, MenuItem,
  FormControl, Select, InputAdornment, CircularProgress,
  Tabs, Tab, Chip
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
import Link from 'next/link';
import dotenv from "dotenv";
dotenv.config();

// Styled components
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
    <Box sx={{
      border: '1px solid rgba(0, 0, 0, 0.23)',
      borderRadius: '4px',
      padding: '8px',
      '& .ProseMirror': {
        minHeight: '100px',
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
  );
};

// TipTap Toolbar Component
const Toolbar = ({ editor }) => {
  if (!editor) return null;

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

// Deadline status function (reused from Dashboard.jsx)
const getDeadlineStatus = (dueDate) => {
  if (!dueDate) return { label: 'No Due Date', color: 'default' };
  const today = new Date('2025-06-30');
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: 'Overdue', color: 'error' };
  } else if (diffDays <= 7) {
    return { label: 'Approaching', color: 'warning' };
  } else {
    return { label: 'On Track', color: 'success' };
  }
};

// Date formatting function (reused from Dashboard.jsx)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

const TenderEditPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      if (!token) {
        router.replace('/login');
        return;
      }
      try {
        const [tenderRes, customersRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/tenders/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/customers`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setTender({ ...tenderRes.data, customerId: tenderRes.data.customerId?._id || tenderRes.data.customerId });
        setCustomers(customersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load tender or customer data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTender(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    setTender(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, items: updatedItems };
    });
  };

  const addItem = () => {
    setTender(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          sNo: prev.items.length + 1,
          item: "",
          tenderItemRef: "",
          expectedDeliveryDate: ""
        }
      ]
    }));
    setCurrentTab(tender?.items.length || 0);
  };

  const removeItem = (index) => {
    if (tender.items.length <= 1) return;
    setTender(prev => {
      const updatedItems = prev.items
        .filter((_, i) => i !== index)
        .map((item, idx) => ({ ...item, sNo: idx + 1 }));
      return { ...prev, items: updatedItems };
    });
    if (currentTab >= index && currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "tender");
    data.append("folder", "tender_system");
    const res = await axios.post("https://api.cloudinary.com/v1_1/dnfxaju5y/auto/upload", data);
    return res.data.secure_url;
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      try {
        const url = await uploadToCloudinary(files[0]);
        setTender(prev => ({ ...prev, [name]: url }));
      } catch (error) {
        console.error('File upload failed:', error);
        alert('Failed to upload file. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tender.title || !tender.customerId || !tender.items.length || tender.items.some(item => !item.item)) {
      alert('Please fill in all required fields: Title, Customer, and at least one Item Description.');
      return;
    }
    setSaving(true);
    try {
      let decoded = {};
      try {
        decoded = jwtDecode(token);
      } catch {
        alert('Invalid token. Please login again.');
        setSaving(false);
        return;
      }
      const userId = decoded.userId || decoded.id || decoded._id;
      const payload = { ...tender, user: userId };
      await axios.put(`${process.env.NEXT_PUBLIC_API}/api/tenders/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/tenders/${id}`);
    } catch (error) {
      console.error('Error updating tender:', error);
      alert(`Failed to update tender: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tender?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/tenders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/tenders');
    } catch (error) {
      console.error('Error deleting tender:', error);
      alert(`Failed to delete tender: ${error.response?.data?.message || error.message}`);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const fileFields = [
    { name: 'contractAgreements', label: 'Contract Agreements' },
    { name: 'installationTrainingReport', label: 'Installation Training Report' },
    { name: 'earnestMoney', label: 'Earnest Money Document' },
    { name: 'performanceGuaranteeImage', label: 'Performance Guarantee Image' },
    { name: 'extensionLetterImage', label: 'Extension Letter' },
    { name: 'bidEvaluationReport', label: 'Bid Evaluation Report' },
    { name: 'billUrl', label: 'Bill Document' }
  ];

  const dateFields = [
    'publishedOn', 'preBidMeeting', 'dueDate', 'contractDate',
    'twoStageTechnicalOpeningTimeAndDate', 'twoStageFinancialOpeningTimeAndDate',
    'shippingTimeAndDate', 'deliveryTimeAndDate', 'inspectionTimeAndDate',
    'installationTrainingCompletion', 'expectedShipmentDate', 'extendedDeliveryDate'
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">{error}</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!tender) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Tender not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mt: 2 }}>
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
        Edit Tender: {tender.title}
      </Typography>

      <Paper component="form" onSubmit={handleSubmit} elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Basic Information</SectionHeader>
                <Divider sx={{ mb: 3 }} />
                <StyledTextField
                  label="Title"
                  name="title"
                  value={tender.title || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                 <StyledTextField
                  label="Tender No"
                  name="tenderNo"
                  value={tender.tenderNo || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <StyledInputLabel>Customer</StyledInputLabel>
                  <Select
                    name="customerId"
                    value={tender.customerId || ''}
                    onChange={handleChange}
                    required
                  >
                    {customers.map(c => (
                      <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <StyledTextField
                  label="Description"
                  name="description"
                  value={tender.description || ''}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  required
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                <StyledTextField
                  label="Opening Time & Venue"
                  name="openingTimeAndVenue"
                  value={tender.openingTimeAndVenue || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                <StyledTextField
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={formatDateForInput(tender.dueDate)}
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
                  InputLabelProps={{ shrink: true }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="body2">Deadline Status:</Typography>
                  <Chip
                    label={getDeadlineStatus(tender.dueDate).label}
                    color={getDeadlineStatus(tender.dueDate).color}
                    size="small"
                  />
                </Box>
              </CardContent>
            </StyledCard>

            {/* Dates */}
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Key Dates</SectionHeader>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  {dateFields.filter(field => field !== 'dueDate').map(field => (
                    <Grid item xs={12} sm={6} key={field}>
                      <StyledTextField
                        label={field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                        name={field} // Fixed: Use dynamic field name
                        type="date"
                        value={formatDateForInput(tender[field])}
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
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Status and Financial */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Status Information</SectionHeader>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <StyledInputLabel>Tender Type</StyledInputLabel>
                      <Select
                        name="singleStage"
                        value={tender.singleStage || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="Single Stage One Envelope">Single Stage One Envelope</MenuItem>
                        <MenuItem value="Single Stage Two Envelope">Single Stage Two Envelope</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <StyledInputLabel>Project Status</StyledInputLabel>
                      <Select
                        name="projectStatus"
                        value={tender.projectStatus || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="Ongoing">Ongoing</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                        <MenuItem value="On Hold">On Hold</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <StyledInputLabel>Extension Status</StyledInputLabel>
                      <Select
                        name="extensionStatus"
                        value={tender.extensionStatus || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="NIL">NIL</MenuItem>
                        <MenuItem value="Extended">Extended</MenuItem>
                        <MenuItem value="Not Extended">Not Extended</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <StyledInputLabel>Orders Placed</StyledInputLabel>
                      <Select
                        name="ordersPlaced"
                        value={tender.ordersPlaced || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <StyledInputLabel>Orders Awarded</StyledInputLabel>
                      <Select
                        name="ordersAwarded"
                        value={tender.ordersAwarded || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                  <StyledInputLabel>Number of Items Awarded</StyledInputLabel>
                    <StyledTextField
                      label=""
                      name="numItemsAwarded"
                      type="number"
                      value={tender.numItemsAwarded || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <StyledInputLabel>Performance Guarantee</StyledInputLabel>
                      <Select
                        name="performanceGuarantee"
                        value={tender.performanceGuarantee || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="NIL">NIL</MenuItem>
                        <MenuItem value="Bank Guarantee">Bank Guarantee</MenuItem>
                        <MenuItem value="Pay Order">Pay Order</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {tender.performanceGuarantee === 'Other' && (
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        label="Other Performance Guarantee"
                        name="performanceGuaranteeOtherText"
                        value={tender.performanceGuaranteeOtherText || ''}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <StyledInputLabel>PG Status</StyledInputLabel>
                      <Select
                        name="performanceGuaranteeReleased"
                        value={tender.performanceGuaranteeReleased || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="NIL">NIL</MenuItem>
                        <MenuItem value="Letter Submitted">Letter Submitted</MenuItem>
                        <MenuItem value="Released">Released</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <StyledInputLabel>Bill Status</StyledInputLabel>
                      <Select
                        name="billStatus"
                        value={tender.billStatus || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="Not Submitted">Not Submitted</MenuItem>
                        <MenuItem value="Submitted">Submitted</MenuItem>
                        <MenuItem value="Bill Cleared">Bill Cleared</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <StyledInputLabel>Mode of Delivery</StyledInputLabel>
                      <Select
                        name="modeOfDelivery"
                        value={tender.modeOfDelivery || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="FOR">FOR</MenuItem>
                        <MenuItem value="C&F">C&F</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {tender.modeOfDelivery === 'Other' && (
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        label="Other Mode of Delivery"
                        name="modeOfDeliveryOtherText"
                        value={tender.modeOfDeliveryOtherText || ''}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </StyledCard>

            {/* Financial Information */}
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Financial Information</SectionHeader>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Total Amount Quoted"
                      name="totalAmountQuoted"
                      type="number"
                      value={tender.totalAmountQuoted || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Awarded Amount"
                      name="awardedAmount"
                      type="number"
                      value={tender.awardedAmount || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Stamp Duty"
                      name="stampDuty"
                      type="number"
                      value={tender.stampDuty || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Earnest Money Amount"
                      name="earnestMoneyAmount"
                      type="number"
                      value={tender.earnestMoneyAmount || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Late Delivery Charges"
                      name="lateDeliveryCharges"
                      type="number"
                      value={tender.lateDeliveryCharges || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
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
                    <Grid item xs={12} sm={6} md={4} key={field.name}>
                      <StyledInputLabel>{field.label}</StyledInputLabel>
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
                        {tender[field.name] ? 'Change File' : 'Select File'}
                        <input
                          type="file"
                          name={field.name}
                          accept="application/pdf,image/*"
                          onChange={handleFileChange}
                          hidden
                        />
                      </Button>
                      {tender[field.name] && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            color: 'success.main',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {tender[field.name].split('/').pop()}
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
                  <SectionHeader variant="h6">Items</SectionHeader>
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
                {tender.items.length > 0 ? (
                  <>
                    <Tabs
                      value={currentTab}
                      onChange={(e, newValue) => setCurrentTab(newValue)}
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{ mb: 3 }}
                    >
                      {tender.items.map((item, index) => (
                        <Tab key={index} label={`Item ${item.sNo}`} />
                      ))}
                    </Tabs>
                    {tender.items.map((item, index) => (
                      <Box key={index} hidden={currentTab !== index} sx={{ mt: 2 }}>
                        <Grid container spacing={2} alignItems="flex-start">
                          <Grid item xs={12} sm={4}>
                            <StyledInputLabel>Item Description</StyledInputLabel>
                            <TipTapEditor
                              content={item.item || ''}
                              onChange={(value) => handleItemChange(index, 'item', value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3} sx={{ mt: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <StyledTextField
                                label="Tender Item Ref"
                                fullWidth
                                value={item.tenderItemRef || ''}
                                onChange={(e) => handleItemChange(index, 'tenderItemRef', e.target.value)}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                              />
                              <StyledTextField
                                label="Expected Delivery"
                                type="date"
                                fullWidth
                                value={formatDateForInput(item.expectedDeliveryDate)}
                                onChange={(e) => handleItemChange(index, 'expectedDeliveryDate', e.target.value)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CalendarIcon fontSize="small" />
                                    </InputAdornment>
                                  ),
                                }}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={1}>
                            <IconButton
                              onClick={() => removeItem(index)}
                              disabled={tender.items.length <= 1}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No items available. Click "Add Item" to create one.
                  </Typography>
                )}
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Personnel */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <SectionHeader variant="h6">Personnel Information</SectionHeader>
                <Divider sx={{ mb: 3 }} />
                <StyledTextField
                  label="Focal Person Info"
                  name="focalPersonInfo"
                  value={tender.focalPersonInfo || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                <StyledTextField
                  label="Incharge at Paktech"
                  name="inchargeAtPaktech"
                  value={tender.inchargeAtPaktech || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
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

export default TenderEditPage;