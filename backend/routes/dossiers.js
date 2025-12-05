import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get all dossiers
router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.*, c.name as client_name, c.email as client_email, u.login as responsable_login
            FROM client_dossiers d
            LEFT JOIN clients c ON d.client_id = c.id
            LEFT JOIN users u ON d.responsable_id = u.id
            ORDER BY d.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Erreur récupération dossiers:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Create dossier
router.post("/", authenticateToken, async (req, res) => {
    const {
        client_id, id_dossier, status, type_dossier, priorite,
        sujet, description, remarques = null, document_url = null,
        responsable_id = null, date_echeance = null, cout_estime = null
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO client_dossiers 
       (client_id, id_dossier, status, type_dossier, priorite, sujet, description, 
        remarques, document_url, responsable_id, date_echeance, cout_estime) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
            [client_id, id_dossier, status, type_dossier, priorite, sujet, description,
                remarques, document_url, responsable_id, date_echeance, cout_estime]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erreur création dossier:", error);
        res.status(500).json({ error: "Erreur lors de la création" });
    }
});

// Update dossier
router.put("/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const {
        status, type_dossier, priorite, sujet, description, remarques,
        document_url, responsable_id, date_echeance, cout_estime, temps_passe_heures
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE client_dossiers 
       SET status=$1, type_dossier=$2, priorite=$3, sujet=$4, description=$5, 
           remarques=$6, document_url=$7, responsable_id=$8, date_echeance=$9, 
           cout_estime=$10, temps_passe_heures=$11, updated_at=CURRENT_TIMESTAMP
       WHERE id=$12 RETURNING *`,
            [status, type_dossier, priorite, sujet, description, remarques,
                document_url, responsable_id, date_echeance, cout_estime, temps_passe_heures, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erreur modification dossier:", error);
        res.status(500).json({ error: "Erreur lors de la modification" });
    }
});

// Delete dossier
router.delete("/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM client_dossiers WHERE id = $1", [id]);
        res.json({ message: "Dossier supprimé" });
    } catch (error) {
        console.error("Erreur suppression dossier:", error);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
});

// Get dossiers by client
router.get("/client/:clientId", authenticateToken, async (req, res) => {
    const { clientId } = req.params;
    try {
        const result = await pool.query(`
      SELECT d.*, u.login as responsable_login
      FROM client_dossiers d
      LEFT JOIN users u ON d.responsable_id = u.id
      WHERE d.client_id = $1
      ORDER BY d.created_at DESC
    `, [clientId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erreur dossiers client:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

export default router;
