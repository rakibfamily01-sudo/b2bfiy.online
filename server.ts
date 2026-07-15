import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/routes';

// Polyfills for ESM __dirname in Node
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global parse middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Register local upload assets folder statically (must be absolute/cwd relative)
const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Mount API REST router
app.use('/api', apiRouter);

// Serve or mount Vite middleware depending on production flag and platform
async function setupFrontend() {
  if (process.env.VERCEL) {
    // Vercel delivers static files natively via its global CDN, no need for Express to serve them!
    return;
  }
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend files from build dist folder
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupFrontend().then(() => {
  // Only listen to port if not running as a Vercel Serverless Function
  if (!process.env.VERCEL) {
    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`B2bfiy Agency server launched on http://0.0.0.0:${PORT}`);
    });
  }
}).catch((err) => {
  console.error('Fatal: Failed to initialize frontend setup', err);
});

export default app;
