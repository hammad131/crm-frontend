
import CustomerForm from "@/components/CustomerForm";
import { Box } from "@mui/material";

export default function NewCustomer() {
  return (
    <>
      <Box
        component="main"
        sx={{
          marginLeft: "240px", // Match Drawer width
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <CustomerForm />
      </Box>
    </>
  );
}
