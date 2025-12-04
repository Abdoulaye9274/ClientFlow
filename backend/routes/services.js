import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { restrictToAdmin } from "../middleware/roles.js";
import pool from "../db.js";

const router = express.Router();

// GET tous les services
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        COALESCE(s.nom, s.name) as nom,
        s.name,
        s.type,
        s.prix,
        s.description,
        s.duree_mois,
        s.conditions,
        s.is_active,
        s.created_at,
        COUNT(cs.service_id) as clients_count
      FROM services s
      LEFT JOIN contract_services cs ON s.id = cs.service_id
      GROUP BY s.id, s.nom, s.name, s.type, s.prix, s.description, s.duree_mois, s.conditions, s.is_active, s.created_at
      ORDER BY s.id DESC
    `);

    console.log("✅ Services récupérés:", result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Erreur GET services:", error.message);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
});

// POST créer un service
router.post("/", authenticateToken, async (req, res) => {
  console.log("🔥 POST /api/services reçu");
  console.log("📦 Body:", req.body);

  const { nom, type, prix, description, duree_mois, conditions } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO services (name, nom, type, prix, description, duree_mois, conditions) VALUES ($1, $1, $2, $3, $4, $5, $6) RETURNING *",
      [nom, type, prix, description, duree_mois, conditions]
    );
    console.log("✅ Service créé:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur création service:", error.message);
    res.status(500).json({ error: "Erreur lors de la création", details: error.message });
  }
});

// PUT modifier un service (ADMIN ONLY)
router.put("/:id", authenticateToken, restrictToAdmin, async (req, res) => {
  const { id } = req.params;
  const { nom, type, prix, description, duree_mois, conditions, is_active } = req.body;
  try {
    const result = await pool.query(
      "UPDATE services SET name=$1, nom=$1, type=$2, prix=$3, description=$4, duree_mois=$5, conditions=$6, is_active=$7 WHERE id=$8 RETURNING *",
      [nom, type, prix, description, duree_mois, conditions, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur modification service:", error);
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
});

// DELETE supprimer un service
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE services SET is_active = false WHERE id = $1", [id]);
    res.json({ message: "Service désactivé" });
  } catch (error) {
    console.error("❌ Erreur suppression service:", error);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// GET services d'un contrat spécifique
router.get("/contract/:contractId", authenticateToken, async (req, res) => {
  const { contractId } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        COALESCE(s.nom, s.name) as nom,
        s.type,
        s.prix,
        s.description,
        s.duree_mois,
        s.conditions
      FROM services s
      JOIN contract_services cs ON s.id = cs.service_id
      WHERE cs.contract_id = $1
    `, [contractId]);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Erreur services contrat:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST attribuer un service à un contrat
router.post("/assign", authenticateToken, async (req, res) => {
  const { client_id, service_id, date_debut, date_fin, prix_convenu, notes } = req.body;

  console.log("🔥 POST /api/services/assign");
  console.log("📦 Body:", req.body);

  try {
    let contract_id;

    // ✅ Si client_id est fourni, trouvez ou créez un contrat actif pour ce client
    if (client_id) {
      // Cherchez un contrat actif existant
      const existingContract = await pool.query(
        "SELECT id FROM contracts WHERE client_id = $1 AND status IN ('actif', 'en_cours') ORDER BY id DESC LIMIT 1",
        [client_id]
      );

      if (existingContract.rows.length > 0) {
        contract_id = existingContract.rows[0].id;
        console.log("✅ Contrat existant trouvé:", contract_id);
      } else {
        // Créez un nouveau contrat
        const newContract = await pool.query(
          "INSERT INTO contracts (client_id, title, amount, start_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING id",
          [client_id, 'Contrat Services', prix_convenu || 0, date_debut || new Date(), 'en_cours']
        );
        contract_id = newContract.rows[0].id;
        console.log("✅ Nouveau contrat créé:", contract_id);
      }
    } else if (req.body.contract_id) {
      contract_id = req.body.contract_id;
    } else {
      return res.status(400).json({ error: "client_id ou contract_id requis" });
    }

    // ✅ Vérifiez que le service existe
    const serviceCheck = await pool.query(
      "SELECT id FROM services WHERE id = $1",
      [service_id]
    );

    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({ error: "Service non trouvé" });
    }

    // ✅ Vérifiez si la relation existe déjà
    const existingCheck = await pool.query(
      "SELECT * FROM contract_services WHERE contract_id = $1 AND service_id = $2",
      [contract_id, service_id]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ error: "Ce service est déjà attribué à ce contrat" });
    }

    // ✅ Insérez la relation
    const result = await pool.query(
      "INSERT INTO contract_services (contract_id, service_id) VALUES ($1, $2) RETURNING *",
      [contract_id, service_id]
    );

    console.log("✅ Service attribué au contrat:", result.rows[0]);
    res.status(201).json({ ...result.rows[0], contract_id });
  } catch (error) {
    console.error("❌ Erreur attribution service:", error.message);
    console.error("❌ Stack:", error.stack);
    res.status(500).json({ error: "Erreur lors de l'attribution", details: error.message });
  }
});

// DELETE retirer un service d'un contrat
router.delete("/assign/:contractId/:serviceId", authenticateToken, async (req, res) => {
  const { contractId, serviceId } = req.params;
  try {
    await pool.query(
      "DELETE FROM contract_services WHERE contract_id = $1 AND service_id = $2",
      [contractId, serviceId]
    );
    res.json({ message: "Service retiré du contrat" });
  } catch (error) {
    console.error("❌ Erreur retrait service:", error);
    res.status(500).json({ error: "Erreur lors du retrait" });
  }
});

export default router;