import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Configuration
const createTransporter = async () => {
    console.log("📧 Config Email: Vérification des identifiants...");

    // Si les variables GMAIL sont présentes, on utilise Gmail
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        console.log("✅ Identifiants Gmail trouvés pour:", process.env.GMAIL_USER);
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
            logger: true,
            debug: true,
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    // Sinon, fallback sur Ethereal (Dev)
    console.log("⚠️ Pas de config Gmail trouvée, utilisation de Ethereal (Fake SMTP)");
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

export const sendEmail = async (to, subject, html) => {
    try {
        const transporter = await createTransporter();

        const info = await transporter.sendMail({
            from: '"ClientFlow CRM" <no-reply@clientflow.com>',
            to,
            subject,
            html,
        });

        console.log("📧 Email envoyé: %s", info.messageId);

        // Si c'est Ethereal, on affiche le lien de preview
        if (info.messageId && !process.env.GMAIL_USER) {
            console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error("❌ Erreur envoi email:", error);
        // On retourne null mais on ne plante pas l'app
        return null;
    }
};

export const sendNewClientEmail = async (client) => {
    const subject = `🎉 Nouveau Client : ${client.name}`;
    const html = `
    <h1>Nouveau Client Ajouté</h1>
    <p>Un nouveau client a été ajouté au CRM.</p>
    <ul>
      <li><strong>Nom :</strong> ${client.name}</li>
      <li><strong>Email :</strong> ${client.email}</li>
      <li><strong>Téléphone :</strong> ${client.phone}</li>
    </ul>
    <p>Connectez-vous pour voir le dossier.</p>
  `;
    // Envoi à votre adresse personnelle
    return sendEmail('abdouladoumbia309@gmail.com', subject, html);
};

export const sendNewContractEmail = async (contract, clientName) => {
    const subject = `📜 Nouveau Contrat : ${contract.title}`;
    const html = `
    <h1>Nouveau Contrat Signé !</h1>
    <p>Un contrat a été créé pour <strong>${clientName}</strong>.</p>
    <ul>
      <li><strong>Titre :</strong> ${contract.title}</li>
      <li><strong>Montant :</strong> ${contract.amount} €</li>
      <li><strong>Début :</strong> ${contract.start_date}</li>
    </ul>
  `;
    return sendEmail('abdouladoumbia309@gmail.com', subject, html);
};
