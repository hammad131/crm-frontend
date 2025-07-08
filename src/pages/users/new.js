'use client';
import React from "react";
import { Box, Container, Button } from "@mui/material";
import UserForm from "../../components/UserForm";
import { useRouter } from "next/router";

const NewUserPage = () => {
  const router = useRouter();

  return (
    <Box
      component="main"
      sx={{
        marginLeft: "240px", // Match Drawer width
        padding: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Horizontally center child container
      }}
    >
      <Container>
        <Button variant="outlined" onClick={() => router.back()} sx={{ mb: 2 }}>
          Back
        </Button>
        <UserForm />
      </Container>
    </Box>
  );
};

export default NewUserPage;