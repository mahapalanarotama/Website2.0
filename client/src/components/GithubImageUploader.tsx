
import React, { useState, useEffect } from "react";
import { getGithubOAuthUrl, getCodeFromCallbackUrl, exchangeCodeForToken, getCookie, deleteCookie, testGitHubConnection } from "@/lib/github-oauth";

interface GithubImageUploaderProps {
  repo?: string;
  path?: string;
  branch?: string;
}

export default function GithubImageUploader({ 
  repo = "mahapalanarotama/OfficialWebsite", 
  path = "uploads", 
  branch = "main" 
}: GithubImageUploaderProps) {
  const [token, setToken] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [authStep, setAuthStep] = useState<'idle' | 'authing' | 'testing'>('idle');

  useEffect(() => {
    const savedToken = getCookie('github_token');
    if (savedToken) {
      setAuthStep('testing');
      testGitHubConnection(savedToken).then(isValid => {
        if (isValid) {
          setToken(savedToken);
          setAuthStep('idle');
        } else {
          deleteCookie('github_token');
          setAuthStep('idle');
          setError('Stored token is invalid. Please login again.');
        }
      });
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      setFile(selectedFile);
      setError('');
      setSuccess('');
    }
  };

  const handleLogin = () => {
    setAuthStep('authing');
    localStorage.setItem('github_oauth_redirect', window.location.pathname + window.location.search);
    window.location.href = getGithubOAuthUrl();
  };

  const handleLogout = () => {
    deleteCookie('github_token');
    setToken('');
    setAuthStep('idle');
    setSuccess('');
    setError('');
  };

  const uploadToGithub = async () => {
    if (!file || !token) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Content = (reader.result as string).split(',')[1];
          const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `${path}/${fileName}`;

          console.log(`Uploading to: ${repo}/${filePath}`);

          // Upload to GitHub
          const response = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
              message: `Upload image: ${fileName}`,
              content: base64Content,
              branch: branch
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Upload failed: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          const imageUrl = data.content.download_url;
          
          setSuccess(`✅ Image uploaded successfully! URL: ${imageUrl}`);
          setFile(null);
          
          // Reset file input
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';

        } catch (error) {
          console.error('Upload error:', error);
          setError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read file');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload preparation error:', error);
      setError(`Failed to prepare upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploading(false);
    }
  };

  return (
    <div className="border p-4 rounded mb-4 bg-gray-50">
      <h3 className="font-semibold mb-3">🐙 GitHub Image Upload</h3>
      
      {/* Repository Info */}
      <div className="mb-3 text-sm text-gray-600">
        <p><strong>Repository:</strong> {repo}</p>
        <p><strong>Upload Path:</strong> {path}/</p>
        <p><strong>Branch:</strong> {branch}</p>
      </div>
      
      {/* Authentication Status */}
      <div className="mb-4">
        {token ? (
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✅ GitHub Connected</span>
            <button 
              className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600"
              onClick={handleLogout}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50" 
              onClick={handleLogin}
              disabled={authStep !== 'idle'}
            >
              {authStep === 'authing' ? '🔄 Authenticating...' : 
               authStep === 'testing' ? '🔍 Verifying...' : 
               '🔑 Connect GitHub'}
            </button>
            {authStep !== 'idle' && (
              <div className="text-sm text-gray-600 mt-1">
                {authStep === 'authing' ? 'Redirecting to GitHub...' : 'Checking connection...'}
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
            <div className="mb-3 p-2 bg-blue-50 rounded">
              <p className="text-sm text-gray-700">📁 <strong>Selected:</strong> {file.name}</p>
              <p className="text-xs text-gray-500">Size: {(file.size / 1024).toFixed(1)} KB</p>
              <p className="text-xs text-gray-500">Will upload to: {repo}/{path}/{Date.now()}-{file.name}</p>
            </div>
          )}

          <button
            onClick={uploadToGithub}
            disabled={!file || uploading}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? '📤 Uploading...' : '📤 Upload to GitHub'}
          </button>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded text-green-700 text-sm">
          {success}
        </div>
      )}
    </div>
  );
}
