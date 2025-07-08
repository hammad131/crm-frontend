import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container, Typography, Box, Grid, Card, CardContent, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Paper, Chip
} from '@mui/material';
import {
  Add as AddIcon, Visibility as VisibilityIcon, Edit as EditIcon,
  People as PeopleIcon, Assignment as AssignmentIcon,
  RequestQuote as RequestQuoteIcon, Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { isTokenValid } from '../../utils/auth';

import dotenv from "dotenv";
dotenv.config();

// Styled components from TenderEditPage.jsx
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

// Function to determine deadline status
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

// Function to format date as MM/DD/YYYY
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

// Function to format currency
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const Home = () => {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalTenders: 0,
    ongoingTenders: 0,
    completedTenders: 0,
    totalCustomers: 0,
    totalQuotations: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    totalPurchaseOrders: 0,
  });
  const [recentTenders, setRecentTenders] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (!token || !isTokenValid(token)) {
        router.replace('/login');
        return;
      }

      setCheckingAuth(false);
      try {
        const [tendersRes, customersRes, quotationsRes, invoicesRes, poRes, recentTendersRes, recentInvoicesRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/tenders`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/customers`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/quotations`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/invoices`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/purchase-orders`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/tenders?limit=5&sort=-updatedAt`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/api/invoices?limit=5&sort=-updatedAt`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const tenders = tendersRes.data;
        const invoices = invoicesRes.data;
        setMetrics({
          totalTenders: tenders.length,
          ongoingTenders: tenders.filter(t => t.projectStatus === 'Ongoing').length,
          completedTenders: tenders.filter(t => t.projectStatus === 'Completed').length,
          totalCustomers: customersRes.data.length,
          totalQuotations: quotationsRes.data.length,
          totalInvoices: invoices.length,
          paidInvoices: invoices.filter(i => i.status === 'Paid').length,
          unpaidInvoices: invoices.filter(i => i.status === 'Not Paid').length,
          partiallyPaidInvoices: invoices.filter(i => i.status === 'Partially Paid').length,
          totalPurchaseOrders: poRes.data.length,
        });
        setRecentTenders(recentTendersRes.data);
        setRecentInvoices(recentInvoicesRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router, token]);

  if (checkingAuth || loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', marginLeft: '240px' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center', marginLeft: '240px' }}>
        <Typography variant="h6" color="error">{error}</Typography>
        <Button variant="outlined" onClick={() => router.reload()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Box
      component="main"
      role="main"
      sx={{
        marginLeft: '240px',
        padding: 4,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Tender Management Dashboard
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Manage tenders, quotations, invoices, purchase orders, customers, and vendors with ease.
        </Typography>

        {/* Summary Cards */}
        <StyledCard>
          <CardContent>
            <SectionHeader variant="h6">Key Metrics</SectionHeader>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#e3f2fd' }}>
                  <CardContent>
                    <Typography variant="h6">{metrics.totalTenders}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Tenders</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography variant="h6">{metrics.ongoingTenders}</Typography>
                    <Typography variant="body2" color="text.secondary">Ongoing Tenders</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#fff3e0' }}>
                  <CardContent>
                    <Typography variant="h6">{metrics.completedTenders}</Typography>
                    <Typography variant="body2" color="text.secondary">Completed Tenders</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#f3e5f5' }}>
                  <CardContent>
                    <Typography variant="h6">{metrics.totalCustomers}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Customers</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#e0f7fa' }}>
                  <CardContent>
                    <Typography variant="h6">{metrics.totalQuotations}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Quotations</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#fce4ec' }}>
                  <CardContent>
                    <Typography variant="h6">{metrics.totalInvoices}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Invoices</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#e1bee7' }}>
                  <CardContent>
                    <Typography variant="h6">{metrics.paidInvoices}</Typography>
                    <Typography variant="body2" color="text.secondary">Paid Invoices</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#ffccbc' }}>
                  <CardContent>
                    <Typography variant="h6">{metrics.unpaidInvoices}</Typography>
                    <Typography variant="body2" color="text.secondary">Unpaid Invoices</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#f3e5f5' }}>
                  <CardContent>
                    <Typography variant="h6">{metrics.partiallyPaidInvoices}</Typography>
                    <Typography variant="body2" color="text.secondary">Partially Paid Invoices</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#f1f8e9' }}>
                  <CardContent>
                    <Typography variant="h6">{metrics.totalPurchaseOrders}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Purchase Orders</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Quick Actions */}
        <StyledCard>
          <CardContent>
            <SectionHeader variant="h6">Quick Actions</SectionHeader>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  fullWidth
                  component={Link}
                  href="/tenders/new"
                >
                  Create New Tender
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AssignmentIcon />}
                  fullWidth
                  component={Link}
                  href="/tenders"
                >
                  View All Tenders
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  fullWidth
                  component={Link}
                  href="/quotations/new"
                >
                  Create New Quotation
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<RequestQuoteIcon />}
                  fullWidth
                  component={Link}
                  href="/quotations"
                >
                  View All Quotations
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  fullWidth
                  component={Link}
                  href="/invoices/new"
                >
                  Create New Invoice
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ReceiptIcon />}
                  fullWidth
                  component={Link}
                  href="/invoices"
                >
                  View All Invoices
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  fullWidth
                  component={Link}
                  href="/purchase-orders/new"
                >
                  Create New Purchase Order
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PeopleIcon />}
                  fullWidth
                  component={Link}
                  href="/customers"
                >
                  Manage Customers
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ShoppingCartIcon />}
                  fullWidth
                  component={Link}
                  href="/vendors"
                >
                  Manage Vendors
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Recent Tenders */}
        <StyledCard>
          <CardContent>
            <SectionHeader variant="h6">Recent Tenders</SectionHeader>
            {recentTenders.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Deadline</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTenders.map((tender) => {
                      const deadlineStatus = getDeadlineStatus(tender.dueDate);
                      return (
                        <TableRow key={tender._id}>
                          <TableCell>{tender.title}</TableCell>
                          <TableCell>{tender.customerId?.name || 'N/A'}</TableCell>
                          <TableCell>{tender.projectStatus}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">{formatDate(tender.dueDate)}</Typography>
                              <Chip
                                label={deadlineStatus.label}
                                color={deadlineStatus.color}
                                size="small"
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              startIcon={<VisibilityIcon />}
                              component={Link}
                              href={`/tenders/${tender._id}`}
                              sx={{ mr: 1 }}
                            >
                              View
                            </Button>
                            <Button
                              variant="outlined"
                              color="secondary"
                              size="small"
                              startIcon={<EditIcon />}
                              component={Link}
                              href={`/tenders/edit/${tender._id}`}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No recent tenders available.
              </Typography>
            )}
          </CardContent>
        </StyledCard>

        {/* Recent Invoices */}
        <StyledCard>
          <CardContent>
            <SectionHeader variant="h6">Recent Invoices</SectionHeader>
            {recentInvoices.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice Number</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentInvoices.map((invoice) => {
                      const deadlineStatus = getDeadlineStatus(invoice.dueDate);
                      return (
                        <TableRow key={invoice._id}>
                          <TableCell>{invoice.invoiceNo || 'N/A'}</TableCell>
                          <TableCell>{invoice.customerId?.name || 'N/A'}</TableCell>
                          <TableCell>{invoice.status}</TableCell>
                          <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">{formatDate(invoice.dueDate)}</Typography>
                              <Chip
                                label={deadlineStatus.label}
                                color={deadlineStatus.color}
                                size="small"
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              startIcon={<VisibilityIcon />}
                              component={Link}
                              href={`/invoices/${invoice._id}`}
                              sx={{ mr: 1 }}
                            >
                              View
                            </Button>
                            <Button
                              variant="outlined"
                              color="secondary"
                              size="small"
                              startIcon={<EditIcon />}
                              component={Link}
                              href={`/invoices/edit/${invoice._id}`}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No recent invoices available.
              </Typography>
            )}
          </CardContent>
        </StyledCard>
      </Container>
    </Box>
  );
};

export default Home;