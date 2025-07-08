import { useState } from "react";
import axios from "axios";
import { TextField, Button, Grid, Container, Typography } from "@mui/material";

import dotenv from "dotenv";
dotenv.config();

const CustomerForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    universityName: "",
    universityPrefix: "",
    departmentName: "",
    departmentPrefix: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${process.env.API}/api/customers`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Customer created successfully");
    } catch (err) {
      console.error("Creation failed", err);
      alert("Error creating customer");
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>Create Customer</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {Object.keys(form).map((key) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                name={key}
                value={form[key]}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default CustomerForm;