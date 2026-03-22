import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { analyzeListing } from './services/analyzer.js';
import { validateMarketplaceUrl } from './utils/validation.js';

const app = express();
const port = Number(process.env.PORT || 8080);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || '*'
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 20),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait before analyzing another listing.' }
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'marketplace-fraud-analyzer' });
});

app.post('/api/analyze', async (req, res) => {
  const { url } = req.body || {};
  const validation = validateMarketplaceUrl(url);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.message });
  }

  try {
    const result = await analyzeListing(validation.parsedUrl);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Analysis failed. Please try again later.',
      details: error.message
    });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
