import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function cmsDevMiddleware(): import('vite').Plugin {
  return {
    name: 'cms-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }
        if (req.url === '/__cms-save') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              handleCmsSave(req, res, body);
            } catch (e) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: String(e) }));
            }
          });
        } else if (req.url === '/__cms-upload') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              handleCmsUpload(req, res, body);
            } catch (e) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: String(e) }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

function handleCmsSave(req: any, res: any, body: string) {
  const { filePath, content } = JSON.parse(body);
  const fullPath = path.resolve(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: true }));
}

function handleCmsUpload(req: any, res: any, body: string) {
  const { filePath, content } = JSON.parse(body);
  const fullPath = path.resolve(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, Buffer.from(content, 'base64'));
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: true }));
}

export default defineConfig({
  clearScreen: false,
  plugins: [sveltekit(), tailwindcss(), cmsDevMiddleware()],
});
