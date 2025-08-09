export default async function handler(req, res) {
  // Add CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://mahapalanarotama.web.id',
    'https://website2-0-client-jvbnwdfb5-mahapalanarotamas-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://mahapalanarotama.web.id');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  const { code } = req.body;
  
  if (!code) {
    res.status(400).json({ error: 'Authorization code is required' });
    return;
  }
  
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23lisoZfewJvG9HtHK';
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '7f90b5275811168370669968294f6f3199b5489b';

  console.log('Exchanging code for token...');
  console.log('CLIENT_ID:', CLIENT_ID);
  console.log('Code received:', code ? 'Yes' : 'No');

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'GitHub-OAuth-App'
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
      })
    });
    
    console.log('GitHub API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error response:', errorText);
      throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('GitHub API response data:', data);
    
    if (data.error) {
      console.error('GitHub OAuth error:', data.error_description || data.error);
      res.status(400).json({ 
        error: data.error_description || data.error,
        details: data
      });
      return;
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('OAuth exchange error:', error);
    res.status(500).json({ 
      error: 'Failed to exchange code for token',
      details: error.message
    });
  }
}
