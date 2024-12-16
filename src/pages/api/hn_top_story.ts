import MagicBell from "magicbell"
import { NextApiRequest, NextApiResponse } from "next"

const magicbell = new MagicBell({
  apiKey: process.env.NEXT_PUBLIC_MAGICBELL_API_KEY,
  apiSecret: process.env.MAGICBELL_API_SECRET,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, openParc } = req.body; // Extraire openParc et userId du corps de la requête

  if (!openParc) {
    return res.status(400).json({ status: "error", message: "L'heure d'ouverture du parc est manquante" });
  }

  try {
    // Créer la notification avec openParc
    await magicbell.notifications.create({
      title: "Ouverture du parc",
      content: `Le parc ouvre à ${openParc}. Ne manquez pas l'ouverture !`,
      action_url: "",  // Lien optionnel si vous en avez besoin
      recipients: [{ external_id: userId }],
      category: "default",
    });

    res.status(200).json({ status: "success" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ status: "error", message: error.message });
    } else {
      res.status(500).json({ status: "error", message: "Unknown error" });
    }
  }
}
