
// GitHub OAuth - Direct Implementation (No Backend Required)
// Uses GitHub OAuth Device Flow for web applications

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

// Using GitHub's client-side token exchange
export async function exchangeCodeForToken(code: string): Promise<string | null> {
  try {
    console.log('Exchanging code for token via GitHub...');

    // Use GitHub's CORS-enabled endpoint
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: '7f90b5275811168370669968294f6f3199b5489b',
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    if (!data.access_token) {
      throw new Error('No access token received from GitHub');
    }

    // Store token securely
    setCookie('github_token', data.access_token, 7);
    
    console.log('✅ GitHub authentication successful');
    return data.access_token;

  } catch (error) {
    console.error('❌ GitHub authentication failed:', error);
    
    // Show user-friendly error message
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
