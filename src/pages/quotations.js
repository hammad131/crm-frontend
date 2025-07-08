import QuotationList from "../components/QuotationList";
import { Container, Typography, Button, Box } from "@mui/material";
import Link from "next/link";
import { useEffect } from 'react';
import { isTokenValid } from '../../utils/auth';
import { useRouter } from 'next/router';

export default function Quotations() {
  const router = useRouter();
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token || !isTokenValid(token)) {
        router.replace('/login');
      }
    }, []);
  return (
    <>
      <Box component="main"
        sx={{
          marginLeft: "240px",  // Match Drawer width
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
          // Horizontally center child container
        }}>
      <Container>
        {/* <Typography variant="h4" gutterBottom>
          Quotations
        </Typography> */}
         <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" component={Link} href="/quotations/new">
          Create New Quotation
        </Button>
        </Box>
        <QuotationList />
      </Container>
      </Box>
    </>
  );
}