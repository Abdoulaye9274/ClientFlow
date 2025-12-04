import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import {
    Typography,
    Paper,
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function Dossiers() {
    const [dossiers, setDossiers] = useState([]);
    const [clients, setClients] = useState([]);
    const [open, setOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const clientId = searchParams.get('client');

    const [formData, setFormData] = useState({
        client_id: "",
        sujet: "",
        type_dossier: "support",
        priorite: "normale",
        description: "",
        status: "en_cours"
    });

    const fetchDossiers = async () => {
        try {
            const response = await api.get("/dossiers");
            let dossiersData = response.data;
            if (clientId) {
                dossiersData = dossiersData.filter(d => d.client_id === clientId);
            }
            setDossiers(dossiersData);
        } catch (error) {
            console.error("Erreur lors de la récupération des dossiers:", error);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await api.get("/clients");
            setClients(response.data);
        } catch (error) {
            console.error("Erreur clients:", error);
        }
    };

    useEffect(() => {
        fetchDossiers();
        fetchClients();
        if (clientId) {
            setFormData(prev => ({ ...prev, client_id: clientId }));
        }
    }, [clientId]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({
            client_id: clientId || "",
            sujet: "",
            type_dossier: "support",
            priorite: "normale",
            description: "",
            status: "en_cours"
        });
    };

    const handleSubmit = async () => {
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const id_dossier = `DOS-${year}${month}-${random}`;

            await api.post("/dossiers", { ...formData, id_dossier });
            fetchDossiers();
            handleClose();
        } catch (error) {
            console.error("Erreur lors de la création:", error);
            alert("Erreur lors de la création du dossier");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'actif': return 'success';
            case 'en_cours': return 'warning';
            case 'fermé': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}>
                    🗂️ Gestion des Dossiers Clients
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                        {dossiers.length} dossiers trouvés
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpen}
                        sx={{ bgcolor: "#1976d2", color: "#fff" }}
                    >
                        Nouveau Dossier
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell><strong>ID Dossier</strong></TableCell>
                                <TableCell><strong>Client</strong></TableCell>
                                <TableCell><strong>Sujet</strong></TableCell>
                                <TableCell><strong>Type</strong></TableCell>
                                <TableCell><strong>Statut</strong></TableCell>
                                <TableCell><strong>Priorité</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dossiers.map((dossier) => (
                                <TableRow key={dossier.id} hover>
                                    <TableCell>{dossier.id_dossier}</TableCell>
                                    <TableCell>{dossier.client_name}</TableCell>
                                    <TableCell>{dossier.sujet}</TableCell>
                                    <TableCell>{dossier.type_dossier}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={dossier.status}
                                            color={getStatusColor(dossier.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={dossier.priorite}
                                            color={dossier.priorite === 'haute' ? 'error' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Nouveau Dossier</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        label="Client"
                        fullWidth
                        margin="normal"
                        value={formData.client_id}
                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                        disabled={!!clientId}
                    >
                        {clients.map((client) => (
                            <MenuItem key={client.id} value={client.id}>
                                {client.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Sujet"
                        fullWidth
                        margin="normal"
                        value={formData.sujet}
                        onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                    />
                    <TextField
                        select
                        label="Type"
                        fullWidth
                        margin="normal"
                        value={formData.type_dossier}
                        onChange={(e) => setFormData({ ...formData, type_dossier: e.target.value })}
                    >
                        <MenuItem value="support">Support</MenuItem>
                        <MenuItem value="commercial">Commercial</MenuItem>
                        <MenuItem value="technique">Technique</MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Priorité"
                        fullWidth
                        margin="normal"
                        value={formData.priorite}
                        onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                    >
                        <MenuItem value="basse">Basse</MenuItem>
                        <MenuItem value="normale">Normale</MenuItem>
                        <MenuItem value="haute">Haute</MenuItem>
                    </TextField>
                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        margin="normal"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Annuler</Button>
                    <Button onClick={handleSubmit} variant="contained">Créer</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
