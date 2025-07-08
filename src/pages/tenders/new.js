import Navbar from "../../components/Navbar";
import TenderForm from "@/components/TenderForm";
import { Container, Typography, Button, Box } from "@mui/material";
export default function NewTender() {
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
    <TenderForm />
    </Box>
    </>
  );
}