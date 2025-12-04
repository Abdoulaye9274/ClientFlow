import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ClientForm from "../components/ClientForm";
import { useAuth } from "../context/AuthContext";

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [editingClient, setEditingClient] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  const fetchClients = async () => {
    try {
      const response = await api.get("/clients");
      setClients(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
      setSnackbar({
        open: true,
        message: "Impossible de charger les clients.",
      });
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleView = (id) => {
    navigate(`/dashboard/dossiers?client=${id}`);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        await api.delete(`/clients/${id}`);
        setSnackbar({ open: true, message: "Client supprimé avec succès" });
        fetchClients();
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Erreur lors de la suppression du client",
        });
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleFormSave = () => {
    handleFormClose();
    fetchClients();
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Nom", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Téléphone", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="default"
            onClick={() => handleView(params.row.id)}
            title="Dossier client"
          >
            <FolderIcon />
          </IconButton>
          {user && user.role === 'admin' && (
            <IconButton
              color="primary"
              onClick={() => handleEdit(params.row)}
              title="Modifier"
            >
              <EditIcon />
            </IconButton>
          )}
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
            title="Supprimer"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Paper
      elevation={3}
      sx={{ p: 3, borderRadius: 3, bgcolor: "#fff" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "#1976d2" }}
        >
          Liste des clients
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          onClick={() => {
            setEditingClient(null);
            setIsFormOpen(true);
          }}
          sx={{ bgcolor: "#1976d2", color: "#fff" }}
        >
          Ajouter Client
        </Button>
        <ClientForm
          open={isFormOpen}
          onClose={handleFormClose}
          onClientSaved={handleFormSave}
          client={editingClient}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Rechercher un client"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300, bgcolor: "white" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DataGrid
        rows={filteredClients}
        columns={columns}
        autoHeight
        pageSize={5}
        rowsPerPageOptions={[5]}
        sx={{
          bgcolor: "#f4f6fa",
          borderRadius: 2,
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "#f5f5f5",
            color: "#000",
            fontWeight: "bold",
          },
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
      />
    </Paper>
  );
}