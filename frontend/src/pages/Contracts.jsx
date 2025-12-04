import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Container, Typography, Button, Box, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Chip, Paper
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext";

export default function Contracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [newContract, setNewContract] = useState({ client_id: "", ref: "", amount: "", start_date: "", end_date: "", status: "en_cours" });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const fetchContracts = async () => {
    const res = await api.get("/contracts");
    setContracts(res.data);
  };

  useEffect(() => { fetchContracts(); }, []);

  const handleSave = async () => {
    await api.post("/contracts", newContract);
    fetchContracts();
    setOpen(false);
  };

  const handleEdit = (contract) => {
    setSelectedContract(contract);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce contrat ?")) {
      await api.delete(`/contracts/${id}`);
      setContracts(contracts.filter(c => c.id !== id));
    }
  };

  const generatePDF = (contract) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(25, 118, 210);
    doc.text("ClientFlow", 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Contrat de Service", 20, 30);
    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Référence : ${contract.title || contract.ref || "N/A"}`, 20, 50);
    doc.text(`Client : ${contract.client_name || "N/A"}`, 20, 60);
    doc.text(`Montant : ${contract.amount} €`, 20, 70);
    doc.text(`Statut : ${contract.status}`, 20, 80);
    doc.text(`Période : du ${contract.start_date} au ${contract.end_date}`, 20, 90);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Généré par ClientFlow CRM", 20, 280);
    doc.save(`Contrat_${contract.id}.pdf`);
  };

  const getStatusChip = (status) => {
    let color = "default";
    if (status === "actif") color = "success";
    if (status === "en_cours") color = "warning";
    if (status === "termine") color = "info";
    return <Chip label={status} color={color} size="small" />;
  };

  const filteredContracts = contracts.filter(c =>
    (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.client_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "title", headerName: "Référence", flex: 1, valueGetter: (value, row) => row?.title || row?.ref || "N/A" },
    { field: "client_name", headerName: "Client", flex: 1, valueGetter: (value, row) => row?.client_name || "N/A" },
    { field: "amount", headerName: "Montant", width: 120, renderCell: (params) => `${params.row.amount} €` },
    { field: "status", headerName: "Statut", width: 120, renderCell: (params) => getStatusChip(params.row.status) },
    { field: "dates", headerName: "Période", flex: 1, valueGetter: (value, row) => `${row?.start_date} → ${row?.end_date}` },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Télécharger PDF">
            <IconButton color="error" onClick={() => generatePDF(params.row)}>
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>
          {user && user.role === 'admin' && (
            <Tooltip title="Modifier">
              <IconButton color="primary" onClick={() => handleEdit(params.row)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Supprimer">
            <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1976d2" }}>
            Gestion des Contrats
          </Typography>
          <Button variant="contained" onClick={() => setOpen(true)} sx={{ bgcolor: "#1976d2" }}>
            + Nouveau Contrat
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un contrat (référence, client)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: "#f9f9f9", borderRadius: 1 }}
          />
        </Box>

        <DataGrid
          rows={filteredContracts}
          columns={columns}
          autoHeight
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#f5f5f5",
              color: "#000",
              fontSize: "1rem",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-row:hover": {
              bgcolor: "#f5f5f5",
            },
          }}
        />
      </Paper>

      {/* Dialog Création */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Nouveau Contrat</DialogTitle>
        <DialogContent>
          <TextField label="ID Client" fullWidth margin="dense" value={newContract.client_id} onChange={e => setNewContract({ ...newContract, client_id: e.target.value })} />
          <TextField label="Référence" fullWidth margin="dense" value={newContract.ref} onChange={e => setNewContract({ ...newContract, ref: e.target.value })} />
          <TextField label="Montant (€)" fullWidth margin="dense" type="number" value={newContract.amount} onChange={e => setNewContract({ ...newContract, amount: e.target.value })} />
          <TextField label="Date de début" fullWidth margin="dense" type="date" InputLabelProps={{ shrink: true }} value={newContract.start_date} onChange={e => setNewContract({ ...newContract, start_date: e.target.value })} />
          <TextField label="Date de fin" fullWidth margin="dense" type="date" InputLabelProps={{ shrink: true }} value={newContract.end_date} onChange={e => setNewContract({ ...newContract, end_date: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Modification */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Modifier le contrat</DialogTitle>
        <DialogContent>
          <TextField
            label="Titre"
            value={selectedContract?.title || ""}
            onChange={e => setSelectedContract({ ...selectedContract, title: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Montant"
            type="number"
            value={selectedContract?.amount || ""}
            onChange={e => setSelectedContract({ ...selectedContract, amount: e.target.value })}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={async () => {
              await api.put(`/contracts/${selectedContract.id}`, selectedContract);
              setContracts(contracts.map(c => c.id === selectedContract.id ? selectedContract : c));
              setEditDialogOpen(false);
            }}
            variant="contained"
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
