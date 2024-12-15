// pages/api/proxy.js
export async function handler(req, res) {
  const targetUrl = `https://ep-time.vercel.app/api/parks/${parkId}/queue_times.json`;

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
  }
}
