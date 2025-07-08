import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Navbar from "../components/Navbar";
import "../styles/globals.css";
import { useRouter } from "next/router";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const noNavbarRoutes = ['/login', '/register']; // Add more paths if needed
  const showNavbar = !noNavbarRoutes.includes(router.pathname);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {showNavbar && <Navbar />}
        <Component {...pageProps} />
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default MyApp;
