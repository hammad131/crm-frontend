import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import DOMPurify from 'dompurify';
import {
  Container, Typography, Box, Card, CardContent, Divider,
  Button, Grid, Paper, Chip, List, ListItem, ListItemText,
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  AttachFile as AttachFileIcon,
  MonetizationOn as MonetizationOnIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
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

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: 
    status === 'Completed' ? theme.palette.success.main :
    status === 'Ongoing' ? theme.palette.info.main :
    status === 'Cancelled' ? theme.palette.error.main :
    theme.palette.warning.main,
  color: theme.palette.common.white,
  fontWeight: 600,
  padding: theme.spacing(0.5, 1),
  boxShadow: theme.shadows[2],
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 
      status === 'Completed' ? theme.palette.success.dark :
      status === 'Ongoing' ? theme.palette.info.dark :
      status === 'Cancelled' ? theme.palette.error.dark :
      theme.palette.warning.dark,
  },
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
  minWidth: { xs: '100%', sm: 650 },
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

const TenderDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchTender = async () => {
      if (!id) return;
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/tenders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTender(res.data);
      } catch (error) {
        console.error('Error fetching tender:', error);
        setError('Failed to load tender details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTender();
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
      currency: 'USD'
    }).format(amount);
  };

  const getBooleanDisplay = (value) => {
    return value === 'Yes' ? (
      <Chip icon={<CheckCircleIcon fontSize="small" />} label="Yes" color="success" size="small" />
    ) : (
      <Chip icon={<CancelIcon fontSize="small" />} label="No" color="error" size="small" />
    );
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
          Loading tender details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!tender) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Tender not found
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
          onClick={() => router.push(`/tenders/edit/${id}`)}
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
                {tender.title}
              </Typography>
              <StatusChip label={tender.projectStatus} status={tender.projectStatus} />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon fontSize="small" />
              {tender.description}
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
                    { primary: 'Tender No', secondary: tender.tenderNo || 'N/A' },
                    { primary: 'Customer', secondary: tender.customerId?.name || 'N/A' },
                    { primary: 'Published On', secondary: formatDate(tender.publishedOn), icon: <CalendarIcon fontSize="small" /> },
                    { primary: 'Due Date', secondary: formatDate(tender.dueDate), icon: <CalendarIcon fontSize="small" /> }
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

        {/* Key Dates */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <CalendarIcon /> Key Dates
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <Grid container spacing={3}>
              {[
                'preBidMeeting',
                'contractDate',
                'twoStageTechnicalOpeningTimeAndDate',
                'twoStageFinancialOpeningTimeAndDate',
                'shippingTimeAndDate',
                'deliveryTimeAndDate',
                'inspectionTimeAndDate',
                'installationTrainingCompletion',
                'expectedShipmentDate',
                'extendedDeliveryDate'
              ].map((field, index) => (
                <Grid item xs={12} md={6} key={field}>
                  <StyledListItem index={index}>
                    <ListItemText
                      primary={formatLabel(field)}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" />
                          {formatDate(tender[field])}
                        </Box>
                      }
                      primaryTypographyProps={{ style: { whiteSpace: 'normal' } }}
                    />
                  </StyledListItem>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Tender Process */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <DescriptionIcon /> Tender Process
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List dense>
                  {[
                    { primary: 'Tender Type', secondary: tender.singleStage || 'N/A' },
                    { primary: 'Opening Time & Venue', secondary: tender.openingTimeAndVenue || 'N/A' },
                    { primary: 'Extension Status', secondary: tender.extensionStatus || 'N/A' },
                    { primary: 'Project Status', secondary: tender.projectStatus || 'N/A' },
                    { primary: 'End User Query', secondary: tender.endUserQuery || 'N/A' },
                    { primary: 'Orders Awarded', secondary: tender.ordersAwarded || 'N/A' }
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
                    { primary: 'Total Amount Quoted', secondary: formatCurrency(tender.totalAmountQuoted), icon: <MonetizationOnIcon fontSize="small" /> },
                    { primary: 'Awarded Amount', secondary: formatCurrency(tender.awardedAmount), icon: <MonetizationOnIcon fontSize="small" /> },
                    { primary: 'Stamp Duty', secondary: formatCurrency(tender.stampDuty), icon: <MonetizationOnIcon fontSize="small" /> },
                    { primary: 'Earnest Money Amount', secondary: formatCurrency(tender.earnestMoneyAmount), icon: <MonetizationOnIcon fontSize="small" /> },
                    { primary: 'Late Delivery Charges', secondary: formatCurrency(tender.lateDeliveryCharges), icon: <MonetizationOnIcon fontSize="small" /> },
                    { primary: 'Mode of Delivery', secondary: tender.modeOfDelivery || 'N/A' },
                    { primary: 'Other Mode of Delivery', secondary: tender.modeOfDeliveryOtherText || 'N/A', condition: tender.modeOfDelivery === 'Other' },
                    { primary: 'Performance Guarantee', secondary: tender.performanceGuarantee || 'N/A' },
                    { primary: 'Other Performance Guarantee', secondary: tender.performanceGuaranteeOtherText || 'N/A', condition: tender.performanceGuarantee === 'Other' },
                    { primary: 'Performance Guarantee Released', secondary: tender.performanceGuaranteeReleased || 'N/A' },
                    { primary: 'Bill Status', secondary: tender.billStatus || 'N/A' },
                    { primary: 'Orders Placed', secondary: getBooleanDisplay(tender.ordersPlaced), icon: null },
                    { primary: 'Number of Items Awarded', secondary: tender.numItemsAwarded || 'N/A' }
                  ].filter(item => !item.condition || item.condition).map(({ primary, secondary, icon }, index) => (
                    <StyledListItem key={primary} index={index}>
                      <ListItemText
                        primary={primary}
                        secondary={
                          icon !== null ? (
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

        {/* Documents Section */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <AttachFileIcon /> Documents
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <Grid container spacing={2}>
              {[
                { field: 'contractAgreements', label: 'Contract Agreements' },
                { field: 'installationTrainingReport', label: 'Installation Training Report' },
                { field: 'earnestMoney', label: 'Earnest Money Document' },
                { field: 'performanceGuaranteeImage', label: 'Performance Guarantee Image' },
                { field: 'extensionLetterImage', label: 'Extension Letter' },
                { field: 'bidEvaluationReport', label: 'Bid Evaluation Report' },
                { field: 'billUrl', label: 'Bill Document' }
              ].map(({ field, label }) => (
                tender[field] && (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <StyledButton
                      startIcon={<AttachFileIcon />}
                      onClick={() => window.open(tender[field], '_blank')}
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
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
              <StyledTable>
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>Tender Item Ref</TableCell>
                    <TableCell>Item Description</TableCell>
                    <TableCell>Expected Delivery Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tender.items?.length > 0 ? (
                    tender.items.map((item, index) => (
                      <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'grey.100' } }}>
                        <TableCell>{item.sNo}</TableCell>
                        <TableCell>{item.tenderItemRef || 'N/A'}</TableCell>
                        <TableCell>
                          {item.item ? (
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.item) }} />
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon fontSize="small" />
                            {formatDate(item.expectedDeliveryDate)}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No items available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </StyledTable>
            </TableContainer>
          </CardContent>
        </StyledCard>

        {/* Personnel Information */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <DescriptionIcon /> Personnel Information
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List dense>
                  {[
                    { primary: 'Focal Person Info', secondary: tender.focalPersonInfo || 'N/A' },
                    { primary: 'Incharge at Paktech', secondary: tender.inchargeAtPaktech || 'N/A' }
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

export default TenderDetails;