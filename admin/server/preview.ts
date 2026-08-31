import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createApp } from './createApp';

const port = Number(process.env.PORT || 4174);
const app = createApp();
const distDir = join(process.cwd(), 'dist');
const indexFile = join(distDir, 'index.html');

if (!existsSync(indexFile)) {
  console.error('Le dossier dist est introuvable. Lancez npm run build avant npm run preview.');
  process.exit(1);
}

app.use(express.static(distDir));

app.get('*', (request, response, next) => {
  if (request.path.startsWith('/api/')) {
    next();
    return;
  }

  response.sendFile(indexFile);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`LoukaTech admin preview: http://localhost:${port}`);
});
