import pool from "./db.js";
import bcrypt from "bcryptjs";

async function seedJury() {
    const client = await pool.connect();
    try {
        const hashedPassword = await bcrypt.hash("jury123!", 10);

        // Check if user exists
        const check = await client.query("SELECT * FROM users WHERE login = 'jury'");
        if (check.rows.length > 0) {
            console.log("⚠️ L'utilisateur 'jury' existe déjà.");
            // Update password just in case
            await client.query("UPDATE users SET password = $1, role = 'user' WHERE login = 'jury'", [hashedPassword]);
            console.log("✅ Mot de passe et rôle mis à jour.");
        } else {
            await client.query(
                "INSERT INTO users (login, password, role) VALUES ($1, $2, 'user')",
                ["jury", hashedPassword]
            );
            console.log("✅ Utilisateur 'jury' créé avec succès (Rôle: user).");
        }
    } catch (err) {
        console.error("❌ Erreur:", err);
    } finally {
        client.release();
        process.exit();
    }
}

seedJury();
