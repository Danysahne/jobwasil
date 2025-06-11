import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const BASE_URL = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4';

async function proxyRequest(endpoint, queryParams, res) {
  const url = new URL(`${BASE_URL}${endpoint}`);

  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.append(key, value);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': process.env.BUNDES_API_KEY,
        Accept: 'application/json',
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Proxy failed' });
  }
}

// Endpoint: /api/jobs
app.get('/api/jobs', (req, res) => {
  proxyRequest('/jobs', req.query, res);
});

// Endpoint: /api/job/:id
app.get('/api/job/:id', (req, res) => {
  proxyRequest(`/jobs/${req.params.id}`, {}, res);
});

app.listen(PORT, () => {
  console.log(`Jobwasil Proxy running at http://localhost:${PORT}`);
});
