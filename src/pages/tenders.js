import Navbar from "../components/Navbar";
import TenderList from "../components/TenderList";
import { Container, Typography, Button, Box } from "@mui/material";
import Link from "next/link";
import { useEffect,useState } from 'react';
import { useRouter } from 'next/router';
import { isTokenValid } from '../../utils/auth';

export default function Tenders() {
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token || !isTokenValid(token)) {
        router.replace('/login');
      } else {
        setCheckingAuth(false);
      }
    }, [router]);

    if (checkingAuth) return <Typography>Loading...</Typography>;
  return (
    <>

      <Box
        component="main"
        sx={{
          marginLeft: "240px",  // Match Drawer width
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // Horizontally center child container
        }}
      >
        <Container >
          {/* <Typography variant="h4" gutterBottom>
            Tenders
          </Typography> */}
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              component={Link}
              href="/tenders/new"
            >
              Create New Tender
            </Button>
          </Box>
          <TenderList />
        </Container>
      </Box>
    </>
  );
}
