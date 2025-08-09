
// GitHub OAuth - Using Backend Proxy (CORS-Safe)
const CLIENT_ID = "Ov23lisoZfewJvG9HtHK";
const REDIRECT_URI = window.location.origin + "/github-oauth-callback";

export function getGithubOAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "repo user",
    allow_signup: "true"
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export function getCodeFromCallbackUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

// Use backend proxy to exchange code for token (CORS-safe)
export async function exchangeCodeForToken(code: string): Promise<string | null> {
  try {
    console.log('Exchanging code for token via backend proxy...');

    // Try backend endpoints
    const endpoints = [
      '/api/github-oauth', // Express backend
      '/.netlify/functions/github-oauth', // Netlify functions
    ];

    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error_description || data.error);
        }

        if (!data.access_token) {
          throw new Error('No access token received');
        }

        // Store token securely
        setCookie('github_token', data.access_token, 7);
        
        console.log('✅ GitHub authentication successful');
        return data.access_token;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Failed to exchange token via ${endpoint}:`, lastError.message);
        continue; // Try next endpoint
      }
    }

    // All endpoints failed
    throw lastError || new Error('All OAuth endpoints failed');

  } catch (error) {
    console.error('❌ GitHub authentication failed:', error);
    
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    alert(`GitHub authentication failed: ${errorMsg}\n\nPlease try again or contact support.`);
    
    return null;
  }
}

function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
}

export function getCookie(name: string): string {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure`;
}

// Test GitHub API connection
export async function testGitHubConnection(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('GitHub connection test failed:', error);
    return false;
  }
}
