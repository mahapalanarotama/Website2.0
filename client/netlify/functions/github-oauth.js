
exports.handler = async function(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Function called with method:', event.httpMethod);
    console.log('Function body received:', event.body);
    
    const { code } = JSON.parse(event.body);

    if (!code) {
      console.log('No code provided');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Authorization code is required' })
      };
    }

    const CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23lisoZfewJvG9HtHK';
    const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '7f90b5275811168370669968294f6f3199b5489b';

    console.log('Exchanging code for token with GitHub...', code.substring(0, 10) + '...');

    // Use fetch with proper headers
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Netlify-Function'
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code
      }).toString()
    });

    console.log('GitHub API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: `GitHub API error: ${response.status}` })
      };
    }

    const data = await response.json();
    console.log('GitHub response data:', data);

    if (data.error) {
      console.error('GitHub OAuth error:', data.error);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: data.error_description || data.error })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};
