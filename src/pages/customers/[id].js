import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import dotenv from "dotenv";
dotenv.config();

const CustomerDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/customers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCustomer(res.data);
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    };
    fetchCustomer();
  }, [id]);

  if (!customer) return <Typography>Loading...</Typography>;

  return (
    <Box
      component="main"
      sx={{
        marginLeft: "240px",
        padding: 4,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Customer Details: {customer.name}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Basic Info</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><strong>Name:</strong> {customer.name}</Grid>
            <Grid item xs={12} sm={6}><strong>Email:</strong> {customer.email}</Grid>
            <Grid item xs={12} sm={6}><strong>Phone:</strong> {customer.phone}</Grid>
            <Grid item xs={12} sm={6}><strong>Address:</strong> {customer.address}</Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>University & Department</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><strong>University Name:</strong> {customer.universityName}</Grid>
            <Grid item xs={12} sm={6}><strong>University Prefix:</strong> {customer.universityPrefix}</Grid>
            <Grid item xs={12} sm={6}><strong>Department Name:</strong> {customer.departmentName}</Grid>
            <Grid item xs={12} sm={6}><strong>Department Prefix:</strong> {customer.departmentPrefix}</Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>System Info</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><strong>Created At:</strong> {new Date(customer.createdAt).toLocaleString()}</Grid>
            <Grid item xs={12} sm={6}><strong>Updated At:</strong> {new Date(customer.updatedAt).toLocaleString()}</Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerDetailPage;
