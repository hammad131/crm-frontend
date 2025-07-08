'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container, Typography, Box, Card, CardContent, Divider,
  Button, Grid, List, ListItem, ListItemText
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import dotenv from "dotenv";
dotenv.config();

// Custom styled components (matching InvoiceDetail)
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

const UserDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
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

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Loading user details...
        </Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          User not found
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
          onClick={() => router.push(`/users/edit/${id}`)}
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
                User: {user.name}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon fontSize="small" />
              Details for {user.email || 'N/A'}
            </Typography>
          </CardContent>
        </StyledCard>

        {/* User Information */}
        <StyledCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <SectionHeader>
              <DescriptionIcon /> User Information
            </SectionHeader>
            <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List dense>
                  {[
                    { primary: 'Name', secondary: user.name || 'N/A' },
                    { primary: 'Email', secondary: user.email || 'N/A' },
                    { primary: 'Role', secondary: user.role || 'N/A' },
                    { primary: 'Created At', secondary: formatDate(user.createdAt), icon: <CalendarIcon fontSize="small" /> },
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
      </Box>
    </Container>
  );
};

export default UserDetail;