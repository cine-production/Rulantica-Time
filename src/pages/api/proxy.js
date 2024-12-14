import { createProxyMiddleware } from 'http-proxy-middleware';

export default function handler(req, res) {
  const { parkId } = req.query;

  if (!parkId) {
    return res.status(400).json({ error: 'Park ID is required' });
  }

  // Proxy vers l'API des temps d'attente du parc
  const proxy = createProxyMiddleware({
    target: `https://queue-times.com/parks/${parkId}/queue_times.json`, // URL de l'API des temps d'attente
    changeOrigin: true, // Change l'origine pour l'API
    pathRewrite: {
      '^/api/proxy': '', // Retirer le préfixe '/api/proxy' pour l'URL finale
    },
    onProxyReq: (proxyReq, req, res) => {
      // Ajout des en-têtes CORS dans la requête
      proxyReq.setHeader('Access-Control-Allow-Origin', '*');
      proxyReq.setHeader('Access-Control-Allow-Methods', 'GET');
      proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    },
    onProxyRes: (proxyRes, req, res) => {
      // Ajout des en-têtes CORS dans la réponse de l'API cible
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    },
  });

  // Exécute la requête proxy
  return proxy(req, res);
}
