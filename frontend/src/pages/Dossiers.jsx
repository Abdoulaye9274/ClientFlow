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
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Tooltip } from "@mui/material";

export default function Dossiers() {
    const [dossiers, setDossiers] = useState([]);
    const [clients, setClients] = useState([]);
    const [open, setOpen] = useState(false);
    const [searchParams] = useSearchParams();

    const clientId = searchParams.get('client');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDossierId, setSelectedDossierId] = useState(null);

    const [formData, setFormData] = useState({
        client_id: "",
        sujet: "",
        type_dossier: "support",
        priorite: "normale",
        description: "",
        status: "en_cours",
        remarques: "",
        cout_estime: "",
        date_echeance: ""
    });

    const fetchDossiers = async () => {
        try {
            const response = await api.get("/dossiers");
            let dossiersData = response.data;
            if (clientId) {
                dossiersData = dossiersData.filter(d => d.client_id === parseInt(clientId));
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

    const handleOpen = (dossier = null) => {
        if (dossier) {
            setIsEditing(true);
            setSelectedDossierId(dossier.id);
            setFormData({
                client_id: dossier.client_id,
                sujet: dossier.sujet,
                type_dossier: dossier.type_dossier,
                priorite: dossier.priorite,
                description: dossier.description || "",
                status: dossier.status,
                remarques: dossier.remarques || "",
                cout_estime: dossier.cout_estime || "",
                date_echeance: dossier.date_echeance ? dossier.date_echeance.split('T')[0] : ""
            });
        } else {
            setIsEditing(false);
            setSelectedDossierId(null);
            setFormData({
                client_id: clientId || "",
                sujet: "",
                type_dossier: "support",
                priorite: "normale",
                description: "",
                status: "en_cours",
                remarques: "",
                cout_estime: "",
                date_echeance: ""
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setIsEditing(false);
        setSelectedDossierId(null);
        setFormData({
            client_id: clientId || "",
            sujet: "",
            type_dossier: "support",
            priorite: "normale",
            description: "",
            status: "en_cours",
            remarques: "",
            cout_estime: "",
            date_echeance: ""
        });
    };

    const handleSubmit = async () => {
        try {
            if (isEditing) {
                await api.put(`/dossiers/${selectedDossierId}`, formData);
            } else {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                const id_dossier = `DOS-${year}${month}-${random}`;

                await api.post("/dossiers", { ...formData, id_dossier });
            }
            fetchDossiers();
            handleClose();
        } catch (error) {
            console.error("Erreur lors de l'enregistrement:", error);
            alert("Erreur lors de l'enregistrement du dossier");
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
                        onClick={() => handleOpen()}
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
                                <TableCell align="right"><strong>Actions</strong></TableCell>
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
                                    <TableCell align="right">
                                        <Tooltip title="Modifier">
                                            <IconButton
                                                onClick={() => handleOpen(dossier)}
                                                color="primary"
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? "Modifier le Dossier" : "Nouveau Dossier"}</DialogTitle>
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
                    <TextField
                        label="Coût Estimé (€)"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={formData.cout_estime}
                        onChange={(e) => setFormData({ ...formData, cout_estime: e.target.value })}
                    />
                    <TextField
                        label="Date d'échéance"
                        type="date"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        value={formData.date_echeance}
                        onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                    />
                    <TextField
                        label="Remarques"
                        fullWidth
                        multiline
                        rows={2}
                        margin="normal"
                        value={formData.remarques}
                        onChange={(e) => setFormData({ ...formData, remarques: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Annuler</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {isEditing ? "Enregistrer" : "Créer"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
