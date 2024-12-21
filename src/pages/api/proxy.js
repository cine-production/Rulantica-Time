import axios from 'axios';

export default async function handler(req, res) {
  const { parkId, openingtimes } = req.query;

  try {
    if (openingtimes === 'true') {
      // Requête pour les horaires d'ouverture
      const response = await axios.get('https://api.wartezeiten.app/v1/openingtimes', {
        headers: {
          'accept': 'application/json',
          'park': 'rulantica',
        },
      });

      // Ajout des en-têtes CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json(response.data);
    } else if (parkId) {
      // Requête pour les temps d'attente des attractions
      const response = await axios.get(`https://queue-times.com/parks/${parkId}/queue_times.json`);

      // Ajout des en-têtes CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json(response.data);
    } else {
      res.status(400).json({ error: 'Paramètres insuffisants.' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error.message);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des données.' });
  }
}
