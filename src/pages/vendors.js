'use client';
import VendorList from "../components/VendorList";
import { Container, Box, Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { isTokenValid } from '../../utils/auth';

export default function Vendors() {
    const router = useRouter();
    
    useEffect(() => {
          const token = localStorage.getItem('token');
          if (!token || !isTokenValid(token)) {
            router.replace('/login');
          }
    }, []);

  return (
    <Box  component="main"
        sx={{
          marginLeft: "240px",  // Match Drawer width
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // Horizontally center child container
        }}>
      <Container>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button variant="contained" component={Link} href="/vendors/new">
            Add Vendor
          </Button>
        </Box>
        <VendorList />
      </Container>
    </Box>
  );
}
