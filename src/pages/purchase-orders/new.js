
import { Box, Container, Button } from "@mui/material";
import PurchaseOrderForm from "../../components/PurchaseOrderForm";
import { useRouter } from "next/router";

export default function NewPurchaseOrder() {
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
        <PurchaseOrderForm />
      </Container>
    </Box>

  );
}