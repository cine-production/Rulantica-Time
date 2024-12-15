import axios from 'axios';

export default async function handler(req, res) {
  const { parkId } = req.query;

  try {
    const response = await axios.get(`https://queue-times.com/parks/${parkId}/queue_times.json`);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permet à tout domaine d'accéder
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error.message);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des données.' });
  }
}
