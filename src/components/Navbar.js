"use client";
import { useEffect, useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Toolbar,
  AppBar,
  Button,
  Avatar,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import dotenv from "dotenv";
dotenv.config();


const drawerWidth = 240;

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    handleClose();
    router.push("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.userId || decoded.id || decoded._id;

        fetch(`${process.env.NEXT_PUBLIC_API}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Unauthorized");
            return res.json();
          })
          .then((data) => {
            setUser({ name: data.name, role: data.role });
          })
          .catch((err) => {
            console.error("Fetch error:", err);
            localStorage.removeItem("token");
          });
      } catch (err) {
        console.error("Token decode failed:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const navItems = [
  { label: "Home", icon: <HomeIcon />, path: "/" },
  { label: "Tenders", icon: <WorkIcon />, path: "/tenders" },
  { label: "Quotations", icon: <ArticleIcon />, path: "/quotations" },
  { label: "Purchase Orders", icon: <AssignmentIndIcon />, path: "/purchase-orders" },
  { label: "Invoices", icon: <ReceiptLongIcon />, path: "/invoices" },
  { label: "Vendors", icon: <BusinessIcon />, path: "/vendors" }, 
  { label: "Customers", icon: <BusinessIcon />, path: "/customers" }, 
  { label: "Admin-Users", icon: <PeopleIcon />, path: "/users" },
];


  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#f1f5f9",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderTopRightRadius: 0,
            borderBottomRightRadius: "80px",
          },
        }}
      >
        <Box>
          <Toolbar sx={{ justifyContent: "center", py: 2 }}>
            <Avatar src='/images/logo.png' alt="Logo" sx={{ width: 60, height: 60 }} />
          </Toolbar>
          <List>
            {navItems.map((item) => (
              <ListItem
                key={item.label}
                button
                component={Link}
                href={item.path}
                sx={{
                  backgroundColor: pathname === item.path ? "#e0e7ff" : "inherit",
                  borderRadius: 1,
                  // mx: 1,
                  // my: 0.5,
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="static"
          color="primary"
          sx={{
            
            width: `calc(100% - 0px)`,
            boxShadow: 1,
          }}
        >
          <Toolbar sx={{ justifyContent: "flex-end" }}>
            {user ? (
              <>
                <IconButton color="inherit" onClick={handleMenu}>
                  <AccountCircle />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {user.name} ({user.role})
                  </Typography>
                </IconButton>
                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" component={Link} href="/login">
                Login
              </Button>
            )}
          </Toolbar>
        </AppBar>
      </Box>
    </Box>
  );
};

export default Navbar;
