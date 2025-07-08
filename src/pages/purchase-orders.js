import Navbar from "../components/Navbar";
import PurchaseOrderList from "../components/PurchaseOrderList";
import { Container, Typography, Button, Box} from "@mui/material";
import Link from "next/link";
import { useEffect } from 'react';
import { isTokenValid } from '../../utils/auth';
import { useRouter } from 'next/router';

export default function PurchaseOrders() {
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
          // Horizontally center child container
        }}>
      <Container>
         <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" component={Link} href="/purchase-orders/new">
          Create New Purchase Order
        </Button>
        </Box>
        <PurchaseOrderList />
      </Container>
      </Box>
    </>
  );
}