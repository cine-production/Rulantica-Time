// pages/api/queue-times.js
import axios from 'axios';

export default async function handler(req, res) {
  const { parkId } = req.query; // Récupère le paramètre 'parkId' depuis la query

  try {
    // Faites la requête API vers l'URL source sans utiliser le proxy externe
    const response = await axios.get(`https://queue-times.com/parks/${parkId}/queue_times.json`);
    
    // Vous pouvez ajouter des en-têtes de contrôle CORS ici si nécessaire
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Renvoie les données au client
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error.message);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des données.' });
  }
}
