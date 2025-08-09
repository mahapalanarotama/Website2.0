// GitHub OAuth client-side only (no backend)
// You must register an OAuth App at https://github.com/settings/developers
// Set callback URL to your site (e.g. http://localhost:5173 or your deployed site)

const CLIENT_ID = "Ov23lisoZfewJvG9HtHK"; // Ganti dengan client_id OAuth App Anda
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

// Exchange code for access_token (client-side only, not recommended for production)
// Helper cookie
function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
}
export async function exchangeCodeForToken(code: string) {
  // Request ke Vercel endpoint
  let data;
  let token = null;
  const vercelUrl = 'https://website2-0-client-jvbnwdfb5-mahapalanarotamas-projects.vercel.app/api/github-oauth'; // Ganti dengan URL Vercel Anda
  try {
    const res = await fetch(vercelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (res.ok) {
      data = await res.json();
      token = data.access_token;
    }
  } catch (err) {
    token = null;
  }
  // Redirect ke halaman sebelumnya setelah token didapat
  const redirectUrl = localStorage.getItem('github_oauth_redirect') || '/admin';
  if (token) {
    setCookie('github_token', token, 7);
    localStorage.removeItem('github_token');
    window.location.replace(redirectUrl);
    return token;
  } else {
    window.location.replace('/');
    return null;
  }
}
