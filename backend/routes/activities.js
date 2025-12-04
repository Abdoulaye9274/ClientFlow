import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/activities/recent
router.get("/recent", authenticateToken, async (req, res) => {
    try {
        // Query for recent clients (using ID as proxy for recency since created_at is missing)
        // We use CURRENT_DATE as a fallback timestamp for display purposes
        const clientsQuery = `
      SELECT 
        'client' as type, 
        'Nouveau client : ' || name as description,
        NULL as timestamp, 
        id
      FROM clients 
      ORDER BY id DESC
      LIMIT 5
    `;

        // Query for recent contracts (using start_date)
        const contractsQuery = `
      SELECT 
        'contract' as type,
        'Contrat : ' || COALESCE(title, 'Sans titre') as description, 
        start_date as timestamp,
        id
      FROM contracts
      ORDER BY start_date DESC
      LIMIT 5
    `;

        const [clientsRes, contractsRes] = await Promise.all([
            pool.query(clientsQuery),
            pool.query(contractsQuery)
        ]);

        // Combine and sort
        // For clients without timestamp, we treat them as "very recent" (top of list) or just use ID order
        // Here we simply combine and take the top 10. 
        // Since we can't perfectly sort mixed types without a common date, we'll interleave or just show them.
        // A better approach given the schema limitation:

        const activities = [
            ...clientsRes.rows.map(c => ({ ...c, timestamp: new Date().toISOString() })), // Fallback for now
            ...contractsRes.rows
        ];

        // Sort by timestamp desc
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(activities.slice(0, 10));

    } catch (error) {
        console.error("❌ Erreur activities/recent:", error.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

export default router;
