
import React, { useState, useEffect } from "react";
import { getGithubOAuthUrl, getCodeFromCallbackUrl, exchangeCodeForToken, getCookie, deleteCookie } from "@/lib/github-oauth";

interface GithubImageUploaderProps {
  onUpload: (url: string) => void;
  repo: string;
  branch?: string;
  path: string;
}

export default function GithubImageUploader({ onUpload, repo, branch = "main", path }: GithubImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [token, setToken] = useState("");
  const [uploading, setUploading] = useState(false);
  const [authStep, setAuthStep] = useState<'idle' | 'authing' | 'done'>('idle');
  const [error, setError] = useState("");

  // Check for existing token or handle OAuth callback
  useEffect(() => {
    const existingToken = getCookie('github_token');
    if (existingToken) {
      setToken(existingToken);
      setAuthStep('done');
      return;
    }

    // Check if we're on the OAuth callback
    const code = getCodeFromCallbackUrl();
    if (code && authStep === 'idle') {
      setAuthStep('authing');
      exchangeCodeForToken(code).then(token => {
        if (token) {
          setToken(token);
          setAuthStep('done');
          // Redirect back to admin page
          const redirectUrl = localStorage.getItem('github_oauth_redirect') || '/admin';
          localStorage.removeItem('github_oauth_redirect');
          window.location.replace(redirectUrl);
        } else {
          setAuthStep('idle');
        }
      });
    }
  }, [authStep]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError("");
  };

  const handleLogin = () => {
    localStorage.setItem('github_oauth_redirect', window.location.pathname + window.location.search);
    window.location.href = getGithubOAuthUrl();
  };

  const handleLogout = () => {
    deleteCookie('github_token');
    setToken('');
    setAuthStep('idle');
  };

  const uploadToGithub = async () => {
    if (!file || !token) return;

    setUploading(true);
    setError("");

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Content = (reader.result as string).split(',')[1];
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `${path}/${fileName}`;

          // Upload to GitHub
          const response = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Upload ${fileName}`,
              content: base64Content,
              branch: branch
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Upload failed: ${response.status}`);
          }

          const data = await response.json();
          const imageUrl = data.content.download_url;
          
          onUpload(imageUrl);
          setFile(null);
          
          // Reset file input
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          
        } catch (err) {
          console.error('Upload error:', err);
          setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
          setUploading(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File read error:', err);
      setError('Failed to read file');
      setUploading(false);
    }
  };

  return (
    <div className="border p-4 rounded mb-4 bg-gray-50">
      <h3 className="font-semibold mb-3">GitHub Image Upload</h3>
      
      {/* Authentication Status */}
      <div className="mb-4">
        {token ? (
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓ Authenticated</span>
            <button 
              className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50" 
              onClick={handleLogin}
              disabled={authStep === 'authing'}
            >
              {authStep === 'authing' ? 'Authenticating...' : 'Login with GitHub'}
            </button>
            {authStep === 'authing' && (
              <div className="text-sm text-gray-600 mt-1">
                Processing GitHub authentication...
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Upload */}
      {token && (
        <div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Select Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {file && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">Selected: {file.name}</p>
              <p className="text-xs text-gray-500">Repository: {repo}/{path}</p>
            </div>
          )}

          <button
            onClick={uploadToGithub}
            disabled={!file || uploading}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload to GitHub'}
          </button>

          {error && (
            <div className="mt-2 text-red-600 text-sm">
              Error: {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
