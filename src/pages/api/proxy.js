import { createProxyMiddleware } from 'http-proxy-middleware';

export default function handler(req, res) {
  const { parkId } = req.query;

  if (!parkId) {
    return res.status(400).json({ error: 'Park ID is required' });
  }

  // Proxy vers l'API des temps d'attente du parc
  createProxyMiddleware({
    target: `https://queue-times.com/parks/${parkId}/queue_times.json`,  // URL dynamique selon le parc
    changeOrigin: true,  // Permet au proxy de faire une demande avec un en-tête "Origin" ajusté
    pathRewrite: {
      '^/api/proxy': '',  // Réécrit le chemin de l'API pour correspondre à l'API cible
    },
    onProxyRes(proxyRes, req, res) {
      // Ajout de l'en-tête CORS pour autoriser les requêtes depuis n'importe quelle origine
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      // Si nécessaire, vous pouvez ajouter d'autres en-têtes CORS
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
  })(req, res);
}
