import bcrypt from "bcryptjs";
import pool from "./db.js";

(async () => {
  try {
    // Create Admin
    const adminPass = await bcrypt.hash("admin123!", 10);
    await pool.query(
      "INSERT INTO users (login, password, role) VALUES ($1, $2, $3) ON CONFLICT (login) DO NOTHING",
      ["admin", adminPass, "admin"]
    );
    console.log("✅ Utilisateur 'admin' prêt.");

    // Create Abdoulaye (matching the hardcoded one)
    const userPass = await bcrypt.hash("abdoulaye123!", 10);
    await pool.query(
      "INSERT INTO users (login, password, role) VALUES ($1, $2, $3) ON CONFLICT (login) DO NOTHING",
      ["abdoulaye", userPass, "admin"]
    );
    console.log("✅ Utilisateur 'abdoulaye' prêt.");

    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur seeding:", err);
    process.exit(1);
  }
})();
