import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Alert,
  Fade,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Business,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import api from "../api";
import { useAuth } from "../context/AuthContext";

// Animation de float
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Animation de pulse
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;



export default function Login() {
  const [credentials, setCredentials] = useState({ login: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", credentials);

      login(response.data.user, response.data.token);

      // Redirection immédiate vers le dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Identifiants incorrects. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)", // ✅ VOS COULEURS
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Formes décoratives animées */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          animation: `${float} 6s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "70%",
          right: "15%",
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          animation: `${float} 8s ease-in-out infinite reverse`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "20%",
          left: "20%",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          animation: `${float} 7s ease-in-out infinite`,
        }}
      />

      <Container maxWidth="sm">
        <Fade in timeout={1000}>
          <Paper
            elevation={24}
            sx={{
              p: 5,
              borderRadius: 4,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
              },
            }}
          >
            {/* Header avec logo */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: "0 auto 16px",
                  background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)", // ✅ VOS COULEURS
                  animation: `${pulse} 2s ease-in-out infinite`,
                }}
              >
                <Business sx={{ fontSize: 40 }} />
              </Avatar>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)", // ✅ VOS COULEURS
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                ClientFlow
              </Typography>

              <Typography
                variant="h6"
                color="textSecondary"
                sx={{ fontWeight: 300 }}
              >
                Connectez-vous à votre espace
              </Typography>
            </Box>

            {/* Formulaire */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Nom d'utilisateur"
                value={credentials.login}
                onChange={(e) =>
                  setCredentials({ ...credentials, login: e.target.value })
                }
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(25,118,210,0.15)", // ✅ VOS COULEURS
                    },
                    "&.Mui-focused": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(25,118,210,0.25)", // ✅ VOS COULEURS
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "#1976d2" }} /> {/* ✅ VOS COULEURS */}
                    </InputAdornment>
                  ),
                }}
                required
              />

              <TextField
                fullWidth
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(25,118,210,0.15)", // ✅ VOS COULEURS
                    },
                    "&.Mui-focused": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(25,118,210,0.25)", // ✅ VOS COULEURS
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#1976d2" }} /> {/* ✅ VOS COULEURS */}
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "#1976d2" }} // ✅ VOS COULEURS
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
              />

              {error && (
                <Fade in>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      background: "rgba(244,67,54,0.1)",
                      border: "1px solid rgba(244,67,54,0.2)",
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)", // ✅ VOS COULEURS
                  boxShadow: "0 8px 25px rgba(25,118,210,0.3)", // ✅ VOS COULEURS
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 15px 35px rgba(25,118,210,0.4)", // ✅ VOS COULEURS
                    background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)", // ✅ VOS COULEURS
                  },
                  "&:disabled": {
                    background: "linear-gradient(135deg, #ccc 0%, #999 100%)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Se connecter"
                )}
              </Button>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="body2" color="textSecondary">
                © 2025 ClientFlow - Solution de gestion client
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
