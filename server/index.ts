
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Enable CORS for all routes
app.use(cors({
  origin: ['https://mahapalanarotama.web.id', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GitHub OAuth proxy endpoint
app.post('/api/github-oauth', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    if (!process.env.GITHUB_CLIENT_SECRET) {
      return res.status(500).json({ error: 'GitHub client secret not configured' });
    }

    // Exchange code for access token
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID || 'Ov23lisoZfewJvG9HtHK',
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error_description || data.error });
    }

    res.json(data);

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Special route for offline page - always serve standalone HTML directly
app.get('/offline', (req, res) => {
  const offlinePath = path.join(__dirname, 'public', 'offline-standalone.html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(offlinePath);
});

// Catch-all handler: send back React's index.html file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${port}`);
});
