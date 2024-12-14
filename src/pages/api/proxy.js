// pages/api/proxy.js
import { createProxyMiddleware } from 'http-proxy-middleware';

const proxy = createProxyMiddleware({
  target: 'https://queue-times.com', // Serveur cible
  changeOrigin: true,
  pathRewrite: {
    '^/api/proxy': '', // Retirer le préfixe '/api/proxy'
  },
});

export const config = {
  api: {
    bodyParser: false, // Désactive l'analyseur de corps pour laisser passer le flux
  },
};

export default function handler(req, res) {
  return proxy(req, res, (result) => {
    if (result instanceof Error) {
      console.error('Erreur du proxy:', result);
      res.status(500).json({ error: 'Erreur du proxy' });
    }
  });
}
