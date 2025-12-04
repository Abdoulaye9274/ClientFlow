import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import pool from "../db.js";

const router = express.Router();

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, login, role, first_name, last_name, email FROM users WHERE id = $1",
      [req.user.id]
    );

    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json(user);
  } catch (error) {
    console.error("Erreur /users/me:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
