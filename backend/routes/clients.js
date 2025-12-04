import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import { restrictToAdmin } from "../middleware/roles.js";

const router = express.Router();

// Get all clients
router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM clients ORDER BY id DESC");
        res.json(result.rows);
    } catch (error) {
        console.error("Erreur récupération clients:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

import { sendNewClientEmail } from "../utils/emailService.js";

// Create client
router.post("/", authenticateToken, async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
            [name, email, phone]
        );
        const newClient = result.rows[0];

        // Send notification asynchronously (don't await to keep API fast)
        sendNewClientEmail(newClient);

        res.json(newClient);
    } catch (error) {
        console.error("Erreur création client:", error);
        res.status(500).json({ error: "Erreur création client" });
    }
});



// Update client (ADMIN ONLY)
router.put("/:id", authenticateToken, restrictToAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    try {
        const result = await pool.query(
            "UPDATE clients SET name=$1, email=$2, phone=$3 WHERE id=$4 RETURNING *",
            [name, email, phone, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erreur modification client:", error);
        res.status(500).json({ error: "Erreur modification client" });
    }
});

// Delete client
router.delete("/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM clients WHERE id=$1", [id]);
        res.json({ message: "Client supprimé" });
    } catch (error) {
        console.error("Erreur suppression client:", error);
        res.status(500).json({ error: "Erreur suppression client" });
    }
});

export default router;
