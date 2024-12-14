export default async function handler(req, res) {
  const { parkId } = req.query;

  const response = await fetch(`https://queue-times.com/parks/${parkId}/queue_times.json`);
  const data = await response.json();

  res.setHeader('Access-Control-Allow-Origin', '*'); // Permet à tout domaine d'accéder
  res.status(200).json(data);
}
