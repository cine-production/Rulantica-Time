import axios from 'axios';

export default async function handler(req, res) {
  const { parkId } = req.query;

  try {
    // Faire la requête à l'API externe
    const response = await axios.get(`https://queue-times.com/parks/${parkId}/queue_times.json`);

    // Ajouter l'en-tête CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permet à tout domaine d'accéder
    res.status(200).json(response.data); // Retourne les données à l'utilisateur
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error.message);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des données.' });
  }
}
