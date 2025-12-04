import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.js";
import contractRoutes from "./routes/contracts.js";
import serviceRoutes from "./routes/services.js";
import activitiesRoutes from "./routes/activities.js";
import clientRoutes from "./routes/clients.js";
import dossierRoutes from "./routes/dossiers.js";
import userRoutes from "./routes/users.js";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

console.log("🔥 SERVEUR EN COURS DE DÉMARRAGE...");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔥 MIDDLEWARE DE LOG AJOUTÉ");

// 🚨 MIDDLEWARE DE LOG SÉCURISÉ (Plus de body loggé)
app.use((req, res, next) => {
  console.log(`🌐 REQUÊTE REÇUE: ${req.method} ${req.url}`);
  next();
});

// ✅ ROUTES PUBLIQUES (SANS TOKEN)
app.get("/", (req, res) => {
  res.send("🚀 API Mini CRM fonctionne ✅");
});

// ✅ STATS DASHBOARD - SANS TOKEN
app.get("/api/stats/dashboard", async (req, res) => {
  try {
    const clientCountRes = await pool.query("SELECT COUNT(*) FROM clients");
    const contractCountRes = await pool.query(
      "SELECT COUNT(*) FROM contracts WHERE status IN ('actif', 'en_cours')"
    );
    const revenueRes = await pool.query(
      "SELECT COALESCE(SUM(CAST(amount AS DECIMAL)), 0) as total FROM contracts WHERE status IN ('actif', 'en_cours')"
    );

    const contractsHistory = [
      { month: "Jan", contracts: 3 },
      { month: "Fév", contracts: 6 },
      { month: "Mar", contracts: 5 },
      { month: "Avr", contracts: 8 },
      { month: "Mai", contracts: 10 },
      { month: "Juin", contracts: 12 },
    ];

    const revenue = parseFloat(revenueRes.rows[0].total).toFixed(2);

    res.json({
      clientCount: parseInt(clientCountRes.rows[0].count),
      contractCount: parseInt(contractCountRes.rows[0].count),
      revenue: revenue,
      contractsHistory,
    });
  } catch (error) {
    console.error("❌ Erreur stats dashboard:", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ ROUTES AUTH
app.use("/api/auth", authRoutes);

// ✅ ROUTES PROTÉGÉES
app.use("/api/contracts", contractRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/dossiers", dossierRoutes);
app.use("/api/users", userRoutes);

console.log("🚀 TOUTES LES ROUTES CHARGÉES - SERVEUR PRÊT");

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erreur serveur" });
});

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend sur http://localhost:${PORT}`);
    console.log("🔥 SERVEUR COMPLÈTEMENT DÉMARRÉ");
  });
}

export default app;