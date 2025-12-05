import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Authentication Utils", () => {
  describe("Password Hashing", () => {
    it("devrait hasher un mot de passe correctement", async () => {
      const password = "testPassword123!";
      const hashedPassword = await bcrypt.hash(password, 10);
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(20);
    });

    it("devrait vérifier un mot de passe correct", async () => {
      const password = "testPassword123!";
      const hashedPassword = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it("devrait rejeter un mot de passe incorrect", async () => {
      const password = "testPassword123!";
      const wrongPassword = "wrongPassword";
      const hashedPassword = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe("JWT Token", () => {
    const SECRET = "test-secret";

    it("devrait générer un token JWT valide", () => {
      const payload = { id: 1, login: "testuser", role: "user" };
      const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
    });

    it("devrait décoder un token JWT correctement", () => {
      const payload = { id: 1, login: "testuser", role: "admin" };
      const token = jwt.sign(payload, SECRET);
      const decoded = jwt.verify(token, SECRET);
      expect(decoded.id).toBe(1);
      expect(decoded.login).toBe("testuser");
      expect(decoded.role).toBe("admin");
    });

    it("devrait rejeter un token invalide", () => {
      const invalidToken = "invalid.token.here";
      expect(() => jwt.verify(invalidToken, SECRET)).toThrow();
    });

    it("devrait vérifier l'expiration d'un token", () => {
      const payload = { id: 1, login: "testuser" };
      const token = jwt.sign(payload, SECRET, { expiresIn: "0s" });
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(() => jwt.verify(token, SECRET)).toThrow();
          resolve();
        }, 100);
      });
    });
  });
});
