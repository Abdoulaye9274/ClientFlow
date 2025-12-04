import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Button, Box, Avatar
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import DescriptionIcon from "@mui/icons-material/Description";
import BuildIcon from "@mui/icons-material/Build";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const drawerWidth = 240;

export default function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#1976d2",
            color: "#fff"
          }
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src={require("../assets/logo.png")}
            alt="Logo"
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'white',
              borderRadius: '50%',
              p: 0.5
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            ClientFlow
          </Typography>
        </Toolbar>

        <List sx={{ px: 2 }}>
          {[
            { text: "Tableau de bord", icon: <DashboardIcon />, path: "/dashboard" },
            { text: "Clients", icon: <PeopleIcon />, path: "/dashboard/clients" },
            { text: "Contrats", icon: <DescriptionIcon />, path: "/dashboard/contracts" },
            { text: "Services", icon: <BuildIcon />, path: "/dashboard/services" },
            { text: "Assistant IA", icon: <SmartToyIcon />, path: "/dashboard/ai" },
            { text: "Paramètres", icon: <SettingsIcon />, path: "/dashboard/settings" }
          ].map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{ mb: 1, borderRadius: 1 }}
            >
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ p: 2 }}>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            fullWidth
            onClick={handleLogout}
            sx={{ color: "#fff", borderColor: "#fff" }}
          >
            Déconnexion
          </Button>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: "#fff", color: "#1976d2" }}>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: "bold" }}>
              Tableau de bord
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {JSON.parse(localStorage.getItem('user') || '{}').login || 'Utilisateur'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </Typography>
              </Box>
              <Avatar
                sx={{ bgcolor: '#1976d2', cursor: 'pointer' }}
                onClick={() => navigate("/dashboard/settings")}
              >
                {(JSON.parse(localStorage.getItem('user') || '{}').login || 'U')[0].toUpperCase()}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
