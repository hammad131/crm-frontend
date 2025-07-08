'use client';
import React from "react";
import { Box, Container, Button } from "@mui/material";
import InvoiceForm from "../../components/InvoiceForm";
import { useRouter } from "next/router";

const NewInvoicePage = () => {
  const router = useRouter();

  return (
    <Box component="main"
        sx={{
          marginLeft: "240px",  // Match Drawer width
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // Horizontally center child container
        }}>
      <Container>
        <Button variant="outlined" onClick={() => router.back()} sx={{ mb: 2 }}>
          Back
        </Button>
        <InvoiceForm />
      </Container>
    </Box>
  );
};

export default NewInvoicePage;
