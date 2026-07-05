import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import fetch from 'node-fetch';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ───────────────────────────────────────────────────────────────────
// ALLOWED_ORIGINS: comma-separated list, e.g. "https://jobwasil.example.com".
// Unset = allow all (local development).
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim());
app.use(cors(allowedOrigins ? { origin: allowedOrigins } : {}));
app.use(express.json());

// ── Access code ────────────────────────────────────────────────────────────
// ACCESS_CODE unset = open (local development). When set, every /api request
// must carry the matching X-Access-Code header.
const ACCESS_CODE = process.env.ACCESS_CODE;
app.use('/api', (req, res, next) => {
  if (!ACCESS_CODE) return next();
  if (req.get('X-Access-Code') === ACCESS_CODE) return next();
  res.status(401).json({ error: 'Invalid access code' });
});

// ── Rate limiting ──────────────────────────────────────────────────────────
app.use(
  '/api',
  rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }),
);
// Translation calls cost real money — keep this limit tight.
const translateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const BASE_URL = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4';

// Lazy: only instantiate if the key is present so the proxy starts without it
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ── Health (used by the app to verify the access code) ────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// ── Bundesagentur proxy ────────────────────────────────────────────────────

async function proxyRequest(endpoint, queryParams, res) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.append(key, value);
  }
  try {
    const response = await fetch(url.toString(), {
      headers: { 'X-API-Key': process.env.BUNDES_API_KEY, Accept: 'application/json' },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Proxy failed' });
  }
}

app.get('/api/jobs', (req, res) => {
  proxyRequest('/jobs', req.query, res);
});

app.get('/api/job/:id', (req, res) => {
  const base64Id = Buffer.from(req.params.id).toString('base64');
  proxyRequest(`/jobdetails/${base64Id}`, {}, res);
});

// ── Translation endpoint ───────────────────────────────────────────────────
// POST /api/translate
// Body: { fields: { key: "German text", ... } }
// Returns: { fields: { key: "Arabic text", ... } }

app.post('/api/translate', translateLimiter, async (req, res) => {
  const { fields } = req.body;
  if (!fields || typeof fields !== 'object') {
    return res.status(400).json({ error: 'fields object required' });
  }

  // Build a single prompt with all fields to translate in one API call
  const entries = Object.entries(fields).filter(([, v]) => v && typeof v === 'string');
  if (entries.length === 0) return res.json({ fields: {} });

  const payload = entries.map(([k, v]) => `[${k}]\n${v}`).join('\n\n');

  if (!anthropic) {
    return res.status(503).json({ fields, error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 3000,
      system:
        'You are a professional translator specialising in German job postings. ' +
        'Translate each labelled section to Arabic. ' +
        'Keep the exact section labels in square brackets. ' +
        'Preserve line breaks, bullet points (- item), and **bold** markers. ' +
        'Return only the translated sections, nothing else.',
      messages: [{ role: 'user', content: payload }],
    });

    const raw = message.content[0]?.type === 'text' ? message.content[0].text : '';

    // Parse labelled sections back into a fields object
    const translated = {};
    for (const [key] of entries) {
      const regex = new RegExp(`\\[${key}\\]\\n([\\s\\S]*?)(?=\\n\\[|$)`);
      const match = raw.match(regex);
      translated[key] = match ? match[1].trim() : fields[key]; // fall back to original
    }

    res.json({ fields: translated });
  } catch (error) {
    console.error('Translation error:', error.message);
    // Return originals so the app never crashes on a translation failure
    const fallback = Object.fromEntries(entries);
    res.status(500).json({ fields: fallback, error: 'Translation failed' });
  }
});

// ── Static web build (production hosting) ──────────────────────────────────
// After `npx expo export --platform web`, point WEB_BUILD_DIR at the dist
// folder and the proxy serves the app itself — one service to host.
if (process.env.WEB_BUILD_DIR) {
  const webDir = join(__dirname, process.env.WEB_BUILD_DIR);
  app.use(express.static(webDir));
  app.get('*', (req, res) => res.sendFile(join(webDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Jobwasil Proxy running at http://localhost:${PORT}`);
});
