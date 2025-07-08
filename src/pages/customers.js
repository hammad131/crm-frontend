
import CustomerList from "../components/CustomerList";
import { Container, Typography, Button, Box } from "@mui/material";
import Link from "next/link";
import { useEffect } from 'react';
import { isTokenValid } from '../../utils/auth';
import { useRouter } from 'next/router';

export default function Customers() {
  const router = useRouter();
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token || !isTokenValid(token)) {
        router.replace('/login');
      }
    }, []);
  return (
    <>
      <Box
        component="main"
        sx={{
          marginLeft: "240px",  // Match sidebar drawer width
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Container>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              component={Link}
              href="/customers/new"
            >
              Add New Customer
            </Button>
          </Box>
          <CustomerList />
        </Container>
      </Box>
    </>
  );
}
