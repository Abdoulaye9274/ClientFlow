describe("Data Validation", () => {
    describe("Email Validation", () => {
        const isValidEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        it("devrait accepter un email valide", () => {
            expect(isValidEmail("test@example.com")).toBe(true);
            expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
            expect(isValidEmail("firstname+lastname@company.org")).toBe(true);
        });

        it("devrait rejeter un email invalide", () => {
            expect(isValidEmail("invalid.email")).toBe(false);
            expect(isValidEmail("@example.com")).toBe(false);
            expect(isValidEmail("test@")).toBe(false);
            expect(isValidEmail("test @example.com")).toBe(false);
        });
    });

    describe("Phone Validation", () => {
        const isValidPhone = (phone) => {
            const phoneRegex = /^0[1-9]\d{8}$/;
            return phoneRegex.test(phone.replace(/\s/g, ""));
        };

        it("devrait accepter un numéro français valide", () => {
            expect(isValidPhone("0612345678")).toBe(true);
            expect(isValidPhone("0712345678")).toBe(true);
            expect(isValidPhone("0123456789")).toBe(true);
        });

        it("devrait rejeter un numéro invalide", () => {
            expect(isValidPhone("123456789")).toBe(false);
            expect(isValidPhone("06123")).toBe(false);
            expect(isValidPhone("1234567890")).toBe(false);
        });
    });

    describe("Client Data Validation", () => {
        const validateClientData = (data) => {
            const errors = [];
            if (!data.name || data.name.trim().length < 2) {
                errors.push("Le nom doit contenir au moins 2 caractères");
            }
            if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                errors.push("Email invalide");
            }
            return { isValid: errors.length === 0, errors };
        };

        it("devrait valider un client avec des données correctes", () => {
            const client = { name: "John Doe", email: "john@example.com", phone: "0612345678" };
            const result = validateClientData(client);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("devrait rejeter un client sans nom", () => {
            const client = { name: "", email: "john@example.com" };
            const result = validateClientData(client);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Le nom doit contenir au moins 2 caractères");
        });

        it("devrait rejeter un client avec email invalide", () => {
            const client = { name: "John Doe", email: "invalid-email" };
            const result = validateClientData(client);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Email invalide");
        });
    });

    describe("Contract Data Validation", () => {
        const validateContractData = (data) => {
            const errors = [];
            if (!data.title || data.title.trim().length < 3) {
                errors.push("Le titre doit contenir au moins 3 caractères");
            }
            if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
                errors.push("Le montant doit être un nombre positif");
            }
            if (!data.client_id) {
                errors.push("Un client doit être associé");
            }
            return { isValid: errors.length === 0, errors };
        };

        it("devrait valider un contrat correct", () => {
            const contract = { title: "Contrat Test", amount: 1000, client_id: 1 };
            const result = validateContractData(contract);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("devrait rejeter un contrat sans titre", () => {
            const contract = { title: "", amount: 1000, client_id: 1 };
            const result = validateContractData(contract);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it("devrait rejeter un contrat avec montant invalide", () => {
            const contract = { title: "Contrat Test", amount: -500, client_id: 1 };
            const result = validateContractData(contract);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Le montant doit être un nombre positif");
        });
    });
});
