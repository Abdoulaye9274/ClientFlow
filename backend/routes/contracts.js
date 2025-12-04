// ✅ routes/contracts.js
import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import { restrictToAdmin } from "../middleware/roles.js";

const router = express.Router();

// Get all contracts - 🚨 MODIFIÉ POUR INCLURE LES NOMS DES CLIENTS
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("🔍 GET /api/contracts - Récupération avec JOIN");
    const result = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.amount,
        c.start_date,
        c.end_date,
        c.status,
        c.client_id,
        cl.name as client_name
      FROM contracts c
      LEFT JOIN clients cl ON c.client_id = cl.id
      ORDER BY c.start_date DESC
    `);
    console.log("📊 Contrats avec clients:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("💥 Erreur GET contracts:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get a single contract
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM contracts WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contrat non trouvé" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

import { sendNewContractEmail } from "../utils/emailService.js";

// Create a new contract
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { client_id, ref, amount, start_date, end_date, status } = req.body;

    // 🚨 Utiliser "ref" comme "title"
    const title = ref || "Contrat sans titre";

    const result = await pool.query(
      "INSERT INTO contracts (client_id, title, amount, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [client_id, title, amount, start_date, end_date, status || 'actif']
    );
    const newContract = result.rows[0];

    // Fetch client name for the email
    const clientRes = await pool.query("SELECT name FROM clients WHERE id = $1", [client_id]);
    const clientName = clientRes.rows[0]?.name || "Client Inconnu";

    // Send notification
    sendNewContractEmail(newContract, clientName);

    res.json(newContract);
  } catch (error) {
    console.error("Erreur création contrat:", error);
    res.status(500).json({ error: error.message });
  }
});



// Update a contract (ADMIN ONLY)
router.put("/:id", authenticateToken, restrictToAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, amount, start_date, end_date, status, client_id } = req.body;
  const result = await pool.query(
    "UPDATE contracts SET title=$1, amount=$2, start_date=$3, end_date=$4, status=$5, client_id=$6 WHERE id=$7 RETURNING *",
    [title, amount, start_date, end_date, status, client_id, id]
  );
  res.json(result.rows[0]);
});

// Delete a contract
router.delete("/:id", authenticateToken, async (req, res) => {
  await pool.query("DELETE FROM contracts WHERE id = $1", [req.params.id]);
  res.json({ message: "Contrat supprimé" });
});

export default router;
