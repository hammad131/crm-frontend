'use client';
import React, { useState } from "react";
import {
  Container, Typography, Grid, TextField, Button
} from "@mui/material";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const VendorForm = () => {
  const [formData, setFormData] = useState({
    name: "", contactPerson: "", phone: "", email: "",
    address: "", city: "", country: "", zipCode: "", ntn: "", remarks: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API}/api/vendors`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Vendor created successfully!");
    } catch (err) {
      console.error("Vendor creation failed", err);
      alert("Failed to create vendor.");
    }
  };

  return (
    <Container>
      <Typography variant="h6" gutterBottom>Create Vendor</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={6}><TextField label="Vendor Name" name="name" fullWidth required value={formData.name} onChange={handleChange} /></Grid>
          <Grid item xs={6}><TextField label="Contact Person" name="contactPerson" fullWidth value={formData.contactPerson} onChange={handleChange} /></Grid>
          <Grid item xs={6}><TextField label="Email" name="email" type="email" fullWidth value={formData.email} onChange={handleChange} /></Grid>
          <Grid item xs={6}><TextField label="Phone" name="phone" fullWidth value={formData.phone} onChange={handleChange} /></Grid>
          <Grid item xs={6}><TextField label="Address" name="address" fullWidth value={formData.address} onChange={handleChange} /></Grid>
          <Grid item xs={3}><TextField label="City" name="city" fullWidth value={formData.city} onChange={handleChange} /></Grid>
          <Grid item xs={3}><TextField label="Country" name="country" fullWidth value={formData.country} onChange={handleChange} /></Grid>
          <Grid item xs={3}><TextField label="Zip Code" name="zipCode" fullWidth value={formData.zipCode} onChange={handleChange} /></Grid>
          <Grid item xs={3}><TextField label="NTN" name="ntn" fullWidth value={formData.ntn} onChange={handleChange} /></Grid>
          <Grid item xs={12}><TextField label="Remarks" name="remarks" multiline rows={2} fullWidth value={formData.remarks} onChange={handleChange} /></Grid>
          <Grid item xs={12}><Button variant="contained" type="submit">Submit</Button></Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default VendorForm;
