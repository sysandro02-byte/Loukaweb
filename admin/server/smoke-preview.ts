import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createApp } from './createApp';

const app = createApp();
const distDir = join(process.cwd(), 'dist');
const indexFile = join(distDir, 'index.html');

if (!existsSync(indexFile)) {
  throw new Error('Le dossier dist est introuvable. Lancez npm run build.');
}

app.use(express.static(distDir));
app.get('*', (request, response, next) => {
  if (request.path.startsWith('/api/')) {
    next();
    return;
  }

  response.sendFile(indexFile);
});

const server = app.listen(0, '127.0.0.1', async () => {
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Adresse serveur invalide.');
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const page = await fetch(`${baseUrl}/login`);
    const html = await page.text();
    const health = await fetch(`${baseUrl}/api/health`);
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@loukatech.com', password: 'ChangeMe!2026' })
    });
    const loginJson = await login.json();
    const dashboard = await fetch(`${baseUrl}/api/dashboard`, {
      headers: { Authorization: `Bearer ${loginJson.token}` }
    });
    const dashboardJson = await dashboard.json();

    console.log(JSON.stringify({
      loginPage: {
        status: page.status,
        hasRoot: html.includes('id="root"'),
        hasAssets: html.includes('/assets/index-')
      },
      health: {
        status: health.status,
        body: await health.text()
      },
      login: {
        status: login.status,
        email: loginJson.user?.email,
        role: loginJson.user?.role,
        hasToken: Boolean(loginJson.token)
      },
      dashboard: {
        status: dashboard.status,
        totalVisitors: dashboardJson.totalVisitors,
        totalMessages: dashboardJson.totalMessages
      }
    }, null, 2));
  } finally {
    server.close();
  }
});
