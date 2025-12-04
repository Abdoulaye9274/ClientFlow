import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/login", async (req, res) => {
  // Removed sensitive logs
  const { login, password } = req.body;

  try {
    // Query user from DB
    const result = await pool.query("SELECT * FROM users WHERE login = $1", [login]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Identifiants introuvables" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Identifiants introuvables" });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "votre_secret_jwt",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        login: user.login,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Erreur auth:", error.message); // Log only message, not full error object if it contains sensitive data
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
