import { createProxyMiddleware } from 'http-proxy-middleware';

export default function handler(req, res) {
  const { parkId } = req.query; // Récupérer l'ID du parc

  if (!parkId) {
    return res.status(400).json({ error: 'Park ID is required' });
  }

  // Proxy vers l'API des temps d'attente du parc
  return createProxyMiddleware({
    target: `https://queue-times.com/parks/${parkId}/queue_times.json`, // URL dynamique selon le parc
    changeOrigin: true,  // Permet au proxy de faire une demande avec un en-tête "Origin" ajusté
    pathRewrite: {
      '^/api/proxy': '',  // Réécrit le chemin de l'API pour correspondre à l'API cible
    },
    onProxyRes(proxyRes, req, res) {
      // Permet de contourner CORS en ajoutant l'en-tête Access-Control-Allow-Origin
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
  })(req, res);
}
