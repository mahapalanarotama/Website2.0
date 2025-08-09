
// GitHub OAuth - Using Netlify Functions
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

// Use Netlify Functions as backend proxy
export async function exchangeCodeForToken(code: string): Promise<string | null> {
  try {
    console.log('Exchanging code for token via Netlify Functions...');

    const response = await fetch('/.netlify/functions/github-oauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Response data:', data);

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    if (!data.access_token) {
      throw new Error('No access token received');
    }

    console.log('✅ Successfully obtained GitHub token');
    
    // Store token in cookie
    document.cookie = `github_token=${data.access_token}; path=/; max-age=3600; secure; samesite=strict`;
    
    return data.access_token;

  } catch (error) {
    console.error('❌ GitHub authentication failed:', error);
    throw error;
  }
}

export function getStoredToken(): string | null {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'github_token') {
      return value;
    }
  }
  return null;
}

export function clearStoredToken(): void {
  document.cookie = 'github_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export async function uploadToGithub(file: File, filename: string): Promise<string> {
  const token = getStoredToken();
  if (!token) {
    throw new Error('No GitHub token found. Please authenticate first.');
  }

  try {
    // Convert file to base64
    const base64Content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Upload to GitHub
    const response = await fetch(`https://api.github.com/repos/mahapalanarotama/website2.0/contents/uploaded/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload ${filename}`,
        content: base64Content,
        branch: 'main'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const result = await response.json();
    return result.content.download_url;

  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
