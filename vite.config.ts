import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function cmsDevSave(): import('vite').Plugin {
  return {
    name: 'cms-dev-save',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/__cms-save' || req.method !== 'POST') {
          next();
          return;
        }

        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          try {
            const { filePath, content } = JSON.parse(body);
            const fullPath = path.resolve(process.cwd(), filePath);
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, content, 'utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: String(e) }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  clearScreen: false,
  plugins: [sveltekit(), tailwindcss(), cmsDevSave()],
});
