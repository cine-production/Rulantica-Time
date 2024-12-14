// pages/api/proxy.js
import { createProxyMiddleware } from 'http-proxy-middleware';

export default function handler(req, res) {
  const { parkId } = req.query; // Récupérer l'ID du parc depuis la requête

  if (!parkId) {
    return res.status(400).json({ error: 'Park ID is required' });
  }

  // Proxy vers l'API des temps d'attente du parc
  return createProxyMiddleware({
    target: `https://queue-times.com/parks/${parkId}/queue_times.json`, // URL dynamique selon le parc
    changeOrigin: true,
    pathRewrite: {
      '^/api/proxy': '', // Retirer le préfixe '/api/proxy'
    },
  })(req, res);
}
