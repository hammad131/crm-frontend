import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container, Typography, Box, Card, CardContent, Divider,
  Button, Grid, Paper, List, ListItem, ListItemText,
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  MonetizationOn as MonetizationOnIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import dotenv from "dotenv";
dotenv.config();


// Custom styled components (matching QuotationDetail.tsx)
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

const PurchaseOrderDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      if (!id) return;
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/purchase-orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPurchaseOrder(res.data);
      } catch (error) {
        console.error('Error fetching purchase order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchaseOrder();
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
    const currency = purchaseOrder?.mode === 'F.O.R' ? 'PKR' : 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
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
          Loading purchase order details...
        </Typography>
      </Container>
    );
  }

  if (!purchaseOrder) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Purchase order not found
        </Typography>
      </Container>
    );
  }

  const {
    poNumber, poDate, vendorId, clientRefNo, clientOrderNo, mode, shipTo,
    shippingTerms, shippingMethod, deliveryDate, items, subTotal, grandTotal,
    deliveryTerms, paymentTerms, warranty, notes, importDutiesTaxes,
    inspectionTerms, forceMajeure, customsCompliance,
  } = purchaseOrder;

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
        <Box>
          <StyledButton
            startIcon={<EditIcon />}
            onClick={() => router.push(`/purchase-orders/edit/${id}`)}
            variant="contained"
            color="primary"
          >
            Edit
          </StyledButton>
        </Box>
      </Box>

      <Box sx={{ width: '100%', maxWidth: '1200px' }}>
        {/* Header Section */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                Purchase Order #{poNumber}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon fontSize="small" />
              Purchase Order for {clientRefNo?.quoteNo || 'N/A'}
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
                    { primary: 'Purchase Order Number', secondary: poNumber },
                    { primary: 'Purchase Order Date', secondary: formatDate(poDate), icon: <CalendarIcon fontSize="small" /> },
                    { primary: 'Vendor', secondary: vendorId?.name || 'N/A' },
                    { primary: 'Quotation Reference', secondary: clientRefNo?.quoteNo || 'N/A' },
                    { primary: 'Client Order Number', secondary: clientOrderNo || 'N/A' },
                    { primary: 'Mode', secondary: mode },
                    { primary: 'Shipping Terms', secondary: shippingTerms || 'N/A' },
                    { primary: 'Shipping Method', secondary: shippingMethod || 'N/A' },
                    { primary: 'Delivery Date', secondary: formatDate(deliveryDate), icon: <CalendarIcon fontSize="small" /> },
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

        {/* Ship To */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <DescriptionIcon /> Ship To
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List dense>
                  {[
                    { primary: 'Name', secondary: shipTo?.name || 'N/A' },
                    { primary: 'Address', secondary: shipTo?.address || 'N/A' },
                    { primary: 'City', secondary: shipTo?.city || 'N/A' },
                    { primary: 'Zip Code', secondary: shipTo?.zip || 'N/A' },
                    { primary: 'Phone', secondary: shipTo?.phone || 'N/A' },
                    { primary: 'Fax', secondary: shipTo?.fax || 'N/A' },
                    { primary: 'Email', secondary: shipTo?.email || 'N/A' },
                  ].map(({ primary, secondary }, index) => (
                    <StyledListItem key={primary} index={index}>
                      <ListItemText primary={primary} secondary={secondary} />
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
                    { primary: 'Subtotal', secondary: formatCurrency(subTotal), icon: <MonetizationOnIcon fontSize="small" /> },
                    { primary: 'Grand Total', secondary: formatCurrency(grandTotal), icon: <MonetizationOnIcon fontSize="small" /> },
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

        {/* Items Section */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <DescriptionIcon /> Items
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
              <StyledTable>
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Total Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items?.map((item, index) => (
                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'grey.100' } }}>
                      <TableCell>{item.sNo}</TableCell>
                      <TableCell>{item.description || 'N/A'}</TableCell>
                      <TableCell align="center">{item.qty}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </StyledTable>
            </TableContainer>
          </CardContent>
        </StyledCard>

        {/* Terms and Conditions */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <DescriptionIcon /> Terms and Conditions
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List dense>
                  {[
                    { primary: 'Delivery Terms', secondary: deliveryTerms || 'N/A' },
                    { primary: 'Payment Terms', secondary: paymentTerms || 'N/A' },
                    { primary: 'Warranty', secondary: warranty || 'N/A' },
                    { primary: 'Notes', secondary: notes || 'N/A' },
                    { primary: 'Import Duties and Taxes', secondary: importDutiesTaxes || 'N/A' },
                    { primary: 'Inspection Terms', secondary: inspectionTerms || 'N/A' },
                    { primary: 'Force Majeure', secondary: forceMajeure || 'N/A' },
                    { primary: 'Customs Compliance', secondary: customsCompliance || 'N/A' },
                  ].map(({ primary, secondary }, index) => (
                    <StyledListItem key={primary} index={index}>
                      <ListItemText primary={primary} secondary={secondary} />
                    </StyledListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      </Box>
    </Container>
  );
};

export default PurchaseOrderDetailPage;