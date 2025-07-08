import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import DOMPurify from 'dompurify';
import {
  Container, Typography, Box, Card, CardContent, Divider,
  Button, Grid, Paper, List, ListItem, ListItemText,
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  AttachFile as AttachFileIcon,
  MonetizationOn as MonetizationOnIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import dotenv from "dotenv";
dotenv.config();

// Custom styled components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  boxShadow: theme.shadows[4],
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  overflow: 'hidden',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.dark,
  marginBottom: theme.spacing(2),
  fontSize: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledListItem = styled(ListItem)(({ theme, index }) => ({
  backgroundColor: index % 2 === 0 ? theme.palette.grey[50] : 'transparent',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(0.5),
  '& .MuiListItemText-primary': {
    fontWeight: 500,
    color: theme.palette.text.primary,
    whiteSpace: 'normal',
    fontSize: '1rem',
  },
  '& .MuiListItemText-secondary': {
    color: theme.palette.text.secondary,
    fontSize: '0.95rem',
  },
}));

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 650,
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: '1rem',
    padding: theme.spacing(2),
  },
  '& .MuiTableCell-body': {
    padding: theme.spacing(2),
    fontSize: '0.95rem',
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5),
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.95rem',
  transition: 'all 0.2s ease',
  textAlign: 'left',
  justifyContent: 'flex-start',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    transform: 'translateY(-2px)',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    padding: theme.spacing(1),
  },
}));

const QuotationDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchQuotation = async () => {
      if (!id) return;
      
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/quotations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuotation(res.data);
      } catch (error) {
        console.error('Error fetching quotation:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [id, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quotation?.currencyUnit || 'USD'
    }).format(amount);
  };

  const formatLabel = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .replace(/(\b\w)/g, s => s.toUpperCase());
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Loading quotation details...
        </Typography>
      </Container>
    );
  }

  if (!quotation) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Quotation not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{
      marginLeft: { xs: 0, md: '100px' },
      padding: { xs: 2, md: 4 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f4f6f8',
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        width: '100%',
        maxWidth: '1200px',
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          variant="outlined"
          color="primary"
          sx={{ borderRadius: 1, padding: '8px 16px' }}
        >
          Back
        </Button>
        <Button
          startIcon={<EditIcon />}
          onClick={() => router.push(`/quotations/edit/${id}`)}
          variant="contained"
          color="primary"
          sx={{ borderRadius: 1, padding: '8px 16px' }}
        >
          Edit
        </Button>
      </Box>

      <Box sx={{ width: '100%', maxWidth: '1200px' }}>
        {/* Header Section */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                Quotation #{quotation.quoteNo}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon fontSize="small" />
              Quotation for {quotation.tenderId?.title || 'N/A'}
            </Typography>
          </CardContent>
        </StyledCard>

        {/* Basic Information */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <DescriptionIcon /> Basic Information
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List dense>
                  {[
                    { primary: 'Tender', secondary: quotation.tenderId?.title || 'N/A' },
                    { primary: 'Customer', secondary: quotation.customerId?.name || 'N/A' },
                    { primary: 'Quotation Number', secondary: quotation.quoteNo },
                    { primary: 'Quotation Date', secondary: formatDate(quotation.quoteDate), icon: <CalendarIcon fontSize="small" /> },
                    { primary: 'Delivery Details', secondary: quotation.delivery || 'N/A' },
                    { primary: 'Warranty', secondary: quotation.warranty || 'N/A' },
                    { primary: 'Payment Terms', secondary: quotation.paymentTerms || 'N/A' },
                    { primary: 'Mode', secondary: quotation.mode },
                    { primary: 'Other Mode', secondary: quotation.modeOtherText || 'N/A', condition: quotation.mode === 'Other' },
                    { primary: 'Quote Validity (Days)', secondary: quotation.quoteValidityDays || 'N/A' },
                    { primary: 'Unit Price Multiplier', secondary: quotation.unitPriceMultiplier.toFixed(2) },
                  ].filter(item => !item.condition || item.condition).map(({ primary, secondary, icon }, index) => (
                    <StyledListItem key={primary} index={index}>
                      <ListItemText
                        primary={primary}
                        secondary={
                          icon ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {icon}
                              {secondary}
                            </Box>
                          ) : secondary
                        }
                      />
                    </StyledListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Financial Details */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <MonetizationOnIcon /> Financial Details
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List dense>
                  {[
                    { primary: 'Tax (Decimal)', secondary: quotation.tax.toFixed(2), icon: <MonetizationOnIcon fontSize="small" /> },
                    { primary: 'Currency Unit', secondary: quotation.currencyUnit, icon: <MonetizationOnIcon fontSize="small" /> },
                    { primary: 'Subtotal', secondary: formatCurrency(quotation.subTotal), icon: <MonetizationOnIcon fontSize="small" /> },
                    { primary: 'Tax Amount', secondary: formatCurrency(quotation.tax * quotation.subTotal), icon: <MonetizationOnIcon fontSize="small" /> },
                    { primary: 'Grand Total', secondary: formatCurrency(quotation.grandTotal), icon: <MonetizationOnIcon fontSize="small" /> },
                  ].map(({ primary, secondary, icon }, index) => (
                    <StyledListItem key={primary} index={index}>
                      <ListItemText
                        primary={primary}
                        secondary={
                          icon ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {icon}
                              {secondary}
                            </Box>
                          ) : secondary
                        }
                      />
                    </StyledListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Countries of Origin */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <DescriptionIcon /> Countries of Origin
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List dense>
                  {quotation.coOrigin && quotation.coOrigin.length > 0 ? (
                    quotation.coOrigin.map((co, index) => (
                      <StyledListItem key={index} index={index}>
                        <ListItemText primary={`Country ${index + 1}`} secondary={co} />
                      </StyledListItem>
                    ))
                  ) : (
                    <StyledListItem index={0}>
                      <ListItemText primary="No countries specified" secondary="N/A" />
                    </StyledListItem>
                  )}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Principals */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <DescriptionIcon /> Principals
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List dense>
                  {quotation.principal && quotation.principal.length > 0 ? (
                    quotation.principal.map((p, index) => (
                      <StyledListItem key={index} index={index}>
                        <ListItemText primary={`Principal ${index + 1}`} secondary={p} />
                      </StyledListItem>
                    ))
                  ) : (
                    <StyledListItem index={0}>
                      <ListItemText primary="No principals specified" secondary="N/A" />
                    </StyledListItem>
                  )}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Documents Section */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <AttachFileIcon /> Documents
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <Grid container spacing={2}>
              {[
                { field: 'oemSpecification', label: 'OEM Specification' },
                { field: 'approvedBy', label: 'Approval Document' },
              ].map(({ field, label }) => (
                quotation[field] && (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <StyledButton
                      startIcon={<AttachFileIcon />}
                      onClick={() => window.open(quotation[field], '_blank')}
                      variant="outlined"
                      fullWidth
                    >
                      {label}
                    </StyledButton>
                  </Grid>
                )
              ))}
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Items Section */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <DescriptionIcon /> Items
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'greyLy.300' }} />
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
              <StyledTable>
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>Reference Number</TableCell>
                    <TableCell>Item Description</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Currency Unit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotation.items?.length > 0 ? (
                    quotation.items.map((item, index) => (
                      <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'grey.100' } }}>
                        <TableCell>{item.sNo}</TableCell>
                        <TableCell>{item.refNo || 'N/A'}</TableCell>
                        <TableCell>
                          {/* Sanitize HTML content to prevent XSS attacks */}
                          {item.item ? (
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.item) }} />
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>{item.qty}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.qty * item.unitPrice * quotation.unitPriceMultiplier)}</TableCell>
                        <TableCell>{quotation.currencyUnit || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No items available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </StyledTable>
            </TableContainer>
          </CardContent>
        </StyledCard>
      </Box>
    </Container>
  );
};

export default QuotationDetail;