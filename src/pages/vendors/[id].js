'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Typography, Box, Card, CardContent, Grid, Divider, Button
} from "@mui/material";
import dotenv from "dotenv";
dotenv.config();

const VendorDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchVendor = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/vendors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendor(res.data);
    };
    fetchVendor();
  }, [id]);

  if (!vendor) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ marginLeft: "240px", padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Vendor: {vendor.name}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Contact Information</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}><strong>Contact Person:</strong> {vendor.contactPerson}</Grid>
            <Grid item xs={6}><strong>Email:</strong> {vendor.email}</Grid>
            <Grid item xs={6}><strong>Phone:</strong> {vendor.phone}</Grid>
            <Grid item xs={6}><strong>NTN:</strong> {vendor.ntn}</Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Address</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}><strong>Address:</strong> {vendor.address}</Grid>
            <Grid item xs={4}><strong>City:</strong> {vendor.city}</Grid>
            <Grid item xs={4}><strong>Country:</strong> {vendor.country}</Grid>
            <Grid item xs={4}><strong>Zip Code:</strong> {vendor.zipCode}</Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Remarks</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography>{vendor.remarks || "No remarks"}</Typography>
        </CardContent>
      </Card>

      <Box mt={3}>
        <Button variant="outlined" onClick={() => router.push(`/vendors/edit/${vendor._id}`)}>Edit Vendor</Button>
      </Box>
    </Box>
  );
};

export default VendorDetailPage;
