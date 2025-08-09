import React, { useState } from "react";
import { getGithubOAuthUrl, getCodeFromCallbackUrl, exchangeCodeForToken } from "@/lib/github-oauth";

interface GithubImageUploaderProps {
  onUpload: (url: string) => void;
  repo: string;
  branch?: string;
  path: string;
}

export default function GithubImageUploader({ onUpload, repo, branch = "main", path }: GithubImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [token, setToken] = useState("");
  // Helper ambil token dari cookie
  function getCookie(name: string) {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
  }
  
  const [authStep, setAuthStep] = useState<'idle'|'authing'|'done'>('idle');
  
  // Auto-detect token from cookie
  React.useEffect(() => {
    const cookieToken = getCookie('github_token');
    if (cookieToken && !token) {
      setToken(cookieToken);
    }
    
    // Simpan halaman asal sebelum login OAuth
    if (!cookieToken && !token) {
      localStorage.setItem('github_oauth_redirect', window.location.pathname + window.location.search);
    }
  }, [token]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file || !token) {
      setError("File dan token GitHub diperlukan");
      return;
    }
    
    setUploading(true);
    setError("");
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1];
          const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}/${filename}`;
          
          const res = await fetch(apiUrl, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
              "Accept": "application/vnd.github.v3+json"
            },
            body: JSON.stringify({
              message: `Upload image ${filename}`,
              content: base64,
              branch
            })
          });
          
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `HTTP ${res.status}`);
          }
          
          const data = await res.json();
          
          if (data.content && data.content.download_url) {
            // Generate proper raw URL
            const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${path}/${filename}`;
            onUpload(rawUrl);
            setError("");
          } else {
            setError("Gagal mendapatkan URL file. Coba lagi.");
          }
        } catch (err: any) {
          console.error("Upload error:", err);
          setError(`Upload gagal: ${err.message}`);
        } finally {
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        setError("Gagal membaca file");
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (e: any) {
      setError(`Error: ${e.message}`);
      setUploading(false);
    }
  };

  // OAuth flow
  React.useEffect(() => {
    // Cek token di cookie setelah redirect
    const cookieToken = getCookie('github_token');
    if (cookieToken && !token) {
      setToken(cookieToken);
      setAuthStep('done');
    } else {
      const code = getCodeFromCallbackUrl();
      if (code && !token) {
        setAuthStep('authing');
        exchangeCodeForToken(code).then(t => {
          setToken(t);
          setAuthStep('done');
          // Redirect ke halaman asal setelah auth
          const redirectUrl = localStorage.getItem('github_oauth_redirect') || '/admin';
          window.location.replace(redirectUrl);
        });
      }
    }
  }, []);

  return (
    <div className="border p-4 rounded mb-2 bg-gray-50">
      <div className="mb-3">
        <label className="block font-semibold mb-2">GitHub OAuth</label>
        {token ? (
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓ Terautentikasi!</span>
            <button 
              className="bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-600"
              onClick={() => {
                document.cookie = 'github_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                setToken('');
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50" 
              onClick={() => {
                localStorage.setItem('github_oauth_redirect', window.location.pathname + window.location.search);
                window.location.href = getGithubOAuthUrl();
              }} 
              disabled={authStep === 'authing'}
            >
              {authStep === 'authing' ? 'Memproses...' : 'Login dengan GitHub'}
            </button>
            {authStep === 'authing' && (
              <div className="text-sm text-gray-600 mt-1">
                Sedang memproses autentikasi GitHub...
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <label className="block font-semibold mb-1">Pilih Gambar</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
        {file && (
          <p className="text-sm text-gray-600 mt-1">
            File: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>
      
      <button 
        className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed" 
        onClick={handleUpload} 
        disabled={!file || !token || uploading}
      >
        {uploading ? "Uploading..." : "Upload ke GitHub"}
      </button>
      
      {error && <div className="text-red-600 mt-2 p-2 bg-red-50 rounded">{error}</div>}
      
      <div className="mt-2 text-xs text-gray-500">
        <p>Target: {repo}/{path}</p>
        <p>Branch: {branch}</p>
      </div>
    </div>
  );
}
