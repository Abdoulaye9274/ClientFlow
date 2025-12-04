import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Login from "./pages/Login";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import DashboardLayout from "./components/DashboardLayout";
import Settings from "./pages/Settings";
import Services from "./pages/Services";
import Dossiers from "./pages/Dossiers";
import AIAssistant from './components/AIAssistant';

import { AuthProvider, useAuth } from "./context/AuthContext";

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="services" element={<Services />} />
              <Route path="dossiers" element={<Dossiers />} />
              <Route path="settings" element={<Settings />} />
              <Route path="ai" element={<AIAssistant />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
