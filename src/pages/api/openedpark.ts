import MagicBell from "magicbell";
import type { NextApiRequest, NextApiResponse } from "next";

const magicbell = new MagicBell({
  apiKey: process.env.NEXT_PUBLIC_MAGICBELL_API_KEY,
  apiSecret: process.env.MAGICBELL_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Méthode non autorisée" }); // Vérifie la méthode HTTP
    }

    const { userId, notificationTime } = req.body;

    if (!userId || !notificationTime) {
      return res.status(400).json({ error: "Paramètres manquants dans la requête" }); // Vérifie les paramètres
    }

    await magicbell.notifications.create({
      title: "Parc ouvert bientôt !",
      content: `Le parc ouvrira dans ${notificationTime} minutes.`,
      action_url: "",
      recipients: [{ external_id: userId }],
      category: "park-notification",
    });

    res.status(200).json({ status: "success" });
  } catch (error: any) {
    console.error("Erreur côté serveur : ", error.message);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
