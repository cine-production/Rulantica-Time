// pages/api/proxy.js
import { createProxyMiddleware } from 'http-proxy-middleware';

const proxy = createProxyMiddleware({
  target: 'https://queue-times.com', // URL de base de l'API
  changeOrigin: true,
  pathRewrite: {
    '^/api/proxy': '', // Supprime le préfixe /api/proxy
  },
});

// Middleware personnalisé pour gérer le proxy
export default function handler(req, res) {
  const { parkId } = req.query; // Récupérer l'ID du parc

  if (!parkId) {
    return res.status(400).json({ error: 'Park ID is required' });
  }

  req.url = `/parks/${parkId}/queue_times.json`; // Ajuster le chemin pour le proxy
  return proxy(req, res, (result) => {
    if (result instanceof Error) {
      console.error('Erreur de proxy:', result);
      res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  });
}
