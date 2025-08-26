
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

    // Exchange code for access token
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: 'Ov23lisoZfewJvG9HtHK',
        client_secret: '7f90b5275811168370669968294f6f3199b5489b',
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

// Catch-all handler: send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${port}`);
});
