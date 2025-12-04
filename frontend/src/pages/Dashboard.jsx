import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Grid,
  Card,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StatCard({ title, value, icon, color }) {
  return (
    <Card
      elevation={3}
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        borderRadius: 3,
        bgcolor: color,
        color: "#fff",
      }}
    >
      <Box sx={{ mr: 2 }}>{icon}</Box>
      <Box>
        <Typography variant="body2">{title}</Typography>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {value}
        </Typography>
      </Box>
    </Card>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ✅ RÉCUPÉREZ UNIQUEMENT LES STATS
        const statsRes = await api.get('/stats/dashboard');

        console.log('📊 Stats reçues:', statsRes.data);

        // ✅ UTILISEZ DIRECTEMENT LES STATS DE L'API
        setStats({
          clientCount: statsRes.data.clientCount,
          contractCount: statsRes.data.contractCount,
          revenue: parseFloat(statsRes.data.revenue),
          contractsHistory: statsRes.data.contractsHistory
        });

        // ✅ RÉCUPÉREZ LES ACTIVITÉS
        try {
          const activitiesRes = await api.get('/activities/recent');
          setActivities(activitiesRes.data || []);
        } catch (err) {
          console.log('Activités non disponibles');
          setActivities([]);
        }

      } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: "primary.main",
          color: "#fff",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Tableau de bord
        </Typography>
        <Typography>Vue d'ensemble de vos données</Typography>
      </Paper>

      {/* Statistiques clés */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Clients"
            value={stats?.clientCount || 0}
            icon={<PeopleIcon fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Contrats"
            value={stats?.contractCount || 0}
            icon={<DescriptionIcon fontSize="large" />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Chiffre d'affaires"
            value={`${stats?.revenue || 0} €`}
            icon={<MonetizationOnIcon fontSize="large" />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tendance"
            value="+15%"
            icon={<TrendingUpIcon fontSize="large" />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      {/* Graphique */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Évolution des contrats
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats?.contractsHistory || []}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="contracts" stroke="#1976d2" />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Activités récentes */}
      <Paper elevation={3} sx={{ mt: 4, p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}>
          📋 Activités Récentes
        </Typography>
        {activities.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Date & Heure</strong></TableCell>
                  <TableCell><strong>Type d'Activité</strong></TableCell>
                  <TableCell><strong>Responsable</strong></TableCell>
                  <TableCell><strong>Statut</strong></TableCell>
                  <TableCell><strong>Détails</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((act, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      {new Date(act.timestamp).toLocaleDateString('fr-FR')} - {new Date(act.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>{act.type}</TableCell>
                    <TableCell>{act.user || 'Système'}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: act.status === 'terminé' ? '#d4edda' : act.status === 'en cours' ? '#fff3cd' : '#f8d7da',
                          color: act.status === 'terminé' ? '#155724' : act.status === 'en cours' ? '#856404' : '#721c24',
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}
                      >
                        {act.status || 'terminé'}
                      </Box>
                    </TableCell>
                    <TableCell>{act.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, color: '#999' }}>
            <Typography>Aucune activité récente</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
