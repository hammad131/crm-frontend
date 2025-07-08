import Navbar from "../../components/Navbar";
import { Box } from "@mui/material";
import QuotationsForm from "@/components/QuotationForm";

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
      <QuotationsForm />
      </Box>
    </>
  );
}