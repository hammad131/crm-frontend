import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import axios from "axios";
import {
  Container, Typography, TextField, Grid, Button, MenuItem,
  Box, Card, CardContent, Divider, IconButton, Paper,
  InputLabel, Tabs, Tab
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { jwtDecode } from "jwt-decode";
import { styled } from "@mui/material/styles";
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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

// TipTap Editor Component
const TipTapEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
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
        minHeight: '56px', // Match TextField height
        '& .ProseMirror': {
          minHeight: '56px',
          padding: '14.5px 14px', // Match TextField padding
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

const initialState = {
  title: "",
  description: "",
  tenderNo:"",
  customerId: "",
  user: "",
  publishedOn: "",
  preBidMeeting: "",
  dueDate: "",
  contractDate: "",
  openingTimeAndVenue: "",
  singleStage: "Single Stage One Envelope",
  twoStageTechnicalOpeningTimeAndDate: "",
  twoStageFinancialOpeningTimeAndDate: "",
  endUserQuery: "",
  bidEvaluationReport: "",
  ordersAwarded: "No",
  ordersPlaced: "No",
  contractAgreements: "",
  performanceGuarantee: "NIL",
  performanceGuaranteeOtherText: "",
  performanceGuaranteeReleased: "NIL",
  shippingTimeAndDate: "",
  deliveryTimeAndDate: "",
  inspectionTimeAndDate: "",
  installationTrainingCompletion: "",
  installationTrainingReport: "",
  billStatus: "Not Submitted",
  billUrl: "",
  modeOfDelivery: "FOR",
  modeOfDeliveryOtherText: "",
  earnestMoney: "",
  earnestMoneyAmount: 0,
  performanceGuaranteeImage: "",
  items: [{ sNo: 1, itemName:"", item: "", tenderItemRef: "", unitPrice: 0, expectedDeliveryDate: "" }],
  totalAmountQuoted: 0,
  numItemsAwarded: 0,
  awardedAmount: 0,
  stampDuty: 0,
  expectedShipmentDate: "",
  extensionLetterImage: "",
  extensionStatus: "Pending",
  extendedDeliveryDate: "",
  lateDeliveryCharges: 0,
  projectStatus: "Ongoing",
  focalPersonInfo: "",
  inchargeAtPaktech: ""
};

const TenderForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState(initialState);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  // const token = localStorage.getItem("token");

  useEffect(() => {
    // if (!token) {
    //   alert("User not authenticated. Please login again.");
    //   return;
    // }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.replace('/login');
        return;
      }
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/customers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(res.data || []);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    };
    fetchCustomers();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, items: updatedItems };
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          sNo: prev.items.length + 1,
          item: "",
          itemName:"",
          tenderItemRef: "",
          unitPrice:0,
          expectedDeliveryDate: ""
        }
      ]
    }));
    setActiveTab(formData.items.length); // Switch to the new tab
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => {
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
    data.append("file", file);
    data.append("upload_preset", "tender");
    data.append("folder", "tender_system");
    const res = await axios.post("https://api.cloudinary.com/v1_1/dnfxaju5y/image/upload", data);
    return res.data.secure_url;
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      try {
        const url = await uploadToCloudinary(files[0]);
        setFormData(prev => ({ ...prev, [name]: url }));
      } catch (error) {
        console.error("File upload failed:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      alert("User not authenticated. Please login again.");
      return;
    }
    setLoading(true);
    try {
      let decoded = {};
      try {
        decoded = jwtDecode(token);
      } catch {
        alert("Invalid token. Please login again.");
        setLoading(false);
        return;
      }

      const userId = decoded.userId || decoded.id || decoded._id;
      const payload = {
        ...formData,
        user: userId
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API}/api/tenders`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Tender created successfully!");
      setFormData(initialState);
      setActiveTab(0);
    } catch (error) {
      console.error("Failed to create tender:", error);
      alert(`Failed to create tender: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fileFields = [
    { name: "contractAgreements", label: "Contract Agreements" },
    { name: "installationTrainingReport", label: "Installation Training Report" },
    { name: "earnestMoney", label: "Earnest Money Document" },
    { name: "performanceGuaranteeImage", label: "Performance Guarantee Image" },
    { name: "extensionLetterImage", label: "Extension Letter" },
    { name: "bidEvaluationReport", label: "Bid Evaluation Report" },
    { name: "billUrl", label: "Bill Document" }
  ];

  const dateFields = [
    "publishedOn", "preBidMeeting", "dueDate", "contractDate",
    "twoStageTechnicalOpeningTimeAndDate", "twoStageFinancialOpeningTimeAndDate",
    "shippingTimeAndDate", "deliveryTimeAndDate", "inspectionTimeAndDate",
    "installationTrainingCompletion", "expectedShipmentDate", "extendedDeliveryDate"
  ];

  const formatLabel = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .replace(/(\b\w)/g, s => s.toUpperCase());
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Create New Tender
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Basic Information</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              
              <FormGrid container spacing={3}>
              <Grid item xs={12} md={6}>
                  <StyledTextField
                    label="Tender No"
                    name="tenderNo"
                    value={formData.tenderNo}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    select
                    label="Customer"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  >
                    {customers.map(c => (
                      <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                    ))}
                  </StyledTextField>
                </Grid>
                
                <Grid item xs={12}>
                  <StyledTextField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Dates Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Key Dates</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              
              <FormGrid container spacing={3}>
                {dateFields.map(field => (
                  <Grid item xs={12} md={6} key={field}>
                    <StyledTextField
                      label={formatLabel(field)}
                      name={field}
                      type="date"
                      value={formData[field]}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ 
                        shrink: true,
                        sx: { 
                          whiteSpace: 'normal',
                          lineHeight: 1.2,
                          overflow: 'visible'
                        }
                      }}
                    />
                  </Grid>
                ))}
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Tender Process Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Tender Process</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              
              <FormGrid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    select
                    label="Tender Type"
                    name="singleStage"
                    value={formData.singleStage}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="Single Stage One Envelope">Single Stage One Envelope</MenuItem>
                    <MenuItem value="Single Stage Two Envelope">Single Stage Two Envelope</MenuItem>
                  </StyledTextField>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    label="Opening Time & Venue"
                    name="openingTimeAndVenue"
                    value={formData.openingTimeAndVenue}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    select
                    label="Extension Status"
                    name="extensionStatus"
                    value={formData.extensionStatus}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="NIL">NIL</MenuItem>
                    <MenuItem value="Extended">Extended</MenuItem>
                    <MenuItem value="Not Extended">Not Extended</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </StyledTextField>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    select
                    label="Project Status"
                    name="projectStatus"
                    value={formData.projectStatus}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="Ongoing">Ongoing</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                  </StyledTextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    select
                    label="Order Awarded"
                    name="ordersAwarded"
                    value={formData.ordersAwarded}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </StyledTextField>
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Financial Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Financial Details</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              
              <FormGrid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    label="Total Amount Quoted"
                    name="totalAmountQuoted"
                    type="number"
                    value={formData.totalAmountQuoted}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    label="Awarded Amount"
                    name="awardedAmount"
                    type="number"
                    value={formData.awardedAmount}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    label="Stamp Duty"
                    name="stampDuty"
                    type="number"
                    value={formData.stampDuty}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    label="Earnest Money Amount"
                    name="earnestMoneyAmount"
                    type="number"
                    value={formData.earnestMoneyAmount}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    label="Late Delivery Charges"
                    name="lateDeliveryCharges"
                    type="number"
                    value={formData.lateDeliveryCharges}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    select
                    label="Mode of Payment"
                    name="modeOfDelivery"
                    value={formData.modeOfDelivery}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="FOR">FOR</MenuItem>
                    <MenuItem value="C&F">C&F</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </StyledTextField>
                </Grid>

                {formData.modeOfDelivery === "Other" && (
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Other Mode of Delivery"
                      name="modeOfDeliveryOtherText"
                      value={formData.modeOfDeliveryOtherText}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    select
                    label="Performance Guarantee"
                    name="performanceGuarantee"
                    value={formData.performanceGuarantee}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="NIL">NIL</MenuItem>
                    <MenuItem value="Bank Guarantee">Bank Guarantee</MenuItem>
                    <MenuItem value="Pay Order">Pay Order</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </StyledTextField>
                </Grid>

                {formData.performanceGuarantee === "Other" && (
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Other Performance Guarantee"
                      name="performanceGuaranteeOtherText"
                      value={formData.performanceGuaranteeOtherText}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    select
                    label="Performance Guarantee Status"
                    name="performanceGuaranteeReleased"
                    value={formData.performanceGuaranteeReleased}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="NIL">NIL</MenuItem>
                    <MenuItem value="Letter Submitted">Letter Submitted</MenuItem>
                    <MenuItem value="Released">Released</MenuItem>
                  </StyledTextField>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    select
                    label="Bill Status"
                    name="billStatus"
                    value={formData.billStatus}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="Not Submitted">Not Submitted</MenuItem>
                    <MenuItem value="Submitted">Submitted</MenuItem>
                    <MenuItem value="Bill Cleared">Bill Cleared</MenuItem>
                  </StyledTextField>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    select
                    label="Orders Placed"
                    name="ordersPlaced"
                    value={formData.ordersPlaced}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </StyledTextField>
                </Grid>
              </FormGrid>
            </CardContent>
          </StyledCard>

          {/* Documents Section */}
          <StyledCard>
            <CardContent>
              <SectionHeader variant="h5">Documents</SectionHeader>
              <Divider sx={{ mb: 3 }} />
              
              <FormGrid container spacing={3}>
                {fileFields.map((field) => (
                  <Grid item xs={12} md={6} key={field.name}>
                    <StyledInputLabel>{field.label}</StyledInputLabel>
                    <input 
                      type="file" 
                      name={field.name} 
                      accept="application/pdf,image/*" 
                      onChange={handleFileChange}
                      style={{ display: 'block', marginTop: 8, width: '100%' }}
                    />
                    {formData[field.name] && (
                      <Typography variant="caption" color="success.main">
                        File uploaded successfully
                      </Typography>
                    )}
                  </Grid>
                ))}
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
                    <Grid item xs={12} md={4} sx={{ mt: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <StyledTextField 
                          label="Tender Item Ref" 
                          fullWidth 
                          value={item.tenderItemRef} 
                          onChange={(e) => handleItemChange(index, "tenderItemRef", e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                         <StyledTextField 
                          label="Item Name" 
                          fullWidth 
                          value={item.itemName} 
                          onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                        <StyledTextField 
                          label="Unit Price" 
                          fullWidth 
                          value={item.unitPrice} 
                          onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                        <StyledTextField 
                          label="Expected Delivery" 
                          type="date" 
                          fullWidth 
                          value={item.expectedDeliveryDate} 
                          onChange={(e) => handleItemChange(index, "expectedDeliveryDate", e.target.value)} 
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={7}>
                      <TipTapEditor
                        content={item.item}
                        onChange={(value) => handleItemChange(index, "item", value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <IconButton 
                        onClick={() => removeItem(index)} 
                        disabled={formData.items.length <= 1}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
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
              {loading ? 'Creating...' : 'Create Tender'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default TenderForm;