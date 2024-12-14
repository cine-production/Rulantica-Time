import { createProxyMiddleware } from 'http-proxy-middleware';

export default function handler(req, res) {
  const { parkId } = req.query;

  if (!parkId) {
    return res.status(400).json({ error: 'Park ID is required' });
  }

  // Ajouter les en-têtes CORS à la réponse du proxy
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permet à n'importe quelle origine d'accéder à cette ressource
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Proxy vers l'API des temps d'attente du parc
  createProxyMiddleware({
    target: `https://queue-times.com/parks/${parkId}/queue_times.json`,  // URL dynamique selon le parc
    changeOrigin: true,  // Permet au proxy de faire une demande avec un en-tête "Origin" ajusté
    pathRewrite: {
      '^/api/proxy': '',  // Réécrit le chemin de l'API pour correspondre à l'API cible
    },
    onProxyRes(proxyRes, req, res) {
      // En-têtes supplémentaires pour autoriser l'accès cross-origin
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type';
    }
  })(req, res);
}
