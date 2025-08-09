// GitHub OAuth client-side only (no backend)
// You must register an OAuth App at https://github.com/settings/developers
// Set callback URL to your site (e.g. http://localhost:5173 or your deployed site)

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

export async function exchangeCodeForToken(code: string): Promise<string | null> {
  try {
    console.log('Exchanging code for token...');

    const response = await fetch('/api/github-oauth', {
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
      throw new Error(data.error);
    }

    if (!data.access_token) {
      throw new Error('No access token received');
    }

    // Store token in cookie
    setCookie('github_token', data.access_token, 7);

    console.log('Token received successfully');
    return data.access_token;

  } catch (error) {
    console.error('Token exchange failed:', error);
    alert(`GitHub authentication failed: ${error.message}`);
    return null;
  }
}

function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name: string): string {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}