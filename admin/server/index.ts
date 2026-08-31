import { createApp } from './createApp';

const port = Number(process.env.API_PORT || 5175);
const app = createApp();

app.use((_request, response) => response.status(404).json({ message: 'Route introuvable.' }));

app.listen(port, '0.0.0.0', () => {
  console.log(`LoukaTech admin API: http://localhost:${port}`);
});
