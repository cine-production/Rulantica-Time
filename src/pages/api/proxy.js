// pages/api/proxy.js
export async function handler(req, res) {
  const targetUrl = `https://queue-times.com${req.url}`;

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();
    
    // Ajout des en-têtes CORS pour permettre l'accès depuis ton domaine
    res.setHeader('Access-Control-Allow-Origin', '*');  // Permet l'accès depuis n'importe quel domaine
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
  }
}
